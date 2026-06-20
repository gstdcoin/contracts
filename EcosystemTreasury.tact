// ============================================================================
// EcosystemTreasury Contract — Treasury Fund Management
// ============================================================================
// Receives 10% of settlement revenue
// Holds accumulated TON/GSTD for the ecosystem treasury
// Buybacks happen off-chain by the DAO via STON.fi
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message WithdrawFunds {
    amount: Int as coins;
    destination: Address;
}

// ── EcosystemTreasury Contract ──────────────────────────────────────────────

contract EcosystemTreasury with Deployable, Ownable {
    // ── State ───────────────────────────────────────────────────────────
    owner: Address; // DAOVoting contract

    // ── Treasury tracking ───────────────────────────────────────────────
    totalTONReceived: Int as coins; // total TON received from Settlement
    totalWithdrawn: Int as coins;   // total TON withdrawn by DAO for buybacks

    // ── Statistics ──────────────────────────────────────────────────────
    depositCount: Int as uint64;
    lastDepositTime: Int as uint64;

    init(owner: Address) {
        self.owner = owner;

        self.totalTONReceived = 0;
        self.totalWithdrawn = 0;

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

        // Funds accumulate here. DAO withdraws for GSTD buybacks on STON.fi.
    }

    // ── DAO: Withdraw funds for buyback execution ───────────────────────
    // DAO calls this to fund off-chain GSTD buybacks on STON.fi
    receive(msg: WithdrawFunds) {
        require(sender() == self.owner, "Only DAO");
        require(msg.amount > 0, "Amount must be positive");
        require(msg.amount <= myBalance() - ton("1"), "Insufficient treasury balance");

        self.totalWithdrawn = self.totalWithdrawn + msg.amount;

        send(SendParameters {
            to: msg.destination,
            value: msg.amount,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "treasury_withdrawal".asComment(),
        });
    }

    // ── Getters (Public Verification) ───────────────────────────────────
    get fun getBalance(): Int {
        return myBalance();
    }

    get fun getTreasuryStats(): TreasuryData {
        return TreasuryData {
            totalTONReceived: self.totalTONReceived,
            totalWithdrawn: self.totalWithdrawn,
            depositCount: self.depositCount,
            lastDepositTime: self.lastDepositTime,
        };
    }
}

// ── Data structures ─────────────────────────────────────────────────────────

struct TreasuryData {
    totalTONReceived: Int as coins;
    totalWithdrawn: Int as coins;
    depositCount: Int as uint64;
    lastDepositTime: Int as uint64;
}
