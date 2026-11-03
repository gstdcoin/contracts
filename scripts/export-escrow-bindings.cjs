// Deterministic generated bindings for the platform's older @ton/core runtime.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {Cell}=require('@ton/core');
const root=path.resolve(__dirname,'..'),frontend=process.argv[2];
if(!frontend)throw Error('Explicit frontend directory required');
const out=path.join(path.resolve(frontend),'src/lib/escrow-generated');fs.mkdirSync(out,{recursive:true});
const manifest={generated_from:'gstdcoin/contracts',network:'testnet only in platform UI',contracts:{}};
for(const [project,name] of [['GstdTaskEscrow','GstdTaskEscrow'],['GstdTaskEscrow','GstdEscrowShare'],['TestGstdMaster','TestGstdMaster']]){
 const stem=path.join(root,'build',project,project+'_'+name);
 let source=fs.readFileSync(stem+'.ts','utf8').replace(/Cell\.fromHex\('([a-f0-9]+)'\)/g,(_,hex)=>"Cell.fromBoc(Buffer.from('"+hex+"','hex'))[0]");
 fs.writeFileSync(path.join(out,name+'.ts'),'// Generated; regenerate with contracts/scripts/export-escrow-bindings.cjs.\n'+source);
 const boc=fs.readFileSync(stem+'.code.boc'),code=Cell.fromBoc(boc)[0];
 manifest.contracts[name]={code_hash:code.hash().toString('hex'),binding_sha256:crypto.createHash('sha256').update(source).digest('hex')};
}
const f=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/canonical-gstd-wallet.json'),'utf8'));
fs.writeFileSync(path.join(out,'wallet-code.json'),JSON.stringify({provenance:'Public canonical GSTD wallet code; testnet asset is valueless',code_hex:f.code,code_hash:f.code_hash})+'\n');
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Exported pinned escrow bindings; no runtime secrets.');
