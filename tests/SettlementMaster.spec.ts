import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import { keyPairFromSeed, sign, KeyPair } from '@ton/crypto';
import { SettlementMaster } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';
import '@ton/test-utils';

// ── Helpers ──────────────────────────────────────────────────────────────

function keypairFromIndex(i: number): KeyPair {
  const seed = Buffer.alloc(32, i + 1); // deterministic, distinct per index
  return keyPairFromSeed(seed);
}

function pubkeyToBigInt(pubkey: Buffer): bigint {
  return BigInt('0x' + pubkey.toString('hex'));
}

// Mirrors the Tact contract's msgHash computation exactly:
// beginCell().storeUint(taskId,64).storeAddress(workerAddr).storeUint(resultHash,256).endCell().hash()
function computeMsgHash(taskId: bigint, workerAddr: Address, resultHash: bigint): Buffer {
  return beginCell()
    .storeUint(taskId, 64)
    .storeAddress(workerAddr)
    .storeUint(resultHash, 256)
    .endCell()
    .hash();
}

function signAttestation(taskId: bigint, workerAddr: Address, resultHash: bigint, kp: KeyPair): Buffer {
  const hash = computeMsgHash(taskId, workerAddr, resultHash);
  return sign(hash, kp.secretKey); // 64-byte Ed25519 signature
}

// Builds the attestations Cell chain the contract's verifyQuorum() walks:
// each cell = {pubkey: uint256, signature: 512 bits}, ref[0] = next (or none).
function buildAttestationsChain(entries: { pubkey: bigint; signature: Buffer }[]): Cell {
  let chain: Cell | null = null;
  // build from the last entry backward so each cell's ref points to the already-built next cell
  for (let i = entries.length - 1; i >= 0; i--) {
    const b = beginCell().storeUint(entries[i].pubkey, 256).storeBuffer(entries[i].signature);
    if (chain) b.storeRef(chain);
    chain = b.endCell();
  }
  return chain!;
}

describe('SettlementMaster — P2P quorum settlement', () => {
  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let worker: SandboxContract<TreasuryContract>;
  let treasury: SandboxContract<TreasuryContract>;
  let protocolFee: SandboxContract<TreasuryContract>;
  let jetton: SandboxContract<TreasuryContract>;
  let settlement: SandboxContract<SettlementMaster>;

  let nodeKeys: KeyPair[]; // 3 "registered node" keypairs
  let strangerKey: KeyPair; // NOT registered — used for the "unauthorized signer" test

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    deployer = await blockchain.treasury('deployer');
    worker = await blockchain.treasury('worker');
    treasury = await blockchain.treasury('treasury');
    protocolFee = await blockchain.treasury('protocolFee');
    jetton = await blockchain.treasury('jetton');

    nodeKeys = [keypairFromIndex(0), keypairFromIndex(1), keypairFromIndex(2)];
    strangerKey = keypairFromIndex(99);

    settlement = blockchain.openContract(
      await SettlementMaster.fromInit(deployer.address, jetton.address, treasury.address, protocolFee.address),
    );

    const deployResult = await settlement.send(
      deployer.getSender(),
      { value: toNano('0.5') },
      { $$type: 'Deploy', queryId: 0n },
    );
    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: settlement.address,
      deploy: true,
      success: true,
    });

    // Register all 3 node pubkeys as authorized attestors (DAO-only action)
    for (const kp of nodeKeys) {
      const res = await settlement.send(
        deployer.getSender(),
        { value: toNano('0.05') },
        { $$type: 'RegisterAttestorKey', pubkey: pubkeyToBigInt(kp.publicKey), authorized: true },
      );
      expect(res.transactions).toHaveTransaction({ to: settlement.address, success: true });
    }

    // Default quorum is 2; set explicitly so the test doesn't depend on the contract default
    const qRes = await settlement.send(
      deployer.getSender(),
      { value: toNano('0.05') },
      { $$type: 'SetQuorumThreshold', threshold: 2n },
    );
    expect(qRes.transactions).toHaveTransaction({ to: settlement.address, success: true });
  });

  it('accepts settlement with a valid 2-of-3 quorum and pays the worker 85%', async () => {
    const taskId = 1001n;
    const resultHash = 777777n;

    const attestations = buildAttestationsChain([
      { pubkey: pubkeyToBigInt(nodeKeys[0].publicKey), signature: signAttestation(taskId, worker.address, resultHash, nodeKeys[0]) },
      { pubkey: pubkeyToBigInt(nodeKeys[1].publicKey), signature: signAttestation(taskId, worker.address, resultHash, nodeKeys[1]) },
    ]);

    const value = toNano('1'); // 0.1 gas reserve + 0.9 payable
    const balanceBefore = await worker.getBalance();

    const result = await settlement.send(
      // Submitted by a THIRD PARTY (not the worker, not a "gateway") — proves
      // trust comes from the attached signatures, not from who calls.
      deployer.getSender(),
      { value },
      {
        $$type: 'SettleTaskWithProof',
        taskId,
        workerAddr: worker.address,
        resultHash,
        attestationCount: 2n,
        attestations,
        gstdBonusAmount: 0n,
        computeUnits: 100n,
      },
    );

    expect(result.transactions).toHaveTransaction({ to: settlement.address, success: true });
    const balanceAfter = await worker.getBalance();
    const received = balanceAfter - balanceBefore;
    // worker share is 85% of (value - 0.1 TON gas reserve) = 85% of 0.9 TON = 0.765 TON
    expect(received).toBeGreaterThan(toNano('0.7'));
    expect(received).toBeLessThan(toNano('0.8'));

    const settled = await settlement.getIsTaskSettled(taskId);
    expect(settled).toBe(true);
  });

  it('rejects settlement with only 1-of-3 signatures (below threshold)', async () => {
    const taskId = 1002n;
    const resultHash = 888888n;

    const attestations = buildAttestationsChain([
      { pubkey: pubkeyToBigInt(nodeKeys[0].publicKey), signature: signAttestation(taskId, worker.address, resultHash, nodeKeys[0]) },
    ]);

    const result = await settlement.send(
      deployer.getSender(),
      { value: toNano('1') },
      {
        $$type: 'SettleTaskWithProof',
        taskId,
        workerAddr: worker.address,
        resultHash,
        attestationCount: 1n,
        attestations,
        gstdBonusAmount: 0n,
        computeUnits: 100n,
      },
    );

    expect(result.transactions).toHaveTransaction({ to: settlement.address, success: false });
    const settled = await settlement.getIsTaskSettled(taskId);
    expect(settled).toBe(false);
  });

  it('rejects a duplicated signature counted as two attestations (Sybil-of-one)', async () => {
    const taskId = 1003n;
    const resultHash = 999999n;
    const sig0 = signAttestation(taskId, worker.address, resultHash, nodeKeys[0]);

    // Same pubkey + same signature submitted twice — must be counted as ONE
    // distinct attestor, not two, so this should fail the 2-of-3 threshold.
    const attestations = buildAttestationsChain([
      { pubkey: pubkeyToBigInt(nodeKeys[0].publicKey), signature: sig0 },
      { pubkey: pubkeyToBigInt(nodeKeys[0].publicKey), signature: sig0 },
    ]);

    const result = await settlement.send(
      deployer.getSender(),
      { value: toNano('1') },
      {
        $$type: 'SettleTaskWithProof',
        taskId,
        workerAddr: worker.address,
        resultHash,
        attestationCount: 2n,
        attestations,
        gstdBonusAmount: 0n,
        computeUnits: 100n,
      },
    );

    expect(result.transactions).toHaveTransaction({ to: settlement.address, success: false });
  });

  it('rejects a quorum that includes an unregistered (unauthorized) signer', async () => {
    const taskId = 1004n;
    const resultHash = 555555n;

    // Only nodeKeys[0] is authorized; strangerKey is a real, validly-signed
    // key but was never registered via RegisterAttestorKey.
    const attestations = buildAttestationsChain([
      { pubkey: pubkeyToBigInt(nodeKeys[0].publicKey), signature: signAttestation(taskId, worker.address, resultHash, nodeKeys[0]) },
      { pubkey: pubkeyToBigInt(strangerKey.publicKey), signature: signAttestation(taskId, worker.address, resultHash, strangerKey) },
    ]);

    const result = await settlement.send(
      deployer.getSender(),
      { value: toNano('1') },
      {
        $$type: 'SettleTaskWithProof',
        taskId,
        workerAddr: worker.address,
        resultHash,
        attestationCount: 2n,
        attestations,
        gstdBonusAmount: 0n,
        computeUnits: 100n,
      },
    );

    expect(result.transactions).toHaveTransaction({ to: settlement.address, success: false });
  });

  it('rejects a forged signature (tampered resultHash) even from a registered signer', async () => {
    const taskId = 1005n;
    const realResultHash = 111n;
    const claimedResultHash = 222n; // attacker claims a different result than what was signed

    const attestations = buildAttestationsChain([
      { pubkey: pubkeyToBigInt(nodeKeys[0].publicKey), signature: signAttestation(taskId, worker.address, realResultHash, nodeKeys[0]) },
      { pubkey: pubkeyToBigInt(nodeKeys[1].publicKey), signature: signAttestation(taskId, worker.address, realResultHash, nodeKeys[1]) },
    ]);

    const result = await settlement.send(
      deployer.getSender(),
      { value: toNano('1') },
      {
        $$type: 'SettleTaskWithProof',
        taskId,
        workerAddr: worker.address,
        resultHash: claimedResultHash, // mismatched vs. what was actually signed
        attestationCount: 2n,
        attestations,
        gstdBonusAmount: 0n,
        computeUnits: 100n,
      },
    );

    expect(result.transactions).toHaveTransaction({ to: settlement.address, success: false });
  });

  it('rejects replay: the same taskId cannot be settled twice', async () => {
    const taskId = 1006n;
    const resultHash = 42n;
    const attestations = buildAttestationsChain([
      { pubkey: pubkeyToBigInt(nodeKeys[0].publicKey), signature: signAttestation(taskId, worker.address, resultHash, nodeKeys[0]) },
      { pubkey: pubkeyToBigInt(nodeKeys[1].publicKey), signature: signAttestation(taskId, worker.address, resultHash, nodeKeys[1]) },
    ]);
    const msg = {
      $$type: 'SettleTaskWithProof' as const,
      taskId,
      workerAddr: worker.address,
      resultHash,
      attestationCount: 2n,
      attestations,
      gstdBonusAmount: 0n,
      computeUnits: 100n,
    };

    const first = await settlement.send(deployer.getSender(), { value: toNano('1') }, msg);
    expect(first.transactions).toHaveTransaction({ to: settlement.address, success: true });

    const second = await settlement.send(deployer.getSender(), { value: toNano('1') }, msg);
    expect(second.transactions).toHaveTransaction({ to: settlement.address, success: false });
  });

  it('SettleBatch settles multiple attested tasks for one worker in a single call', async () => {
    const workerAddr = worker.address;
    const entries = [
      { taskId: 2001n, resultHash: 10n, computeUnits: 50n },
      { taskId: 2002n, resultHash: 20n, computeUnits: 75n },
    ];

    // Build the entries chain: each BatchEntry cell is
    // {taskId:64, resultHash:256, attestationCount:8, computeUnits:64}, ref[0]=attestations, ref[1]=next entry (or none)
    let chain: Cell | null = null;
    for (let i = entries.length - 1; i >= 0; i--) {
      const e = entries[i];
      const attestations = buildAttestationsChain([
        { pubkey: pubkeyToBigInt(nodeKeys[0].publicKey), signature: signAttestation(e.taskId, workerAddr, e.resultHash, nodeKeys[0]) },
        { pubkey: pubkeyToBigInt(nodeKeys[1].publicKey), signature: signAttestation(e.taskId, workerAddr, e.resultHash, nodeKeys[1]) },
      ]);
      const b = beginCell()
        .storeUint(e.taskId, 64)
        .storeUint(e.resultHash, 256)
        .storeUint(2, 8) // attestationCount
        .storeUint(e.computeUnits, 64)
        .storeRef(attestations);
      if (chain) b.storeRef(chain);
      chain = b.endCell();
    }

    const balanceBefore = await worker.getBalance();
    const result = await settlement.send(
      deployer.getSender(),
      { value: toNano('1') },
      {
        $$type: 'SettleBatch',
        workerAddr,
        entryCount: BigInt(entries.length),
        entries: chain!,
        totalGstdBonusAmount: 0n,
      },
    );

    expect(result.transactions).toHaveTransaction({ to: settlement.address, success: true });
    const balanceAfter = await worker.getBalance();
    expect(balanceAfter - balanceBefore).toBeGreaterThan(toNano('0.7'));

    expect(await settlement.getIsTaskSettled(2001n)).toBe(true);
    expect(await settlement.getIsTaskSettled(2002n)).toBe(true);
  });

  it('the original gateway-only SettleTask path still works unmodified', async () => {
    // Regression check: adding the quorum path must not break the existing
    // trusted-gateway path that mainnet already depends on.
    const taskId = 3001n;
    const result = await settlement.send(
      deployer.getSender(), // deployer == owner == initial gateway
      { value: toNano('1') },
      {
        $$type: 'SettleTask',
        taskId,
        workerAddr: worker.address,
        gstdBonusAmount: 0n,
        qualityScore: 7500n,
        computeUnits: 100n,
      },
    );
    expect(result.transactions).toHaveTransaction({ to: settlement.address, success: true });

    // A random, non-gateway sender must still be rejected on the OLD path
    const stranger = await blockchain.treasury('stranger');
    const rejected = await settlement.send(
      stranger.getSender(),
      { value: toNano('1') },
      {
        $$type: 'SettleTask',
        taskId: 3002n,
        workerAddr: worker.address,
        gstdBonusAmount: 0n,
        qualityScore: 7500n,
        computeUnits: 100n,
      },
    );
    expect(rejected.transactions).toHaveTransaction({ to: settlement.address, success: false });
  });
});
