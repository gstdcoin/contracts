// ============================================================================
// EcosystemTreasury (legacy) — superseded by EcosystemTreasury.tact
// ============================================================================
// Receives 10% of settlement revenue
// Funds held for ecosystem buybacks (XAUt conversion removed)
// See EcosystemTreasury.tact for current implementation
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message SetConvertRatio {
    ratio: Int as uint8; // 0-100
}

message SetDexRouter {
    router: Address; // DeDust/STON.fi router
}

message WithdrawOperational {
    amount: Int as coins;
    destination: Address;
}

message GoldSwapConfirmed {
    amount: Int as coins; // XAUt amount received
    txHash: Int as uint256; // DEX transaction hash
}

message SetXautJetton {
    xautAddr: Address;
}

// ── TreasuryGold Contract ───────────────────────────────────────────────────

contract TreasuryGold with Deployable, Ownable {
    // ── State ───────────────────────────────────────────────────────────
    owner: Address; // DAOVoting contract
    xautJetton: Address; // Tether Gold contract on TON
    dexRouter: Address; // DeDust/STON.fi router

    // ── Reserve tracking ────────────────────────────────────────────────
    goldReserveXAUt: Int as coins; // total XAUt accumulated
    totalTONReceived: Int as coins; // total TON received from Settlement
    totalTONConvertedToGold: Int as coins; // TON sent to DEX for gold
    totalOperationalSpent: Int as coins; // TON used for operations

    // ── Configuration ───────────────────────────────────────────────────
    goldConvertRatio: Int as uint8; // % of incoming → gold (default 70)

    // ── Statistics ──────────────────────────────────────────────────────
    depositCount: Int as uint64;
    lastDepositTime: Int as uint64;

    init(owner: Address, xautJetton: Address, dexRouter: Address) {
        self.owner = owner;
        self.xautJetton = xautJetton;
        self.dexRouter = dexRouter;

        self.goldReserveXAUt = 0;
        self.totalTONReceived = 0;
        self.totalTONConvertedToGold = 0;
        self.totalOperationalSpent = 0;

        self.goldConvertRatio = 70;
        self.depositCount = 0;
        self.lastDepositTime = 0;
    }

    // ── Receive TON from Settlement Contract ────────────────────────────
    receive("deposit") {
        let amount: Int = context().value - ton("0.05"); // gas reserve
        require(amount > 0, "Deposit too small");

        self.totalTONReceived = self.totalTONReceived + amount;
        self.depositCount = self.depositCount + 1;
        self.lastDepositTime = now();

        // Gold allocation is held in this contract until DAO triggers a DEX swap.
        // totalTONConvertedToGold tracks funds earmarked for gold, NOT yet swapped.
        // Actual XAUt swap happens via SwapToGold (DAO-only), confirmed via GoldSwapConfirmed.
        let goldAmt: Int = amount * self.goldConvertRatio / 100;
        self.totalTONConvertedToGold = self.totalTONConvertedToGold + goldAmt;
        // Remaining stays as operational reserve in contract balance.
    }

    // ── DAO: Trigger actual DEX swap of accumulated gold funds ──────────
    // Callable by DAO only after amount is verified sufficient.
    receive("swap_gold") {
        require(sender() == self.owner, "Only DAO");
        let swapAmt: Int = self.totalTONConvertedToGold;
        require(swapAmt > ton("1"), "Insufficient gold fund");
        require(myBalance() >= swapAmt + ton("1"), "Insufficient contract balance");

        self.totalTONConvertedToGold = 0; // reset pending; confirmed via GoldSwapConfirmed

        send(SendParameters {
            to: self.dexRouter,
            value: swapAmt,
            mode: SendIgnoreErrors,
            bounce: true,
            // Real STON.fi swap ABI: DAO updates dexRouter to the correct pool address first
            body: "swap_to_xaut".asComment(),
        });
    }

    // ── Confirmation of gold swap from DEX / oracle ─────────────────────
    receive(msg: GoldSwapConfirmed) {
        require(sender() == self.dexRouter || sender() == self.owner, "Only DEX router or DAO");
        require(msg.amount > 0, "Amount must be positive");
        self.goldReserveXAUt = self.goldReserveXAUt + msg.amount;
    }

    // ── DAO: Withdraw operational funds ──────────────────────────────────
    receive(msg: WithdrawOperational) {
        require(sender() == self.owner, "Only DAO");
        require(msg.amount <= myBalance() - ton("1"), "Insufficient operational balance");

        self.totalOperationalSpent = self.totalOperationalSpent + msg.amount;

        send(SendParameters {
            to: msg.destination,
            value: msg.amount,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "operational_withdrawal".asComment(),
        });
    }

    // ── DAO: Update gold conversion ratio ───────────────────────────────
    receive(msg: SetConvertRatio) {
        require(sender() == self.owner, "Only DAO");
        require(msg.ratio >= 50 && msg.ratio <= 95, "Ratio must be 50-95%");
        self.goldConvertRatio = msg.ratio;
    }

    // ── DAO: Update DEX router ──────────────────────────────────────────
    receive(msg: SetDexRouter) {
        require(sender() == self.owner, "Only DAO");
        self.dexRouter = msg.router;
    }

    // ── DAO: Update XAUt address ────────────────────────────────────────
    receive(msg: SetXautJetton) {
        require(sender() == self.owner, "Only DAO");
        self.xautJetton = msg.xautAddr;
    }

    // ── Getters (Public Verification) ───────────────────────────────────
    get fun get_gold_reserve(): GoldReserveData {
        return GoldReserveData {
            goldReserveXAUt: self.goldReserveXAUt,
            totalTONReceived: self.totalTONReceived,
            totalTONConvertedToGold: self.totalTONConvertedToGold,
            convertRatio: self.goldConvertRatio,
            depositCount: self.depositCount,
            lastDepositTime: self.lastDepositTime,
        };
    }

    get fun get_operational_balance(): Int {
        return myBalance();
    }

    get fun get_convert_ratio(): Int {
        return self.goldConvertRatio;
    }
}

// ── Data structures ─────────────────────────────────────────────────────────

struct GoldReserveData {
    goldReserveXAUt: Int as coins;
    totalTONReceived: Int as coins;
    totalTONConvertedToGold: Int as coins;
    convertRatio: Int as uint8;
    depositCount: Int as uint64;
    lastDepositTime: Int as uint64;
}
