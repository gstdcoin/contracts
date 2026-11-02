// TESTNET / SANDBOX migration primitive, NOT the live platform balance.
// Each account holds GSTD for exactly one immutable beneficiary.
// No admin, platform signer, pooled credits, pause, or arbitrary withdrawal destination.
import "@stdlib/deploy";

message(0x47525701) WithdrawOwnGstd {
    amount: Int as coins;
    queryId: Int as uint64;
}
message(0x7362d09c) GstdReceived {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    forwardPayload: Slice as remaining;
}
message(0xd53276db) GstdExcess {
    queryId: Int as uint64;
}
contract GstdRewardAccount with Deployable {
    beneficiary: Address;
    walletCode: Cell;

    init(beneficiary: Address, walletCode: Cell) {
        require(beneficiary != newAddress(0,0), "Zero beneficiary");
        // Code of the immutable canonical GSTD jetton wallet, verified against mainnet fixture.
        require(walletCode.hash() == 0xa46ef8746f4ea669c2ce9455be129b693cd1c638cb021faaac58c7df01e0a163, "Noncanonical wallet code");
        let addressBits: Slice = beginCell().storeAddress(beneficiary).endCell().beginParse();
        addressBits.skipBits(3);
        require(addressBits.loadInt(8) == 0, "Basechain beneficiary only");
        self.beneficiary = beneficiary;
        self.walletCode = walletCode;
    }
    fun tokenWallet(): Address {
        let data: Cell = beginCell()
            .storeCoins(0)
            .storeAddress(myAddress())
            .storeAddress(address("0:efe9c616f673622a337737097c0fa0018d4887d6061f59519985f3fbfbdb59b2"))
            .storeBit(false).endCell();
        return contractAddress(StateInit {code:self.walletCode, data:data});
    }
    receive(msg: WithdrawOwnGstd) {
        require(sender() == self.beneficiary, "Beneficiary only");
        require(msg.amount > 0, "Zero amount");
        // User funds this call. Never take an execution budget from another user's balance.
        require(context().value >= ton("0.08"), "Attach 0.08 TON");
        send(SendParameters {
            to: self.tokenWallet(),
            value: ton("0.05"),
            mode: SendPayGasSeparately,
            bounce: true,
            body: beginCell().storeUint(0x0f8a7ea5,32)
                .storeUint(msg.queryId,64).storeCoins(msg.amount)
                .storeAddress(self.beneficiary).storeAddress(self.beneficiary)
                .storeBit(false).storeCoins(1).storeBit(false).endCell()
        });
        // This is an attempt, not a receipt. No off-chain balance is marked paid here.
        // A downstream failure can be retried: only this beneficiary owns all funds
        // in the account's canonical token wallet; that wallet enforces actual balance.
    }
    receive(msg: GstdReceived) {
        require(sender() == self.tokenWallet(), "Canonical wallet only");
        // No shadow accounting; the canonical jetton-wallet balance is authoritative.
    }
    receive(msg: GstdExcess) {}
    receive() {}
    bounced(raw: Slice) {}
    get fun beneficiary_address(): Address { return self.beneficiary; }
    get fun jetton_wallet_address(): Address { return self.tokenWallet(); }
}
