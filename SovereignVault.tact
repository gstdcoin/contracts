import "@stdlib/deploy";
import "@stdlib/ownable";

message ProvideLiquidity {
    amount: Int as coins;
}

message WithdrawLiquidity {
    amount: Int as coins;
}

message UpdateKeeper {
    newKeeper: Address;
}

message UpdateFee {
    newFeeBasisPoints: Int as uint16;
}

message(0x4a25ce37) Deposit {}
message(0x14617f84) HarvestFees {}

message ExecuteSwap {
    queryId: Int as uint64;
    destination: Address;
    amountOut: Int as coins;
    feeReserved: Int as coins;
}

contract SovereignVault with Deployable, Ownable {
    owner: Address;        // Cold wallet of the Node Operator
    nodeKeeper: Address;   // Hot wallet managed by the node backend
    managementFee: Int as uint16; // Fee in basis points (e.g. 150 = 1.5%)
    totalLiquidity: Int as coins;
    accumulatedFees: Int as coins;

    init(owner: Address, nodeKeeper: Address, initialFee: Int) {
        self.owner = owner;
        self.nodeKeeper = nodeKeeper;
        self.managementFee = initialFee;
        self.totalLiquidity = 0;
        self.accumulatedFees = 0;
    }

    // ─── Liquidity Provision ───

    receive(msg: Deposit) {
        let ctx: Context = context();
        self.totalLiquidity += ctx.value;
    }

    receive(msg: ProvideLiquidity) {
        let ctx: Context = context();
        require(ctx.value >= msg.amount, "Insufficient deposit value");
        self.totalLiquidity += msg.amount;
    }

    receive(msg: WithdrawLiquidity) {
        require(sender() == self.owner, "Only owner can withdraw liquidity");
        require(self.totalLiquidity >= msg.amount, "Insufficient liquidity pool");

        self.totalLiquidity -= msg.amount;
        send(SendParameters{
            to: self.owner,
            value: msg.amount,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "Liquidity withdrawal".asComment()
        });
    }

    // ─── Swap Execution via Node Keeper (JIT Provision) ───

    receive(msg: ExecuteSwap) {
        // Only the backend's hot wallet can trigger the JIT liquidity
        require(sender() == self.nodeKeeper, "Only Node Keeper can execute swaps");
        require(self.totalLiquidity >= msg.amountOut, "Not enough liquidity to fulfill swap");

        self.totalLiquidity -= msg.amountOut;
        self.accumulatedFees += msg.feeReserved;

        // Send the requested tokens to the user destination
        send(SendParameters{
            to: msg.destination,
            value: msg.amountOut,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "DLN Swap Fulfillment".asComment()
        });
    }

    // ─── Vault Management ───

    receive(msg: UpdateKeeper) {
        require(sender() == self.owner, "Only owner can update keeper");
        self.nodeKeeper = msg.newKeeper;
    }

    receive(msg: UpdateFee) {
        require(sender() == self.owner, "Only owner can update fee");
        require(msg.newFeeBasisPoints <= 1000, "Fee too high (max 10%)");
        self.managementFee = msg.newFeeBasisPoints;
    }

    receive(msg: HarvestFees) {
        require(sender() == self.owner, "Only owner can harvest fees");
        require(self.accumulatedFees > 0, "No fees to harvest");

        let harvest: Int = self.accumulatedFees;
        self.accumulatedFees = 0;

        send(SendParameters{
            to: self.owner,
            value: harvest,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "Fee Harvest".asComment()
        });
    }

    // ─── Getters ───

    get fun get_vault_state(): VaultState {
        return VaultState{
            owner: self.owner,
            nodeKeeper: self.nodeKeeper,
            managementFee: self.managementFee,
            totalLiquidity: self.totalLiquidity,
            accumulatedFees: self.accumulatedFees
        };
    }
}

struct VaultState {
    owner: Address;
    nodeKeeper: Address;
    managementFee: Int as uint16;
    totalLiquidity: Int as coins;
    accumulatedFees: Int as coins;
}
