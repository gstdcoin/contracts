import {readFileSync} from 'fs';
import {join} from 'path';
import {createHash} from 'crypto';
import {Blockchain} from '@ton/sandbox';
import {Address,Cell,Dictionary,beginCell,contractAddress,toNano} from '@ton/core';
import {TestGstdMasterV2} from '../build/TestGstdMasterV2/TestGstdMasterV2_TestGstdMasterV2';
import {GstdTaskEscrow} from '../build/GstdTaskEscrow/GstdTaskEscrow_GstdTaskEscrow';
import {GstdEscrowShare} from '../build/GstdTaskEscrow/GstdTaskEscrow_GstdEscrowShare';
import '@ton/test-utils';
const fixture=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-wallet.json'),'utf8'));
const expected=JSON.parse(readFileSync(join(__dirname,'fixtures/test-token-metadata.json'),'utf8'));
const code=Cell.fromBoc(Buffer.from(fixture.code,'hex'))[0];
async function setup(testnet=true){
 const chain=await Blockchain.create();chain.now=1800000000;
 if(testnet){const config=chain.config.beginParse().loadDictDirect(Dictionary.Keys.Int(32),Dictionary.Values.Cell());config.set(19,beginCell().storeInt(-3,32).endCell());chain.setConfig(beginCell().storeDictDirect(config).endCell());}
 const payer=await chain.treasury('payer'),worker=await chain.treasury('worker'),protocol=await chain.treasury('protocol'),reserve=await chain.treasury('reserve');
 const master=chain.openContract(await TestGstdMasterV2.fromInit(code));
 return{chain,payer,worker,protocol,reserve,master};
}
it('returns complete immutable TEP-64 on-chain metadata and settles actual canonical-wallet transfers',async()=>{
 const x=await setup();
 await x.master.send(x.payer.getSender(),{value:toNano('.2')},{$$type:'MintTestGstd',amount:toNano('1000'),queryId:1n});
 const metadata=(await x.master.getGetJettonData()).jettonContent.beginParse();expect(metadata.loadUint(8)).toBe(0);
 const dict=metadata.loadDict(Dictionary.Keys.Buffer(32),Dictionary.Values.Cell());expect(dict.size).toBe(Object.keys(expected).length);
 for(const [key,value]of Object.entries(expected)){const content=dict.get(createHash('sha256').update(key).digest())!.beginParse();expect(content.loadUint(8)).toBe(0);expect(content.loadStringTail()).toBe(value);}
 const wallet=(owner:Address)=>contractAddress(0,{code,data:beginCell().storeCoins(0).storeAddress(owner).storeAddress(x.master.address).storeBit(false).endCell()});
 const balance=async(owner:Address)=>(await x.chain.provider(wallet(owner)).get('get_wallet_data',[])).stack.readBigNumber();
 expect(await balance(x.payer.address)).toBe(toNano('1000'));
 const task=x.chain.openContract(await GstdTaskEscrow.fromInit(x.payer.address,x.worker.address,x.protocol.address,x.reserve.address,77n,toNano('1'),1800000100n,code,x.master.address,-3n));
 await task.send(x.payer.getSender(),{value:toNano('.4')},{$$type:'SyncTask'});
 const recipients=[x.worker,x.protocol,x.reserve],amounts=[toNano('.85'),toNano('.1'),toNano('.05')];
 for(let role=0;role<3;role++){
  const share=x.chain.openContract(await GstdEscrowShare.fromInit(task.address,x.payer.address,recipients[role].address,BigInt(role),amounts[role],code,x.master.address,-3n));
  const body=beginCell().storeUint(0x0f8a7ea5,32).storeUint(BigInt(role+2),64).storeCoins(amounts[role]).storeAddress(share.address).storeAddress(x.payer.address).storeBit(false).storeCoins(toNano('.01')).storeBit(false).endCell();
  await x.payer.send({to:wallet(x.payer.address),value:toNano('.1'),body});expect(await balance(share.address)).toBe(amounts[role]);
 }
 expect(await task.getFundingMask()).toBe(7n);
 await task.send(x.payer.getSender(),{value:toNano('.3')},{$$type:'AcceptFundedTask'});
 for(let role=0;role<3;role++){
  const share=x.chain.openContract(await GstdEscrowShare.fromInit(task.address,x.payer.address,recipients[role].address,BigInt(role),amounts[role],code,x.master.address,-3n));
  await share.send(recipients[role].getSender(),{value:toNano('.08')},{$$type:'WithdrawAcceptedShare',amount:amounts[role],queryId:BigInt(role+10)});
  expect(await balance(recipients[role].address)).toBe(amounts[role]);expect(await balance(share.address)).toBe(0n);
 }
 expect(await balance(x.payer.address)).toBe(toNano('999'));
});
it('keeps the metadata-bearing free test token disabled on mainnet',async()=>{
 const x=await setup(false);const result=await x.master.send(x.payer.getSender(),{value:toNano('.2')},{$$type:'MintTestGstd',amount:toNano('1'),queryId:1n});
 expect(result.transactions).toHaveTransaction({to:x.master.address,success:false});
});
