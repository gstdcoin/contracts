// Valueless test asset. Constructor rejects every network except TON testnet.
// Uses the pinned canonical wallet code so the transfer path can be exercised.
import "@stdlib/deploy";
message(0x54475301) MintTestGstd { amount: Int as coins; queryId: Int as uint64; }
struct TestJettonData { totalSupply: Int; mintable: Bool; adminAddress: Address; jettonContent: Cell; jettonWalletCode: Cell; }
contract TestGstdMaster with Deployable {
 walletCode: Cell;totalSupply: Int as coins;
 init(walletCode: Cell) {
  require(getConfigParam(19)!!.beginParse().loadInt(32)==-3,"Testnet only");
  require(walletCode.hash()==0xa46ef8746f4ea669c2ce9455be129b693cd1c638cb021faaac58c7df01e0a163,"Canonical wallet code required");
  self.walletCode=walletCode;self.totalSupply=0;
 }
 fun walletInit(owner: Address): StateInit {
  return StateInit {code:self.walletCode,data:beginCell().storeCoins(0).storeAddress(owner).storeAddress(myAddress()).storeBit(false).endCell()};
 }
 receive(msg: MintTestGstd) {
  require(msg.amount>0 && msg.amount<=1000000000000,"Max1000testtokens per call");
  require(context().value>=ton("0.15"),"Attach testnet TON");
  self.totalSupply+=msg.amount;
  let init: StateInit=self.walletInit(sender());
  send(SendParameters {to:contractAddress(init),value:ton("0.10"),mode:SendPayGasSeparately,bounce:true,code:init.code,data:init.data,
   body:beginCell().storeUint(0x178d4519,32).storeUint(msg.queryId,64).storeCoins(msg.amount).storeAddress(myAddress())
    .storeAddress(sender()).storeCoins(ton("0.01")).storeBit(false).endCell()});
 }
 receive() {}
 bounced(raw: Slice) {}
 get fun get_wallet_address(owner: Address): Address {return contractAddress(self.walletInit(owner));}
 get fun get_jetton_data(): TestJettonData {
  return TestJettonData {totalSupply:self.totalSupply,mintable:true,adminAddress:myAddress(),
   jettonContent:beginCell().endCell(),jettonWalletCode:self.walletCode};
 }
}
