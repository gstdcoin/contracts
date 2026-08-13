/**
 * Fund SettlementMaster v2's GSTD bonus pool — via TON Connect, no mnemonic.
 *
 * Two steps, each a separate wallet approval:
 *   1. SetOwnJettonWallet — tells SettlementMaster v2 its own GSTD jetton
 *      wallet address (owner-only call; the connected wallet must be SM's
 *      owner). No-op if already set to the same address.
 *   2. TEP-74 Jetton Transfer — sends GSTD_AMOUNT from the connected
 *      wallet's own GSTD jetton wallet to SettlementMaster v2's jetton
 *      wallet. This is what actually funds the bonus pool.
 *
 * Until both steps complete, gstdBonusAmount in SettleTaskWithProof stays
 * inert (see SettlementMaster.tact's settlePayout — the bonus transfer is
 * skipped entirely when ownJettonWallet is unset). The TON-denominated
 * 85/10/5 split has never depended on this.
 *
 * Usage:
 *   GSTD_AMOUNT=500 npx ts-node --project tsconfig.deploy.json scripts/tonconnect-fund-bonus-pool.ts
 */

import 'dotenv/config';
import { Address, beginCell, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { storeSetOwnJettonWallet } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';
import { connectWallet, sendForApproval, sleep } from './lib/tonconnect-helper';

const GSTD_JETTON = 'EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO';
const SETTLEMENT_MASTER_V2 = 'EQCi-QjafvcYE7wgl9Dc5jAFJrmiy_oGfcobzORb2gZQezhE';
const GSTD_AMOUNT = process.env.GSTD_AMOUNT || '500';
const GSTD_DECIMALS = 9; // standard TON jetton decimals, matches GSTDJetton

async function getJettonWalletAddress(client: TonClient, jettonMaster: Address, owner: Address): Promise<Address> {
    const result = await client.runMethod(jettonMaster, 'get_wallet_address', [
        { type: 'slice', cell: beginCell().storeAddress(owner).endCell() },
    ]);
    return result.stack.readAddress();
}

async function main() {
    const { tonConnect, address: connectedAddress } = await connectWallet();
    const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: process.env.TON_API_KEY });

    const jettonMaster = Address.parse(GSTD_JETTON);
    const settlementAddr = Address.parse(SETTLEMENT_MASTER_V2);
    const connectedAddr = Address.parse(connectedAddress);

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   Fund SettlementMaster v2 GSTD Bonus Pool           ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Signer         : ${connectedAddress.slice(0, 24)}...`);
    console.log(`║  SettlementMaster: ${SETTLEMENT_MASTER_V2.slice(0, 24)}...`);
    console.log(`║  Amount          : ${GSTD_AMOUNT} GSTD`);
    console.log('╚══════════════════════════════════════════════════════╝\n');

    console.log('🔍 Computing jetton wallet addresses...');
    const smJettonWallet = await getJettonWalletAddress(client, jettonMaster, settlementAddr);
    const myJettonWallet = await getJettonWalletAddress(client, jettonMaster, connectedAddr);
    console.log(`   SettlementMaster's GSTD wallet: ${smJettonWallet}`);
    console.log(`   Your GSTD wallet:                ${myJettonWallet}`);

    // ── Step 1: SetOwnJettonWallet ────────────────────────────────────
    // No getter exposes the contract's current ownJettonWallet value, so
    // this is sent unconditionally each run — idempotent, the contract
    // just overwrites the same address if it was already set correctly.
    console.log('\n1️⃣  Setting SettlementMaster\'s own GSTD jetton wallet...');
    const setWalletBody = beginCell()
        .store(storeSetOwnJettonWallet({ $$type: 'SetOwnJettonWallet', wallet: smJettonWallet }))
        .endCell();
    await sendForApproval(
        tonConnect,
        {
            validUntil: Math.floor(Date.now() / 1000) + 300,
            messages: [{ address: settlementAddr.toString(), amount: toNano('0.05').toString(), payload: setWalletBody.toBoc().toString('base64') }],
        },
        `SetOwnJettonWallet -> ${smJettonWallet}`,
    );
    console.log('\n⏳ Waiting ~15s for it to land...');
    await sleep(15_000);

    // ── Step 2: TEP-74 Jetton Transfer (the actual funding) ──────────────
    console.log(`\n2️⃣  Transferring ${GSTD_AMOUNT} GSTD to the bonus pool...`);
    const amountNano = toNano(GSTD_AMOUNT); // GSTD uses standard 9 decimals, same math as TON
    const transferBody = beginCell()
        .storeUint(0xf8a7ea5, 32) // TEP-74 Transfer opcode
        .storeUint(BigInt(Date.now()), 64) // queryId
        .storeCoins(amountNano)
        .storeAddress(settlementAddr) // destination: SettlementMaster (the owner of record for this transfer)
        .storeAddress(connectedAddr) // response_destination: refund excess TON here
        .storeBit(false) // no custom payload
        .storeCoins(toNano('0.01')) // forward_ton_amount (notify SettlementMaster)
        .storeBit(false) // no forward payload
        .endCell();

    await sendForApproval(
        tonConnect,
        {
            validUntil: Math.floor(Date.now() / 1000) + 300,
            messages: [{
                address: myJettonWallet.toString(), // send TO your own jetton wallet, which forwards to SM's
                amount: toNano('0.1').toString(), // gas for the jetton wallet's internal message + forward notify
                payload: transferBody.toBoc().toString('base64'),
            }],
        },
        `Transfer ${GSTD_AMOUNT} GSTD -> SettlementMaster bonus pool`,
    );

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   BONUS POOL FUNDED ✅                               ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`  Verify: https://tonscan.org/address/${smJettonWallet}`);
    process.exit(0);
}

main().catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
});
