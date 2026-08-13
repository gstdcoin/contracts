/**
 * GSTD Quorum-Proof Relay
 *
 * Fetches queued P2P quorum-attested settlement proofs from the platform
 * (POST /api/v1/settlement/quorum-proof — one per node that reached 2-of-3
 * agreement) and submits each as SettlementMaster.SettleTaskWithProof.
 *
 * Why a relay at all, instead of nodes settling on-chain themselves: the
 * gstdbot node wallet (src/wallet/wallet.ts) does not hold a real usable
 * Ed25519 private key — a pre-existing bug where the "public key" fed into
 * WalletContractV4.create() is a raw SHA256 hash, not a real keypair's
 * public key, so no signature can ever be produced for that address. Until
 * that's fixed (a breaking change — it changes every node's TON address —
 * deliberately not done as a side effect of this work), this admin-operated
 * relay is what actually gets SettleTaskWithProof signed and sent. The
 * trust model doesn't weaken from this: SettleTaskWithProof itself has no
 * sender() check — verification comes entirely from the attached quorum
 * signatures, checked on-chain by the contract itself. This relay is just
 * an unprivileged transaction courier; it cannot forge a settlement it
 * wasn't handed a genuine quorum for, because verifyQuorum() would reject it.
 *
 * Run this periodically (cron, or by hand) AFTER SettlementMaster v2 is
 * deployed (scripts/deploy-settlement-v2.ts):
 *
 *   DEPLOYER_MNEMONIC="..." \
 *   SETTLEMENT_ADDRESS="<address from deploy-settlement-v2.ts>" \
 *   TREASURY_SECRET="..." \
 *   TON_API_KEY="..." \
 *   npx ts-node --project tsconfig.deploy.json scripts/settle-quorum-proof.ts
 *
 * Optional:
 *   PLATFORM_API           — defaults to https://app.gstdtoken.com/api/v1
 *   SETTLE_VALUE_TON        — TON attached per settlement call (default 0.2:
 *                             0.1 gas reserve + 0.1 min payment, so worker
 *                             nets 85% of 0.1 = 0.085 TON per settled task)
 */

import 'dotenv/config';
import { Address, beginCell, Cell, toNano, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { SettlementMaster } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';

const MNEMONIC     = process.env.DEPLOYER_MNEMONIC || '';
const SETTLE_ADDR  = process.env.SETTLEMENT_ADDRESS || '';
const API_SECRET   = process.env.TREASURY_SECRET || '';
const TON_API_KEY  = process.env.TON_API_KEY || '';
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

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function waitSeqno(provider: any, seqno: number) {
    for (let i = 0; i < 40; i++) {
        await sleep(3000);
        const cur = await provider.getSeqno();
        if (cur > seqno) return;
    }
    throw new Error('Transaction not confirmed after 120s');
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
    if (!MNEMONIC || !SETTLE_ADDR || !API_SECRET) {
        console.error('❌ Missing: DEPLOYER_MNEMONIC, SETTLEMENT_ADDRESS, TREASURY_SECRET');
        process.exit(1);
    }

    const client   = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: TON_API_KEY });
    const keyPair  = await mnemonicToPrivateKey(MNEMONIC.split(' '));
    const wallet   = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
    const provider = client.open(wallet);
    const settlementAddr = Address.parse(SETTLE_ADDR);
    const settlement = client.open(new SettlementMaster(settlementAddr));

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
        return;
    }

    console.log(`\n💰 Settling ${proofs.length} quorum-attested task(s)...\n`);

    let seqno = await provider.getSeqno();
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

            await settlement.send(
                provider.sender(keyPair.secretKey),
                { value: toNano(SETTLE_VALUE) },
                {
                    $$type: 'SettleTaskWithProof',
                    taskId: taskIdU64,
                    workerAddr,
                    resultHash: resultHashBig,
                    attestationCount: BigInt(p.attestations.length),
                    attestations: attestationsCell,
                    gstdBonusAmount: gstdBonusNano,
                    computeUnits: BigInt(p.computeUnits || 1),
                },
            );
            await waitSeqno(provider, seqno++);
            settledIds.push(p.id);
            console.log('     ✅ Settled on-chain');
        } catch (err: any) {
            // Most common real cause here: verifyQuorum() rejected because
            // the attesting pubkeys aren't registered via RegisterAttestorKey
            // yet, or the quorum threshold wasn't actually met. Leave the
            // proof queued (don't clear it) so it can be retried once fixed.
            console.error(`     ❌ Failed: ${err.message}`);
        }

        await sleep(2000);
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
}

main().catch((err) => {
    console.error('RELAY FAILED:', err.message);
    process.exit(1);
});
