// Opt-in integration with unchanged public mainnet account data and exact TVM libraries.
// All balances/transfers below exist only in TON Sandbox. No wallet signs or chain broadcasts.
import {readFileSync} from 'fs';
import {join} from 'path';
import {Blockchain,createShardAccount} from '@ton/sandbox';
import {Address,Cell,Dictionary,beginCell,toNano,contractAddress} from '@ton/core';
import {keyPairFromSeed,sign} from '@ton/crypto';
import {GstdLiquidityReserve} from '../build/GstdLiquidityReserve/GstdLiquidityReserve_GstdLiquidityReserve';
import '@ton/test-utils';
const fixturePath=process.env.GSTD_STON_FORK_FIXTURE;
const integration=fixturePath?describe:describe.skip;
const cell=(v:string)=>Cell.fromBoc(Buffer.from(v,v.startsWith('b5ee')?'hex':'base64'))[0];
const canonical=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-wallet.json'),'utf8'));
const poolFixture=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-xaut-pool.json'),'utf8'));
const gstdCode=cell(canonical.code),lpCode=Cell.fromBase64(poolFixture.lp_wallet_code),accountCode=Cell.fromBase64(poolFixture.lp_account_code);
const key=keyPairFromSeed(Buffer.alloc(32,91)); // Deterministic sandbox-only oracle, never a funded wallet key.
integration('GSTD -> real STON.fi pool code -> LP receipt / refund in isolated mainnet snapshot',()=>{
 async function setup(){
  const fixture=JSON.parse(readFileSync(fixturePath!,'utf8')),chain=await Blockchain.create();
  chain.now=Math.floor(Date.parse(fixture.captured_at)/1000);
  const libs=Dictionary.empty(Dictionary.Keys.Buffer(32),Dictionary.Values.Cell());
  for(const[hash,boc]of Object.entries(fixture.libraries) as [string,string][]){const c=cell(boc);expect(c.hash().toString('hex')).toBe(hash);libs.set(Buffer.from(hash,'hex'),c);}
  chain.libs=beginCell().storeDictDirect(libs).endCell();
  for(const a of fixture.accounts){
   const code=cell(a.code),data=cell(a.data);expect(code.hash().toString('hex')).toBe(a.code_hash);expect(data.hash().toString('hex')).toBe(a.data_hash);
   await chain.setShardAccount(Address.parse(a.address),createShardAccount({address:Address.parse(a.address),code,data,balance:BigInt(a.balance)}));
  }
  const owner=await chain.treasury('isolated-liquidity-owner');
  const reserve=chain.openContract(await GstdLiquidityReserve.fromInit(owner.address,BigInt('0x'+key.publicKey.toString('hex')),gstdCode,lpCode,accountCode,toNano('.5'),toNano('1'),toNano('2'),1n,10000000n,3600n));
  await reserve.send(owner.getSender(),{value:toNano('.2')},{$$type:'Deploy',queryId:0n});
  await reserve.send(owner.getSender(),{value:toNano('3')},null);
  await reserve.send(owner.getSender(),{value:toNano('.1')},{$$type:'PauseReserveLp',paused:false});
  const state=await reserve.getStatus();
  const funder=await chain.treasury('sandbox-token-funder');
  const emptyData=beginCell().storeCoins(0).storeAddress(funder.address).storeAddress(Address.parse(canonical.master)).storeBit(false).endCell();
  const fundingWallet=contractAddress(0,{code:gstdCode,data:emptyData});
  const fundingData=beginCell().storeCoins(toNano('10')).storeAddress(funder.address).storeAddress(Address.parse(canonical.master)).storeBit(true).endCell();
  await chain.setShardAccount(fundingWallet,createShardAccount({address:fundingWallet,code:gstdCode,data:fundingData,balance:toNano('.1')}));
  await funder.send({to:fundingWallet,value:toNano('.3'),body:beginCell().storeUint(0x0f8a7ea5,32).storeUint(123,64).storeCoins(toNano('10'))
   .storeAddress(reserve.address).storeAddress(funder.address).storeBit(false).storeCoins(toNano('.1')).storeBit(false).endCell()});
  expect((await reserve.getStatus()).accountedGstd).toBe(toNano('10'));
  return{chain,reserve,state,owner};
 }
 function quote(address:Address,min:bigint,deadline:number){
  const hash=beginCell().storeUint(0x47524c51,32).storeAddress(address).storeUint(0,64).storeCoins(toNano('1')).storeCoins(min).storeUint(deadline,32).endCell().hash();
  return{$$type:'ExecuteReserveLp' as const,sequence:0n,amount:toNano('1'),minimumLp:min,deadline:BigInt(deadline),signature:sign(hash,key.secretKey)};
 }
 async function tokenBalance(chain:Blockchain,address:Address){
  const account=await chain.getContract(address);if(account.accountState?.type!=='active')return 0n;
  return(await chain.provider(address).get('get_wallet_data',[])).stack.readBigNumber();
 }
 function trace(result:any){return result.transactions.map((t:any)=>({from:t.inMessage?.info.src?.toString(),to:t.inMessage?.info.dest?.toString(),type:t.description.type,exit:t.description.computePhase?.exitCode,aborted:t.description.aborted,op:t.inMessage?.body?.bits?.length>=32?t.inMessage.body.beginParse().loadUint(32):null}));}
 it('mints actual pool LP tokens to the reserve and confirms only that authenticated receipt',async()=>{
  const f=await setup(),before=await tokenBalance(f.chain,f.state.gstdWallet);
  const result=await f.reserve.sendExternal(quote(f.reserve.address,100n,f.chain.now!+60));
  const after=await f.reserve.getStatus();if(after.pending)console.log(JSON.stringify(trace(result)));
  expect(after.pending).toBe(false);expect(after.totalLpReceived).toBeGreaterThanOrEqual(100n);expect(after.totalRefunded).toBe(0n);
  expect(await tokenBalance(f.chain,after.lpWallet)).toBe(after.totalLpReceived);
  expect(await tokenBalance(f.chain,after.gstdWallet)).toBe(before-toNano('1'));
  // The policy owner cannot bypass the vault and transfer its permanently locked LP.
  const attempted=await f.owner.send({to:after.lpWallet,value:toNano('.1'),body:beginCell()
   .storeUint(0x0f8a7ea5,32).storeUint(99,64).storeCoins(after.totalLpReceived)
   .storeAddress(f.owner.address).storeAddress(f.owner.address).storeBit(false).storeCoins(0).storeBit(false).endCell()});
  expect(attempted.transactions).toHaveTransaction({from:f.owner.address,to:after.lpWallet,success:false});
  expect(await tokenBalance(f.chain,after.lpWallet)).toBe(after.totalLpReceived);

 });
 it('keeps a failed minimum-LP attempt pending, then gets real GSTD back through the exact LPAccount refund path',async()=>{
  const f=await setup(),before=await tokenBalance(f.chain,f.state.gstdWallet);
  const first=await f.reserve.sendExternal(quote(f.reserve.address,9999999n,f.chain.now!+60));
  const pending=await f.reserve.getStatus();expect(pending.pending).toBe(true);expect(pending.totalLpReceived).toBe(0n);
  const lpData=await f.chain.provider(pending.lpAccount).get('get_lp_account_data',[]);
  expect(lpData.stack.readAddress().equals(f.reserve.address)).toBe(true);expect(lpData.stack.readAddress().toRawString()).toBe(poolFixture.pool);
  const left=lpData.stack.readBigNumber(),right=lpData.stack.readBigNumber();expect(left+right).toBe(toNano('1'));
  f.chain.now!+=901;
  const deadline=f.chain.now!+60,hash=beginCell().storeUint(0x47524c52,32).storeAddress(f.reserve.address).storeUint(0,64).storeUint(deadline,32).endCell().hash();
  const result=await f.reserve.sendExternal({$$type:'RecoverReserveLp',sequence:0n,deadline:BigInt(deadline),signature:sign(hash,key.secretKey)});
  const after=await f.reserve.getStatus();if(after.pending)console.log(JSON.stringify({first:trace(first),recovery:trace(result)}));
  expect(after.pending).toBe(false);expect(after.totalRefunded).toBe(toNano('1'));expect(after.totalLpReceived).toBe(0n);
  expect(await tokenBalance(f.chain,after.gstdWallet)).toBe(before);
 });
});
