// ============================================================================
// TreasuryGold Contract — Gold Reserve Management
// ============================================================================
// Receives 10% of settlement revenue
// Converts 70% to XAUt (Tether Gold) via DEX
// Maintains transparent on-chain gold reserve
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

        // Calculate gold allocation
        let goldAmt: Int = amount * self.goldConvertRatio / 100;
        let operAmt: Int = amount - goldAmt;

        // Send TON to DEX router for XAUt swap (off-chain oracle confirms)
        if (goldAmt > ton("0.5")) { // minimum swap threshold
            send(SendParameters {
                to: self.dexRouter,
                value: goldAmt,
                mode: SendIgnoreErrors,
                bounce: true,
                body: "swap_to_xaut".asComment(),
            });
            self.totalTONConvertedToGold = self.totalTONConvertedToGold + goldAmt;
        }

        // Operational funds stay in contract
    }

    // ── Confirmation of gold swap from DEX / oracle ─────────────────────
    receive(msg: GoldSwapConfirmed) {
        // In production: verify sender is DEX router or oracle
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
