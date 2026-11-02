import {readFileSync} from 'fs';
import {join} from 'path';
import {Blockchain,createShardAccount,internal} from '@ton/sandbox';
import {Address,Cell,beginCell,toNano,contractAddress} from '@ton/core';
import {GstdRewardAccount} from '../build/GstdRewardAccount/GstdRewardAccount_GstdRewardAccount';
import '@ton/test-utils';

const fixture=JSON.parse(readFileSync(join(__dirname,'fixtures/canonical-gstd-wallet.json'),'utf8'));
const walletCode=Cell.fromBoc(Buffer.from(fixture.code,'hex'))[0];
const master=Address.parse(fixture.master);
const walletData=(owner:Address,tokens:bigint)=>beginCell().storeCoins(tokens).storeAddress(owner).storeAddress(master).storeBit(tokens>0n).endCell();
describe('GstdRewardAccount — isolated beneficiary-controlled canonical GSTD',()=>{
 async function setup(fund=true) {
  const chain=await Blockchain.create();
  const owner=await chain.treasury('beneficiary'),stranger=await chain.treasury('stranger');
  const account=chain.openContract(await GstdRewardAccount.fromInit(owner.address,walletCode));
  await account.send(owner.getSender(),{value:toNano('.2')},{$$type:'Deploy',queryId:0n});
  const wallet=await account.getJettonWalletAddress();
  expect(wallet.equals(contractAddress(0,{code:walletCode,data:walletData(account.address,0n)}))).toBe(true);
  if(fund)await chain.setShardAccount(wallet,createShardAccount({address:wallet,code:walletCode,data:walletData(account.address,toNano('10')),balance:toNano('.05')}));
  return {chain,owner,stranger,account,wallet};
 }
 async function balance(chain:Blockchain,address:Address){
  const state=await chain.getContract(address);if(state.accountState?.type!=='active')return 0n;
  return (await chain.provider(address).get('get_wallet_data',[])).stack.readBigNumber();
 }
 it('matches the known mainnet wallet derivation before using its code',()=>{
  expect(walletCode.hash().toString('hex')).toBe(fixture.code_hash);
  expect(contractAddress(0,{code:walletCode,data:walletData(Address.parse(fixture.owner),0n)}).toRawString()).toBe(fixture.address);
 });
 it('rejects forged wallet code at deployment',async()=>{
  const chain=await Blockchain.create(),owner=await chain.treasury('o');
  const account=chain.openContract(await GstdRewardAccount.fromInit(owner.address,beginCell().endCell()));
  const result=await account.send(owner.getSender(),{value:toNano('.2')},{$$type:'Deploy',queryId:0n});
  expect(result.transactions).toHaveTransaction({to:account.address,success:false});
 });
 it('blocks strangers before emitting any GSTD transfer',async()=>{
  const {chain,stranger,account,wallet}=await setup();
  const result=await account.send(stranger.getSender(),{value:toNano('.08')},{$$type:'WithdrawOwnGstd',amount:toNano('1'),queryId:1n});
  expect(result.transactions).toHaveTransaction({to:account.address,success:false});
  expect(await balance(chain,wallet)).toBe(toNano('10'));
 });
 it.each([{amount:0n,value:'.08'},{amount:toNano('1'),value:'.01'}])('rejects zero amounts or insufficient user gas %j',async({amount,value})=>{
  const {chain,owner,account,wallet}=await setup();
  const result=await account.send(owner.getSender(),{value:toNano(value)},{$$type:'WithdrawOwnGstd',amount,queryId:1n});
  expect(result.transactions).toHaveTransaction({to:account.address,success:false});
  expect(await balance(chain,wallet)).toBe(toNano('10'));
 });
 it('delivers real canonical GSTD to the beneficiary with no platform or custody signature',async()=>{
  const {chain,owner,account,wallet}=await setup();
  await account.send(owner.getSender(),{value:toNano('.08')},{$$type:'WithdrawOwnGstd',amount:toNano('3'),queryId:42n});
  const destination=contractAddress(0,{code:walletCode,data:walletData(owner.address,0n)});
  expect(await balance(chain,destination)).toBe(toNano('3'));
  expect(await balance(chain,wallet)).toBe(toNano('7'));
 });
 it('permits recovery after an unfunded attempt without issuing unbacked tokens',async()=>{
  const {chain,owner,account,wallet}=await setup(false);
  const msg={$$type:'WithdrawOwnGstd' as const,amount:toNano('10'),queryId:1n};
  await account.send(owner.getSender(),{value:toNano('.08')},msg);
  await chain.setShardAccount(wallet,createShardAccount({address:wallet,code:walletCode,data:walletData(account.address,toNano('10')),balance:toNano('.05')}));
  await account.send(owner.getSender(),{value:toNano('.08')},msg);
  await account.send(owner.getSender(),{value:toNano('.08')},msg);
  const destination=contractAddress(0,{code:walletCode,data:walletData(owner.address,0n)});
  expect(await balance(chain,destination)).toBe(toNano('10'));
  expect(await balance(chain,wallet)).toBe(0n);
 });
 it('does not let an oversized attempt consume a smaller valid withdrawal',async()=>{
  const {chain,owner,account,wallet}=await setup();
  await account.send(owner.getSender(),{value:toNano('.08')},{$$type:'WithdrawOwnGstd',amount:toNano('11'),queryId:1n});
  expect(await balance(chain,wallet)).toBe(toNano('10'));
  await account.send(owner.getSender(),{value:toNano('.08')},{$$type:'WithdrawOwnGstd',amount:toNano('10'),queryId:2n});
  expect(await balance(chain,wallet)).toBe(0n);
 });
 it('rejects forged deposit notifications and cannot turn them into spendable funds',async()=>{
  const {chain,stranger,account,wallet}=await setup();
  const body=beginCell().storeUint(0x7362d09c,32).storeUint(7,64).storeCoins(toNano('999')).storeAddress(stranger.address).storeBit(false).endCell();
  const result=await chain.sendMessage(internal({from:stranger.address,to:account.address,value:toNano('.05'),body}));
  expect(result.transactions).toHaveTransaction({to:account.address,success:false});
  expect(await balance(chain,wallet)).toBe(toNano('10'));
 });
 it('rejects non-basechain beneficiaries before funding',async()=>{
  const chain=await Blockchain.create(),payer=await chain.treasury('payer');
  const account=chain.openContract(await GstdRewardAccount.fromInit(new Address(-1,Buffer.alloc(32,7)),walletCode));
  const result=await account.send(payer.getSender(),{value:toNano('.2')},{$$type:'Deploy',queryId:0n});
  expect(result.transactions).toHaveTransaction({to:account.address,success:false});
 });
 it('funds from a canonical source wallet, initializes the account token wallet and then withdraws',async()=>{
  const {chain,owner,account,wallet}=await setup(false);
  const source=Address.parse(fixture.address),sourceOwner=Address.parse(fixture.owner);
  await chain.setShardAccount(source,createShardAccount({address:source,code:walletCode,data:Cell.fromBoc(Buffer.from(fixture.data,'hex'))[0],balance:toNano('.05')}));
  const funding=beginCell().storeUint(0x0f8a7ea5,32).storeUint(51,64).storeCoins(toNano('10'))
    .storeAddress(account.address).storeAddress(sourceOwner).storeBit(false).storeCoins(toNano('.01')).storeBit(false).endCell();
  const funded=await chain.sendMessage(internal({from:sourceOwner,to:source,value:toNano('.1'),body:funding}));
  expect(funded.transactions).toHaveTransaction({from:wallet,to:account.address,success:true});
  expect(await balance(chain,wallet)).toBe(toNano('10'));
  await account.send(owner.getSender(),{value:toNano('.08')},{$$type:'WithdrawOwnGstd',amount:toNano('10'),queryId:52n});
  expect(await balance(chain,wallet)).toBe(0n);
  expect(await balance(chain,contractAddress(0,{code:walletCode,data:walletData(owner.address,0n)}))).toBe(toNano('10'));
 });

});
