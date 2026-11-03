import {readFileSync} from 'fs';
import {join} from 'path';
import {Blockchain,createShardAccount,internal,type SandboxContract} from '@ton/sandbox';
import {Address,Cell,beginCell,toNano,contractAddress} from '@ton/core';
import {GstdTaskEscrow} from '../build/GstdTaskEscrow/GstdTaskEscrow_GstdTaskEscrow';
import {GstdEscrowShare} from '../build/GstdTaskEscrow/GstdTaskEscrow_GstdEscrowShare';
import '@ton/test-utils';
const fixture=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-wallet.json'),'utf8'));
const code=Cell.fromBoc(Buffer.from(fixture.code,'hex'))[0],master=Address.parse(fixture.master);
const data=(owner:Address,amount=0n)=>beginCell().storeCoins(amount).storeAddress(owner).storeAddress(master).storeBit(amount>0n).endCell();
const wallet=(owner:Address)=>contractAddress(0,{code,data:data(owner)});
async function setup(late=false){
 const chain=await Blockchain.create();chain.now=late?1800000200:1800000000;
 const payer=await chain.treasury('payer'),worker=await chain.treasury('worker'),protocol=await chain.treasury('protocol'),reserve=await chain.treasury('reserve'),stranger=await chain.treasury('stranger');
 await chain.setShardAccount(wallet(payer.address),createShardAccount({address:wallet(payer.address),code,data:data(payer.address,toNano('100')),balance:toNano('.2')}));
 const task=chain.openContract(await GstdTaskEscrow.fromInit(payer.address,worker.address,protocol.address,reserve.address,123n,toNano('100'),1800000100n,code,master,-239n));
 await task.send(payer.getSender(),{value:toNano('.3')},{$$type:'Deploy',queryId:0n});
 await task.send(payer.getSender(),{value:toNano('.3')},{$$type:'SyncTask'});
 const specs=[{amount:toNano('85'),recipient:worker},{amount:toNano('10'),recipient:protocol},{amount:toNano('5'),recipient:reserve}];
 const shares:SandboxContract<GstdEscrowShare>[]=[];
 for(let role=0;role<3;role++){
  const share=chain.openContract(await GstdEscrowShare.fromInit(task.address,payer.address,specs[role].recipient.address,BigInt(role),specs[role].amount,code,master,-239n));
  expect(share.address.equals(await task.getShareAddress(BigInt(role)))).toBe(true);
  expect(await task.getShareAmount(BigInt(role))).toBe(specs[role].amount);shares.push(share);
 }
 let query=1n;
 async function fund(role:number,amount=specs[role].amount,forward=toNano('.01')){
  const body=beginCell().storeUint(0x0f8a7ea5,32).storeUint(query++,64).storeCoins(amount).storeAddress(shares[role].address)
    .storeAddress(payer.address).storeBit(false).storeCoins(forward).storeBit(false).endCell();
  await chain.sendMessage(internal({from:payer.address,to:wallet(payer.address),value:toNano('.1'),body}));
 }
 async function fundAll(){for(let role=0;role<3;role++)await fund(role);}
 async function balance(owner:Address){const a=await chain.getContract(wallet(owner));if(a.accountState?.type!=='active')return 0n;return(await chain.provider(wallet(owner)).get('get_wallet_data',[])).stack.readBigNumber();}
 async function refundAll(){
  await task.send(payer.getSender(),{value:toNano('.3')},{$$type:'RefundExpiredTask'});
  for(let role=0;role<3;role++)await shares[role].send(payer.getSender(),{value:toNano('.08')},{$$type:'RefundExpiredShare',amount:specs[role].amount,queryId:100n+BigInt(role)});
 }
 return{chain,payer,worker,protocol,reserve,stranger,task,shares,specs,fund,fundAll,balance,refundAll};
}
it('makes one irreversible85/10/5 decision and prevents fee refunds after worker acceptance',async()=>{
 const x=await setup();await x.fundAll();expect(await x.task.getFundingMask()).toBe(7n);
 const early=await x.shares[0].send(x.worker.getSender(),{value:toNano('.08')},{$$type:'WithdrawAcceptedShare',amount:toNano('85'),queryId:2n});
 expect(early.transactions).toHaveTransaction({to:x.shares[0].address,success:false});
 const forged=await x.task.send(x.stranger.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});
 expect(forged.transactions).toHaveTransaction({to:x.task.address,success:false});
 await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});
 expect(await x.task.getState()).toBe(1n);
 for(let role=0;role<3;role++){
  expect(await x.shares[role].getState()).toBe(1n);
  await x.shares[role].send(x.specs[role].recipient.getSender(),{value:toNano('.08')},{$$type:'WithdrawAcceptedShare',amount:x.specs[role].amount,queryId:10n+BigInt(role)});
  expect(await x.balance(x.specs[role].recipient.address)).toBe(x.specs[role].amount);
 }
 x.chain.now=1800000101;
 const refund=await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'RefundExpiredTask'});
 expect(refund.transactions).toHaveTransaction({to:x.task.address,success:false});
 const feeRefund=await x.shares[1].send(x.payer.getSender(),{value:toNano('.08')},{$$type:'RefundExpiredShare',amount:toNano('10'),queryId:20n});
 expect(feeRefund.transactions).toHaveTransaction({to:x.shares[1].address,success:false});
 expect(await x.balance(x.payer.address)).toBe(0n);
},30_000);
it('refunds all expired shares only to payer and cannot subsequently accept them',async()=>{
 const x=await setup();await x.fundAll();
 const early=await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'RefundExpiredTask'});
 expect(early.transactions).toHaveTransaction({to:x.task.address,success:false});
 x.chain.now=1800000101;await x.refundAll();
 expect(await x.balance(x.payer.address)).toBe(toNano('100'));
 expect(await x.balance(x.worker.address)).toBe(0n);expect(await x.balance(x.protocol.address)).toBe(0n);
 const accept=await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});
 expect(accept.transactions).toHaveTransaction({to:x.task.address,success:false});
});
it('requires full funding of every share and supports partial deposit/top-up',async()=>{
 const x=await setup();await x.fund(0,toNano('84'));await x.fund(1);await x.fund(2);
 expect(await x.task.getFundingMask()).toBe(6n);
 const accept=await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});
 expect(accept.transactions).toHaveTransaction({to:x.task.address,success:false});
 await x.fund(0,toNano('1'));expect(await x.task.getFundingMask()).toBe(7n);
 await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});expect(await x.task.getState()).toBe(1n);
});
it('fails closed on missing deposit notifications while retaining an expiry refund path',async()=>{
 const x=await setup();await x.fund(0,toNano('85'),0n);await x.fund(1);await x.fund(2);
 expect(await x.balance(x.shares[0].address)).toBe(toNano('85'));
 expect(await x.shares[0].getCreditedFunding()).toBe(0n);expect(await x.task.getFundingMask()).toBe(6n);
 const accept=await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});
 expect(accept.transactions).toHaveTransaction({to:x.task.address,success:false});
 x.chain.now=1800000101;await x.refundAll();expect(await x.balance(x.payer.address)).toBe(toNano('100'));
});
it('rejects forged funding/decision messages and can resynchronize the immutable decision',async()=>{
 const x=await setup();
 const forged=await x.task.send(x.stranger.getSender(),{value:toNano('.05')},{$$type:'FundingReady',role:0n});
 expect(forged.transactions).toHaveTransaction({to:x.task.address,success:false});
 const fakeCommit=await x.shares[0].send(x.payer.getSender(),{value:toNano('.08')},{$$type:'CommitTask',phase:1n});
 expect(fakeCommit.transactions).toHaveTransaction({to:x.shares[0].address,success:false});
 await x.fundAll();await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});
 await x.task.send(x.stranger.getSender(),{value:toNano('.3')},{$$type:'SyncTask'});
 for(const share of x.shares)expect(await share.getState()).toBe(1n);
 const oversized=await x.shares[0].send(x.worker.getSender(),{value:toNano('.08')},{$$type:'WithdrawAcceptedShare',amount:toNano('86'),queryId:77n});
 expect(await x.balance(x.shares[0].address)).toBe(toNano('85'));
 await x.shares[0].send(x.worker.getSender(),{value:toNano('.08')},{$$type:'WithdrawAcceptedShare',amount:toNano('85'),queryId:77n});
 expect(await x.balance(x.worker.address)).toBe(toNano('85'));
});
it('allows late deployment/refund and exact deadline acceptance without a refund overlap',async()=>{
 const late=await setup(true);await late.fundAll();await late.refundAll();expect(await late.balance(late.payer.address)).toBe(toNano('100'));
 const x=await setup();await x.fundAll();x.chain.now=1800000100;
 const refund=await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'RefundExpiredTask'});
 expect(refund.transactions).toHaveTransaction({to:x.task.address,success:false});
 await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});expect(await x.task.getState()).toBe(1n);
},30_000);

it('recovers actually undelivered commits and rejects a delayed pending-state message',async()=>{
 const x=await setup();await x.fundAll();
 const iterator=await x.chain.sendMessageIter(internal({from:x.payer.address,to:x.task.address,value:toNano('.3'),body:beginCell().storeUint(0x47544501,32).endCell()}),{allowParallel:true});
 await iterator.next(); // Coordinator accepted; its outgoing commits have NOT executed.
 expect(await x.task.getState()).toBe(1n);expect(await x.shares[0].getState()).toBe(0n);
 const recovered=await Blockchain.create();await recovered.loadFrom(x.chain.snapshot());
 const task=recovered.openContract(GstdTaskEscrow.fromAddress(x.task.address));
 const shares=x.shares.map(s=>recovered.openContract(GstdEscrowShare.fromAddress(s.address)));
 await task.send(recovered.sender(x.stranger.address),{value:toNano('.3')},{$$type:'SyncTask'});
 for(const s of shares)expect(await s.getState()).toBe(1n);
 const delayed=await recovered.sendMessage(internal({from:task.address,to:shares[0].address,value:toNano('.08'),body:beginCell().storeUint(0x47544506,32).storeUint(0,8).endCell()}));
 expect(delayed.transactions).toHaveTransaction({to:shares[0].address,success:false});expect(await shares[0].getState()).toBe(1n);
});
it('keeps readiness idempotent and rolls back acceptance if synchronization gas is missing',async()=>{
 const x=await setup();await x.fundAll();
 for(let i=0;i<2;i++)await x.shares[0].send(x.stranger.getSender(),{value:toNano('.03')},{$$type:'ReportFunding'});
 expect(await x.task.getFundingMask()).toBe(7n);
 const short=await x.task.send(x.payer.getSender(),{value:toNano('.01')},{$$type:'AcceptFundedTask'});
 expect(short.transactions).toHaveTransaction({to:x.task.address,success:false});expect(await x.task.getState()).toBe(0n);
 for(const s of x.shares)expect(await s.getState()).toBe(0n);
});
