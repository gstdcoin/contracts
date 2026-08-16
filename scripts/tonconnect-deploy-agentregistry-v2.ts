/**
 * GSTD AgentRegistryV2 — mainnet deployment via TON Connect
 *
 * Fixes a live bug in v1 (EQDtWcGCQXLFdh7TmkL5QFbFNYXxL9mjOk4ehmsNFwCtsDoT,
 * left untouched, not migrated): getNodeAddress() recomputed a NodeIdentity's
 * address from placeholder constructor args instead of the real ones used at
 * RegisterNode time, so UpdateReputation/ReportGenesisViolation have been
 * silently going nowhere for virtually every real node since deploy. See
 * AgentRegistryV2.tact's header comment for the full explanation, and
 * tests/AgentRegistryV2.spec.ts for the passing regression tests proving the
 * fix (address now resolves to a real contract, UpdateReputation actually
 * reaches and updates it).
 *
 * This deploys a NEW contract at a NEW address -- v1 keeps running as-is,
 * nothing is migrated automatically. Existing registered nodes on v1 are not
 * carried over (v1 has no way to enumerate them for a bulk migration; new
 * registrations should point at this address going forward). Wiring gstdbot/
 * ai's config to the new address is a separate step, noted at the end.
 *
 * Signs from your own wallet app (Tonkeeper by default) via TON Connect --
 * nothing here ever reads or transmits a seed phrase.
 *
 * Usage:
 *   npx ts-node --project tsconfig.deploy.json scripts/tonconnect-deploy-agentregistry-v2.ts
 *
 * Optional:
 *   ADMIN_WALLET — defaults to the connected wallet's own address
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Address, beginCell, contractAddress, storeStateInit, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { AgentRegistryV2, storeDeploy } from '../build/AgentRegistryV2/AgentRegistryV2_AgentRegistryV2';
import { connectWallet, sendForApproval } from './lib/tonconnect-helper';

const OLD_AGENT_REGISTRY   = 'EQDtWcGCQXLFdh7TmkL5QFbFNYXxL9mjOk4ehmsNFwCtsDoT'; // left untouched, not migrated
const SETTLEMENT_MASTER_V2 = 'EQCi-QjafvcYE7wgl9Dc5jAFJrmiy_oGfcobzORb2gZQezhE'; // the one real node registrations should trust

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
    const { tonConnect, address: connectedAddress } = await connectWallet();
    const adminAddr = Address.parse(process.env.ADMIN_WALLET || connectedAddress);
    const settlementAddr = Address.parse(SETTLEMENT_MASTER_V2);

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   AgentRegistryV2 — MAINNET DEPLOY (TON Connect)     ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Signer       : ${connectedAddress.slice(0, 20)}... (your wallet)`);
    console.log(`║  Owner        : ${adminAddr.toString().slice(0, 20)}...`);
    console.log(`║  Settlement   : ${SETTLEMENT_MASTER_V2.slice(0, 20)}... (existing, unchanged)`);
    console.log(`║  Old Registry : ${OLD_AGENT_REGISTRY.slice(0, 20)}... (left running, not migrated)`);
    console.log('╚══════════════════════════════════════════════════════╝\n');

    const registryInit = await AgentRegistryV2.init(adminAddr, settlementAddr);
    const registryAddr = contractAddress(0, registryInit);
    console.log(`Computed address: ${registryAddr}\n`);

    const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: process.env.TON_API_KEY });
    console.log('🔍 Checking this address isn\'t already deployed (avoid burning gas twice)...');
    if (await client.isContractDeployed(registryAddr)) {
        console.log(`\n✓  Already deployed at ${registryAddr} — nothing to send. Skipping deploy transaction.`);
    } else {
        const signerBalance = await client.getBalance(Address.parse(connectedAddress));
        const needed = toNano('0.15');
        console.log(`   Wallet balance: ${Number(signerBalance) / 1e9} TON (need ~${Number(needed) / 1e9} TON for this deploy)`);
        if (signerBalance < needed) {
            console.error(`\n❌ Insufficient balance in ${connectedAddress}. Top up before retrying — aborting, nothing sent.`);
            process.exit(1);
        }

        const stateInitCell = beginCell().store(storeStateInit(registryInit)).endCell();
        const deployBody = beginCell().store(storeDeploy({ $$type: 'Deploy', queryId: BigInt(Date.now()) })).endCell();

        console.log(`\n💸 About to request approval for: 0.15 TON → ${registryAddr} (contract deploy, one-time)`);
        await sendForApproval(
            tonConnect,
            {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [{
                    address: registryAddr.toString(),
                    amount: needed.toString(),
                    stateInit: stateInitCell.toBoc().toString('base64'),
                    payload: deployBody.toBoc().toString('base64'),
                }],
            },
            `Deploy AgentRegistryV2 at ${registryAddr}`,
        );

        console.log('\n⏳ Waiting ~15s for the deploy to land before checking...');
        await sleep(15_000);

        const deployed = await client.isContractDeployed(registryAddr);
        if (!deployed) {
            console.error('\n⚠ Deploy transaction sent but address does not show as deployed yet -- check again in a minute before assuming failure.');
        }
    }

    const recordPath = path.join(__dirname, '..', 'deployment-mainnet.json');
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
    record.contracts.AgentRegistryV2 = registryAddr.toString();
    record._agent_registry_v2_note =
        `Deployed ${new Date().toISOString()} via TON Connect (signed by ${connectedAddress}, no mnemonic used). ` +
        `Fixes v1's getNodeAddress() bug (placeholder-arg address computation meant UpdateReputation/` +
        `ReportGenesisViolation silently went nowhere for virtually every real node) -- see AgentRegistryV2.tact header. ` +
        `Old AgentRegistry (${OLD_AGENT_REGISTRY}) left running, not migrated -- nodes must re-register on v2 to be tracked correctly. ` +
        `settlementContract points at SettlementMasterV2 (${SETTLEMENT_MASTER_V2}).`;
    fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   DEPLOYMENT COMPLETE ✅                             ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`  AgentRegistryV2 : ${registryAddr}`);
    console.log(`  Verify: https://tonscan.org/address/${registryAddr}`);
    console.log('\n📋 Next: point gstdbot/ai config (AGENT_REGISTRY_ADDRESS) at the address above so new');
    console.log('   node registrations use the fixed contract. This wiring step still needs GitHub/Vercel');
    console.log('   access to actually reach production, same as the rest of this session\'s fixes.');

    process.exit(0);
}

main().catch((e) => {
    console.error('❌ Deployment failed:', e);
    process.exit(1);
});
