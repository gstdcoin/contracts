import {randomBytes} from 'crypto';
import {Blockchain} from '@ton/sandbox';
import {keyPairFromSeed} from '@ton/crypto';
import {WalletContractV5R1} from '@ton/ton';
import {Address,Cell,Dictionary,SendMode,beginCell,external,internal,loadStateInit,storeMessage} from '@ton/core';
import {createTestnetPlan,transactionForStep,roles} from '../scripts/escrow-v2-testnet';

it('settles the public plan with four independent signed Wallet V5 accounts and measures Sandbox fees',async()=>{
    const chain=await Blockchain.create();chain.now=1800000000;
    const config=chain.config.beginParse().loadDictDirect(Dictionary.Keys.Int(32),Dictionary.Values.Cell());
    config.set(19,beginCell().storeInt(-3,32).endCell());chain.setConfig(beginCell().storeDictDirect(config).endCell());
    const bank=await chain.treasury('signed-plan-bank');
    type Role=typeof roles[number];
    type Actor={keys:ReturnType<typeof keyPairFromSeed>;wallet:WalletContractV5R1;seqno:number};
    const actors={} as Record<Role,Actor>,addresses={} as Record<Role,string>;
    for(const role of roles){
        const keys=keyPairFromSeed(randomBytes(32));
        const wallet=WalletContractV5R1.create({publicKey:keys.publicKey,walletId:{networkGlobalId:-3,
            context:{walletVersion:'v5r1',workchain:0,subwalletNumber:0}}});
        actors[role]={keys,wallet,seqno:0};addresses[role]=wallet.address.toString({testOnly:true});
        await bank.send({to:wallet.address,value:4000000000n,bounce:false});
    }
    try{
        const plan=await createTestnetPlan(addresses,chain.now,'1000000000','811222');
        let notificationSkips=0,fees=0n,count=0;
        async function send(key:string){
            const request=await transactionForStep(plan,key,chain.now!);
            const role=roles.find(r=>actors[r].wallet.address.equals(Address.parse(request.from)));
            expect(role).toBeDefined();const actor=actors[role!];
            const messages=request.messages.map(m=>internal({to:Address.parse(m.address),value:BigInt(m.amount),
                body:Cell.fromBase64(m.payload),bounce:!m.stateInit,
                ...(m.stateInit?{init:loadStateInit(Cell.fromBase64(m.stateInit).beginParse())}:{})}));
            const body=await actor.wallet.createTransfer({seqno:actor.seqno,secretKey:actor.keys.secretKey,messages,
                sendMode:SendMode.PAY_GAS_SEPARATELY|SendMode.IGNORE_ERRORS,timeout:chain.now!+120,authType:'external'});
            const message=beginCell().store(storeMessage(external({to:actor.wallet.address,
                ...(actor.seqno===0?{init:actor.wallet.init}:{}),body}))).endCell();
            const result=await chain.sendMessage(message);
            for(const tx of result.transactions){
                expect(tx.description.type).toBe('generic');
                if(tx.description.type!=='generic')throw Error('unexpected_transaction_type');
                if(tx.description.aborted){
                    // TEP-74's one-nanoton notification cannot execute on an ordinary wallet.
                    // Never permit a failure in a token wallet, share or coordinator here.
                    const m=tx.inMessage;
                    expect(m?.info.type).toBe('internal');
                    if(m?.info.type!=='internal')throw Error('unexpected_failed_external');
                    expect(m.info.value.coins).toBe(1n);
                    expect(m.body.beginParse().loadUint(32)).toBe(0x7362d09c);
                    expect(tx.description.computePhase).toMatchObject({type:'skipped',reason:'no-gas'});
                    const destination=m.info.dest;
                    expect(roles.some(r=>actors[r].wallet.address.equals(destination))).toBe(true);
                    notificationSkips++;
                }
                fees+=tx.totalFees.coins;count++;
            }
            expect((await chain.provider(actor.wallet.address).get('seqno',[])).stack.readNumber()).toBe(++actor.seqno);
        }
        const value=async(address:string,name:string)=>(await chain.provider(Address.parse(address)).get(name,[])).stack.readBigNumber();
        await send('mint');await send('success-sync');
        for(let i=0;i<3;i++)await send('success-fund-'+i);
        expect(await value(plan.addresses.successTask,'funding_mask')).toBe(7n);
        await send('success-accept');for(let i=0;i<3;i++)await send('success-claim-'+i);
        expect(await value(plan.addresses.successTask,'state')).toBe(1n);
        for(const [i,role]of (['worker','protocol','reserve'] as const).entries()){
            expect(await value(plan.addresses.tokenWallets[role],'get_wallet_data')).toBe([850000000n,100000000n,50000000n][i]);
            expect(await value(plan.addresses.successShares[i],'beneficiary_remaining')).toBe(0n);
            expect(await value(plan.addresses.successShares[i],'transfer_pending')).toBe(0n);
        }
        await send('refund-sync');await send('refund-fund');
        expect(await value(plan.addresses.tokenWallets.payer,'get_wallet_data')).toBe(0n);
        chain.now=1800000121;await send('refund-expire');await send('refund-claim');
        expect(await value(plan.addresses.refundTask,'state')).toBe(2n);
        expect(await value(plan.addresses.tokenWallets.payer,'get_wallet_data')).toBe(425000000n);
        expect(notificationSkips).toBe(4);
        expect(fees).toBeGreaterThan(0n);expect(fees).toBeLessThan(300000000n);
        console.log(JSON.stringify({localSandbox:true,realBroadcasts:0,independentSignedV5Wallets:4,
            expectedOneNanoNotificationSkips:notificationSkips,transactions:count,feesNanoTON:fees.toString()}));
    }finally{for(const role of roles)actors[role].keys.secretKey.fill(0);}
});
