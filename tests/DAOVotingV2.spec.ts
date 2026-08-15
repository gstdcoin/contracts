import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { DAOVotingV2 } from '../build/DAOVotingV2/DAOVotingV2_DAOVotingV2';
import { Proposal } from '../build/DAOVotingV2/DAOVotingV2_Proposal';
import '@ton/test-utils';

// Regression test for the v1 quorum bug: v1's Proposal.quorumStake was seeded
// from a field documented and scaled as "10,000 GSTD" (1e13), but votes are
// counted in raw attached TON — both use 9-decimal nano units, so the real
// effect was a ~10,000 TON quorum that no proposal could ever reach. This
// suite proves a realistic vote total (well under 10,000 TON, at least the
// new 20 TON default) actually passes and executes in v2.

describe('DAOVotingV2 — quorum fix', () => {
  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let voterA: SandboxContract<TreasuryContract>;
  let voterB: SandboxContract<TreasuryContract>;
  let target: SandboxContract<TreasuryContract>;
  let jetton: SandboxContract<TreasuryContract>;
  let dao: SandboxContract<DAOVotingV2>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    deployer = await blockchain.treasury('deployer');
    voterA = await blockchain.treasury('voterA', { balance: toNano('1000') });
    voterB = await blockchain.treasury('voterB', { balance: toNano('1000') });
    target = await blockchain.treasury('target');
    jetton = await blockchain.treasury('jetton');

    dao = blockchain.openContract(await DAOVotingV2.fromInit(deployer.address, jetton.address));
    const deployResult = await dao.send(
      deployer.getSender(),
      { value: toNano('1') },
      { $$type: 'Deploy', queryId: 0n },
    );
    expect(deployResult.transactions).toHaveTransaction({ from: deployer.address, to: dao.address, success: true });
  });

  it('defaults to a 20 TON quorum, not the old ~10,000 TON', async () => {
    const stats = await dao.getGetGovernanceStats();
    expect(stats.quorumStakeTon).toEqual(toNano('20'));
  });

  it('lets a realistic vote total (22 TON) actually reach quorum and execute', async () => {
    const votingPeriod = 7n * 24n * 3600n; // 7 days, matches contract's documented default usage
    const create = await dao.send(
      deployer.getSender(),
      { value: toNano('2') },
      {
        $$type: 'CreateProposal',
        title: 'Test proposal',
        descriptionHash: 0n,
        targetContract: target.address,
        payload: beginCell().endCell(),
        votingPeriod,
      },
    );
    expect(create.transactions).toHaveTransaction({ from: deployer.address, to: dao.address, success: true });

    const proposalAddr = await dao.getGetProposalAddress(0n);
    const proposal = blockchain.openContract(Proposal.fromAddress(proposalAddr));

    // Two voters, 12 + 10 = 22 TON total — comfortably above the new 20 TON
    // quorum, and utterly unreachable under v1's ~10,000 TON bug.
    const voteA = await proposal.send(voterA.getSender(), { value: toNano('12') }, { $$type: 'CastVote', proposalId: 0n, support: true });
    expect(voteA.transactions).toHaveTransaction({ from: voterA.address, to: proposalAddr, success: true });

    const voteB = await proposal.send(voterB.getSender(), { value: toNano('10') }, { $$type: 'CastVote', proposalId: 0n, support: true });
    expect(voteB.transactions).toHaveTransaction({ from: voterB.address, to: proposalAddr, success: true });

    const dataAfterVotes = await proposal.getGetProposalData();
    expect(dataAfterVotes.votesFor + dataAfterVotes.votesAgainst).toBeGreaterThanOrEqual(toNano('20'));
    expect(dataAfterVotes.status).toEqual(0n); // still Active — timelock hasn't expired

    // Fast-forward past votingPeriod + 48h timelock
    blockchain.now = Math.floor(Date.now() / 1000) + Number(votingPeriod) + 172800 + 10;

    const exec = await dao.send(deployer.getSender(), { value: toNano('0.2') }, { $$type: 'ExecuteProposal', proposalId: 0n });
    expect(exec.transactions).toHaveTransaction({ from: dao.address, to: proposalAddr, success: true });

    const dataAfterExec = await proposal.getGetProposalData();
    expect(dataAfterExec.status).toEqual(3n); // Executed

    const statsAfter = await dao.getGetGovernanceStats();
    expect(statsAfter.executedCount).toEqual(1n);
  });

  it('rejects execution below the 20 TON quorum, same as before', async () => {
    const votingPeriod = 7n * 24n * 3600n;
    await dao.send(
      deployer.getSender(),
      { value: toNano('2') },
      {
        $$type: 'CreateProposal',
        title: 'Underfunded proposal',
        descriptionHash: 0n,
        targetContract: target.address,
        payload: beginCell().endCell(),
        votingPeriod,
      },
    );
    const proposalAddr = await dao.getGetProposalAddress(0n);
    const proposal = blockchain.openContract(Proposal.fromAddress(proposalAddr));

    // Only 5 TON total — below the 20 TON quorum
    await proposal.send(voterA.getSender(), { value: toNano('5') }, { $$type: 'CastVote', proposalId: 0n, support: true });

    blockchain.now = Math.floor(Date.now() / 1000) + Number(votingPeriod) + 172800 + 10;

    const exec = await dao.send(deployer.getSender(), { value: toNano('0.2') }, { $$type: 'ExecuteProposal', proposalId: 0n });
    // DAOVoting's ExecuteProposal uses SendIgnoreErrors, so the forwarding
    // message itself "succeeds" at the DAO level -- the actual rejection
    // happens inside Proposal's own execute() require(), which we verify
    // via status staying Active rather than becoming Executed.
    expect(exec.transactions).toHaveTransaction({ from: dao.address, to: proposalAddr });

    const data = await proposal.getGetProposalData();
    expect(data.status).toEqual(0n); // still Active, not Executed
  });
});
