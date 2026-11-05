// Opt-in read-only mainnet snapshot for local sandbox tests. Never signs/broadcasts.
// Full third-party code remains in the caller's temporary fixture, not this repository.
import {Cell} from '@ton/core';
import {writeFile} from 'node:fs/promises';
const output=process.argv[2];if(!output)throw Error('Explicit new output file required');
const addresses=[
 '0:22bf722ec5803a64612e9ce819493b8c0736e98f045b5b0d3df96b04fa2a8a28',
 '0:3ef895c6f154b204998b32a6f6276b783f26b44d2f525c787bbc787c21ecf6e6',
 '0:e78456ad6c32971a30385a46fcb69ed9896ad456956cfdd3e048fce546adb9d7',
 '0:a374e6ff3aeb0d3e6ff3917b1ee72c5ccb71de2c75d91f5eae53f1bad09913dc'
];
const cell=v=>Cell.fromBoc(Buffer.from(v,v.startsWith('b5ee')?'hex':'base64'))[0];
let calls=0,last=0;async function get(path){
 if(++calls>32)throw Error('Snapshot request budget exceeded');
 const wait=1100-(Date.now()-last);if(wait>0)await new Promise(r=>setTimeout(r,wait));last=Date.now();
 const r=await fetch('https://tonapi.io/v2/'+path,{headers:{'User-Agent':'GSTD-Local-Liquidity-Sandbox'},signal:AbortSignal.timeout(15000),redirect:'manual'});
 if(!r.ok)throw Error('Snapshot source HTTP '+r.status);
 return r.json();
}
const accounts=[],libraries={},pending=new Set(),visited=new Set();
function collect(c){
 const hash=c.hash().toString('hex');if(visited.has(hash))return;visited.add(hash);
 if(c.isExotic&&c.bits.length===264){const s=c.beginParse(true);if(s.loadUint(8)===2)pending.add(s.loadBuffer(32).toString('hex'));}
 for(const r of c.refs)collect(r);
}
for(const address of addresses){
 const a=await get('blockchain/accounts/'+address);
 if(!a.code||!a.data||!Number.isSafeInteger(a.balance)||a.balance<0)throw Error('Invalid active account snapshot');
 const code=cell(a.code),data=cell(a.data);collect(code);collect(data);
 accounts.push({address,code:a.code,data:a.data,balance:String(a.balance),code_hash:code.hash().toString('hex'),data_hash:data.hash().toString('hex')});
}
for(const hash of pending){
 if(libraries[hash])continue;if(Object.keys(libraries).length>=16)throw Error('Library budget exceeded');
 const l=await get('blockchain/libraries/'+hash),code=cell(l.boc);
 if(code.hash().toString('hex')!==hash)throw Error('Library hash mismatch');
 libraries[hash]=l.boc;collect(code);
}
for(const old of accounts){
 const a=await get('blockchain/accounts/'+old.address);
 if(cell(a.code).hash().toString('hex')!==old.code_hash||cell(a.data).hash().toString('hex')!==old.data_hash)throw Error('Account changed during capture; use a new snapshot later');
}
await writeFile(output,JSON.stringify({captured_at:new Date().toISOString(),mode:'bounded_sequential_unchanged_code_and_data',source:'https://tonapi.io/v2/',accounts,libraries,requests:calls,real_transactions:false},null,2),{flag:'wx',mode:0o600});
console.log(JSON.stringify({accounts:accounts.length,libraries:Object.keys(libraries).length,requests:calls,real_transactions:false}));
