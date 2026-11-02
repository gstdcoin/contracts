// Offline fixture generator: canonical deployed wallet code in TON Sandbox.
// No network, seed, wallet signature or real funds.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {Blockchain,createShardAccount,internal}=require('@ton/sandbox');
const {Address,Cell,beginCell,toNano,contractAddress,storeTransaction}=require('@ton/core');
async function main(){
 const fixture=require('../tests/fixtures/canonical-gstd-wallet.json');
 const code=Cell.fromBoc(Buffer.from(fixture.code,'hex'))[0],master=Address.parse(fixture.master);
 if(code.hash().toString('hex')!==fixture.code_hash)throw Error('Canonical code mismatch');
 const custody=Address.parse('0:cc1db8988345b901e6eb39bd6fda9350fc6a02b22df7bcb4ac2542a2fdf29931');
 const payer=Address.parse('0:'+'11'.repeat(32)),executor=Address.parse('0:'+'22'.repeat(32));
 const data=(owner,balance)=>beginCell().storeCoins(balance).storeAddress(owner).storeAddress(master).storeBit(balance>0n).endCell();
 const wallet=owner=>contractAddress(0,{code,data:data(owner,0n)});
 const chain=await Blockchain.create(),time=1800000000;
 chain.now=time;
 await chain.setShardAccount(wallet(payer),createShardAccount({address:wallet(payer),code,data:data(payer,toNano('100')),balance:toNano('.1')}));
 const body=(amount,dest,query)=>beginCell().storeUint(0x0f8a7ea5,32).storeUint(query,64).storeCoins(amount)
  .storeAddress(dest).storeAddress(dest).storeBit(false).storeCoins(1).storeBit(false).endCell();
 function receipt(result,dest){
  const tx=result.transactions.find(tx=>tx.address===BigInt('0x'+dest.hash.toString('hex'))&&tx.inMessage?.info.type==='internal'&&tx.inMessage.body.bits.length>=32&&tx.inMessage.body.beginParse().preloadUint(32)===0x178d4519);
  if(!tx||tx.description.type!=='generic'||tx.description.computePhase.type!=='vm'||!tx.description.computePhase.success)throw Error('Canonical transfer failed');
  const root=beginCell().store(storeTransaction(tx)).endCell();
  return {hash:root.hash().toString('hex'),raw:root.toBoc().toString('hex'),account:{address:dest.toRawString()}};
 }
 chain.now=time+1;
 const deposited=await chain.sendMessage(internal({from:payer,to:wallet(payer),value:toNano('.05'),body:body(toNano('100'),custody,1n)}));
 const deposit=receipt(deposited,wallet(custody));
 const requestId='rehearsal-withdraw-v1';
 const id=crypto.createHash('sha256').update(JSON.stringify(['withdrawal',executor.toRawString(),requestId])).digest('hex');
 const query=BigInt('0x'+id.slice(0,16));
 chain.now=time+3;
 const paid=await chain.sendMessage(internal({from:custody,to:wallet(custody),value:toNano('.05'),body:body(toNano('8.5'),executor,query)}));
 const withdrawal=receipt(paid,wallet(executor));
 const remaining=(await chain.provider(wallet(custody)).get('get_wallet_data',[])).stack.readBigNumber();
 if(remaining!==toNano('91.5'))throw Error('Conservation failed');
 const result={provenance:{kind:'TON Sandbox, not mainnet',canonical_wallet_code_hash:fixture.code_hash,no_real_funds:true},
 time,payer:payer.toRawString(),executor:executor.toRawString(),custody:custody.toRawString(),master:master.toRawString(),requestId,
 wallets:Object.fromEntries([payer,custody,executor].map(owner=>[owner.toRawString(),wallet(owner).toRawString()])),
 deposit,withdrawal,custody_reserve_after_deposit:toNano('100').toString(),custody_reserve_after_withdrawal:remaining.toString()};
 const output=process.argv[2];if(!output)throw Error('Explicit fixture output path required');
 fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log('Canonical money fixture generated; conservation100=91.5+8.5; no real funds.');
}
main().catch(()=>{console.error('Offline fixture generation failed');process.exitCode=1;});
