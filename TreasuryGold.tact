// ============================================================================
// TreasuryGold — Phase 2 Gold Reserve Contract
// ============================================================================
// Receives TON, converts a configurable ratio into XAUt (Tether Gold) via
// STON.fi (DEX v2.1 + pTON v2.1 proxy). NOT deployed in Phase 1 — use
// EcosystemTreasury.tact for Phase 1. Phase 2 upgrade: enables gold-backed
// ecosystem reserve.
//
// Swap message formats below are taken directly from STON.fi's own SDK
// source (github.com/ston-fi/sdk, packages/sdk/src/contracts/dex/v2_1 and
// .../pTON/v2_1), not guessed — the previous version of this contract sent
// a plain text comment ("swap_to_xaut") to the router, which no real DEX
// router accepts as a swap instruction; it would never have executed a
// trade. Gold-reserve accounting is now driven by a real TEP-74
// TransferNotification from this contract's own verified XAUt jetton
// wallet, not a self-reported amount from an arbitrary sender.
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// STON.fi v2.1 Router opcode (github.com/ston-fi/sdk, dex/v2_1/constants.ts)
const STONFI_SWAP_OP: Int = 0x6664de2a;
// STON.fi pTON v2.1 proxy opcode (github.com/ston-fi/sdk, pTON/v2_1/constants.ts)
const PTON_TON_TRANSFER_OP: Int = 0x01f3835d;
// TEP-74 standard Jetton TransferNotification opcode
const JETTON_TRANSFER_NOTIFICATION_OP: Int = 0x7362d09c;

// ── Messages ────────────────────────────────────────────────────────────────

message SetConvertRatio {
    ratio: Int as uint8; // 0-100
}

message SetDexRouter {
    router: Address; // STON.fi v2.1 router
}

message WithdrawOperational {
    amount: Int as coins;
    destination: Address;
}

message SetXautJetton {
    xautAddr: Address; // XAUt jetton master
}

message SetPtonMaster {
    ptonMaster: Address; // STON.fi pTON v2.1 proxy master
}

// These three are set post-deploy from off-chain computed addresses (same
// convention as SettlementMaster.tact's SetOwnJettonWallet) -- Tact has no
// on-chain cross-contract "get_wallet_address" call, so wallet addresses
// for a given (master, owner) pair are computed in the deploy/ops script
// and pushed in here, owner-gated.
message SetOwnXautJettonWallet {
    wallet: Address; // this contract's own XAUt jetton wallet
}

message SetOwnPtonJettonWallet {
    wallet: Address; // this contract's own pTON (wrapped-TON) jetton wallet
}

message SetRouterXautWallet {
    wallet: Address; // the STON.fi router's own XAUt jetton wallet (askJettonWalletAddress)
}

// Triggers the actual swap. minAskAmount is deliberately a required
// argument, not a stored config value -- it must be computed off-chain
// against the *current* pool price right before sending, same as any real
// swap UI does. Without it, the swap has no slippage protection and is
// trivially sandwichable.
message SwapGold {
    minAskAmount: Int as coins;
    deadline: Int as uint32; // unix timestamp; 0 = default (now + 15 min)
}

// TEP-74 standard notification a jetton wallet sends to its owner on
// incoming transfer. Same shape as GSTDJetton.tact's TransferNotification.
message TransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Slice as remaining;
}

// ── TreasuryGold Contract ───────────────────────────────────────────────────

contract TreasuryGold with Deployable, Ownable {
    // ── State ───────────────────────────────────────────────────────────
    owner: Address; // DAOVoting contract
    xautJetton: Address; // Tether Gold jetton master on TON
    dexRouter: Address; // STON.fi v2.1 router

    // ── Swap wiring (set post-deploy, see the Set* messages above) ───────
    ptonMaster: Address;
    ownXautJettonWallet: Address;
    ownPtonJettonWallet: Address;
    routerXautWallet: Address;

    // ── Reserve tracking ────────────────────────────────────────────────
    goldReserveXAUt: Int as coins; // total XAUt actually received (TransferNotification-verified)
    totalTONReceived: Int as coins; // total TON received from Settlement
    totalTONConvertedToGold: Int as coins; // TON earmarked for gold, not yet swapped
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

        self.ptonMaster = newAddress(0, 0); // set via SetPtonMaster after deploy
        self.ownXautJettonWallet = newAddress(0, 0); // set via SetOwnXautJettonWallet
        self.ownPtonJettonWallet = newAddress(0, 0); // set via SetOwnPtonJettonWallet
        self.routerXautWallet = newAddress(0, 0); // set via SetRouterXautWallet

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
        // Actual XAUt swap happens via SwapGold (DAO-only), confirmed via a real
        // TransferNotification from ownXautJettonWallet -- see below.
        let goldAmt: Int = amount * self.goldConvertRatio / 100;
        self.totalTONConvertedToGold = self.totalTONConvertedToGold + goldAmt;
        // Remaining stays as operational reserve in contract balance.
    }

    // ── DAO: Trigger actual DEX swap of accumulated gold funds via STON.fi ───
    receive(msg: SwapGold) {
        require(sender() == self.owner, "Only DAO");
        require(self.ptonMaster != newAddress(0, 0), "pTON master not configured");
        require(self.ownPtonJettonWallet != newAddress(0, 0), "Own pTON wallet not configured");
        require(self.routerXautWallet != newAddress(0, 0), "Router XAUt wallet not configured");
        require(msg.minAskAmount > 0, "minAskAmount required for slippage protection");

        let swapAmt: Int = self.totalTONConvertedToGold;
        require(swapAmt > ton("1"), "Insufficient gold fund");

        // forwardGasAmount(0.3, STON.fi's own default for swapTonToJetton) +
        // pTON's own tonTransfer gas (0.01) on top of the swapped amount itself.
        let gasBudget: Int = ton("0.31");
        require(myBalance() >= swapAmt + gasBudget + ton("0.05"), "Insufficient contract balance");

        self.totalTONConvertedToGold = 0; // reset pending; re-credited only on real TransferNotification

        let deadline: Int = msg.deadline;
        if (deadline == 0) {
            deadline = now() + 900; // 15 min, matches STON.fi's own TX_DEADLINE default
        }

        // Inner cell: STON.fi v2.1 Router.createSwapBody's ref cell
        let swapParams: Cell = beginCell()
            .storeCoins(msg.minAskAmount)
            .storeAddress(myAddress()) // receiverAddress: XAUt comes back to us
            .storeCoins(0) // dexCustomPayloadForwardGasAmount
            .storeMaybeRef(null) // dexCustomPayload
            .storeCoins(0) // refundForwardGasAmount
            .storeMaybeRef(null) // refundPayload
            .storeUint(0, 16) // referralValue (bps) -- no referral
            .storeUint(0, 2) // referralAddress: addr_none (Maybe MsgAddressInt, absent)
            .endCell();

        // Outer cell: STON.fi v2.1 Router SWAP body
        let swapBody: Cell = beginCell()
            .storeUint(STONFI_SWAP_OP, 32)
            .storeAddress(self.routerXautWallet) // askJettonWalletAddress
            .storeAddress(myAddress()) // refundAddress
            .storeAddress(myAddress()) // excessesAddress
            .storeUint(deadline, 64)
            .storeRef(swapParams)
            .endCell();

        // pTON v2.1 TON_TRANSFER: wraps swapAmt TON and forwards swapBody to
        // the router. Sent to OUR OWN pTON jetton wallet, which is the wallet
        // that actually does the wrap-and-forward.
        let ptonBody: Cell = beginCell()
            .storeUint(PTON_TON_TRANSFER_OP, 32)
            .storeUint(0, 64) // queryId
            .storeCoins(swapAmt)
            .storeAddress(myAddress()) // refundAddress
            .storeBit(true)
            .storeRef(swapBody)
            .endCell();

        send(SendParameters {
            to: self.ownPtonJettonWallet,
            value: swapAmt + gasBudget,
            mode: SendIgnoreErrors,
            bounce: true,
            body: ptonBody,
        });
    }

    // ── Verified confirmation of gold received ──────────────────────────
    // Only trusts a TransferNotification from our OWN, pre-verified XAUt
    // jetton wallet -- not a self-reported amount from an arbitrary sender.
    // This is what actually credits goldReserveXAUt; a swap that never
    // lands (bad slippage, expired deadline, router rejects it) simply
    // never triggers this and the DAO can see that from an unchanged
    // goldReserveXAUt vs. a zeroed totalTONConvertedToGold.
    receive(msg: TransferNotification) {
        require(sender() == self.ownXautJettonWallet, "Only our own verified XAUt wallet");
        require(self.ownXautJettonWallet != newAddress(0, 0), "Own XAUt wallet not configured");
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

    // ── DAO: Update XAUt jetton master address ──────────────────────────
    receive(msg: SetXautJetton) {
        require(sender() == self.owner, "Only DAO");
        self.xautJetton = msg.xautAddr;
    }

    // ── DAO: Update pTON proxy master address ───────────────────────────
    receive(msg: SetPtonMaster) {
        require(sender() == self.owner, "Only DAO");
        self.ptonMaster = msg.ptonMaster;
    }

    // ── DAO: Wire computed wallet addresses (see message docs above) ────
    receive(msg: SetOwnXautJettonWallet) {
        require(sender() == self.owner, "Only DAO");
        self.ownXautJettonWallet = msg.wallet;
    }

    receive(msg: SetOwnPtonJettonWallet) {
        require(sender() == self.owner, "Only DAO");
        self.ownPtonJettonWallet = msg.wallet;
    }

    receive(msg: SetRouterXautWallet) {
        require(sender() == self.owner, "Only DAO");
        self.routerXautWallet = msg.wallet;
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

    get fun get_swap_wiring(): SwapWiring {
        return SwapWiring {
            ptonMaster: self.ptonMaster,
            ownXautJettonWallet: self.ownXautJettonWallet,
            ownPtonJettonWallet: self.ownPtonJettonWallet,
            routerXautWallet: self.routerXautWallet,
        };
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

struct SwapWiring {
    ptonMaster: Address;
    ownXautJettonWallet: Address;
    ownPtonJettonWallet: Address;
    routerXautWallet: Address;
}
