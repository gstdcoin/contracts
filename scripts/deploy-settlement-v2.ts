/**
 * GSTD SettlementMaster v2 — targeted mainnet deployment
 *
 * Deploys ONLY the new SettlementMaster (with quorum-attested P2P
 * settlement: SettleTaskWithProof, SettleBatch, RegisterAttestorKey,
 * SetQuorumThreshold). Does NOT touch EcosystemTreasury, Escrow, or the
 * GSTD jetton — those are live, unchanged, and referenced by address only.
 *
 * Why a new address at all: SettlementMaster.tact gained new receivers
 * (new code), and Tact/TON contract addresses are a hash of (code, initial
 * data) — there is no in-place upgrade path here, so this is necessarily a
 * fresh contract, not a modification of the currently-deployed one at
 * EQAhuR_cEaIkRqs4gvgXSD-Qw2FRUkkBUZQkTBrFT5n-ZrSS.
 *
 * The currently-deployed SettlementMaster holds ~0.1 TON and NO GSTD
 * (verified on-chain 2026-08-13) — there is no meaningful balance to
 * migrate. The old contract is simply abandoned in place; nothing points
 * at it anymore once this deploy's address is wired into ai/gstdbot config.
 *
 * SettleTaskWithProof/SettleBatch need no pre-funded GSTD pool to work for
 * the TON-denominated 85/10/5 split — the payout comes from the TON value
 * attached to that specific call, not from a contract balance. The GSTD
 * bonus path (gstdBonusAmount) is separately gated on self.ownJettonWallet
 * being set via SetOwnJettonWallet + that wallet holding real GSTD — both
 * still TODO, deliberately not done by this script (funding a bonus pool
 * is a real, separate financial decision).
 *
 * Usage:
 *   npm run build   # compile contracts first (already done if you just ran it)
 *   DEPLOYER_MNEMONIC="..." npx ts-node --project tsconfig.deploy.json scripts/deploy-settlement-v2.ts
 *
 * Optional — register a real node's attestor key right after deploy
 * (owner-only call, same deployer wallet). Skip this if you don't have a
 * real running node's attestor pubkey yet; RegisterAttestorKey can be sent
 * separately at any time later, no redeploy needed:
 *   ATTESTOR_PUBKEY_HEX="<64 hex chars, from gstdbot's ~/.config/gstdbot/attestor-identity.json>" \
 *   DEPLOYER_MNEMONIC="..." npx ts-node --project tsconfig.deploy.json scripts/deploy-settlement-v2.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { Address, contractAddress, toNano, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { SettlementMaster } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';

// Existing, unchanged infrastructure — referenced, not redeployed.
const EXISTING_GSTD_JETTON = 'EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO';
const EXISTING_TREASURY    = 'EQAbtTCsty8-gpX-45eotGWxnYG1c7ew7NFsZ9LJBRiv_Ii_';
const OLD_SETTLEMENT_MASTER = 'EQAhuR_cEaIkRqs4gvgXSD-Qw2FRUkkBUZQkTBrFT5n-ZrSS'; // abandoned, not touched

const NETWORK      = process.env.TON_NETWORK || '';
const MNEMONIC      = process.env.DEPLOYER_MNEMONIC || '';
const ADMIN_WALLET  = process.env.ADMIN_WALLET || 'UQCkXFlNRsubUp7Uh7lg_ScUqLCiff1QCLsdQU0a7kphqQED';
const ATTESTOR_PUBKEY_HEX = process.env.ATTESTOR_PUBKEY_HEX || '';

const ENDPOINTS: Record<string, string> = {
    mainnet: 'https://toncenter.com/api/v2/jsonRPC',
};

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function waitSeqno(provider: any, seqno: number) {
    for (let i = 0; i < 40; i++) {
        await sleep(3000);
        const cur = await provider.getSeqno();
        if (cur > seqno) return;
    }
    throw new Error('Transaction not confirmed after 120s');
}

function confirm(question: string): Promise<boolean> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(`${question} (yes/no): `, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

async function main() {
    if (NETWORK !== 'mainnet') {
        console.error('❌ TON_NETWORK must be "mainnet". Currently:', NETWORK || '(not set)');
        process.exit(1);
    }
    if (!MNEMONIC) {
        console.error('❌ Missing env var: DEPLOYER_MNEMONIC');
        process.exit(1);
    }

    const adminAddr   = Address.parse(ADMIN_WALLET);
    const gstdJetton   = Address.parse(EXISTING_GSTD_JETTON);
    const treasuryAddr = Address.parse(EXISTING_TREASURY);

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   SettlementMaster v2 — MAINNET DEPLOYMENT           ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Admin/owner  : ${ADMIN_WALLET.slice(0, 20)}...`);
    console.log(`║  GSTD token   : ${EXISTING_GSTD_JETTON.slice(0, 20)}... (existing, unchanged)`);
    console.log(`║  Treasury     : ${EXISTING_TREASURY.slice(0, 20)}... (existing, unchanged)`);
    console.log(`║  Old SM       : ${OLD_SETTLEMENT_MASTER.slice(0, 20)}... (abandoned in place)`);
    console.log(`║  Attestor key : ${ATTESTOR_PUBKEY_HEX ? ATTESTOR_PUBKEY_HEX.slice(0, 16) + '...' : '(none provided — register later)'}`);
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log('⚠️  This deploys to TON MAINNET with real funds (gas only — no pre-funded pool needed).\n');

    const ok = await confirm('Ready to deploy SettlementMaster v2 to mainnet?');
    if (!ok) { console.log('Aborted.'); process.exit(0); }

    const client   = new TonClient({ endpoint: ENDPOINTS.mainnet, apiKey: process.env.TON_API_KEY });
    const keyPair  = await mnemonicToPrivateKey(MNEMONIC.split(' '));
    const wallet   = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
    const provider = client.open(wallet);

    const deployer = wallet.address;
    console.log(`\nDeployer: ${deployer.toString()}`);
    const balance = await client.getBalance(deployer);
    console.log(`Balance: ${Number(balance) / 1e9} TON`);
    if (Number(balance) < toNano('0.5')) {
        console.error('❌ Insufficient balance. Need ≥ 0.5 TON for gas.');
        process.exit(1);
    }

    let seqno = await provider.getSeqno();

    // ── Deploy SettlementMaster v2 ──────────────────────────────────────
    console.log('\n1️⃣  Deploying SettlementMaster v2...');
    // protocolFee address kept as adminAddr, matching Phase 1's convention
    // (see deploy-mainnet.ts) — change here if the DAO has since designated
    // a separate protocol-fee/buyback address.
    const settlementInit = await SettlementMaster.init(adminAddr, gstdJetton, treasuryAddr, adminAddr);
    const settlementAddr = contractAddress(0, settlementInit);
    console.log(`   Computed address: ${settlementAddr}`);

    if (!(await client.isContractDeployed(settlementAddr))) {
        const settlement = client.open(new SettlementMaster(settlementAddr, settlementInit));
        await settlement.send(provider.sender(keyPair.secretKey), { value: toNano('0.3') }, {
            $$type: 'Deploy', queryId: BigInt(Date.now()),
        });
        await waitSeqno(provider, seqno++);
        console.log(`   ✅ SettlementMaster v2 deployed: ${settlementAddr}`);
    } else {
        console.log(`   ✓  Already deployed at this address: ${settlementAddr}`);
    }

    // ── Optionally register one attestor key ────────────────────────────
    const settlement = client.open(new SettlementMaster(settlementAddr));
    if (ATTESTOR_PUBKEY_HEX) {
        if (!/^[0-9a-fA-F]{64}$/.test(ATTESTOR_PUBKEY_HEX)) {
            console.error('❌ ATTESTOR_PUBKEY_HEX must be exactly 64 hex chars (32-byte Ed25519 pubkey).');
            process.exit(1);
        }
        console.log('\n2️⃣  Registering attestor key...');
        await settlement.send(provider.sender(keyPair.secretKey), { value: toNano('0.05') }, {
            $$type: 'RegisterAttestorKey',
            pubkey: BigInt('0x' + ATTESTOR_PUBKEY_HEX),
            authorized: true,
        });
        await waitSeqno(provider, seqno++);
        console.log('   ✅ Attestor key registered');
    } else {
        console.log('\n2️⃣  Skipped — no ATTESTOR_PUBKEY_HEX provided.');
        console.log('   Register real node attestor keys later with the same owner wallet:');
        console.log('   RegisterAttestorKey { pubkey, authorized: true } — no redeploy needed.');
    }

    // ── Update deployment record ─────────────────────────────────────────
    const recordPath = path.join(__dirname, '..', 'deployment-mainnet.json');
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
    record.contracts.SettlementMasterV2 = settlementAddr.toString();
    record._settlement_v2_note =
        `Deployed ${new Date().toISOString()}. Supports SettleTaskWithProof/SettleBatch ` +
        `(quorum-attested P2P settlement, default quorumThreshold=2-of-3). The old ` +
        `SettlementMaster (${OLD_SETTLEMENT_MASTER}) is abandoned in place — held no GSTD ` +
        `and ~0.1 TON at time of migration, nothing to move. ownJettonWallet not yet set ` +
        `(GSTD bonus path inactive until SetOwnJettonWallet + funding — TON-split settlement ` +
        `works without it).`;
    fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   DEPLOYMENT COMPLETE ✅                             ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`  SettlementMasterV2 : ${settlementAddr}`);
    console.log('\n📋 Next steps:');
    console.log('  1. Verify on https://tonscan.org/address/' + settlementAddr.toString());
    console.log('  2. Set SETTLEMENT_MASTER_V2_ADDRESS in gstdbot config to the address above.');
    console.log('  3. Register real node attestor keys (RegisterAttestorKey) as operators come online.');
    console.log('  4. (Optional, later) SetOwnJettonWallet + fund it to activate the GSTD bonus path.');
}

main().catch((e) => {
    console.error('❌ Deployment failed:', e);
    process.exit(1);
});
