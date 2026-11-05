import {readFileSync} from 'fs';
import {join} from 'path';
import {Blockchain,internal} from '@ton/sandbox';
import {Address,Cell,beginCell,toNano,contractAddress} from '@ton/core';
import {keyPairFromSeed,sign} from '@ton/crypto';
import {DEX} from '@ston-fi/sdk';
import {GstdLiquidityReserve,storeReserveJettonReceived} from '../build/GstdLiquidityReserve/GstdLiquidityReserve_GstdLiquidityReserve';
import '@ton/test-utils';

const canonical=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-wallet.json'),'utf8'));
const pool=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-xaut-pool.json'),'utf8'));
const gstdCode=Cell.fromBoc(Buffer.from(canonical.code,'hex'))[0];
const lpCode=Cell.fromBase64(pool.lp_wallet_code),accountCode=Cell.fromBase64(pool.lp_account_code);
const oracle=keyPairFromSeed(Buffer.alloc(32,44)); // Public, deterministic TEST-ONLY key.
const oracleKey=BigInt('0x'+oracle.publicKey.toString('hex'));
const amount=toNano('1'),minimumLp=1000n;
describe('GstdLiquidityReserve — sandbox boundary tests, not a complete DEX fork',()=>{
 async function setup(gas='3'){
  const chain=await Blockchain.create();chain.now=1800000000;
  const owner=await chain.treasury('reserve-policy-owner'),attacker=await chain.treasury('not-reserve-owner');
  const reserve=chain.openContract(await GstdLiquidityReserve.fromInit(owner.address,oracleKey,gstdCode,lpCode,accountCode,toNano('.5'),toNano('1'),toNano('2'),1n,10000000n,3600n));
  await reserve.send(owner.getSender(),{value:toNano('.2')},{$$type:'Deploy',queryId:0n});
  await reserve.send(owner.getSender(),{value:toNano(gas)},null);
  const f={chain,owner,attacker,reserve},state=await reserve.getStatus();
  // Component-only funding notification; the integration suite funds through actual token-wallet code.
  await notify(f,state.gstdWallet,owner.address,123n,toNano('10'));
  return f;
 }
 function execute(address:Address,sequence=0n,value=amount,min=minimumLp,deadline=1800000060,signingKey=oracle){
  const hash=beginCell().storeUint(0x47524c51,32).storeAddress(address).storeUint(sequence,64).storeCoins(value).storeCoins(min).storeUint(deadline,32).endCell().hash();
  return{$$type:'ExecuteReserveLp' as const,sequence,amount:value,minimumLp:min,deadline:BigInt(deadline),signature:sign(hash,signingKey.secretKey)};
 }
 async function open(f:Awaited<ReturnType<typeof setup>>){await f.reserve.send(f.owner.getSender(),{value:toNano('.1')},{$$type:'PauseReserveLp',paused:false});}
 async function notify(f:Awaited<ReturnType<typeof setup>>,from:Address,origin:Address,queryId:bigint,value:bigint){
  return f.chain.sendMessage(internal({from,to:f.reserve.address,value:toNano('.1'),body:beginCell().store(storeReserveJettonReceived({$$type:'ReserveJettonReceived',queryId,amount:value,from:origin,payload:beginCell().endCell().beginParse()})).endCell()}));
 }
 it('pins the canonical token/pool wallet derivations to independent public getter fixtures',async()=>{
  expect(gstdCode.hash().toString('hex')).toBe(canonical.code_hash);
  expect(lpCode.hash().toString('hex')).toBe(pool.lp_wallet_code_hash);
  expect(accountCode.hash().toString('hex')).toBe(pool.lp_account_code_hash);
  const owner=Address.parse(pool.owner),master=Address.parse(pool.pool);
  expect(contractAddress(0,{code:accountCode,data:beginCell().storeAddress(owner).storeAddress(master).storeCoins(0).storeCoins(0).endCell()}).toRawString()).toBe(pool.expected_lp_account);
  const f=await setup(),s=await f.reserve.getStatus();
  expect(s.paused).toBe(true);
  expect(s.lpWallet.equals(contractAddress(0,{code:lpCode,data:beginCell().storeCoins(0).storeAddress(f.reserve.address).storeAddress(master).storeRef(lpCode).endCell()}))).toBe(true);
 });
 it('rejects invalid signatures, replay, dust, excess amounts, weak LP bounds and expired quotes before external acceptance',async()=>{
  const f=await setup();await expect(f.reserve.sendExternal(execute(f.reserve.address))).rejects.toThrow();await open(f);
  for(const message of [
   execute(f.reserve.address,0n,amount,minimumLp,1800000060,keyPairFromSeed(Buffer.alloc(32,45))),
   execute(f.reserve.address,1n),execute(f.reserve.address,0n,1n),
   execute(f.reserve.address,0n,toNano('2')),execute(f.reserve.address,0n,amount,1n),
   execute(f.reserve.address,0n,amount,minimumLp,1799999999),
   execute(f.reserve.address,0n,amount,minimumLp,1800000121),
   execute(f.attacker.address)
  ])await expect(f.reserve.sendExternal(message)).rejects.toThrow();
  expect((await f.reserve.getStatus()).sequence).toBe(0n);
 });
 it('requires a separately funded TON execution budget and only owner can unpause',async()=>{
  const f=await setup('.5');
  const bad=await f.reserve.send(f.attacker.getSender(),{value:toNano('.1')},{$$type:'PauseReserveLp',paused:false});
  expect(bad.transactions).toHaveTransaction({to:f.reserve.address,success:false});await open(f);
  await expect(f.reserve.sendExternal(execute(f.reserve.address))).rejects.toThrow();
 });
 it('constructs exactly the official SDK provide-LP payload with fixed beneficiary, pair and no arbitrary call data',async()=>{
  const f=await setup();await open(f);
  const result=await f.reserve.sendExternal(execute(f.reserve.address));
  const state=await f.reserve.getStatus();expect(state.pending).toBe(true);expect(state.sequence).toBe(1n);expect(state.totalSubmitted).toBe(amount);
  const tx=result.transactions.find(t=>t.inMessage?.info.type==='external-in')!;
  const out=Array.from(tx.outMessages.values()).find(m=>m.info.type==='internal'&&m.info.dest.equals(state.gstdWallet))!;
  expect(out.info.type).toBe('internal');if(out.info.type!=='internal')throw Error('missing transfer');
  expect(out.info.value.coins).toBe(toNano('1'));
  const body=out.body.beginParse();expect(body.loadUint(32)).toBe(0x0f8a7ea5);expect(body.loadUintBig(64)).toBe(0n);expect(body.loadCoins()).toBe(amount);
  expect(body.loadAddress().toRawString()).toBe(pool.router);expect(body.loadAddress().equals(f.reserve.address)).toBe(true);
  expect(body.loadBit()).toBe(false);expect(body.loadCoins()).toBe(toNano('.8'));expect(body.loadBit()).toBe(true);const payload=body.loadRef();
  const sdk=new DEX.v2_2.Router(pool.router);
  const expected=await sdk.createProvideLiquidityBody({routerWalletAddress:pool.gold_router_wallet,refundAddress:f.reserve.address.toRawString(),excessesAddress:f.reserve.address.toRawString(),deadline:1800000060,minLpOut:minimumLp,receiverAddress:f.reserve.address.toRawString(),bothPositive:false,dexCustomPayloadForwardGasAmount:toNano('.05'),dexCustomPayload:beginCell().storeUint(0,64).endCell()});
  expect(payload.toBoc().toString('hex')).toBe(expected.toBoc().toString('hex'));
  await expect(f.reserve.sendExternal(execute(f.reserve.address))).rejects.toThrow();
  await expect(f.reserve.sendExternal(execute(f.reserve.address,1n))).rejects.toThrow();
 });
 it('leaves an unresolved transfer pending; forged, wrong-origin, wrong-query and too-small LP receipts cannot clear it',async()=>{
  const f=await setup();await open(f);await f.reserve.sendExternal(execute(f.reserve.address));
  const s=await f.reserve.getStatus();
  for(const [sender,origin,query,value]of [[f.attacker.address,f.reserve.address,0n,minimumLp],[s.lpWallet,f.attacker.address,0n,minimumLp],[s.lpWallet,f.reserve.address,7n,minimumLp],[s.lpWallet,f.reserve.address,0n,1n]] as [Address,Address,bigint,bigint][]){
   await notify(f,sender,origin,query,value);expect((await f.reserve.getStatus()).pending).toBe(true);
  }
  // Injected authenticated notifications test the boundary only, not actual DEX minting.
  await notify(f,s.lpWallet,f.reserve.address,0n,minimumLp);const after=await f.reserve.getStatus();
  expect(after.pending).toBe(false);expect(after.totalLpReceived).toBe(minimumLp);
  await notify(f,s.lpWallet,f.reserve.address,0n,minimumLp);expect((await f.reserve.getStatus()).totalLpReceived).toBe(minimumLp);
 });
 it('clears only a full canonical-router refund and preserves daily/cooldown limits',async()=>{
  const f=await setup();await open(f);await f.reserve.sendExternal(execute(f.reserve.address));const s=await f.reserve.getStatus();
  await notify(f,s.gstdWallet,f.attacker.address,0n,amount);expect((await f.reserve.getStatus()).pending).toBe(true);
  await notify(f,s.gstdWallet,Address.parse(pool.router),0n,amount-1n);expect((await f.reserve.getStatus()).pending).toBe(true);
  await notify(f,s.gstdWallet,Address.parse(pool.router),0n,amount);expect((await f.reserve.getStatus()).totalRefunded).toBe(amount);
  await expect(f.reserve.sendExternal(execute(f.reserve.address,1n))).rejects.toThrow();
  f.chain.now!+=3601;await f.reserve.send(f.owner.getSender(),{value:toNano('3')},null);
  await f.reserve.sendExternal(execute(f.reserve.address,1n,amount,minimumLp,f.chain.now!+60));await notify(f,s.gstdWallet,Address.parse(pool.router),1n,amount);
  f.chain.now!+=3601;await f.reserve.send(f.owner.getSender(),{value:toNano('3')},null);
  await expect(f.reserve.sendExternal(execute(f.reserve.address,2n,amount,minimumLp,f.chain.now!+60))).rejects.toThrow();
 });
});
