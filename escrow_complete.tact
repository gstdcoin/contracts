// ============================================================================
// GSTD Escrow Contract — Task Compensation Distribution
// ============================================================================
// Handles task compensation via pull-model with full security:
// - Owner deposits TON for tasks
// - Owner authorizes withdrawals to workers
// - Platform fee is sent to treasury
// - Replay attack protection via nonce
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message Withdraw {
    executorAddress: Address;
    platformFee: Int as coins;
    executorReward: Int as coins;
    taskId: Int as uint64;
    nonce: Int as uint64;
}

message DepositTask {
    taskId: Int as uint64;
    totalAmount: Int as coins;
}

message UpdateTreasury {
    newTreasury: Address;
}

message EmergencyWithdraw {
    destination: Address;
    amount: Int as coins;
}

// ── Data structures ─────────────────────────────────────────────────────────

struct TaskDeposit {
    totalAmount: Int as coins;
    executorReward: Int as coins;
    platformFee: Int as coins;
    claimed: Bool;
    createdAt: Int as uint64;
}

// ── Escrow Contract ─────────────────────────────────────────────────────────

contract Escrow with Deployable, Ownable {
    owner: Address;
    treasury: Address;

    // Minimum message value to prevent spam
    minMessageValue: Int as coins;

    // Global nonce counter (must always increase)
    lastNonce: Int as uint64;

    // Task tracking counters
    totalDeposits: Int as uint64;
    totalWithdrawals: Int as uint64;
    totalValueLocked: Int as coins;

    init(owner: Address, treasuryAddress: Address) {
        self.owner = owner;
        self.treasury = treasuryAddress;
        self.minMessageValue = ton("0.01");
        self.lastNonce = 0;
        self.totalDeposits = 0;
        self.totalWithdrawals = 0;
        self.totalValueLocked = 0;
    }

    // ── Receive TON deposits (any sender can deposit) ───────────────────
    receive("deposit") {
        let amount: Int = context().value - ton("0.01");
        require(amount > 0, "Deposit too small");
        self.totalDeposits = self.totalDeposits + 1;
        self.totalValueLocked = self.totalValueLocked + amount;
    }

    // ── Deposit for specific task ───────────────────────────────────────
    receive(msg: DepositTask) {
        let amount: Int = context().value - ton("0.01");
        require(amount > 0, "Deposit too small");
        require(msg.totalAmount <= amount, "Declared amount exceeds actual deposit");
        self.totalDeposits = self.totalDeposits + 1;
        self.totalValueLocked = self.totalValueLocked + amount;
    }

    // ── Withdraw: Owner authorizes payout to worker ─────────────────────
    receive(msg: Withdraw) {
        // Only owner can authorize withdrawals
        require(sender() == self.owner, "Only owner can authorize payouts");
        require(context().value >= self.minMessageValue, "Message value too low");

        // Replay attack protection: nonce must be strictly increasing
        require(msg.nonce > self.lastNonce, "Invalid nonce — replay attack prevented");
        self.lastNonce = msg.nonce;

        // Verify amounts
        let totalPayout: Int = msg.platformFee + msg.executorReward;
        require(totalPayout > 0, "Payout must be positive");
        require(myBalance() >= totalPayout + ton("0.1"), "Insufficient contract balance");

        // Update tracking
        self.totalWithdrawals = self.totalWithdrawals + 1;
        self.totalValueLocked = self.totalValueLocked - totalPayout;

        // Send platform fee to treasury
        if (msg.platformFee > 0) {
            send(SendParameters{
                to: self.treasury,
                value: msg.platformFee,
                mode: SendIgnoreErrors,
                bounce: false,
                body: "escrow_fee".asComment()
            });
        }

        // Send executor reward
        if (msg.executorReward > 0) {
            send(SendParameters{
                to: msg.executorAddress,
                value: msg.executorReward,
                mode: SendIgnoreErrors,
                bounce: true,
                body: "task_reward".asComment()
            });
        }
    }

    // ── Update treasury address (only owner) ────────────────────────────
    receive(msg: UpdateTreasury) {
        require(sender() == self.owner, "Only owner");
        self.treasury = msg.newTreasury;
    }

    // ── Emergency withdrawal (only owner, for stuck funds) ──────────────
    receive(msg: EmergencyWithdraw) {
        require(sender() == self.owner, "Only owner");
        require(msg.amount <= myBalance() - ton("0.1"), "Cannot withdraw below minimum reserve");

        send(SendParameters{
            to: msg.destination,
            value: msg.amount,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "emergency_withdrawal".asComment()
        });
    }

    // ── Getters ─────────────────────────────────────────────────────────

    get fun balance(): Int {
        return myBalance();
    }

    get fun get_nonce(): Int {
        return self.lastNonce;
    }

    get fun get_escrow_stats(): EscrowStats {
        return EscrowStats{
            totalDeposits: self.totalDeposits,
            totalWithdrawals: self.totalWithdrawals,
            totalValueLocked: self.totalValueLocked,
            lastNonce: self.lastNonce,
            treasury: self.treasury
        };
    }
}

// ── Data structures ─────────────────────────────────────────────────────────

struct EscrowStats {
    totalDeposits: Int as uint64;
    totalWithdrawals: Int as uint64;
    totalValueLocked: Int as coins;
    lastNonce: Int as uint64;
    treasury: Address;
}
