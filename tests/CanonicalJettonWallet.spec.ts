import {readFileSync} from 'fs';
import {join} from 'path';
import {Blockchain,createShardAccount,internal} from '@ton/sandbox';
import {Address,Cell,beginCell} from '@ton/core';
const fixture=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-wallet.json'),'utf8'));
const address=Address.parse(fixture.address),owner=Address.parse(fixture.owner),recipient=Address.parse(fixture.recipient);
async function emulate(op:number,balance:bigint){
 const chain=await Blockchain.create();
 const code=Cell.fromBoc(Buffer.from(fixture.code,'hex'))[0],data=Cell.fromBoc(Buffer.from(fixture.data,'hex'))[0];
 expect(code.hash().toString('hex')).toBe(fixture.code_hash);
 await chain.setShardAccount(address,createShardAccount({address,code,data,balance}));
 const before=(await chain.provider(address).get('get_wallet_data',[])).stack;
 const tokensBefore=before.readBigNumber();expect(before.readAddress().equals(owner)).toBe(true);
 expect(before.readAddress().toRawString()).toBe(fixture.master);
 let payload=Cell.fromBase64(fixture.payload);
 if(op!==0x0f8a7ea5){const rest=payload.beginParse();rest.loadUint(32);payload=beginCell().storeUint(op,32).storeSlice(rest).endCell();}
 const result=await chain.sendMessage(internal({from:owner,to:address,value:BigInt(fixture.attached_ton_nano),body:payload,bounce:true}));
 const tokensAfter=(await chain.provider(address).get('get_wallet_data',[])).stack.readBigNumber();
 return {chain,result,tokensBefore,tokensAfter};
}
describe('canonical deployed GSTD wallet, read-only mainnet fork',()=>{
 it.each([BigInt(fixture.balance),0n])('accepts the platform TEP-74 payload with 0.05 TON and initial wallet TON %s',async balance=>{
  const {chain,result,tokensBefore,tokensAfter}=await emulate(0x0f8a7ea5,balance);
  expect(tokensBefore-tokensAfter).toBe(BigInt(fixture.amount));
  const outgoing=[...result.transactions[0].outMessages.values()].find(m=>m.body.bits.length>=32&&m.body.beginParse().preloadUint(32)===0x178d4519)!;
  expect(outgoing).toBeDefined();
  const body=outgoing.body.beginParse();expect(body.loadUint(32)).toBe(0x178d4519);
  expect(body.loadUintBig(64)).toBe(BigInt(fixture.query_id));expect(body.loadCoins()).toBe(BigInt(fixture.amount));expect(body.loadAddress().equals(owner)).toBe(true);
  expect(outgoing.info.type).toBe('internal');
  if(outgoing.info.type!=='internal')throw new Error('Expected internal transfer');
  const receiver=(await chain.provider(outgoing.info.dest).get('get_wallet_data',[])).stack;
  expect(receiver.readBigNumber()).toBe(BigInt(fixture.amount));expect(receiver.readAddress().equals(recipient)).toBe(true);
 });
 it('rejects the unrelated generated Transfer header from PR #1 without changing token balance',async()=>{
  const {result,tokensBefore,tokensAfter}=await emulate(1435380091,BigInt(fixture.balance));
  expect(tokensAfter).toBe(tokensBefore);
  const phase=result.transactions[0].description;
  expect(phase.type).toBe('generic');
  if(phase.type==='generic'&&phase.computePhase.type==='vm')expect(phase.computePhase.exitCode).toBe(65535);
 });
});
