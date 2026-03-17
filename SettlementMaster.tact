// ============================================================================
// SettlementMaster Contract — Economic Heart of GSTD
// ============================================================================
// Receives task payments, splits 85/10/5:
//   85% → Worker Node (TON)
//   10% → Treasury (→ Gold Reserve)
//    5% → Protocol Buyback & Burn
// Also triggers GSTD bonus minting for workers.
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message SettleTask {
    taskId: Int as uint64;
    workerAddr: Address;
    gstdBonusAmount: Int as coins; // GSTD tokens to mint as bonus
    qualityScore: Int as uint32; // 0-10000 (2 decimal places)
    computeUnits: Int as uint64;
}

message WorkerPayment {
    taskId: Int as uint64;
    amount: Int as coins;
    bonusGSTD: Int as coins;
}

message UpdateShares {
    worker: Int as uint8;
    treasury: Int as uint8;
    protocol: Int as uint8;
}

message UpdateAddresses {
    treasury: Address;
    protocolFee: Address;
    gstdJetton: Address;
}

message MintWorkerReward {
    workerAddr: Address;
    amount: Int as coins;
    taskId: Int as uint64;
}

message SetBaseRate {
    rate: Int as coins; // nanoGSTD per compute unit
}

message EmergencyPause {
    paused: Bool;
}

// ── Settlement Master Contract ──────────────────────────────────────────────

contract SettlementMaster with Deployable, Ownable {
    // ── Configuration ───────────────────────────────────────────────────
    owner: Address; // DAO governance contract
    gstdJetton: Address; // GSTDJetton master contract
    treasury: Address; // TreasuryGold contract
    protocolFee: Address; // Buyback & Burn contract

    // ── Revenue split (must sum to 100) ─────────────────────────────────
    workerShare: Int as uint8; // 85%
    treasuryShare: Int as uint8; // 10%
    protocolShare: Int as uint8; //  5%

    // ── Economics ────────────────────────────────────────────────────────
    baseRate: Int as coins; // nanoGSTD per compute unit
    totalSettled: Int as coins; // total TON settled
    totalGSTDMinted: Int as coins; // total GSTD minted to workers
    taskCount: Int as uint64;

    // ── Circuit breaker ─────────────────────────────────────────────────
    paused: Bool;
    minPayment: Int as coins; // Minimum TON per settlement

    init(
        owner: Address,
        gstdJetton: Address,
        treasury: Address,
        protocolFee: Address,
    ) {
        self.owner = owner;
        self.gstdJetton = gstdJetton;
        self.treasury = treasury;
        self.protocolFee = protocolFee;

        self.workerShare = 85;
        self.treasuryShare = 10;
        self.protocolShare = 5;

        self.baseRate = 1000000; // 0.001 GSTD per CU (nanoGSTD)
        self.totalSettled = 0;
        self.totalGSTDMinted = 0;
        self.taskCount = 0;

        self.paused = false;
        self.minPayment = ton("0.1"); // minimum 0.1 TON per settlement
    }

    // ── Main Settlement Function ────────────────────────────────────────
    // Called by Gateway/Orchestrator with TON payment attached
    receive(msg: SettleTask) {
        require(sender() == self.owner, "Only Gateway/Orchestrator can settle");
        require(!self.paused, "Settlement paused");

        let total: Int = context().value - ton("0.1"); // reserve for gas
        require(total >= self.minPayment, "Payment below minimum");

        // Calculate shares
        let workerAmt: Int = total * self.workerShare / 100;
        let treasuryAmt: Int = total * self.treasuryShare / 100;
        let protocolAmt: Int = total - workerAmt - treasuryAmt; // remainder

        // ── Update statistics BEFORE sends (prevent race conditions) ────
        self.totalSettled = total + self.totalSettled;
        self.totalGSTDMinted = msg.gstdBonusAmount + self.totalGSTDMinted;
        self.taskCount = 1 + self.taskCount;

        // ── 1. Pay worker (85% TON) — bounce:true to recover on failure ─
        send(SendParameters {
            to: msg.workerAddr,
            value: workerAmt,
            mode: SendIgnoreErrors,
            bounce: true,
            body: WorkerPayment {
                taskId: msg.taskId,
                amount: workerAmt,
                bonusGSTD: msg.gstdBonusAmount,
            }.toCell(),
        });

        // ── 2. Send to Treasury (10% TON → Gold reserve) ───────────────
        send(SendParameters {
            to: self.treasury,
            value: treasuryAmt,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "deposit".asComment(),
        });

        // ── 3. Protocol Fee (5% → Buyback & Burn) ──────────────────────
        send(SendParameters {
            to: self.protocolFee,
            value: protocolAmt,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "buyback".asComment(),
        });

        // ── 4. Mint GSTD bonus to worker ────────────────────────────────
        if (msg.gstdBonusAmount > 0) {
            send(SendParameters {
                to: self.gstdJetton,
                value: ton("0.08"),
                mode: SendIgnoreErrors,
                bounce: false,
                body: MintWorkerReward {
                    workerAddr: msg.workerAddr,
                    amount: msg.gstdBonusAmount,
                    taskId: msg.taskId,
                }.toCell(),
            });
        }
    }

    // ── Handle bounced worker payments (return TON to settlement pool) ──
    bounced(src: bounced<WorkerPayment>) {
        // Worker payment failed (invalid address). TON returns here.
        // Re-add to treasury as fallback
        send(SendParameters {
            to: self.treasury,
            value: 0,
            mode: SendRemainingValue + SendIgnoreErrors,
            bounce: false,
            body: "bounced_worker_payment".asComment(),
        });
    }

    // ── DAO Governance: Update revenue split ────────────────────────────
    receive(msg: UpdateShares) {
        require(sender() == self.owner, "Only DAO");
        require(msg.worker + msg.treasury + msg.protocol == 100, "Must sum to 100");
        require(msg.worker >= 50, "Worker share minimum 50%");

        self.workerShare = msg.worker;
        self.treasuryShare = msg.treasury;
        self.protocolShare = msg.protocol;
    }

    // ── DAO: Update contract addresses ──────────────────────────────────
    receive(msg: UpdateAddresses) {
        require(sender() == self.owner, "Only DAO");
        self.treasury = msg.treasury;
        self.protocolFee = msg.protocolFee;
        self.gstdJetton = msg.gstdJetton;
    }

    // ── DAO: Update base rate ───────────────────────────────────────────
    receive(msg: SetBaseRate) {
        require(sender() == self.owner, "Only DAO");
        require(msg.rate > 0, "Rate must be positive");
        self.baseRate = msg.rate;
    }

    // ── Emergency pause ─────────────────────────────────────────────────
    receive(msg: EmergencyPause) {
        require(sender() == self.owner, "Only DAO");
        self.paused = msg.paused;
    }

    // ── Getters ─────────────────────────────────────────────────────────
    get fun get_settlement_stats(): SettlementStats {
        return SettlementStats {
            totalSettled: self.totalSettled,
            totalGSTDMinted: self.totalGSTDMinted,
            taskCount: self.taskCount,
            baseRate: self.baseRate,
        };
    }

    get fun get_revenue_split(): RevenueSplit {
        return RevenueSplit {
            worker: self.workerShare,
            treasury: self.treasuryShare,
            protocol: self.protocolShare,
        };
    }

    get fun get_addresses(): ContractAddresses {
        return ContractAddresses {
            gstdJetton: self.gstdJetton,
            treasury: self.treasury,
            protocolFee: self.protocolFee,
            owner: self.owner,
        };
    }

    get fun is_paused(): Bool {
        return self.paused;
    }
}

// ── Data structures ─────────────────────────────────────────────────────────

struct SettlementStats {
    totalSettled: Int as coins;
    totalGSTDMinted: Int as coins;
    taskCount: Int as uint64;
    baseRate: Int as coins;
}

struct RevenueSplit {
    worker: Int as uint8;
    treasury: Int as uint8;
    protocol: Int as uint8;
}

struct ContractAddresses {
    gstdJetton: Address;
    treasury: Address;
    protocolFee: Address;
    owner: Address;
}
