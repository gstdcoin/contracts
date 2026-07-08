// DEPRECATED — superseded by escrow_complete.tact
// escrow_complete.tact adds nonce replay protection, TVL tracking, and multi-task batch support.
// This file is NOT deployed. Kept for reference only.

import "@stdlib/deploy";
import "@stdlib/ownable";

// Messages
message Withdraw {
    executorAddress: Address;
    platformFee: Int as coins;
    executorReward: Int as coins;
    taskId: Int as uint64;
}

message UpdateAdmin {
    newAdmin: Address;
}

// Escrow contract
contract Escrow with Deployable, Ownable {
    owner: Address;
    adminWallet: Address;
    minMessageValue: Int as coins;

    init(owner: Address, adminWalletAddress: Address) {
        self.owner = owner;
        self.adminWallet = adminWalletAddress;
        self.minMessageValue = ton("0.01");
    }

    // Accept deposits (lock funds for tasks)
    receive("deposit") {
        require(context().value >= self.minMessageValue, "Below minimum deposit");
    }

    // Withdraw: Owner authorizes split payout
    receive(msg: Withdraw) {
        require(sender() == self.owner, "Only owner can authorize payouts");

        let totalAmount: Int = msg.platformFee + msg.executorReward;
        require(myBalance() >= totalAmount + ton("0.05"), "Insufficient balance");

        // 1. Send platform fee (5%) to admin wallet
        if (msg.platformFee > 0) {
            send(SendParameters{
                to: self.adminWallet,
                value: msg.platformFee,
                mode: SendIgnoreErrors,
                bounce: false,
                body: "platform_fee".asComment(),
            });
        }

        // 2. Send executor reward (95%) — bounce:true for safety
        if (msg.executorReward > 0) {
            send(SendParameters{
                to: msg.executorAddress,
                value: msg.executorReward,
                mode: SendIgnoreErrors,
                bounce: true,
                body: "task_reward".asComment(),
            });
        }
    }

    // Admin update (owner only)
    receive(msg: UpdateAdmin) {
        require(sender() == self.owner, "Only owner");
        self.adminWallet = msg.newAdmin;
    }

    // Getters
    get fun balance(): Int {
        return myBalance();
    }

    get fun get_admin(): Address {
        return self.adminWallet;
    }
}
