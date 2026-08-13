// ============================================================================
// SettlementMaster Contract — Economic Heart of GSTD
// ============================================================================
// Receives task payments, splits 85/10/5:
//   85% → Worker Node (TON)
//   10% → Ecosystem Treasury (buybacks)
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

message SetGateway {
    gateway: Address;
}

message SetOwnJettonWallet {
    wallet: Address; // SM's own GSTD jetton wallet (pre-funded by admin)
}

// ── P2P settlement additions ────────────────────────────────────────────────
// See docs/P2P_SETTLEMENT_RFC.md for the full design. Summary: instead of
// trusting sender() (a single gateway wallet), these messages trust a quorum
// of Ed25519 signatures attached to the call — any address can submit the
// transaction, but it only succeeds if enough registered nodes attested to
// the same (taskId, workerAddr, resultHash).

// DAO-controlled allowlist of attestor Ed25519 public keys. Interim mechanism:
// populated by the DAO from AgentRegistry's registered nodes until a direct
// on-chain relay from AgentRegistry is wired up (cross-contract calls in TON
// are asynchronous, so that relay is separate follow-up work, not done here).
message RegisterAttestorKey {
    pubkey: Int as uint256; // Ed25519 public key of a registered node
    authorized: Bool;
}

message SetQuorumThreshold {
    threshold: Int as uint8; // minimum distinct valid attestations required
}

// One task's completion, attested by a quorum of other nodes instead of
// trusted-gateway-only. `attestations` is a chain of cells, one per
// attestation: 256-bit pubkey + 512-bit Ed25519 signature over
// sha256(taskId . workerAddr . resultHash), each cell holding a single ref
// to the next attestation (or no ref for the last one).
message SettleTaskWithProof {
    taskId: Int as uint64;
    workerAddr: Address;
    resultHash: Int as uint256; // hash of the accepted (majority-agreed) result
    attestationCount: Int as uint8;
    attestations: Cell;
    gstdBonusAmount: Int as coins;
    computeUnits: Int as uint64;
}

// Same as SettleTaskWithProof but for a bounded batch of tasks completed by
// the SAME worker, settled in one call so the ~0.15 TON gas floor per call
// is paid once instead of once per task. `entries` is a chain of BatchEntry
// cells (see struct below), max MaxBatchSize per call.
message SettleBatch {
    workerAddr: Address;
    entryCount: Int as uint8;
    entries: Cell;
    totalGstdBonusAmount: Int as coins;
}

// ── Settlement Master Contract ──────────────────────────────────────────────

contract SettlementMaster with Deployable, Ownable {
    // ── Configuration ───────────────────────────────────────────────────
    owner: Address; // DAO governance contract
    gateway: Address; // Gateway/Orchestrator that initiates settlements
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
    totalGSTDMinted: Int as coins; // total GSTD sent to workers (from pool, not minted)
    taskCount: Int as uint64;
    // SM's own GSTD jetton wallet — set by admin after deploy, pre-funded with reward pool
    ownJettonWallet: Address;

    // ── Replay / double-settlement guard ─────────────────────────────────
    settledTasks: map<Int, Bool>; // taskId => true; prevents paying same task twice

    // ── Circuit breaker ─────────────────────────────────────────────────
    paused: Bool;
    minPayment: Int as coins; // Minimum TON per settlement

    // ── P2P settlement (quorum-attested) ─────────────────────────────────
    attestorKeys: map<Int, Bool>; // Ed25519 pubkey (uint256) => authorized
    quorumThreshold: Int as uint8; // min distinct valid attestations required

    init(
        owner: Address,
        gstdJetton: Address,
        treasury: Address,
        protocolFee: Address,
    ) {
        self.owner = owner;
        self.gateway = owner; // initially owner is also gateway; set separately later
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
        self.minPayment = ton("0.05"); // effective minimum payment after gas reserve (total = value - 0.1 TON gas)
        self.ownJettonWallet = newAddress(0, 0); // set via SetOwnJettonWallet after deploy

        self.quorumThreshold = 2; // default: 2-of-3 redundant execution
    }

    // ── DAO: Set gateway address ─────────────────────────────────────────
    receive(msg: SetGateway) {
        require(sender() == self.owner, "Only DAO");
        self.gateway = msg.gateway;
    }

    // ── Main Settlement Function ────────────────────────────────────────
    // Called by Gateway/Orchestrator with TON payment attached
    receive(msg: SettleTask) {
        require(sender() == self.owner || sender() == self.gateway, "Only DAO or Gateway can settle");
        require(!self.paused, "Settlement paused");
        require(msg.workerAddr != newAddress(0, 0), "Worker address cannot be zero");

        // ── Replay guard: each taskId can only be settled once ───────────
        require(self.settledTasks.get(msg.taskId) == null, "Task already settled");
        self.settledTasks.set(msg.taskId, true);

        // Gas reserve: 0.1 TON kept for gas + nested sends. Actual minimum call value = 0.15 TON.
        require(context().value > ton("0.1"), "Insufficient value for gas reserve");
        let total: Int = context().value - ton("0.1");
        require(total >= self.minPayment, "Payment below minimum");

        self.settlePayout(msg.taskId, msg.workerAddr, total, msg.gstdBonusAmount, msg.computeUnits);
    }

    // ── P2P settlement: quorum-attested, any sender ─────────────────────
    // No sender() check — trust comes entirely from the attached signature
    // quorum, verified below. This is what lets a node settle its own work.
    receive(msg: SettleTaskWithProof) {
        require(!self.paused, "Settlement paused");
        require(msg.workerAddr != newAddress(0, 0), "Worker address cannot be zero");
        require(self.settledTasks.get(msg.taskId) == null, "Task already settled");

        require(
            self.verifyQuorum(msg.taskId, msg.workerAddr, msg.resultHash, msg.attestationCount, msg.attestations),
            "Insufficient attested quorum",
        );

        self.settledTasks.set(msg.taskId, true);

        require(context().value > ton("0.1"), "Insufficient value for gas reserve");
        let total: Int = context().value - ton("0.1");
        require(total >= self.minPayment, "Payment below minimum");

        self.settlePayout(msg.taskId, msg.workerAddr, total, msg.gstdBonusAmount, msg.computeUnits);
    }

    // ── P2P settlement: batched, single gas reserve for up to MaxBatchSize
    // tasks belonging to the same worker. Each entry carries its own quorum
    // proof; only the payout is combined. ────────────────────────────────
    receive(msg: SettleBatch) {
        require(!self.paused, "Settlement paused");
        require(msg.workerAddr != newAddress(0, 0), "Worker address cannot be zero");
        require(msg.entryCount > 0, "Empty batch");
        require(msg.entryCount <= 5, "Batch too large"); // MaxBatchSize

        require(context().value > ton("0.1"), "Insufficient value for gas reserve");
        let totalValue: Int = context().value - ton("0.1");
        require(totalValue >= self.minPayment, "Payment below minimum");

        let cursor: Cell = msg.entries;
        let i: Int = 0;
        let acceptedComputeUnits: Int = 0;
        while (i < msg.entryCount) {
            let es: Slice = cursor.beginParse();
            let taskId: Int = es.loadUint(64);
            let resultHash: Int = es.loadUint(256);
            let attestationCount: Int = es.loadUint(8);
            let computeUnits: Int = es.loadUint(64);
            let attestations: Cell = es.loadRef();

            require(self.settledTasks.get(taskId) == null, "Task already settled");
            require(
                self.verifyQuorum(taskId, msg.workerAddr, resultHash, attestationCount, attestations),
                "Insufficient attested quorum for batch entry",
            );
            self.settledTasks.set(taskId, true);
            acceptedComputeUnits += computeUnits;

            if (es.refs() > 0) {
                cursor = es.loadRef(); // link to next BatchEntry
            }
            i += 1;
        }

        // Single combined payout for the whole batch — this is the point of
        // batching: one 0.1 TON gas reserve for up to 5 tasks, not five.
        self.settlePayout(0, msg.workerAddr, totalValue, msg.totalGstdBonusAmount, acceptedComputeUnits);
    }

    // ── Shared payout logic (worker/treasury/protocol split + GSTD bonus) ─
    // taskId is used only for the WorkerPayment memo and bonus queryId; for
    // SettleBatch it's 0 since a batch settles many taskIds at once (each
    // already recorded individually in settledTasks above).
    fun settlePayout(taskId: Int, workerAddr: Address, total: Int, gstdBonusAmount: Int, computeUnits: Int) {
        // Calculate shares
        let workerAmt: Int = total * self.workerShare / 100;
        let treasuryAmt: Int = total * self.treasuryShare / 100;
        let protocolAmt: Int = total - workerAmt - treasuryAmt; // remainder

        // ── Cap computeUnits to prevent overflow in bonus calculation ────
        let safeComputeUnits: Int = computeUnits;
        if (safeComputeUnits > 1000000000) { safeComputeUnits = 1000000000; } // 1B CU max

        // ── Cap bonus before stats update ───────────────────────────────
        let maxAllowedBonus: Int = self.baseRate * safeComputeUnits;
        let actualBonus: Int = gstdBonusAmount;
        if (actualBonus > maxAllowedBonus) { actualBonus = maxAllowedBonus; }

        // ── Update statistics BEFORE sends (prevent race conditions) ────
        self.totalSettled += total;
        self.totalGSTDMinted += actualBonus;
        self.taskCount += 1;

        // ── 1. Pay worker (85% TON) — bounce:true to recover on failure ─
        send(SendParameters {
            to: workerAddr,
            value: workerAmt,
            mode: SendIgnoreErrors,
            bounce: true,
            body: WorkerPayment {
                taskId: taskId,
                amount: workerAmt,
                bonusGSTD: gstdBonusAmount,
            }.toCell(),
        });

        // ── 2. Send to Ecosystem Treasury (10%) ────────────────────────
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

        // ── 4. Transfer GSTD bonus to worker from pre-funded pool ──────────
        // Uses standard TEP-74 Jetton Transfer (opcode 0xf8a7ea5).
        // Admin must pre-fund ownJettonWallet with GSTD before bonuses activate.
        if (actualBonus > 0 && self.ownJettonWallet != newAddress(0, 0)) {
            send(SendParameters {
                to: self.ownJettonWallet,
                value: ton("0.12"),
                mode: SendIgnoreErrors,
                bounce: false,
                body: beginCell()
                    .storeUint(0xf8a7ea5, 32)      // Transfer opcode (TEP-74)
                    .storeUint(taskId, 64)           // queryId
                    .storeCoins(actualBonus)         // amount
                    .storeAddress(workerAddr)        // destination
                    .storeAddress(workerAddr)        // response_destination
                    .storeBit(false)                 // no custom payload
                    .storeCoins(ton("0.01"))         // forward_ton_amount (notify worker)
                    .storeBit(false)                 // no forward payload
                    .endCell(),
            });
        }
    }

    // ── Verify a quorum of distinct, registered-attestor signatures over
    // sha256(taskId . workerAddr . resultHash). Bounded to <= 5 entries so
    // gas cost stays predictable regardless of attestationCount claims. ──
    fun verifyQuorum(taskId: Int, workerAddr: Address, resultHash: Int, count: Int, attestations: Cell): Bool {
        if (count < self.quorumThreshold) { return false; }
        if (count > 5) { return false; } // MaxAttestations

        let msgHash: Int = beginCell()
            .storeUint(taskId, 64)
            .storeAddress(workerAddr)
            .storeUint(resultHash, 256)
            .endCell()
            .hash();

        let seen1: Int = -1;
        let seen2: Int = -1;
        let seen3: Int = -1;
        let seen4: Int = -1;
        let seen5: Int = -1;
        let validCount: Int = 0;

        let cursor: Cell = attestations;
        let i: Int = 0;
        while (i < count) {
            let cs: Slice = cursor.beginParse();
            let pubkey: Int = cs.loadUint(256);
            let signature: Slice = cs.loadBits(512);

            let isDup: Bool = (pubkey == seen1) || (pubkey == seen2) || (pubkey == seen3) || (pubkey == seen4) || (pubkey == seen5);
            if (i == 0) { seen1 = pubkey; }
            if (i == 1) { seen2 = pubkey; }
            if (i == 2) { seen3 = pubkey; }
            if (i == 3) { seen4 = pubkey; }
            if (i == 4) { seen5 = pubkey; }

            if (!isDup && self.attestorKeys.get(pubkey) == true && checkSignature(msgHash, signature, pubkey)) {
                validCount += 1;
            }

            if (cs.refs() > 0) {
                cursor = cs.loadRef();
            }
            i += 1;
        }

        return validCount >= self.quorumThreshold;
    }

    // ── DAO: manage the attestor allowlist and quorum size ───────────────
    // Interim: DAO populates this from AgentRegistry's registered nodes.
    // A direct on-chain relay from AgentRegistry is follow-up work (requires
    // an async cross-contract message, not done in this pass).
    receive(msg: RegisterAttestorKey) {
        require(sender() == self.owner, "Only DAO");
        self.attestorKeys.set(msg.pubkey, msg.authorized);
    }

    receive(msg: SetQuorumThreshold) {
        require(sender() == self.owner, "Only DAO");
        require(msg.threshold >= 1, "Threshold must be at least 1");
        self.quorumThreshold = msg.threshold;
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

    // ── Admin: Set SM's own GSTD jetton wallet ──────────────────────────
    // Call once after deploy. Wallet address = compute_jetton_wallet(SM_address, gstdJetton).
    // Then transfer GSTD to that wallet as the worker reward pool.
    receive(msg: SetOwnJettonWallet) {
        require(sender() == self.owner, "Only DAO");
        self.ownJettonWallet = msg.wallet;
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

    get fun get_quorum_threshold(): Int {
        return self.quorumThreshold;
    }

    get fun is_attestor_authorized(pubkey: Int): Bool {
        return self.attestorKeys.get(pubkey) == true;
    }

    get fun is_task_settled(taskId: Int): Bool {
        return self.settledTasks.get(taskId) != null;
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
