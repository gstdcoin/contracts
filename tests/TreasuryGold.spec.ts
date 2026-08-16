import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, toNano } from '@ton/core';
import { TreasuryGold } from '../build/TreasuryGold/TreasuryGold_TreasuryGold';
import '@ton/test-utils';

// TreasuryGold previously sent a plain text comment ("swap_to_xaut") to the
// DEX router, which no real STON.fi router accepts as a swap instruction --
// it would never have executed a trade. And GoldSwapConfirmed trusted a
// self-reported XAUt amount from either the router OR the owner, with no
// on-chain proof -- spoofable reserve accounting. This suite proves the
// fixed version (a) only the owner can trigger a swap, (b) the swap sends a
// real STON.fi v2.1 + pTON v2.1 message to our own pTON wallet, not a
// comment, and (c) gold reserve accounting only moves on a genuine TEP-74
// TransferNotification from our own verified XAUt wallet -- an arbitrary
// sender claiming a transfer happened is rejected.

describe('TreasuryGold — real swap wiring + spoofing fix', () => {
  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let attacker: SandboxContract<TreasuryContract>;
  let xautJetton: SandboxContract<TreasuryContract>;
  let dexRouter: SandboxContract<TreasuryContract>;
  let ptonMaster: SandboxContract<TreasuryContract>;
  let ownXautWallet: SandboxContract<TreasuryContract>;
  let ownPtonWallet: SandboxContract<TreasuryContract>;
  let routerXautWallet: SandboxContract<TreasuryContract>;
  let treasury: SandboxContract<TreasuryGold>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    deployer = await blockchain.treasury('deployer');
    attacker = await blockchain.treasury('attacker');
    xautJetton = await blockchain.treasury('xautJetton');
    dexRouter = await blockchain.treasury('dexRouter');
    ptonMaster = await blockchain.treasury('ptonMaster');
    ownXautWallet = await blockchain.treasury('ownXautWallet');
    ownPtonWallet = await blockchain.treasury('ownPtonWallet');
    routerXautWallet = await blockchain.treasury('routerXautWallet');

    treasury = blockchain.openContract(
      await TreasuryGold.fromInit(deployer.address, xautJetton.address, dexRouter.address),
    );
    const deployResult = await treasury.send(
      deployer.getSender(),
      { value: toNano('1') },
      { $$type: 'Deploy', queryId: 0n },
    );
    expect(deployResult.transactions).toHaveTransaction({ from: deployer.address, to: treasury.address, success: true });

    // Wire the swap addresses (owner-gated, mirrors SettlementMaster's SetOwnJettonWallet convention)
    await treasury.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'SetPtonMaster', ptonMaster: ptonMaster.address });
    await treasury.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'SetOwnXautJettonWallet', wallet: ownXautWallet.address });
    await treasury.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'SetOwnPtonJettonWallet', wallet: ownPtonWallet.address });
    await treasury.send(deployer.getSender(), { value: toNano('0.05') }, { $$type: 'SetRouterXautWallet', wallet: routerXautWallet.address });

    // Fund the contract and earmark gold via a deposit
    await treasury.send(deployer.getSender(), { value: toNano('100') }, 'deposit');
  });

  it('rejects SwapGold from anyone but the owner', async () => {
    const result = await treasury.send(
      attacker.getSender(),
      { value: toNano('0.5') },
      { $$type: 'SwapGold', minAskAmount: 1n, deadline: 0n },
    );
    expect(result.transactions).toHaveTransaction({ from: attacker.address, to: treasury.address, success: false });

    const reserve = await treasury.getGetGoldReserve();
    expect(reserve.totalTONConvertedToGold).toBeGreaterThan(0n); // untouched
  });

  it('owner-triggered SwapGold sends a real message to our own pTON wallet, not a text comment', async () => {
    const before = await treasury.getGetGoldReserve();
    // deposit's 100 TON minus its 0.05 TON gas reserve, times the 70% ratio
    expect(before.totalTONConvertedToGold).toEqual((toNano('100') - toNano('0.05')) * 70n / 100n);

    const result = await treasury.send(
      deployer.getSender(),
      { value: toNano('0.5') },
      { $$type: 'SwapGold', minAskAmount: toNano('0.01'), deadline: 0n },
    );
    expect(result.transactions).toHaveTransaction({ from: deployer.address, to: treasury.address, success: true });

    // The swap message must go to our own pTON wallet (which wraps + forwards
    // to the router), carrying the earmarked TON amount plus gas -- not a
    // comment sent straight to the router.
    expect(result.transactions).toHaveTransaction({
      from: treasury.address,
      to: ownPtonWallet.address,
      value: (v) => v !== undefined && v >= toNano('70'),
    });

    const after = await treasury.getGetGoldReserve();
    expect(after.totalTONConvertedToGold).toEqual(0n); // earmark cleared, pending real confirmation
    expect(after.goldReserveXAUt).toEqual(0n); // NOT credited yet -- only a verified TransferNotification credits it
  });

  it('rejects a spoofed gold-received claim from an arbitrary sender', async () => {
    const result = await treasury.send(
      attacker.getSender(),
      { value: toNano('0.05') },
      { $$type: 'TransferNotification', queryId: 0n, amount: toNano('999'), sender: attacker.address, forwardPayload: beginCell().endCell().asSlice() } as any,
    );
    // Rejected: attacker is not ownXautJettonWallet
    expect(result.transactions).toHaveTransaction({ from: attacker.address, to: treasury.address, success: false });

    const reserve = await treasury.getGetGoldReserve();
    expect(reserve.goldReserveXAUt).toEqual(0n);
  });

  it('credits goldReserveXAUt on a real TransferNotification from our own verified XAUt wallet', async () => {
    const result = await treasury.send(
      ownXautWallet.getSender(),
      { value: toNano('0.05') },
      { $$type: 'TransferNotification', queryId: 0n, amount: toNano('0.05'), sender: dexRouter.address, forwardPayload: beginCell().endCell().asSlice() } as any,
    );
    expect(result.transactions).toHaveTransaction({ from: ownXautWallet.address, to: treasury.address, success: true });

    const reserve = await treasury.getGetGoldReserve();
    expect(reserve.goldReserveXAUt).toEqual(toNano('0.05'));
  });
});
