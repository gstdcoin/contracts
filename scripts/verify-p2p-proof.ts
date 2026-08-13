/**
 * Cross-repo verification: loads a REAL attestation proof produced by the
 * gstdcoin/gstdbot P2P layer (3 actual libp2p nodes, real network, real
 * Ed25519 signing — see gstdbot's tests/p2p-quorum-live.ts) and submits it
 * to the actual compiled SettlementMaster contract in the TON sandbox.
 *
 * This is the step that proves the two halves of the redesign (P2P
 * attestation signing in TypeScript, quorum verification in Tact) are
 * genuinely bit-for-bit compatible — not just independently plausible.
 *
 * Run after gstdbot's tests/p2p-quorum-live.ts has produced
 * .p2p-test-tmp/node0-quorum-proof.json:
 *   npx ts-node --project tsconfig.json scripts/verify-p2p-proof.ts <path-to-proof.json>
 */
import { Blockchain } from '@ton/sandbox';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { SettlementMaster } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';
import '@ton/test-utils';

function taskIdToUint64(taskUuid: string): bigint {
    // Must exactly match gstdcoin/gstdbot's src/p2p/attestation.ts::taskIdToUint64
    const digest = createHash('sha256').update(taskUuid, 'utf-8').digest();
    return BigInt('0x' + digest.subarray(0, 8).toString('hex'));
}

function buildAttestationsChain(entries: { pubkeyHex: string; signatureHex: string }[]): Cell {
    let chain: Cell | null = null;
    for (let i = entries.length - 1; i >= 0; i--) {
        const b = beginCell().storeUint(BigInt('0x' + entries[i].pubkeyHex), 256).storeBuffer(Buffer.from(entries[i].signatureHex, 'hex'));
        if (chain) b.storeRef(chain);
        chain = b.endCell();
    }
    if (!chain) throw new Error('empty attestations');
    return chain;
}

async function main() {
    const proofPath = process.argv[2] || '../gstdbot-full/.p2p-test-tmp/node0-quorum-proof.json';
    if (!existsSync(proofPath)) {
        console.error(`Proof file not found: ${proofPath}`);
        console.error('Run gstdcoin/gstdbot\'s "npx tsx tests/p2p-quorum-live.ts" first to generate it.');
        process.exit(1);
    }
    const proof = JSON.parse(readFileSync(proofPath, 'utf-8'));
    console.log('Loaded real P2P-generated proof:');
    console.log('  taskId (UUID):', proof.taskId);
    console.log('  workerAddr:', proof.workerAddr);
    console.log('  resultHash:', proof.resultHash);
    console.log('  attestations:', proof.attestations.length);

    const blockchain = await Blockchain.create();
    const deployer = await blockchain.treasury('deployer');
    const treasury = await blockchain.treasury('treasury');
    const protocolFee = await blockchain.treasury('protocolFee');
    const jetton = await blockchain.treasury('jetton');

    const settlement = blockchain.openContract(
        await SettlementMaster.fromInit(deployer.address, jetton.address, treasury.address, protocolFee.address),
    );
    await settlement.send(deployer.getSender(), { value: toNano('0.5') }, { $$type: 'Deploy', queryId: 0n });

    // Register the REAL pubkeys the P2P layer actually produced/used — not
    // pubkeys fabricated fresh in this script.
    for (const att of proof.attestations) {
        await settlement.send(
            deployer.getSender(),
            { value: toNano('0.05') },
            { $$type: 'RegisterAttestorKey', pubkey: BigInt('0x' + att.pubkeyHex), authorized: true },
        );
    }
    await settlement.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'SetQuorumThreshold', threshold: 2n });

    const workerAddr = Address.parse(proof.workerAddr);
    const taskId = taskIdToUint64(proof.taskId);
    const resultHash = BigInt('0x' + proof.resultHash);
    const attestations = buildAttestationsChain(proof.attestations);

    const result = await settlement.send(
        deployer.getSender(), // irrelevant WHO submits — trust is in the attached signatures
        { value: toNano('1') },
        {
            $$type: 'SettleTaskWithProof',
            taskId,
            workerAddr,
            resultHash,
            attestationCount: BigInt(proof.attestations.length),
            attestations,
            gstdBonusAmount: 0n,
            computeUnits: 100n,
        },
    );

    const settled = await settlement.getIsTaskSettled(taskId);

    console.log('\n=== Result ===');
    console.log('Task settled on-chain (sandbox):', settled);

    if (settled) {
        console.log('\nPASS — signatures produced by the real gstdbot P2P layer over a real');
        console.log('network were accepted by the actual compiled SettlementMaster contract.');
        console.log('The P2P attestation format and the Tact verifyQuorum() implementation');
        console.log('are confirmed bit-for-bit compatible, end to end.');
        process.exit(0);
    } else {
        console.error('\nFAIL — the contract did not accept the P2P-generated proof.');
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Verification script crashed:', err);
    process.exit(1);
});
