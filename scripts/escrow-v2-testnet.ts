// Public-data preparation only: no private keys, wallet signing or broadcasts.
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {randomBytes} from 'crypto';
import {performance} from 'perf_hooks';
import {Address, Cell, Dictionary, beginCell, contractAddress, storeStateInit, toNano, type StateInit} from '@ton/core';
import {TestGstdMasterV2, storeMintTestGstd} from '../build/TestGstdMasterV2/TestGstdMasterV2_TestGstdMasterV2';
import {GstdEscrowShareV2} from '../build/GstdTaskEscrowV2/GstdTaskEscrowV2_GstdEscrowShareV2';
import * as Abi from '../build/GstdTaskEscrowV2/GstdTaskEscrowV2_GstdTaskEscrowV2';

export const TESTNET_RPC = 'https://testnet.toncenter.com/api/v2/';
export const TESTNET_TONAPI = 'https://testnet.tonapi.io/v2/';
export const roles = ['payer', 'worker', 'protocol', 'reserve'] as const;
export type Role = typeof roles[number];
type Wallets = Record<Role, string>;
type Message = {address:string;amount:string;payload:string;stateInit?:string};
type Step = {key:string;signer:Role;message:Message;availableAfter?:number;expiresAt?:number};
type Inputs = {wallets:Wallets;budget:string;taskId:string;createdAt:number};
export type TestnetPlan = {
    schema:1;network:-3;inputs:Inputs;codeHashes:Record<string,string>;
    token:{symbol:'tGSTD';valueless:true};steps:Step[];
    addresses:{master:string;successTask:string;refundTask:string;successShares:string[];refundShares:string[];tokenWallets:Wallets};
    attachedBudgetsNanoTON:Record<Role,string>;signingRequired:true;broadcasts:false;
};
const friendly = (address:Address) => address.toString({testOnly:true,bounceable:true});
function walletCode() {
    const fixture = JSON.parse(readFileSync(join(__dirname, '../tests/fixtures/canonical-gstd-wallet.json'), 'utf8'));
    const code = Cell.fromBoc(Buffer.from(fixture.code, 'hex'))[0];
    if (code.hash().toString('hex') !== 'a46ef8746f4ea669c2ce9455be129b693cd1c638cb021faaac58c7df01e0a163') throw Error('wallet_code_mismatch');
    return code;
}
export function assertTestnetChoice(value = process.env.TON_NETWORK) {
    if (value && value !== 'testnet') throw Error('testnet_only');
}
function actors(value:Wallets):Record<Role,Address> {
    const result = {} as Record<Role,Address>;
    for (const role of roles) {
        if (typeof value?.[role] !== 'string' || value[role].length > 100) throw Error('four_public_testnet_addresses_required');
        const parsed = Address.parseFriendly(value[role]);
        if (!parsed.isTestOnly || parsed.address.workChain !== 0 || parsed.address.hash.equals(Buffer.alloc(32))) throw Error('testnet_basechain_address_required');
        result[role] = parsed.address;
    }
    if (new Set(roles.map(role=>result[role].toRawString())).size !== 4) throw Error('independent_wallets_required');
    return result;
}
function initString(init?:StateInit) {
    if (!init) throw Error('compiled_init_required');
    return beginCell().store(storeStateInit(init)).endCell().toBoc().toString('base64');
}
export async function createTestnetPlan(wallets:Wallets, createdAt:number, budgetText='1000000000', taskText=BigInt('0x'+randomBytes(32).toString('hex')).toString()):Promise<TestnetPlan> {
    const a = actors(wallets);
    if (!Number.isSafeInteger(createdAt) || createdAt < 1 || createdAt > 0xffffffff-3600) throw Error('invalid_chain_time');
    if (typeof budgetText !== 'string' || !/^[1-9]\d{0,11}$/.test(budgetText)) throw Error('invalid_test_budget');
    const budget = BigInt(budgetText);
    if (budget < 100n || budget > 100_000_000_000n) throw Error('test_budget_out_of_range');
    if (typeof taskText !== 'string' || !/^[1-9]\d{0,77}$/.test(taskText)) throw Error('invalid_task_id');
    const taskId = BigInt(taskText);
    if (taskId >= (1n<<256n)-1n) throw Error('invalid_task_id');
    const code = walletCode(), master = await TestGstdMasterV2.fromInit(code);
    const amounts = [budget*85n/100n,budget*10n/100n,budget-budget*85n/100n-budget*10n/100n];
    const partial = amounts[0]/2n;
    const success = await Abi.GstdTaskEscrowV2.fromInit(a.payer,a.worker,a.protocol,a.reserve,taskId,budget,BigInt(createdAt+3600),code,master.address,-3n);
    const refund = await Abi.GstdTaskEscrowV2.fromInit(a.payer,a.worker,a.protocol,a.reserve,taskId+1n,budget,BigInt(createdAt+120),code,master.address,-3n);
    const tokenWallet = (owner:Address)=>contractAddress(0,{code,data:beginCell().storeCoins(0).storeAddress(owner).storeAddress(master.address).storeBit(false).endCell()});
    const recipients = [a.worker,a.protocol,a.reserve], signerRoles:Role[]=['worker','protocol','reserve'];
    const successShares = await Promise.all(recipients.map((recipient,i)=>GstdEscrowShareV2.fromInit(success.address,a.payer,recipient,BigInt(i),amounts[i],code,master.address,-3n)));
    const refundShares = await Promise.all(recipients.map((recipient,i)=>GstdEscrowShareV2.fromInit(refund.address,a.payer,recipient,BigInt(i),amounts[i],code,master.address,-3n)));
    const nonce = (offset:number)=>(taskId+BigInt(offset))% (1n<<64n);
    const message = (to:Address,value:string,body:Cell,init?:StateInit):Message=>({address:friendly(to),amount:toNano(value).toString(),payload:body.toBoc().toString('base64'),...(init?{stateInit:initString(init)}:{})});
    const transfer = (to:Address,amount:bigint,offset:number)=>beginCell().storeUint(0x0f8a7ea5,32).storeUint(nonce(offset),64)
        .storeCoins(amount).storeAddress(to).storeAddress(a.payer).storeBit(false).storeCoins(toNano('.01')).storeBit(false).endCell();
    const steps:Step[] = [
        {key:'mint',signer:'payer',message:message(master.address,'.2',beginCell().store(storeMintTestGstd({$$type:'MintTestGstd',amount:budget+partial,queryId:nonce(1)})).endCell(),master.init)},
        {key:'success-sync',signer:'payer',expiresAt:createdAt+3600,message:message(success.address,'.3',beginCell().store(Abi.storeSyncTask({$$type:'SyncTask'})).endCell(),success.init)},
    ];
    for (let i=0;i<3;i++) steps.push({key:'success-fund-'+i,signer:'payer',expiresAt:createdAt+3600,message:message(tokenWallet(a.payer),'.1',transfer(successShares[i].address,amounts[i],10+i))});
    steps.push({key:'success-accept',signer:'payer',expiresAt:createdAt+3600,message:message(success.address,'.3',beginCell().store(Abi.storeAcceptFundedTask({$$type:'AcceptFundedTask'})).endCell())});
    for (let i=0;i<3;i++) steps.push({key:'success-claim-'+i,signer:signerRoles[i],message:message(successShares[i].address,'.08',beginCell().store(Abi.storeWithdrawAcceptedShare({$$type:'WithdrawAcceptedShare',amount:amounts[i],queryId:nonce(20+i)})).endCell())});
    steps.push(
        {key:'refund-sync',signer:'payer',message:message(refund.address,'.3',beginCell().store(Abi.storeSyncTask({$$type:'SyncTask'})).endCell(),refund.init)},
        {key:'refund-fund',signer:'payer',message:message(tokenWallet(a.payer),'.1',transfer(refundShares[0].address,partial,30))},
        {key:'refund-expire',signer:'payer',availableAfter:createdAt+120,message:message(refund.address,'.3',beginCell().store(Abi.storeRefundExpiredTask({$$type:'RefundExpiredTask'})).endCell())},
        {key:'refund-claim',signer:'payer',availableAfter:createdAt+120,message:message(refundShares[0].address,'.08',beginCell().store(Abi.storeRefundExpiredShare({$$type:'RefundExpiredShare',amount:partial,queryId:nonce(31)})).endCell())},
    );
    const totals:Record<Role,bigint>={payer:0n,worker:0n,protocol:0n,reserve:0n};
    for (const step of steps) totals[step.signer]+=BigInt(step.message.amount);
    return {schema:1,network:-3,inputs:{wallets:Object.fromEntries(roles.map(role=>[role,friendly(a[role])])) as Wallets,budget:budgetText,taskId:taskText,createdAt},
        codeHashes:{wallet:code.hash().toString('hex'),testMaster:master.init!.code!.hash().toString('hex'),task:success.init!.code!.hash().toString('hex'),share:successShares[0].init!.code!.hash().toString('hex')},
        token:{symbol:'tGSTD',valueless:true},steps,addresses:{master:friendly(master.address),successTask:friendly(success.address),refundTask:friendly(refund.address),successShares:successShares.map(x=>friendly(x.address)),refundShares:refundShares.map(x=>friendly(x.address)),tokenWallets:Object.fromEntries(roles.map(role=>[role,friendly(tokenWallet(a[role]))])) as Wallets},
        attachedBudgetsNanoTON:Object.fromEntries(roles.map(role=>[role,totals[role].toString()])) as Record<Role,string>,signingRequired:true,broadcasts:false};
}
export async function transactionForStep(plan:TestnetPlan,key:string,chainTime:number) {
    if (plan.schema!==1 || plan.network!==-3 || plan.broadcasts!==false || !Number.isSafeInteger(chainTime)) throw Error('invalid_testnet_plan');
    const rebuilt = await createTestnetPlan(plan.inputs.wallets,plan.inputs.createdAt,plan.inputs.budget,plan.inputs.taskId);
    if (Object.keys(plan.codeHashes||{}).length!==Object.keys(rebuilt.codeHashes).length
      || Object.entries(rebuilt.codeHashes).some(([key,value])=>plan.codeHashes[key]!==value)) throw Error('compiled_code_changed_prepare_again');
    const step = rebuilt.steps.find(item=>item.key===key);
    if (!step) throw Error('unknown_step');
    if (step.availableAfter!==undefined && chainTime<=step.availableAfter) throw Error('refund_deadline_not_reached');
    if (step.expiresAt!==undefined && chainTime>step.expiresAt) throw Error('task_expired');
    return {network:'-3',from:Address.parse(rebuilt.inputs.wallets[step.signer]).toRawString(),validUntil:Math.min(chainTime+600,step.expiresAt??chainTime+600),messages:[step.message]};
}
export async function testnetPreflight() {
    assertTestnetChoice();
    const provider=process.env.ESCROW_TESTNET_RPC_PROVIDER||'tonapi';
    if(!['tonapi','toncenter'].includes(provider)) throw Error('unsupported_testnet_provider');
    const origin=provider==='tonapi'?TESTNET_TONAPI:TESTNET_RPC;
    let last = -2000;
    let requests=0;
    async function read(method:string,params:Record<string,string>={}) {
        const url = new URL(method,origin);
        for (const [key,value] of Object.entries(params)) url.searchParams.set(key,value);
        const headers:Record<string,string>={'accept':'application/json','user-agent':'GSTD-Testnet-ReadOnly-Preflight'};
        if(provider==='toncenter' && process.env.ESCROW_TESTNET_TONCENTER_API_KEY) headers['X-API-Key']=process.env.ESCROW_TESTNET_TONCENTER_API_KEY;
        if(provider==='tonapi' && process.env.ESCROW_TESTNET_TONAPI_KEY) headers.Authorization='Bearer '+process.env.ESCROW_TESTNET_TONAPI_KEY;
        for(let attempt=0;attempt<3;attempt++) {
            const wait=1100-(performance.now()-last);
            if(wait>0) await new Promise(resolve=>setTimeout(resolve,wait));
            last=performance.now();requests++;
            const response=await fetch(url,{headers,redirect:'error',signal:AbortSignal.timeout(12_000)});
            if([429,503].includes(response.status) && attempt<2) {
                const retry=response.headers.get('retry-after');
                const seconds=retry?Number(retry):2*(attempt+1);
                if(!Number.isFinite(seconds) || seconds>10 || seconds<0) throw Error('testnet_rpc_retry_later');
                await response.body?.cancel();
                await new Promise(resolve=>setTimeout(resolve,Math.max(1100,seconds*1000)));
                continue;
            }
            if(!response.ok) throw Error('testnet_rpc_http_'+response.status);
            const json=await response.json() as any;
            if(provider==='toncenter') {if(!json.ok) throw Error('testnet_rpc_rejected');return json.result;}
            return json;
        }
        throw Error('testnet_rpc_retry_exhausted');
    }
    let now:number,seqno:number;
    if(provider==='tonapi') {
        const config=await read('blockchain/config');
        if(typeof config.raw!=='string' || config.raw.length>4_000_000) throw Error('invalid_raw_network_config');
        const root=Cell.fromBoc(Buffer.from(config.raw,config.raw.startsWith('b5ee')?'hex':'base64'))[0];
        const slice=root.beginParse();
        if(slice.remainingBits!==256 || slice.remainingRefs!==1) throw Error('invalid_config_params');
        slice.skip(256);
        const dictionary=slice.loadRef().beginParse().loadDictDirect(Dictionary.Keys.Int(32),Dictionary.Values.Cell());
        const network=dictionary.get(19);
        if(!network || network.beginParse().loadInt(32)!==-3) throw Error('rpc_is_not_testnet');
        const head=await read('blockchain/masterchain-head');
        if(head.global_id!==-3 || head.workchain_id!==-1) throw Error('rpc_is_not_testnet');
        now=head.gen_utime;seqno=head.seqno;
    } else {
        const config=await read('getConfigParam',{config_id:'19'});
        if(Cell.fromBase64(config.config.bytes).beginParse().loadInt(32)!==-3) throw Error('rpc_is_not_testnet');
        const info=await read('getMasterchainInfo');
        if(info.last.workchain!==-1) throw Error('invalid_masterchain');
        const block=await read('getBlockHeader',{workchain:String(info.last.workchain),shard:info.last.shard,seqno:String(info.last.seqno)});
        now=block.gen_utime;seqno=info.last.seqno;
    }
    if (!Number.isSafeInteger(now) || now<1) throw Error('invalid_chain_time');
    if(!Number.isSafeInteger(seqno) || seqno<1) throw Error('invalid_masterchain');
    const master = await TestGstdMasterV2.fromInit(walletCode());
    return {network:-3 as const,rpc_origin:new URL(origin).origin,provider,requests,masterchain_seqno:seqno,chain_time:now,
        host_clock_skew_seconds:Math.floor(Date.now()/1000)-now,test_master:friendly(master.address),
        signing_required:true,broadcasts:false,real_transactions:false};
}
function publicJson(path:string) {
    const raw=readFileSync(path);if(raw.length>1_000_000) throw Error('public_plan_file_too_large');return JSON.parse(raw.toString('utf8'));
}
async function main() {
    assertTestnetChoice();
    const [command='preflight',...args]=process.argv.slice(2),flags:Record<string,string>={};
    for(let i=0;i<args.length;i+=2){if(!['--wallets','--out','--budget','--session','--step'].includes(args[i]) || !args[i+1]) throw Error('invalid_arguments');flags[args[i]]=args[i+1];}
    if(!['preflight','prepare','transaction'].includes(command)) throw Error('unknown_command');
    if(command==='prepare' && (!flags['--wallets'] || !flags['--out'])) throw Error('public_wallets_and_new_output_path_required');
    if(command==='transaction' && (!flags['--session'] || !flags['--step'])) throw Error('session_and_step_required');
    const probe=await testnetPreflight();
    let result:unknown=probe;
    if(command==='prepare') {
        if(!flags['--wallets'] || !flags['--out']) throw Error('public_wallets_and_new_output_path_required');
        result=await createTestnetPlan(publicJson(flags['--wallets']),probe.chain_time,flags['--budget']);
    } else if(command==='transaction') {
        if(!flags['--session'] || !flags['--step']) throw Error('session_and_step_required');
        if(Math.abs(probe.host_clock_skew_seconds)>300) throw Error('host_clock_skew_refresh_clock_before_signing');
        result=await transactionForStep(publicJson(flags['--session']),flags['--step'],probe.chain_time);
    }
    const output=JSON.stringify(result,null,2)+'\n';
    if(flags['--out']) {writeFileSync(flags['--out'],output,{flag:'wx'});console.log(JSON.stringify({written:flags['--out'],network:-3,signing_required:true,broadcasts:false}));}
    else console.log(output);
}
if(require.main===module) main().catch(error=>{console.error(error instanceof Error?error.message:'testnet_preparation_failed');process.exitCode=1;});
