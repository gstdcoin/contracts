'use strict';

// Local Windows operator tool. No networking, signing or broadcasts.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {mnemonicNew, mnemonicValidate, mnemonicToPrivateKey} = require('@ton/crypto');
const {WalletContractV5R1} = require('@ton/ton');
const roles = ['payer', 'worker', 'protocol', 'reserve'];
function ps(script, input = '') {
  try {
    return execFileSync('pwsh.exe', ['-NoProfile', '-NonInteractive', '-Command',
      "$ErrorActionPreference='Stop';" + script], {
      input, encoding:'utf8', windowsHide:true, timeout:30000, maxBuffer:131072,
      stdio:['pipe','pipe','pipe'],
    }).trim();
  } catch { throw Error('windows_protection_failed'); }
}
function protect(bytes, unprotect = false) {
  return Buffer.from(ps(`Add-Type -AssemblyName System.Security;
    $bytes=[Convert]::FromBase64String([Console]::In.ReadToEnd());
    try { $result=[Security.Cryptography.ProtectedData]::${unprotect?'Unprotect':'Protect'}(
      $bytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);
      [Console]::Out.Write([Convert]::ToBase64String($result));
    } finally { [Array]::Clear($bytes,0,$bytes.Length) }`, bytes.toString('base64')), 'base64');
}
function wallet(publicKey) {
  return WalletContractV5R1.create({publicKey, walletId:{networkGlobalId:-3,
    context:{walletVersion:'v5r1',workchain:0,subwalletNumber:0}}});
}
function outsideRepository(directory) {
  let current = fs.realpathSync(directory);
  for (;;) {
    if (fs.existsSync(path.join(current,'.git'))) throw Error('vault_must_be_outside_git_repositories');
    const parent = path.dirname(current);
    if (parent === current) return;
    current = parent;
  }
}
function checkedRead(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size>100000) throw Error('invalid_wallet_file');
  return JSON.parse(fs.readFileSync(file,'utf8'));
}
function assertPrivateDirectory(vault) {
  if (!fs.lstatSync(vault).isDirectory() || fs.lstatSync(vault).isSymbolicLink()) throw Error('invalid_private_directory');
  ps(`$directory=[Console]::In.ReadToEnd();
    $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User;
    $acl=Get-Acl -LiteralPath $directory;
    if(!$acl.AreAccessRulesProtected -or $acl.Owner -ne $sid.Translate([Security.Principal.NTAccount]).Value) { throw 'private_directory_required' }
    foreach($file in @($directory,(Join-Path $directory 'wallets.dpapi.json'))) {
      $access=(Get-Acl -LiteralPath $file).Access;
      if($access.Count -lt 1) { throw 'private_directory_required' }
      foreach($rule in $access) {
        $id=$rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value;
        if($id -notin @($sid.Value,'S-1-5-18') -or $rule.AccessControlType -ne 'Allow') { throw 'private_directory_required' }
      }
    }`, vault);
}
async function verify(vault, publicPath) {
  outsideRepository(vault);
  assertPrivateDirectory(vault);
  const envelope = checkedRead(path.join(vault,'wallets.dpapi.json'));
  if (envelope.schema!==1 || envelope.network!==-3 || envelope.protection!=='Windows-DPAPI-CurrentUser'
    || typeof envelope.ciphertext!=='string' || !/^[A-Za-z0-9+/]+=*$/.test(envelope.ciphertext)) throw Error('invalid_wallet_envelope');
  const plaintext = protect(Buffer.from(envelope.ciphertext,'base64'),true);
  try {
    const secret = JSON.parse(plaintext.toString('utf8')), publicWallets=checkedRead(publicPath);
    if (secret.schema!==1 || secret.network!==-3 || secret.walletVersion!=='v5r1'
      || secret.accounts?.length!==4 || Object.keys(publicWallets).sort().join()!==[...roles].sort().join()) throw Error('invalid_wallet_bundle');
    const seen = new Set();
    for (let i=0;i<roles.length;i++) {
      const account=secret.accounts[i];
      if (account.role!==roles[i] || account.mnemonic?.length!==24 || !await mnemonicValidate(account.mnemonic)) throw Error('wallet_recovery_failed');
      const keys=await mnemonicToPrivateKey(account.mnemonic);
      try {
        const address=wallet(keys.publicKey).address.toString({testOnly:true,bounceable:false});
        if (account.address!==address || publicWallets[account.role]!==address
          || account.publicKey!==keys.publicKey.toString('hex') || seen.has(address)) throw Error('wallet_recovery_failed');
        seen.add(address);
      } finally { keys.secretKey.fill(0); }
    }
    return {network:-3,walletVersion:'v5r1',wallets:publicWallets,independentKeys:4,
      recoveryVerified:true,protection:envelope.protection,signatures:0,broadcasts:0};
  } finally { plaintext.fill(0); }
}
async function main() {
  if (process.platform!=='win32') throw Error('windows_dpapi_required');
  if (process.env.TON_NETWORK && process.env.TON_NETWORK!=='testnet') throw Error('testnet_only');
  const args=process.argv.slice(2), check=args[0]==='verify';
  if (check) args.shift();
  if (args.length!==4 || args[0]!=='--vault' || args[2]!=='--public') throw Error('usage_optional_verify_then_vault_and_public_paths');
  const vault=path.resolve(args[1]), publicPath=path.resolve(args[3]);
  if (check) return verify(vault,publicPath);
  outsideRepository(path.dirname(vault));
  if (fs.existsSync(vault) || fs.existsSync(publicPath)) throw Error('new_paths_required');
  fs.mkdirSync(vault,{recursive:false});
  // Restrict the empty directory before generating a secret. Children inherit this ACL.
  ps(`$vaultPath=[Console]::In.ReadToEnd();
    $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User;
    $acl=New-Object Security.AccessControl.DirectorySecurity;
    $acl.SetAccessRuleProtection($true,$false); $acl.SetOwner($sid);
    $inherit=[Security.AccessControl.InheritanceFlags]'ContainerInherit,ObjectInherit';
    foreach($id in @($sid,(New-Object Security.Principal.SecurityIdentifier('S-1-5-18')))) {
      $rule=New-Object Security.AccessControl.FileSystemAccessRule($id,'FullControl',$inherit,'None','Allow');
      $acl.AddAccessRule($rule);
    }
    Set-Acl -LiteralPath $vaultPath -AclObject $acl;`, vault);
  fs.writeFileSync(path.join(vault,'.gitignore'),'*\n',{flag:'wx'});
  const accounts=[], publicWallets={};
  for (const role of roles) {
    const mnemonic=await mnemonicNew(24), keys=await mnemonicToPrivateKey(mnemonic);
    try {
      const address=wallet(keys.publicKey).address.toString({testOnly:true,bounceable:false});
      accounts.push({role,mnemonic,address,publicKey:keys.publicKey.toString('hex')});
      publicWallets[role]=address;
    } finally { keys.secretKey.fill(0); }
  }
  const plaintext=Buffer.from(JSON.stringify({schema:1,network:-3,walletVersion:'v5r1',accounts}));
  try {
    const ciphertext=protect(plaintext);
    fs.writeFileSync(path.join(vault,'wallets.dpapi.json'),JSON.stringify({schema:1,network:-3,
      protection:'Windows-DPAPI-CurrentUser',ciphertext:ciphertext.toString('base64')},null,2)+'\n',{flag:'wx'});
  } finally { plaintext.fill(0); }
  fs.writeFileSync(publicPath,JSON.stringify(publicWallets,null,2)+'\n',{flag:'wx'});
  return verify(vault,publicPath);
}
if (require.main===module) main().then(result=>console.log(JSON.stringify(result,null,2)))
  .catch(()=>{console.error('Testnet wallet operation failed; no secret is included in this error. Existing files were preserved.');process.exitCode=1;});
