import {Blockchain} from '@ton/sandbox';
import {Address,Cell,Dictionary,beginCell,loadStateInit} from '@ton/core';
import {GstdTaskEscrowV2} from '../build/GstdTaskEscrowV2/GstdTaskEscrowV2_GstdTaskEscrowV2';
import {assertTestnetChoice,createTestnetPlan,transactionForStep,roles} from '../scripts/escrow-v2-testnet';
import '@ton/test-utils';

async function setup(testnet=true) {
    const chain=await Blockchain.create();chain.now=1800000000;
    if(testnet) {
        const config=chain.config.beginParse().loadDictDirect(Dictionary.Keys.Int(32),Dictionary.Values.Cell());
        config.set(19,beginCell().storeInt(-3,32).endCell());
        chain.setConfig(beginCell().storeDictDirect(config).endCell());
    }
    const payer=await chain.treasury('testnet-plan-payer'),worker=await chain.treasury('testnet-plan-worker'),protocol=await chain.treasury('testnet-plan-protocol'),reserve=await chain.treasury('testnet-plan-reserve');
    const wallets={payer,worker,protocol,reserve};
    const addresses=Object.fromEntries(roles.map(role=>[role,wallets[role].address.toString({testOnly:true})])) as Record<typeof roles[number],string>;
    const plan=await createTestnetPlan(addresses,chain.now,'1000000000','811');
    async function send(key:string) {
        const request=await transactionForStep(plan,key,chain.now!);
        expect(request.network).toBe('-3');expect(request.messages).toHaveLength(1);
        const signer=roles.find(role=>wallets[role].address.equals(Address.parse(request.from)))!;
        expect(signer).toBeDefined();
        const message=request.messages[0];
        return wallets[signer].send({to:Address.parse(message.address),value:BigInt(message.amount),body:Cell.fromBase64(message.payload),
            ...(message.stateInit?{init:loadStateInit(Cell.fromBase64(message.stateInit).beginParse())}:{})});
    }
    const balance=async(role:typeof roles[number])=>(await chain.provider(Address.parse(plan.addresses.tokenWallets[role])).get('get_wallet_data',[])).stack.readBigNumber();
    return {chain,addresses,plan,send,balance};
}

it('executes the exact unsigned Testnet plan through real canonical wallet payouts and expiry refunds',async()=>{
    const x=await setup();
    await x.send('mint');await x.send('success-sync');
    for(let role=0;role<3;role++) await x.send('success-fund-'+role);
    const success=x.chain.openContract(new GstdTaskEscrowV2(Address.parse(x.plan.addresses.successTask)));
    expect(await success.getFundingMask()).toBe(7n);
    await x.send('success-accept');
    for(let role=0;role<3;role++) await x.send('success-claim-'+role);
    expect(await success.getState()).toBe(1n);
    expect(await x.balance('worker')).toBe(850000000n);
    expect(await x.balance('protocol')).toBe(100000000n);
    expect(await x.balance('reserve')).toBe(50000000n);
    await x.send('refund-sync');await x.send('refund-fund');
    expect(await x.balance('payer')).toBe(0n);
    x.chain.now=1800000121;
    await x.send('refund-expire');await x.send('refund-claim');
    expect(await x.balance('payer')).toBe(425000000n);
    const refund=x.chain.openContract(new GstdTaskEscrowV2(Address.parse(x.plan.addresses.refundTask)));
    expect(await refund.getState()).toBe(2n);
});

it('rejects mainnet configuration, duplicate actors, mainnet-formatted addresses, unsafe amounts and stale actions',async()=>{
    const x=await setup();
    expect(()=>assertTestnetChoice('mainnet')).toThrow('testnet_only');
    await expect(createTestnetPlan({...x.addresses,worker:x.addresses.payer},1800000000)).rejects.toThrow('independent_wallets_required');
    await expect(createTestnetPlan({...x.addresses,worker:Address.parse(x.addresses.worker).toString({testOnly:false})},1800000000)).rejects.toThrow('testnet_basechain_address_required');
    for(const amount of ['1.5','99','100000000001']) await expect(createTestnetPlan(x.addresses,1800000000,amount)).rejects.toThrow();
    await expect(transactionForStep(x.plan,'success-accept',1800003601)).rejects.toThrow('task_expired');
    await expect(transactionForStep(x.plan,'refund-expire',1800000120)).rejects.toThrow('refund_deadline_not_reached');
    await expect(transactionForStep({...x.plan,codeHashes:{...x.plan.codeHashes,task:'00'}},'mint',1800000000)).rejects.toThrow('compiled_code_changed');
    const changed={...x.plan,steps:[]};
    expect((await transactionForStep(changed,'mint',1800000000)).messages[0].address).toBe(x.plan.addresses.master);
});

it('also rejects the plan token deployment inside a mainnet-configured TVM',async()=>{
    const x=await setup(false),result=await x.send('mint');
    expect(result.transactions).toHaveTransaction({to:Address.parse(x.plan.addresses.master),success:false});
});
