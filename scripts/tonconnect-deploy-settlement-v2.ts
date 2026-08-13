/**
 * GSTD SettlementMaster v2 — mainnet deployment via TON Connect
 *
 * Same deployment as scripts/deploy-settlement-v2.ts (see that file's
 * header for the full rationale — new address is unavoidable, no contracts
 * other than SettlementMaster are touched, no pre-funded pool needed for
 * the TON-denominated split), but signs from your own wallet app
 * (Tonkeeper by default) via TON Connect instead of a mnemonic env var.
 * Nothing here ever reads or transmits a seed phrase — you approve the
 * actual deploy transaction on your phone.
 *
 * Usage:
 *   npm run build   # compile contracts first, if not already done
 *   npx ts-node --project tsconfig.deploy.json scripts/tonconnect-deploy-settlement-v2.ts
 *
 * First run prints a QR code — scan it with Tonkeeper (or set
 * TONCONNECT_WALLET=<appName> for a different TON Connect wallet) and
 * approve the connection, then approve the deploy transaction itself.
 * The session is cached in .tonconnect-session.json so later runs
 * (e.g. registering attestor keys) don't need a fresh scan.
 *
 * Optional:
 *   ADMIN_WALLET        — defaults to the connected wallet's own address
 *   ATTESTOR_PUBKEY_HEX — register one node's attestor key right after deploy
 *                         (see deploy-settlement-v2.ts for details; skip if
 *                         you don't have a real running node's key yet)
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Address, beginCell, contractAddress, storeStateInit, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { SettlementMaster, storeDeploy, storeRegisterAttestorKey } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';
import { connectWallet, sendForApproval } from './lib/tonconnect-helper';

const EXISTING_GSTD_JETTON  = 'EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO';
const EXISTING_TREASURY     = 'EQAbtTCsty8-gpX-45eotGWxnYG1c7ew7NFsZ9LJBRiv_Ii_';
const OLD_SETTLEMENT_MASTER = 'EQAhuR_cEaIkRqs4gvgXSD-Qw2FRUkkBUZQkTBrFT5n-ZrSS'; // abandoned, not touched
const ATTESTOR_PUBKEY_HEX   = process.env.ATTESTOR_PUBKEY_HEX || '';

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
    const { tonConnect, address: connectedAddress } = await connectWallet();
    const adminAddr = Address.parse(process.env.ADMIN_WALLET || connectedAddress);
    const gstdJetton = Address.parse(EXISTING_GSTD_JETTON);
    const treasuryAddr = Address.parse(EXISTING_TREASURY);

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   SettlementMaster v2 — MAINNET DEPLOY (TON Connect) ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Signer       : ${connectedAddress.slice(0, 20)}... (your wallet)`);
    console.log(`║  Owner        : ${adminAddr.toString().slice(0, 20)}...`);
    console.log(`║  GSTD token   : ${EXISTING_GSTD_JETTON.slice(0, 20)}... (existing, unchanged)`);
    console.log(`║  Treasury     : ${EXISTING_TREASURY.slice(0, 20)}... (existing, unchanged)`);
    console.log(`║  Old SM       : ${OLD_SETTLEMENT_MASTER.slice(0, 20)}... (abandoned in place)`);
    console.log('╚══════════════════════════════════════════════════════╝\n');

    const settlementInit = await SettlementMaster.init(adminAddr, gstdJetton, treasuryAddr, adminAddr);
    const settlementAddr = contractAddress(0, settlementInit);
    console.log(`Computed address: ${settlementAddr}\n`);

    // ── Safety: never spend gas re-sending a deploy that already landed ──
    const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: process.env.TON_API_KEY });
    console.log('🔍 Checking this address isn\'t already deployed (avoid burning gas twice)...');
    if (await client.isContractDeployed(settlementAddr)) {
        console.log(`\n✓  Already deployed at ${settlementAddr} — nothing to send. Skipping deploy transaction.`);
    } else {
        // ── Safety: warn (don't just fail silently in the wallet) if the
        // connected wallet doesn't look funded enough to cover this.
        const signerBalance = await client.getBalance(Address.parse(connectedAddress));
        const needed = toNano('0.3');
        console.log(`   Wallet balance: ${Number(signerBalance) / 1e9} TON (need ~${Number(needed) / 1e9} TON for this deploy)`);
        if (signerBalance < needed) {
            console.error(`\n❌ Insufficient balance in ${connectedAddress}. Top up before retrying — aborting, nothing sent.`);
            process.exit(1);
        }

        const stateInitCell = beginCell().store(storeStateInit(settlementInit)).endCell();
        const deployBody = beginCell().store(storeDeploy({ $$type: 'Deploy', queryId: BigInt(Date.now()) })).endCell();

        console.log(`\n💸 About to request approval for: 0.3 TON → ${settlementAddr} (contract deploy, one-time)`);
        await sendForApproval(
            tonConnect,
            {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [{
                    address: settlementAddr.toString(),
                    amount: needed.toString(),
                    stateInit: stateInitCell.toBoc().toString('base64'),
                    payload: deployBody.toBoc().toString('base64'),
                }],
            },
            `Deploy SettlementMaster v2 at ${settlementAddr}`,
        );

        console.log('\n⏳ Waiting ~15s for the deploy to land before checking...');
        await sleep(15_000);
    }

    if (ATTESTOR_PUBKEY_HEX) {
        if (!/^[0-9a-fA-F]{64}$/.test(ATTESTOR_PUBKEY_HEX)) {
            console.error('❌ ATTESTOR_PUBKEY_HEX must be exactly 64 hex chars (32-byte Ed25519 pubkey). Skipping.');
        } else {
            const registerBody = beginCell()
                .store(storeRegisterAttestorKey({ $$type: 'RegisterAttestorKey', pubkey: BigInt('0x' + ATTESTOR_PUBKEY_HEX), authorized: true }))
                .endCell();
            await sendForApproval(
                tonConnect,
                {
                    validUntil: Math.floor(Date.now() / 1000) + 300,
                    messages: [{
                        address: settlementAddr.toString(),
                        amount: toNano('0.05').toString(),
                        payload: registerBody.toBoc().toString('base64'),
                    }],
                },
                `Register attestor key ${ATTESTOR_PUBKEY_HEX.slice(0, 16)}...`,
            );
        }
    } else {
        console.log('\n2️⃣  No ATTESTOR_PUBKEY_HEX provided — register real node attestor keys later, same wallet, no redeploy needed.');
    }

    const recordPath = path.join(__dirname, '..', 'deployment-mainnet.json');
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
    record.contracts.SettlementMasterV2 = settlementAddr.toString();
    record._settlement_v2_note =
        `Deployed ${new Date().toISOString()} via TON Connect (signed by ${connectedAddress}, no mnemonic used). ` +
        `Supports SettleTaskWithProof/SettleBatch (quorum-attested P2P settlement, default quorumThreshold=2-of-3). ` +
        `Old SettlementMaster (${OLD_SETTLEMENT_MASTER}) abandoned in place — held no GSTD, ~0.1 TON at migration time.`;
    fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   DEPLOYMENT COMPLETE ✅                             ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`  SettlementMasterV2 : ${settlementAddr}`);
    console.log(`  Verify: https://tonscan.org/address/${settlementAddr}`);
    console.log('\n📋 Next: set SETTLEMENT_MASTER_V2_ADDRESS in gstdbot/ai config to the address above.');

    process.exit(0);
}

main().catch((e) => {
    console.error('❌ Deployment failed:', e);
    process.exit(1);
});
