import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { AgentRegistryV2 } from '../build/AgentRegistryV2/AgentRegistryV2_AgentRegistryV2';
import { NodeIdentity } from '../build/AgentRegistryV2/AgentRegistryV2_NodeIdentity';
import '@ton/test-utils';

// Regression test for the v1 address-resolution bug: v1's getNodeAddress()
// recomputed a NodeIdentity's address via initOf with placeholder args
// (owner=zero address, nodeType=0, capabilities=0, region=0) instead of the
// real ones used at RegisterNode time. Since a contract's address depends on
// its full initial data (which is derived from the real constructor args),
// this placeholder address essentially never matched the real deployed
// NodeIdentity -- so UpdateReputation/ReportGenesisViolation silently went
// nowhere for any node that wasn't literally type 0/caps 0/region 0,
// registered by the zero address. This suite proves a realistic node
// (type=2 GPU, real capabilities, region=3, registered by a real wallet)
// now actually resolves and receives forwarded messages end-to-end.

describe('AgentRegistryV2 — node address resolution fix', () => {
  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let settlement: SandboxContract<TreasuryContract>;
  let nodeOperator: SandboxContract<TreasuryContract>;
  let registry: SandboxContract<AgentRegistryV2>;

  const NODE_ID = 12345n;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    deployer = await blockchain.treasury('deployer');
    settlement = await blockchain.treasury('settlement');
    nodeOperator = await blockchain.treasury('nodeOperator');

    registry = blockchain.openContract(await AgentRegistryV2.fromInit(deployer.address, settlement.address));
    const deployResult = await registry.send(
      deployer.getSender(),
      { value: toNano('1') },
      { $$type: 'Deploy', queryId: 0n },
    );
    expect(deployResult.transactions).toHaveTransaction({ from: deployer.address, to: registry.address, success: true });
  });

  it('resolves the real deployed NodeIdentity address, not a placeholder-derived guess', async () => {
    // A realistic node: GPU type (2), a real capabilities bitmask, region 3 (ASIA-JP),
    // registered by a real wallet -- none of v1's placeholder values (0, 0, 0, zero address).
    const register = await registry.send(
      nodeOperator.getSender(),
      { value: toNano('0.5') },
      {
        $$type: 'RegisterNode',
        nodeId: NODE_ID,
        nodeType: 2n,
        publicKey: beginCell().storeUint(0, 256).endCell().asSlice(),
        genesisHash: 0n,
        capabilities: 7n, // LLM + Embed + Vision
        region: 3n,
      },
    );
    expect(register.transactions).toHaveTransaction({ from: nodeOperator.address, to: registry.address, success: true });

    const resolvedAddr = await registry.getGetNodeAddress(NODE_ID);
    const nodeIdentity = blockchain.openContract(NodeIdentity.fromAddress(resolvedAddr));

    // If the getter still used placeholder args (v1's bug), this getter call
    // would throw "Trying to run get method on non-active contract" -- there
    // would be no real contract deployed at that guessed address.
    const info = await nodeIdentity.getGetNodeInfo();
    expect(info.nodeId).toEqual(NODE_ID);
    expect(info.owner.toString()).toEqual(nodeOperator.address.toString());
    expect(info.nodeType).toEqual(2n);
    expect(info.capabilities).toEqual(7n);
    expect(info.region).toEqual(3n);
  });

  it('lets UpdateReputation actually reach and update the real node (was a silent no-op in v1)', async () => {
    await registry.send(
      nodeOperator.getSender(),
      { value: toNano('0.5') },
      {
        $$type: 'RegisterNode',
        nodeId: NODE_ID,
        nodeType: 2n,
        publicKey: beginCell().storeUint(0, 256).endCell().asSlice(),
        genesisHash: 0n,
        capabilities: 7n,
        region: 3n,
      },
    );

    const resolvedAddr = await registry.getGetNodeAddress(NODE_ID);
    const nodeIdentity = blockchain.openContract(NodeIdentity.fromAddress(resolvedAddr));

    const before = await nodeIdentity.getGetNodeInfo();
    expect(before.qualityScore).toEqual(0n);
    expect(before.tasksCompleted).toEqual(0n);

    const update = await registry.send(
      settlement.getSender(),
      { value: toNano('0.2') },
      { $$type: 'UpdateReputation', nodeId: NODE_ID, qualityDelta: 10n, uptimeDelta: 5n, tasksDelta: 3n },
    );
    // Confirms the forwarded message actually landed on a real, active contract.
    expect(update.transactions).toHaveTransaction({ from: registry.address, to: resolvedAddr, success: true });

    const after = await nodeIdentity.getGetNodeInfo();
    expect(after.qualityScore).toEqual(10n);
    expect(after.uptimeScore).toEqual(5n);
    expect(after.tasksCompleted).toEqual(3n);
  });
});
