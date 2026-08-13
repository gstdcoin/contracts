/**
 * Shared TON Connect setup for the CLI deploy/settlement scripts —
 * signs every transaction from the operator's own wallet app (Tonkeeper or
 * any TON Connect wallet), approved on-device. No mnemonic/seed is ever
 * read, stored, or transmitted by these scripts.
 *
 * Session is persisted to .tonconnect-session.json (gitignored) so you
 * only need to scan the QR / approve the connection once per machine, not
 * on every script run.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { TonConnect, type IStorage, isWalletInfoRemote, type SendTransactionRequest } from '@tonconnect/sdk';
import qrcode from 'qrcode-terminal';

const SESSION_FILE = join(__dirname, '..', '..', '.tonconnect-session.json');
// gstdtoken.com is mid-DNS-migration (Cloudflare NS not fully propagated
// everywhere yet) — defaulting to the Worker's own workers.dev URL so this
// works today. Switch back to https://gstdtoken.com/tonconnect-manifest.json
// (or set TONCONNECT_MANIFEST_URL) once the custom domain is confirmed live.
const MANIFEST_URL = process.env.TONCONNECT_MANIFEST_URL || 'https://gstd-web.gstdtoken-site.workers.dev/tonconnect-manifest.json';
const WALLET_NAME = process.env.TONCONNECT_WALLET || 'tonkeeper';

/** Minimal file-backed IStorage — TonConnect's Node.js storage contract. */
class FileStorage implements IStorage {
    private data: Record<string, string> = {};

    constructor() {
        if (existsSync(SESSION_FILE)) {
            try {
                this.data = JSON.parse(readFileSync(SESSION_FILE, 'utf-8'));
            } catch {
                this.data = {};
            }
        }
    }

    private persist() {
        writeFileSync(SESSION_FILE, JSON.stringify(this.data, null, 2), { mode: 0o600 });
    }

    async getItem(key: string): Promise<string | null> {
        return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
    }

    async setItem(key: string, value: string): Promise<void> {
        this.data[key] = value;
        this.persist();
    }

    async removeItem(key: string): Promise<void> {
        delete this.data[key];
        this.persist();
    }
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

/**
 * Connects to the operator's wallet via TON Connect. Restores a previous
 * session if one exists (from .tonconnect-session.json); otherwise prints
 * a QR code for the wallet app to scan and waits for approval.
 */
export async function connectWallet(): Promise<{ tonConnect: TonConnect; address: string }> {
    const tonConnect = new TonConnect({ manifestUrl: MANIFEST_URL, storage: new FileStorage() });

    await tonConnect.restoreConnection();
    if (tonConnect.connected && tonConnect.account) {
        console.log(`✅ Restored existing wallet session: ${tonConnect.account.address}`);
        return { tonConnect, address: tonConnect.account.address };
    }

    console.log(`🔎 Looking up ${WALLET_NAME} in the TON Connect wallets list...`);
    const wallets = await tonConnect.getWallets();
    const target = wallets.find(
        (w) => w.appName.toLowerCase() === WALLET_NAME.toLowerCase() && isWalletInfoRemote(w),
    );
    if (!target || !isWalletInfoRemote(target)) {
        console.error(`❌ Wallet "${WALLET_NAME}" not found in TON Connect's wallets list (or has no remote/bridge connect option).`);
        console.error(`   Available: ${wallets.map((w) => w.appName).join(', ')}`);
        process.exit(1);
    }

    const link = tonConnect.connect({
        universalLink: target.universalLink,
        bridgeUrl: target.bridgeUrl,
    }) as string;

    console.log(`\n📱 Open ${target.name} on your phone and scan this QR code (or open the link):\n`);
    qrcode.generate(link, { small: true });
    console.log(`\n${link}\n`);
    console.log('⏳ Waiting for you to approve the connection in your wallet...\n');

    const connected = await new Promise<boolean>((resolve) => {
        const unsub = tonConnect.onStatusChange((wallet) => {
            if (wallet) {
                unsub();
                resolve(true);
            }
        }, () => {
            unsub();
            resolve(false);
        });
        // Safety timeout — matches the connect request's own openingDeadlineMS default order of magnitude.
        setTimeout(() => resolve(tonConnect.connected), 5 * 60_000);
    });

    if (!connected || !tonConnect.account) {
        console.error('❌ Wallet connection failed or timed out.');
        process.exit(1);
    }

    console.log(`✅ Connected: ${tonConnect.account.address}\n`);
    return { tonConnect, address: tonConnect.account.address };
}

/**
 * Sends one transaction for the operator to approve in their wallet app,
 * and waits for the approve/reject response. Throws on rejection.
 */
export async function sendForApproval(
    tonConnect: TonConnect,
    request: SendTransactionRequest,
    label: string,
): Promise<string> {
    console.log(`📲 Sent to your wallet for approval: ${label}`);
    console.log('   Check your phone / wallet app now...');
    const result = await tonConnect.sendTransaction(request);
    console.log(`   ✅ Approved and broadcast. boc: ${result.boc.slice(0, 24)}...`);
    return result.boc;
}

export { sleep };
