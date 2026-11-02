// Sandbox prototype: one irreversible decision coordinates three isolated GSTD shares.
// Payer acceptance is explicit; it is not a proof of model execution.
import "@stdlib/deploy";
message(0x47544501) AcceptFundedTask {}
message(0x47544502) WithdrawAcceptedShare { amount: Int as coins; queryId: Int as uint64; }
message(0x47544503) RefundExpiredShare { amount: Int as coins; queryId: Int as uint64; }
message(0x47544504) SyncTask {}
message(0x47544505) RefundExpiredTask {}
message(0x47544506) CommitTask { phase: Int as uint8; }
message(0x47544507) FundingReady { role: Int as uint8; }
message(0x47544508) ReportFunding {}
message(0x7362d09c) EscrowGstdReceived {
 queryId: Int as uint64; amount: Int as coins; from: Address; forwardPayload: Slice as remaining;
}
message(0xd53276db) EscrowExcess { queryId: Int as uint64; }

contract GstdEscrowShare {
 coordinator: Address;
 payer: Address;
 beneficiary: Address;
 role: Int as uint8;
 requiredAmount: Int as coins;
 walletCode: Cell;
 funded: Int as coins;
 phase: Int as uint8;
 init(coordinator: Address,payer: Address,beneficiary: Address,role: Int,requiredAmount: Int,walletCode: Cell) {
  // Instances are derived by the coordinator; no caller-selected withdrawal destination.
  require(role>=0 && role<=2 && requiredAmount>0,"Invalid share");
  require(walletCode.hash()==0xa46ef8746f4ea669c2ce9455be129b693cd1c638cb021faaac58c7df01e0a163,"Noncanonical wallet code");
  self.coordinator=coordinator;self.payer=payer;self.beneficiary=beneficiary;
  self.role=role;self.requiredAmount=requiredAmount;self.walletCode=walletCode;self.funded=0;self.phase=0;
 }
 fun tokenWallet(): Address {
  return contractAddress(StateInit {code:self.walletCode,data:beginCell().storeCoins(0).storeAddress(myAddress())
   .storeAddress(address("0:efe9c616f673622a337737097c0fa0018d4887d6061f59519985f3fbfbdb59b2"))
   .storeBit(false).endCell()});
 }
 fun report() {
  require(self.funded>=self.requiredAmount,"Share not funded");
  send(SendParameters {to:self.coordinator,value:ton("0.005"),mode:SendPayGasSeparately,bounce:true,
   body:FundingReady {role:self.role}.toCell()});
 }
 receive(msg: EscrowGstdReceived) {
  require(sender()==self.tokenWallet(),"Canonical wallet only");
  self.funded+=msg.amount;
  if(self.funded>=self.requiredAmount){self.report();}
 }
 receive(msg: ReportFunding) {
  require(context().value>=ton("0.03"),"Attach report gas");self.report();
 }
 receive(msg: CommitTask) {
  require(sender()==self.coordinator,"Coordinator only");
  require(msg.phase<=2,"Invalid phase");
  if(self.phase==0){self.phase=msg.phase;}else{require(self.phase==msg.phase,"Decision is final");}
 }
 fun transferTo(recipient: Address,amount: Int,queryId: Int) {
  require(amount>0,"Zero amount");require(context().value>=ton("0.08"),"Attach 0.08 TON");
  send(SendParameters {to:self.tokenWallet(),value:ton("0.05"),mode:SendPayGasSeparately,bounce:true,
   body:beginCell().storeUint(0x0f8a7ea5,32).storeUint(queryId,64).storeCoins(amount)
    .storeAddress(recipient).storeAddress(recipient).storeBit(false).storeCoins(1).storeBit(false).endCell()});
 }
 receive(msg: WithdrawAcceptedShare) {
  require(sender()==self.beneficiary,"Beneficiary only");require(self.phase==1,"Task not accepted");
  self.transferTo(self.beneficiary,msg.amount,msg.queryId);
 }
 receive(msg: RefundExpiredShare) {
  require(sender()==self.payer,"Payer only");require(self.phase==2,"Refund not authorized");
  self.transferTo(self.payer,msg.amount,msg.queryId);
 }
 receive(msg: EscrowExcess) {}
 receive() {}
 bounced(raw: Slice) {}
 get fun state(): Int {return self.phase;}
 get fun credited_funding(): Int {return self.funded;}
 get fun jetton_wallet_address(): Address {return self.tokenWallet();}
}

contract GstdTaskEscrow with Deployable {
 payer: Address;worker: Address;protocol: Address;reserve: Address;
 taskId: Int as uint256;budget: Int as coins;deadline: Int as uint64;walletCode: Cell;
 phase: Int as uint8;readyMask: Int as uint8;
 init(payer: Address,worker: Address,protocol: Address,reserve: Address,taskId: Int,budget: Int,deadline: Int,walletCode: Cell) {
  require(budget>=100 && deadline>0,"Invalid task budget");
  require(walletCode.hash()==0xa46ef8746f4ea669c2ce9455be129b693cd1c638cb021faaac58c7df01e0a163,"Noncanonical wallet code");
  self.payer=payer;self.worker=worker;self.protocol=protocol;self.reserve=reserve;
  self.taskId=taskId;self.budget=budget;self.deadline=deadline;self.walletCode=walletCode;self.phase=0;self.readyMask=0;
  self.validateAddress(payer);self.validateAddress(worker);self.validateAddress(protocol);self.validateAddress(reserve);
 }
 fun validateAddress(a: Address) {
  require(a!=newAddress(0,0),"Zero recipient");
  let s: Slice = beginCell().storeAddress(a).endCell().beginParse();s.skipBits(3);require(s.loadInt(8)==0,"Basechain only");
 }
 fun amount(role: Int): Int {
  if(role==0){return self.budget*85/100;}
  if(role==1){return self.budget*10/100;}
  return self.budget-self.budget*85/100-self.budget*10/100;
 }
 fun recipient(role: Int): Address {
  if(role==0){return self.worker;}if(role==1){return self.protocol;}return self.reserve;
 }
 fun shareInit(role: Int): StateInit {
  require(role>=0 && role<=2,"Invalid role");
  return initOf GstdEscrowShare(myAddress(),self.payer,self.recipient(role),role,self.amount(role),self.walletCode);
 }
 fun synchronize() {
  require(context().value>=ton("0.30"),"Attach 0.30 TON sync budget");
  let role: Int=0;
  while(role<3){
   let init: StateInit=self.shareInit(role);
   send(SendParameters {to:contractAddress(init),value:ton("0.08"),mode:SendPayGasSeparately,bounce:true,
    code:init.code,data:init.data,body:CommitTask {phase:self.phase}.toCell()});
   role+=1;
  }
 }
 receive(msg: SyncTask) {self.synchronize();}
 receive(msg: FundingReady) {
  require(msg.role<=2,"Invalid role");require(sender()==contractAddress(self.shareInit(msg.role)),"Canonical share only");
  self.readyMask=self.readyMask | (1 << msg.role);
 }
 receive(msg: AcceptFundedTask) {
  require(sender()==self.payer,"Payer only");require(self.phase!=2,"Already refunded");
  if(self.phase==0){
   require(now()<=self.deadline,"Task expired");require(self.readyMask==7,"Task not fully funded");self.phase=1;
  }
  self.synchronize();
 }
 receive(msg: RefundExpiredTask) {
  require(self.phase!=1,"Accepted work cannot be refunded");require(now()>self.deadline,"Task still active");
  self.phase=2;self.synchronize();
 }
 receive(msg: EscrowExcess) {}
 receive() {}
 bounced(raw: Slice) {}
 get fun state(): Int {return self.phase;}
 get fun funding_mask(): Int {return self.readyMask;}
 get fun share_address(role: Int): Address {return contractAddress(self.shareInit(role));}
 get fun share_amount(role: Int): Int {require(role>=0 && role<=2,"Invalid role");return self.amount(role);}
}
