// Public read-only verification. No wallet signing key and no transaction submission.
const {TonClient,JettonMaster}=require('@ton/ton');
const {Address}=require('@ton/core');
const fixture=require('../tests/fixtures/canonical-gstd-wallet.json');
async function verify(){
 const client=new TonClient({endpoint:process.env.GSTD_TON_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC',timeout:15000});
 const address=Address.parse(fixture.master);
 const {stack}=await client.runMethod(address,'get_jetton_data');
 const supply=stack.readBigNumber(),mintable=stack.readBigNumber();
 // A frozen Jetton legitimately returns addr_none. JettonMaster.getJettonData in
 // older SDKs uses readAddress(), which throws for this canonical deployed token.
 const admin=stack.readAddressOpt();stack.readCell();const code=stack.readCell();
 const pool=await client.open(JettonMaster.create(address)).getWalletAddress(Address.parse(fixture.owner));
 const proof={scope:'Read-only token identity; not a custody backing or payout confirmation',master:address.toRawString(),supply_nano:String(supply),mintable:String(mintable),admin:admin?.toRawString()||null,wallet_code_hash:code.hash().toString('hex'),derived_pool:pool.toRawString()};
 if(mintable!==0n||admin!==null||supply<0n||supply>1000000000000000000n||proof.wallet_code_hash!==fixture.code_hash||proof.derived_pool!==fixture.address)throw new Error('Canonical token verification mismatch; review the chain state before any payment');
 console.log(JSON.stringify(proof,null,2));
}
if(require.main===module)verify().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={verify};
