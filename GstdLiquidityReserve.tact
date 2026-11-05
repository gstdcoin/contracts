// SANDBOX CANDIDATE. Not deployed or authorized to receive customer backing.
// Fixed GSTD/XAUt0 destination. LP cannot be withdrawn by an administrator.
// Oracle authorization is a trust dependency, bounded by immutable on-chain policy.
import "@stdlib/deploy";

message(0x47524c01) ExecuteReserveLp {
    sequence: Int as uint64;
    amount: Int as coins;
    minimumLp: Int as coins;
    deadline: Int as uint32;
    signature: Slice as bytes64;
}
message(0x47524c02) RecoverReserveLp {
    sequence: Int as uint64;
    deadline: Int as uint32;
    signature: Slice as bytes64;
}
message(0x47524c03) PauseReserveLp { paused: Bool; }
message(0x7362d09c) ReserveJettonReceived {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    payload: Slice as remaining;
}
message(0xd53276db) ReserveExcess { queryId: Int as uint64; }

contract GstdLiquidityReserve with Deployable {
    owner: Address;
    oracleKey: Int as uint256;
    gstdWalletCode: Cell;
    lpWalletCode: Cell;
    lpAccountCode: Cell;
    minBatch: Int as coins;
    maxBatch: Int as coins;
    dailyLimit: Int as coins;
    minimumLpNumerator: Int as uint128;
    minimumLpDenominator: Int as uint128;
    cooldown: Int as uint32;
    paused: Bool;
    sequence: Int as uint64;
    accountedGstd: Int as coins;
    balanceProofPending: Bool;
    pending: Bool;
    pendingAmount: Int as coins;
    pendingMinimumLp: Int as coins;
    day: Int as uint32;
    daySpent: Int as coins;
    lastExecution: Int as uint32;
    lastRecovery: Int as uint32;
    totalSubmitted: Int as coins;
    totalLpReceived: Int as coins;
    totalRefunded: Int as coins;

    init(owner: Address, oracleKey: Int, gstdWalletCode: Cell, lpWalletCode: Cell,
         lpAccountCode: Cell, minBatch: Int, maxBatch: Int, dailyLimit: Int,
         minimumLpNumerator: Int, minimumLpDenominator: Int, cooldown: Int) {
        require(owner != newAddress(0,0), "Zero owner");
        require(oracleKey > 0, "Zero oracle key");
        require(gstdWalletCode.hash() == 0xa46ef8746f4ea669c2ce9455be129b693cd1c638cb021faaac58c7df01e0a163, "Canonical GSTD wallet only");
        require(lpWalletCode.hash() == 0xbf13041750f2beeb688859c75689e2c18b9c90bd78e97b197aad7ad6bc520c84, "Pinned pool LP wallet only");
        require(lpAccountCode.hash() == 0x3f1bb3192caaaa1ab7ae7474de50e2e3625fe2757aed4be4f4e9c3fc85ac0b9a, "Pinned pool LP account only");
        require(minBatch > 0 && minBatch <= maxBatch, "Positive minimum batch required");
        require(maxBatch > 0 && maxBatch <= 1000000000000000000, "Invalid batch maximum");
        require(dailyLimit >= maxBatch && dailyLimit <= 1000000000000000000, "Invalid daily limit");
        require(minimumLpNumerator > 0 && minimumLpDenominator > 0, "Positive LP floor required");
        require(cooldown >= 3600 && cooldown <= 604800, "Cooldown 1h to 7d");
        self.owner=owner; self.oracleKey=oracleKey;
        self.gstdWalletCode=gstdWalletCode; self.lpWalletCode=lpWalletCode; self.lpAccountCode=lpAccountCode;
        self.minBatch=minBatch; self.maxBatch=maxBatch; self.dailyLimit=dailyLimit;
        self.minimumLpNumerator=minimumLpNumerator; self.minimumLpDenominator=minimumLpDenominator;
        self.cooldown=cooldown; self.paused=true; self.sequence=0; self.pending=false; self.accountedGstd=0; self.balanceProofPending=false;
        self.pendingAmount=0; self.pendingMinimumLp=0; self.day=0; self.daySpent=0;
        self.lastExecution=0; self.lastRecovery=0; self.totalSubmitted=0; self.totalLpReceived=0; self.totalRefunded=0;
    }
    fun pool(): Address { return address("0:3ef895c6f154b204998b32a6f6276b783f26b44d2f525c787bbc787c21ecf6e6"); }
    fun router(): Address { return address("0:22bf722ec5803a64612e9ce819493b8c0736e98f045b5b0d3df96b04fa2a8a28"); }
    fun gstdWallet(): Address {
        return contractAddress(StateInit {code:self.gstdWalletCode,data:beginCell().storeCoins(0)
            .storeAddress(myAddress()).storeAddress(address("0:efe9c616f673622a337737097c0fa0018d4887d6061f59519985f3fbfbdb59b2"))
            .storeBit(false).endCell()});
    }
    fun lpWallet(): Address {
        return contractAddress(StateInit {code:self.lpWalletCode,data:beginCell().storeCoins(0)
            .storeAddress(myAddress()).storeAddress(self.pool()).storeRef(self.lpWalletCode).endCell()});
    }
    fun lpAccount(): Address {
        return contractAddress(StateInit {code:self.lpAccountCode,data:beginCell().storeAddress(myAddress())
            .storeAddress(self.pool()).storeCoins(0).storeCoins(0).endCell()});
    }
    fun checkDeadline(deadline: Int) {
        require(deadline >= now() && deadline <= now()+120, "Fresh quote required");
    }
    external(msg: ExecuteReserveLp) {
        self.checkDeadline(msg.deadline);
        require(!self.paused && !self.pending, "Paused or unresolved operation");
        require(msg.sequence == self.sequence && self.sequence < 0x8000000000000000, "Wrong sequence");
        require(self.accountedGstd >= msg.amount, "Insufficient notified GSTD balance");
        require(msg.amount >= self.minBatch && msg.amount <= self.maxBatch, "Batch cap");
        require(msg.minimumLp > 0 && msg.minimumLp*self.minimumLpDenominator >= msg.amount*self.minimumLpNumerator, "LP floor");
        require(self.lastExecution == 0 || now() >= self.lastExecution+self.cooldown, "Cooldown");
        let today: Int = now()/86400;
        let spent: Int = self.daySpent;
        if(self.day != today) { spent=0; }
        require(spent+msg.amount <= self.dailyLimit, "Daily cap");
        require(myBalance() >= ton("2"), "Fund TON gas separately");
        let hash: Int = beginCell().storeUint(0x47524c51,32).storeAddress(myAddress())
            .storeUint(msg.sequence,64).storeCoins(msg.amount).storeCoins(msg.minimumLp).storeUint(msg.deadline,32).endCell().hash();
        require(checkSignature(hash,msg.signature,self.oracleKey), "Invalid bounded oracle quote");
        // No TON wallet key is used. Invalid/replayed quotes are rejected before acceptance.
        acceptMessage();
        self.accountedGstd=self.accountedGstd-msg.amount; self.balanceProofPending=false;
        self.pending=true; self.pendingAmount=msg.amount; self.pendingMinimumLp=msg.minimumLp;
        self.sequence=self.sequence+1; self.day=today; self.daySpent=spent+msg.amount;
        self.lastExecution=now(); self.lastRecovery=0; self.totalSubmitted=self.totalSubmitted+msg.amount;
        let lpPayload: Cell = beginCell().storeCoins(msg.minimumLp).storeAddress(myAddress())
            .storeBit(false).storeCoins(ton("0.05")).storeBit(true)
            .storeRef(beginCell().storeUint(msg.sequence,64).endCell()).endCell();
        let dexPayload: Cell = beginCell().storeUint(935368415,32)
            .storeAddress(address("0:e78456ad6c32971a30385a46fcb69ed9896ad456956cfdd3e048fce546adb9d7"))
            .storeAddress(myAddress()).storeAddress(myAddress()).storeUint(msg.deadline,64).storeRef(lpPayload).endCell();
        send(SendParameters {to:self.gstdWallet(),value:ton("1"),mode:SendPayGasSeparately,bounce:true,
            body:beginCell().storeUint(0x0f8a7ea5,32).storeUint(msg.sequence,64).storeCoins(msg.amount)
                .storeAddress(self.router()).storeAddress(myAddress()).storeBit(false).storeCoins(ton("0.8"))
                .storeBit(true).storeRef(dexPayload).endCell()});
    }
    external(msg: RecoverReserveLp) {
        self.checkDeadline(msg.deadline);
        require(self.pending && msg.sequence+1 == self.sequence, "No matching pending operation");
        require(now() >= self.lastExecution+900, "Wait for chain reconciliation");
        require(self.lastRecovery == 0 || now() >= self.lastRecovery+86400, "Recovery cooldown");
        require(myBalance() >= ton("1.2"), "Fund recovery gas separately");
        let hash: Int = beginCell().storeUint(0x47524c52,32).storeAddress(myAddress())
            .storeUint(msg.sequence,64).storeUint(msg.deadline,32).endCell().hash();
        require(checkSignature(hash,msg.signature,self.oracleKey), "Invalid bounded recovery quote");
        acceptMessage();
        self.lastRecovery=now();
        // Fixed LPAccount refund only. Sending this is not itself proof of a refund.
        send(SendParameters {to:self.lpAccount(),value:ton("0.8"),mode:SendPayGasSeparately,bounce:true,
            body:beginCell().storeUint(321624620,32).storeUint(msg.sequence,64).storeBit(false).storeBit(false).endCell()});
    }
    fun proveReturnedBalance() {
        if(!self.pending || self.balanceProofPending || myBalance() < ton("0.3")) { return; }
        self.balanceProofPending=true;
        // A canonical-wallet self-transfer can succeed only if the full pre-operation
        // notified balance is available again. It does not ask an oracle to assert a balance.
        let query: Int = (self.sequence-1) | 0x8000000000000000;
        send(SendParameters {to:self.gstdWallet(),value:ton("0.2"),mode:SendPayGasSeparately,bounce:true,
            body:beginCell().storeUint(0x0f8a7ea5,32).storeUint(query,64)
                .storeCoins(self.accountedGstd+self.pendingAmount).storeAddress(myAddress()).storeAddress(myAddress())
                .storeBit(false).storeCoins(ton("0.05")).storeBit(false).endCell()});
    }
    receive(msg: ReserveJettonReceived) {
        if(sender() == self.lpWallet()) {
            require(msg.from == myAddress(), "Pool mint provenance required");
            if(self.pending && msg.queryId+1 == self.sequence) {
                require(msg.amount >= self.pendingMinimumLp, "LP receipt below minimum");
                self.totalLpReceived=self.totalLpReceived+msg.amount; self.pending=false; self.balanceProofPending=false;
                self.pendingAmount=0; self.pendingMinimumLp=0;
            }
            return;
        }
        require(sender() == self.gstdWallet(), "Canonical token wallet required");
        if(msg.from == myAddress()) {
            let query: Int = (self.sequence-1) | 0x8000000000000000;
            if(self.pending && self.balanceProofPending && msg.queryId == query && msg.amount == self.accountedGstd+self.pendingAmount) {
                self.accountedGstd=self.accountedGstd+self.pendingAmount;
                self.totalRefunded=self.totalRefunded+self.pendingAmount;
                self.pending=false; self.balanceProofPending=false; self.pendingAmount=0; self.pendingMinimumLp=0;
            }
            return;
        }
        self.accountedGstd=self.accountedGstd+msg.amount;
        if(self.pending && msg.queryId+1 == self.sequence && msg.from == self.router()) {
            let recovered: Int = min(msg.amount,self.pendingAmount);
            self.totalRefunded=self.totalRefunded+recovered; self.pendingAmount=self.pendingAmount-recovered;
            if(self.pendingAmount == 0) { self.pending=false; self.balanceProofPending=false; self.pendingMinimumLp=0; }
        }
    }
    receive(msg: PauseReserveLp) { require(sender() == self.owner, "Owner pause only"); self.paused=msg.paused; }
    receive(msg: ReserveExcess) {
        if(sender() == self.gstdWallet() && self.pending && self.lastRecovery > 0 && msg.queryId+1 == self.sequence) {
            self.proveReturnedBalance();
        }
    }
    receive() {}
    bounced(raw: Slice) {
        if(sender() != self.gstdWallet() || !self.pending || raw.bits() < 96) { return; }
        if(raw.loadUint(32) != 0x0f8a7ea5) { return; }
        let query: Int = raw.loadUint(64);
        if(query == ((self.sequence-1) | 0x8000000000000000)) { self.balanceProofPending=false; return; }
        if(query+1 == self.sequence) { self.proveReturnedBalance(); }
    }
    get fun status(): ReserveLpStatus {
        return ReserveLpStatus {paused:self.paused,pending:self.pending,sequence:self.sequence,
            pendingAmount:self.pendingAmount,pendingMinimumLp:self.pendingMinimumLp,daySpent:self.daySpent,accountedGstd:self.accountedGstd,
            totalSubmitted:self.totalSubmitted,totalLpReceived:self.totalLpReceived,totalRefunded:self.totalRefunded,
            gstdWallet:self.gstdWallet(),lpWallet:self.lpWallet(),lpAccount:self.lpAccount()};
    }
}
struct ReserveLpStatus {
    paused: Bool; pending: Bool; sequence: Int; pendingAmount: Int; pendingMinimumLp: Int; daySpent: Int;
    totalSubmitted: Int; totalLpReceived: Int; totalRefunded: Int; accountedGstd: Int;
    gstdWallet: Address; lpWallet: Address; lpAccount: Address;
}
