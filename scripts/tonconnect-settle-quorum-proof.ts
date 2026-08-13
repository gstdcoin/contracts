/**
 * GSTD Quorum-Proof Relay — TON Connect version
 *
 * Same as scripts/settle-quorum-proof.ts (see that file's header for the
 * full rationale on why a relay exists at all — node wallets can't sign
 * real transactions today, and SettleTaskWithProof's security comes
 * entirely from the attached quorum signatures, not from trusting whoever
 * submits it), but every settlement is signed by your own wallet app via
 * TON Connect instead of a mnemonic env var. You'll get one approval
 * prompt per queued proof.
 *
 * Usage:
 *   SETTLEMENT_ADDRESS="<address from tonconnect-deploy-settlement-v2.ts>" \
 *   TREASURY_SECRET="..." \
 *   npx ts-node --project tsconfig.deploy.json scripts/tonconnect-settle-quorum-proof.ts
 *
 * Optional:
 *   PLATFORM_API      — defaults to https://app.gstdtoken.com/api/v1
 *   SETTLE_VALUE_TON  — TON attached per settlement call (default 0.2)
 */

import 'dotenv/config';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import { storeSettleTaskWithProof } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';
import { connectWallet, sendForApproval, sleep } from './lib/tonconnect-helper';

const SETTLE_ADDR  = process.env.SETTLEMENT_ADDRESS || '';
const API_SECRET   = process.env.TREASURY_SECRET || '';
const PLATFORM_API = (process.env.PLATFORM_API || 'https://app.gstdtoken.com/api/v1').replace(/\/$/, '');
const SETTLE_VALUE = process.env.SETTLE_VALUE_TON || '0.2';

interface AttestationEntry { pubkeyHex: string; signatureHex: string }
interface QuorumProof {
    id: string;
    taskId: string;
    workerAddr: string;
    resultHash: string;
    attestations: AttestationEntry[];
    gstdBonusAmount: number;
    computeUnits: number;
}

/** MUST exactly match gstdbot's src/p2p/attestation.ts:taskIdToUint64() */
function taskIdToUint64(taskUuid: string): bigint {
    const crypto = require('crypto');
    const digest = crypto.createHash('sha256').update(taskUuid, 'utf-8').digest();
    return BigInt('0x' + digest.subarray(0, 8).toString('hex'));
}

/** MUST exactly match gstdbot's src/p2p/attestation.ts:buildAttestationsChain() */
function buildAttestationsChain(attestations: AttestationEntry[]): Cell {
    let chain: Cell | null = null;
    for (let i = attestations.length - 1; i >= 0; i--) {
        const a = attestations[i];
        const b = beginCell()
            .storeUint(BigInt('0x' + a.pubkeyHex), 256)
            .storeBuffer(Buffer.from(a.signatureHex, 'hex'));
        if (chain) b.storeRef(chain);
        chain = b.endCell();
    }
    if (!chain) throw new Error('empty attestation list');
    return chain;
}

async function main() {
    if (!SETTLE_ADDR || !API_SECRET) {
        console.error('❌ Missing: SETTLEMENT_ADDRESS, TREASURY_SECRET');
        process.exit(1);
    }

    const { tonConnect, address: connectedAddress } = await connectWallet();
    const settlementAddr = Address.parse(SETTLE_ADDR);

    console.log('📡 Fetching queued quorum proofs from platform...');
    const resp = await fetch(`${PLATFORM_API}/settlement/quorum-proofs`, {
        headers: { 'x-admin-secret': API_SECRET },
    });
    if (!resp.ok) {
        console.error('❌ Failed to fetch quorum proofs:', await resp.text());
        process.exit(1);
    }
    const data: any = await resp.json();
    const proofs: QuorumProof[] = data.proofs || [];

    if (proofs.length === 0) {
        console.log('✅ No queued quorum proofs. Nothing to settle.');
        process.exit(0);
    }

    console.log(`\n💰 ${proofs.length} quorum-attested task(s) queued. Signer: ${connectedAddress}\n`);
    console.log('   Each one below will prompt an approval on your wallet.\n');

    const settledIds: string[] = [];

    for (let i = 0; i < proofs.length; i++) {
        const p = proofs[i];
        console.log(`  [${i + 1}/${proofs.length}] task ${p.taskId.slice(0, 8)}... → ${p.workerAddr.slice(0, 20)}... (${p.attestations.length} attestations)`);

        try {
            const workerAddr = Address.parse(p.workerAddr);
            const taskIdU64 = taskIdToUint64(p.taskId);
            const resultHashBig = BigInt('0x' + p.resultHash);
            const attestationsCell = buildAttestationsChain(p.attestations);
            const gstdBonusNano = BigInt(Math.round((p.gstdBonusAmount || 0) * 1e9));

            const body = beginCell()
                .store(storeSettleTaskWithProof({
                    $$type: 'SettleTaskWithProof',
                    taskId: taskIdU64,
                    workerAddr,
                    resultHash: resultHashBig,
                    attestationCount: BigInt(p.attestations.length),
                    attestations: attestationsCell,
                    gstdBonusAmount: gstdBonusNano,
                    computeUnits: BigInt(p.computeUnits || 1),
                }))
                .endCell();

            await sendForApproval(
                tonConnect,
                {
                    validUntil: Math.floor(Date.now() / 1000) + 300,
                    messages: [{
                        address: settlementAddr.toString(),
                        amount: toNano(SETTLE_VALUE).toString(),
                        payload: body.toBoc().toString('base64'),
                    }],
                },
                `Settle task ${p.taskId.slice(0, 8)}... (${SETTLE_VALUE} TON)`,
            );
            settledIds.push(p.id);
        } catch (err: any) {
            console.error(`     ❌ Failed or rejected: ${err.message}`);
        }

        await sleep(1000);
    }

    if (settledIds.length > 0) {
        console.log(`\n📤 Clearing ${settledIds.length} settled proof(s) from the queue...`);
        const clearResp = await fetch(`${PLATFORM_API}/settlement/quorum-proof/clear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': API_SECRET },
            body: JSON.stringify({ ids: settledIds }),
        });
        if (clearResp.ok) {
            console.log('   ✅ Queue cleared');
        } else {
            console.warn('   ⚠️  Failed to clear queue — settled proofs will be retried next run (contract rejects the duplicate taskId harmlessly)');
        }
    }

    console.log(`\n✅ Relay run complete: ${settledIds.length}/${proofs.length} settled`);
    process.exit(0);
}

main().catch((err) => {
    console.error('RELAY FAILED:', err.message);
    process.exit(1);
});
