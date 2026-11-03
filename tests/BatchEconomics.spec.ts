import {readFileSync} from 'fs';
import {join} from 'path';
import {Blockchain,type SandboxContract} from '@ton/sandbox';
import {Address,Cell,beginCell,Dictionary,toNano,contractAddress} from '@ton/core';
import {TestGstdMaster} from '../build/TestGstdMaster/TestGstdMaster_TestGstdMaster';
import {GstdTaskEscrow} from '../build/GstdTaskEscrow/GstdTaskEscrow_GstdTaskEscrow';
import {GstdEscrowShare} from '../build/GstdTaskEscrow/GstdTaskEscrow_GstdEscrowShare';
import '@ton/test-utils';
const f=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-wallet.json'),'utf8'));
const code=Cell.fromBoc(Buffer.from(f.code,'hex'))[0];
async function environment(testnet=true){
 const b=await Blockchain.create();b.now=1800000000;
 if(testnet){const config=b.config.beginParse().loadDictDirect(Dictionary.Keys.Int(32),Dictionary.Values.Cell());config.set(19,beginCell().storeInt(-3,32).endCell());b.setConfig(beginCell().storeDictDirect(config).endCell());}
 const payer=await b.treasury('payer'),worker=await b.treasury('worker'),protocol=await b.treasury('protocol'),reserve=await b.treasury('reserve');
 const master=b.openContract(await TestGstdMaster.fromInit(code));
 return{b,payer,worker,protocol,reserve,master};
}
it('rejects the valueless test token and testnet escrow on mainnet',async()=>{
 const x=await environment(false);
 const mint=await x.master.send(x.payer.getSender(),{value:toNano('.2')},{$$type:'MintTestGstd',amount:toNano('100'),queryId:1n});
 expect(mint.transactions).toHaveTransaction({to:x.master.address,success:false});
 const task=x.b.openContract(await GstdTaskEscrow.fromInit(x.payer.address,x.worker.address,x.protocol.address,x.reserve.address,1n,toNano('1'),1800000100n,code,x.master.address,-3n));
 const result=await task.send(x.payer.getSender(),{value:toNano('.4')},{$$type:'SyncTask'});
 expect(result.transactions).toHaveTransaction({to:task.address,success:false});
});
it('measures one funded batch versus five independent escrows using canonical wallet execution',async()=>{
 const x=await environment();
 await x.master.send(x.payer.getSender(),{value:toNano('.2')},{$$type:'MintTestGstd',amount:toNano('100'),queryId:1n});
 const tokenWallet=(owner:Address)=>contractAddress(0,{code,data:beginCell().storeCoins(0).storeAddress(owner).storeAddress(x.master.address).storeBit(false).endCell()});
 expect((await x.b.provider(tokenWallet(x.payer.address)).get('get_wallet_data',[])).stack.readBigNumber()).toBe(toNano('100'));
 async function settle(taskId:bigint,budget:bigint){
  let fees=0n;
  const add=(r:any)=>{for(const t of r.transactions)fees+=t.totalFees.coins;};
  const recipients=[x.worker,x.protocol,x.reserve],amounts=[budget*85n/100n,budget*10n/100n,budget-budget*85n/100n-budget*10n/100n];
  const task=x.b.openContract(await GstdTaskEscrow.fromInit(x.payer.address,x.worker.address,x.protocol.address,x.reserve.address,taskId,budget,1800000100n,code,x.master.address,-3n));
  add(await task.send(x.payer.getSender(),{value:toNano('.4')},{$$type:'SyncTask'}));
  const shares:SandboxContract<GstdEscrowShare>[]=[];
  for(let i=0;i<3;i++){
   const share=x.b.openContract(await GstdEscrowShare.fromInit(task.address,x.payer.address,recipients[i].address,BigInt(i),amounts[i],code,x.master.address,-3n));shares.push(share);
   const body=beginCell().storeUint(0x0f8a7ea5,32).storeUint(taskId*10n+BigInt(i),64).storeCoins(amounts[i]).storeAddress(share.address).storeAddress(x.payer.address).storeBit(false).storeCoins(toNano('.01')).storeBit(false).endCell();
   add(await x.payer.send({to:tokenWallet(x.payer.address),value:toNano('.1'),body}));
  }
  expect(await task.getFundingMask()).toBe(7n);
  add(await task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'}));
  for(let i=0;i<3;i++)add(await shares[i].send(recipients[i].getSender(),{value:toNano('.08')},{$$type:'WithdrawAcceptedShare',amount:amounts[i],queryId:taskId*10n+BigInt(i)}));
  for(const share of shares)add(await share.send(x.payer.getSender(),{value:toNano('.03')},{$$type:'ReclaimEscrowTon'}));
  add(await task.send(x.payer.getSender(),{value:toNano('.03')},{$$type:'ReclaimEscrowTon'}));
  return fees;
 }
 const batched=await settle(1n,toNano('.05'));
 let separate=0n;for(let i=0;i<5;i++)separate+=await settle(BigInt(i+2),toNano('.01'));
 expect(batched*3n).toBeLessThan(separate);
 console.log('BATCH_FEE_MEASUREMENT '+JSON.stringify({configuration:'TON Sandbox testnet networkID, bundled fee config; not a mainnet quote',requests:5,batch_total_fees_nano:String(batched),five_separate_total_fees_nano:String(separate),ratio:Number(separate)/Number(batched),includes_wallet_transactions:true,excludes_test_token_mint:true,attached_budget_is_not_consumed_fee:true}));
},120_000);
it('allows only payer to reclaim unused TON while preserving native storage reserves',async()=>{
 const x=await environment();
 const task=x.b.openContract(await GstdTaskEscrow.fromInit(x.payer.address,x.worker.address,x.protocol.address,x.reserve.address,44n,toNano('1'),1800000100n,code,x.master.address,-3n));
 await task.send(x.payer.getSender(),{value:toNano('.4')},{$$type:'SyncTask'});
 const accounts=[task.address,...await Promise.all([0n,1n,2n].map(role=>task.getShareAddress(role)))];
 for(const address of accounts){
  const denied=await x.worker.send({to:address,value:toNano('.03'),body:beginCell().storeUint(0x47544509,32).endCell()});
  expect(denied.transactions).toHaveTransaction({to:address,success:false});
  await x.payer.send({to:address,value:toNano('.03'),body:beginCell().storeUint(0x47544509,32).endCell()});
  const state=await x.b.provider(address).getState();expect(state.balance).toBe(toNano('.02'));
 }
 expect(await task.getState()).toBe(0n);
});
it('rejects a substituted asset on mainnet even when the network identifier matches',async()=>{
 const x=await environment(false);
 const task=x.b.openContract(await GstdTaskEscrow.fromInit(x.payer.address,x.worker.address,x.protocol.address,x.reserve.address,1n,toNano('1'),1800000100n,code,x.payer.address,-239n));
 const result=await task.send(x.payer.getSender(),{value:toNano('.4')},{$$type:'SyncTask'});
 expect(result.transactions).toHaveTransaction({to:task.address,success:false});
});
