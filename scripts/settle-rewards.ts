/**
 * GSTD Reward Settlement Script
 *
 * Fetches pending rewards from the platform API and settles them on-chain
 * via SettlementMaster.SettleTask.
 *
 * Run this AFTER SettlementMaster is deployed:
 *   npx ts-node scripts/settle-rewards.ts
 *
 * Required env vars (from .env):
 *   DEPLOYER_MNEMONIC    — gateway wallet mnemonic (same as GATEWAY_ADDRESS)
 *   SETTLEMENT_ADDRESS   — deployed SettlementMaster address
 *   TREASURY_SECRET      — admin secret for /api/v1/settlement/pending
 *   TON_API_KEY          — toncenter API key
 *
 * Optional:
 *   PLATFORM_API         — defaults to https://app.gstdtoken.com/api/v1
 *   MIN_SETTLE_GSTD      — min per-wallet threshold, defaults to 0.01
 */

import 'dotenv/config';
import { Address, toNano, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { SettlementMaster } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';

const MNEMONIC       = process.env.DEPLOYER_MNEMONIC || '';
const SETTLE_ADDR    = process.env.SETTLEMENT_ADDRESS || '';
const API_SECRET     = process.env.TREASURY_SECRET || '';
const TON_API_KEY    = process.env.TON_API_KEY || '';
const PLATFORM_API   = (process.env.PLATFORM_API || 'https://app.gstdtoken.com/api/v1').replace(/\/$/, '');
const MIN_GSTD       = parseFloat(process.env.MIN_SETTLE_GSTD || '0.01');
const NANO_FACTOR    = BigInt('1000000000');

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function waitSeqno(wallet: any, seqno: number) {
    for (let i = 0; i < 40; i++) {
        await sleep(3000);
        const cur = await wallet.getSeqno();
        if (cur > seqno) return;
    }
    throw new Error('Transaction not confirmed after 120s');
}

async function main() {
    if (!MNEMONIC || !SETTLE_ADDR || !API_SECRET) {
        console.error('❌ Missing: DEPLOYER_MNEMONIC, SETTLEMENT_ADDRESS, TREASURY_SECRET');
        process.exit(1);
    }

    const client  = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: TON_API_KEY });
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(' '));
    const wallet  = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
    const provider = client.open(wallet);
    const settlementAddr = Address.parse(SETTLE_ADDR);
    const settlement = client.open(new SettlementMaster(settlementAddr));

    // Fetch pending rewards
    console.log('📡 Fetching pending rewards from platform...');
    const resp = await fetch(`${PLATFORM_API}/settlement/pending`, {
        headers: { 'x-admin-secret': API_SECRET },
    });
    if (!resp.ok) {
        console.error('❌ Failed to fetch pending:', await resp.text());
        process.exit(1);
    }
    const data: any = await resp.json();
    const entries: { wallet: string; amount: number; nodeIds: string[] }[] = data.entries || [];
    const eligible = entries.filter(e => e.amount >= MIN_GSTD && e.wallet);

    if (eligible.length === 0) {
        console.log('✅ No pending rewards above threshold. Nothing to settle.');
        return;
    }

    console.log(`\n💰 Settling ${eligible.length} wallets...`);
    console.log(`   Total: ${eligible.reduce((s, e) => s + e.amount, 0).toFixed(6)} GSTD pending\n`);

    let seqno = await provider.getSeqno();
    const settled: string[] = [];

    for (let i = 0; i < eligible.length; i++) {
        const entry = eligible[i];
        const taskId = BigInt(Date.now() + i);
        const gstdBonusAmount = BigInt(Math.round(entry.amount * 1e9));

        console.log(`  [${i + 1}/${eligible.length}] ${entry.wallet.slice(0, 20)}... → ${entry.amount.toFixed(6)} GSTD`);

        try {
            const workerAddr = Address.parse(entry.wallet);
            await settlement.send(
                provider.sender(keyPair.secretKey),
                { value: toNano('0.05') },
                {
                    $$type: 'SettleTask',
                    taskId,
                    workerAddr,
                    gstdBonusAmount,
                    qualityScore: BigInt(7500),  // 75.00 — default quality score
                    computeUnits: BigInt(1),
                }
            );
            await waitSeqno(provider, seqno++);
            settled.push(entry.wallet);
            console.log(`     ✅ Settled`);
        } catch (err: any) {
            console.error(`     ❌ Failed: ${err.message}`);
        }

        await sleep(2000);
    }

    // Clear settled balances on platform
    if (settled.length > 0) {
        console.log(`\n📤 Clearing ${settled.length} settled balances on platform...`);
        const clearResp = await fetch(`${PLATFORM_API}/settlement/clear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': API_SECRET,
            },
            body: JSON.stringify({
                wallets:  settled,
                epoch_id: `epoch_${Date.now()}`,
            }),
        });
        if (clearResp.ok) {
            console.log('   ✅ Platform balances cleared');
        } else {
            console.warn('   ⚠️  Failed to clear platform balances — run settle again to retry');
        }
    }

    console.log(`\n✅ Settlement complete: ${settled.length}/${eligible.length} wallets settled`);
}

main().catch(err => {
    console.error('SETTLEMENT FAILED:', err.message);
    process.exit(1);
});
