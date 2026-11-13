import {readFileSync} from 'fs';
import {join} from 'path';
import {Blockchain,createShardAccount,internal,type SandboxContract} from '@ton/sandbox';
import {Address,Cell,beginCell,toNano,contractAddress} from '@ton/core';
import {GstdTaskEscrowV2} from '../build/GstdTaskEscrowV2/GstdTaskEscrowV2_GstdTaskEscrowV2';
import {GstdEscrowShareV2} from '../build/GstdTaskEscrowV2/GstdTaskEscrowV2_GstdEscrowShareV2';
import '@ton/test-utils';
const fixture=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-wallet.json'),'utf8'));
const code=Cell.fromBoc(Buffer.from(fixture.code,'hex'))[0],master=Address.parse(fixture.master);
const data=(owner:Address,amount=0n)=>beginCell().storeCoins(amount).storeAddress(owner).storeAddress(master).storeBit(amount>0n).endCell();
const wallet=(owner:Address)=>contractAddress(0,{code,data:data(owner)});
async function setup(late=false){
 const chain=await Blockchain.create();chain.now=late?1800000200:1800000000;
 const payer=await chain.treasury('payer'),worker=await chain.treasury('worker'),protocol=await chain.treasury('protocol'),reserve=await chain.treasury('reserve'),stranger=await chain.treasury('stranger');
 await chain.setShardAccount(wallet(payer.address),createShardAccount({address:wallet(payer.address),code,data:data(payer.address,toNano('110')),balance:toNano('.2')}));
 const task=chain.openContract(await GstdTaskEscrowV2.fromInit(payer.address,worker.address,protocol.address,reserve.address,123n,toNano('100'),1800000100n,code,master,-239n));
 await task.send(payer.getSender(),{value:toNano('.3')},{$$type:'Deploy',queryId:0n});
 await task.send(payer.getSender(),{value:toNano('.3')},{$$type:'SyncTask'});
 const specs=[{amount:toNano('85'),recipient:worker},{amount:toNano('10'),recipient:protocol},{amount:toNano('5'),recipient:reserve}];
 const shares:SandboxContract<GstdEscrowShareV2>[]=[];
 for(let role=0;role<3;role++){
  const share=chain.openContract(await GstdEscrowShareV2.fromInit(task.address,payer.address,specs[role].recipient.address,BigInt(role),specs[role].amount,code,master,-239n));
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
it('caps total beneficiary withdrawals and returns excess to the payer',async()=>{
 const x=await setup();
 await x.fund(0,toNano('95'));await x.fund(1);await x.fund(2);
 await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});
 const share=x.shares[0], send=(amount:bigint)=>share.send(x.worker.getSender(),{value:toNano('.08')},{$$type:'WithdrawAcceptedShare',amount,queryId:7n});
 expect((await send(toNano('86'))).transactions).toHaveTransaction({to:share.address,success:false});
 await send(toNano('40'));
 expect(await share.getBeneficiaryRemaining()).toBe(toNano('45'));
 expect(await share.getTransferPending()).toBe(0n);
 await send(toNano('45'));
 expect(await x.balance(x.worker.address)).toBe(toNano('85'));
 expect((await send(1n)).transactions).toHaveTransaction({to:share.address,success:false});
 const refund=(sender:typeof x.payer,amount:bigint)=>share.send(sender.getSender(),{value:toNano('.08')},{$$type:'ReturnAcceptedSurplus',amount,queryId:8n});
 expect((await refund(x.stranger,toNano('10'))).transactions).toHaveTransaction({to:share.address,success:false});
 await refund(x.payer,toNano('10'));
 expect(await x.balance(x.payer.address)).toBe(toNano('10'));
 expect(await share.getPayerSurplus()).toBe(0n);
 expect((await refund(x.payer,1n)).transactions).toHaveTransaction({to:share.address,success:false});
});

it('keeps the original full-refund path for a partially funded expired task',async()=>{
 const x=await setup();await x.fund(0,toNano('30'));
 x.chain.now=1800000101;
 await x.task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'RefundExpiredTask'});
 await x.shares[0].send(x.payer.getSender(),{value:toNano('.08')},{$$type:'RefundExpiredShare',amount:toNano('30'),queryId:7n});
 expect(await x.balance(x.payer.address)).toBe(toNano('110'));
});
