// ============================================================================
// GSTD Jetton Contract — Core Token (TEP-74 Standard)
// ============================================================================
// Total supply: 1,000,000,000 GSTD (1B)
// Mint authority: Settlement Contract only
// Standard: TEP-74 Jetton with extended governance
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message FreezeMint {}

message MintWorkerReward {
    workerAddr: Address;
    amount: Int as coins;
    taskId: Int as uint64;
}

message SetMintAuthority {
    newAuthority: Address;
}

message BurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    responseDestination: Address;
}

message TransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Slice as remaining;
}

message TokenUpdateContent {
    content: Cell;
}

// One-time pre-mint for ecosystem allocations (team, IDO, liquidity, advisors).
// Must be called before SetMintAuthority locks authority to Settlement.
message MintInitialAllocation {
    teamAddr: Address;
    teamAmount: Int as coins;
    ecosystemAddr: Address;
    ecosystemAmount: Int as coins;
    liquidityAddr: Address;
    liquidityAmount: Int as coins;
}

// ── Jetton Wallet Messages (TEP-74) ────────────────────────────────────────

message Transfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

message InternalTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    responseAddress: Address;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

message Burn {
    queryId: Int as uint64;
    amount: Int as coins;
    responseDestination: Address;
}

// ── GSTDJetton Master Contract ─────────────────────────────────────────────

contract GSTDJetton with Deployable, Ownable {
    // ── State ───────────────────────────────────────────────────────────
    totalSupply: Int as coins;
    maxSupply: Int as coins;
    owner: Address;
    mintAuthority: Address;
    content: Cell;
    mintable: Bool;

    // ── Allocation tracking ─────────────────────────────────────────────
    workerPoolMinted: Int as coins;     // out of 400M
    workerPoolMax: Int as coins;        // 400,000,000 * 10^9

    // ── Statistics ──────────────────────────────────────────────────────
    totalBurned: Int as coins;
    totalMintEvents: Int as uint64;
    authorityLocked: Bool;        // One-time lock for mint authority transfer
    initialAllocationDone: Bool;  // Prevents double pre-mint

    init(owner: Address, content: Cell) {
        self.owner = owner;
        self.content = content;
        self.totalSupply = 0;
        self.maxSupply = 1000000000000000000;       // 1B * 10^9 (nanoGSTD)
        self.mintAuthority = owner;                  // Updated after Settlement deploy
        self.mintable = true;
        self.workerPoolMinted = 0;
        self.workerPoolMax = 400000000000000000;     // 400M * 10^9
        self.totalBurned = 0;
        self.totalMintEvents = 0;
        self.authorityLocked = false;
        self.initialAllocationDone = false;
    }

    // ── Worker Reward Mint (from Settlement Contract only) ──────────────
    receive(msg: MintWorkerReward) {
        require(sender() == self.mintAuthority, "Only Settlement can mint");
        require(self.mintable, "Minting disabled");
        require(self.totalSupply + msg.amount <= self.maxSupply, "Max supply reached");
        require(self.workerPoolMinted + msg.amount <= self.workerPoolMax, "Worker pool exhausted");

        self.totalSupply += msg.amount;
        self.workerPoolMinted += msg.amount;
        self.totalMintEvents += 1;

        // Deploy or credit JettonWallet for worker
        let walletInit: StateInit = getJettonWalletInit(msg.workerAddr, myAddress());
        send(SendParameters{
            to: contractAddress(walletInit),
            value: ton("0.08"),
            mode: SendIgnoreErrors,
            bounce: true,
            body: InternalTransfer{
                queryId: msg.taskId,
                amount: msg.amount,
                from: myAddress(),
                responseAddress: msg.workerAddr,
                forwardTonAmount: ton("0.01"),
                forwardPayload: emptySlice()
            }.toCell(),
            code: walletInit.code,
            data: walletInit.data
        });
    }

    // ── Rollback mint if worker wallet deployment failed ────────────────
    bounced(src: bounced<InternalTransfer>) {
        self.totalSupply -= src.amount;
        self.workerPoolMinted -= src.amount;
    }

    // ── Pre-mint ecosystem allocations (ONE-TIME, before authority lock) ─
    receive(msg: MintInitialAllocation) {
        require(sender() == self.owner, "Only owner");
        require(!self.authorityLocked, "Cannot pre-mint after authority locked");
        require(!self.initialAllocationDone, "Initial allocation already done");

        let total: Int = msg.teamAmount + msg.ecosystemAmount + msg.liquidityAmount;
        require(self.totalSupply + total <= self.maxSupply, "Exceeds max supply");

        self.initialAllocationDone = true;
        self.totalSupply += total;

        if (msg.teamAmount > 0) {
            let w: StateInit = getJettonWalletInit(msg.teamAddr, myAddress());
            send(SendParameters{
                to: contractAddress(w), value: ton("0.08"), mode: SendIgnoreErrors, bounce: false,
                body: InternalTransfer{ queryId: 1, amount: msg.teamAmount, from: myAddress(),
                    responseAddress: msg.teamAddr, forwardTonAmount: ton("0.01"), forwardPayload: emptySlice() }.toCell(),
                code: w.code, data: w.data
            });
        }
        if (msg.ecosystemAmount > 0) {
            let w: StateInit = getJettonWalletInit(msg.ecosystemAddr, myAddress());
            send(SendParameters{
                to: contractAddress(w), value: ton("0.08"), mode: SendIgnoreErrors, bounce: false,
                body: InternalTransfer{ queryId: 2, amount: msg.ecosystemAmount, from: myAddress(),
                    responseAddress: msg.ecosystemAddr, forwardTonAmount: ton("0.01"), forwardPayload: emptySlice() }.toCell(),
                code: w.code, data: w.data
            });
        }
        if (msg.liquidityAmount > 0) {
            let w: StateInit = getJettonWalletInit(msg.liquidityAddr, myAddress());
            send(SendParameters{
                to: contractAddress(w), value: ton("0.08"), mode: SendIgnoreErrors, bounce: false,
                body: InternalTransfer{ queryId: 3, amount: msg.liquidityAmount, from: myAddress(),
                    responseAddress: msg.liquidityAddr, forwardTonAmount: ton("0.01"), forwardPayload: emptySlice() }.toCell(),
                code: w.code, data: w.data
            });
        }
    }

    // ── Burn notification handling ──────────────────────────────────────
    receive(msg: BurnNotification) {
        // Verify sender is a valid JettonWallet
        let walletInit: StateInit = getJettonWalletInit(msg.sender, myAddress());
        require(sender() == contractAddress(walletInit), "Invalid burn notification");

        self.totalSupply -= msg.amount;
        self.totalBurned += msg.amount;

        // Send remaining TON to response destination
        if (msg.responseDestination != newAddress(0, 0)) {
            send(SendParameters{
                to: msg.responseDestination,
                value: 0,
                mode: SendRemainingValue + SendIgnoreErrors,
                bounce: false,
                body: "Burn successful".asComment()
            });
        }
    }

    // ── Admin: Set mint authority (ONE-TIME transfer to Settlement) ──────
    receive(msg: SetMintAuthority) {
        require(sender() == self.owner, "Only owner");
        require(!self.authorityLocked, "Mint authority already locked");
        self.mintAuthority = msg.newAuthority;
        self.authorityLocked = true;  // Cannot be changed again
    }

    // ── Admin: Update content metadata ──────────────────────────────────
    receive(msg: TokenUpdateContent) {
        require(sender() == self.owner, "Only owner");
        self.content = msg.content;
    }

    // ── Admin: Permanently disable minting ──────────────────────────────
    receive(msg: FreezeMint) {
        require(sender() == self.owner, "Only owner");
        self.mintable = false;
    }

    // ── Getters ─────────────────────────────────────────────────────────
    get fun get_jetton_data(): JettonData {
        return JettonData{
            totalSupply: self.totalSupply,
            mintable: self.mintable,
            adminAddress: self.owner,
            jettonContent: self.content,
            jettonWalletCode: getJettonWalletInit(myAddress(), myAddress()).code
        };
    }

    get fun get_wallet_address(ownerAddress: Address): Address {
        return contractAddress(getJettonWalletInit(ownerAddress, myAddress()));
    }

    get fun get_max_supply(): Int {
        return self.maxSupply;
    }

    get fun get_worker_pool_stats(): WorkerPoolStats {
        return WorkerPoolStats{
            minted: self.workerPoolMinted,
            max: self.workerPoolMax,
            remaining: self.workerPoolMax - self.workerPoolMinted
        };
    }

    get fun get_burn_stats(): BurnStats {
        return BurnStats{
            totalBurned: self.totalBurned,
            circulatingSupply: self.totalSupply,  // totalSupply already decreased on burn
            totalMintEvents: self.totalMintEvents
        };
    }

    get fun get_mint_authority(): Address {
        return self.mintAuthority;
    }

}

// ── Standalone helper (does not use contract state) ─────────────────────────
fun getJettonWalletInit(address: Address, master: Address): StateInit {
    return initOf GSTDJettonWallet(address, master);
}

// ── Data structures ─────────────────────────────────────────────────────────

struct JettonData {
    totalSupply: Int as coins;
    mintable: Bool;
    adminAddress: Address;
    jettonContent: Cell;
    jettonWalletCode: Cell;
}

struct WorkerPoolStats {
    minted: Int as coins;
    max: Int as coins;
    remaining: Int as coins;
}

struct BurnStats {
    totalBurned: Int as coins;
    circulatingSupply: Int as coins;
    totalMintEvents: Int as uint64;
}

// ============================================================================
// GSTD Jetton Wallet (TEP-74 Standard)
// ============================================================================

contract GSTDJettonWallet {
    balance: Int as coins;
    owner: Address;
    jettonMaster: Address;

    init(owner: Address, jettonMaster: Address) {
        self.balance = 0;
        self.owner = owner;
        self.jettonMaster = jettonMaster;
    }

    // ── Receive tokens (internal transfer from master or other wallet) ──
    receive(msg: InternalTransfer) {
        let senderWalletInit: StateInit = initOf GSTDJettonWallet(msg.from, self.jettonMaster);
        let validSender: Bool = sender() == contractAddress(senderWalletInit) || sender() == self.jettonMaster;
        require(validSender, "Invalid sender");

        self.balance += msg.amount;

        // Forward notification if needed
        if (msg.forwardTonAmount > 0) {
            send(SendParameters{
                to: self.owner,
                value: msg.forwardTonAmount,
                mode: SendIgnoreErrors,
                bounce: false,
                body: TransferNotification{
                    queryId: msg.queryId,
                    amount: msg.amount,
                    sender: msg.from,
                    forwardPayload: msg.forwardPayload
                }.toCell()
            });
        }
    }

    // ── Transfer tokens to another wallet ───────────────────────────────
    receive(msg: Transfer) {
        require(sender() == self.owner, "Only owner can transfer");
        require(self.balance >= msg.amount, "Insufficient balance");

        self.balance -= msg.amount;

        let receiverInit: StateInit = initOf GSTDJettonWallet(msg.destination, self.jettonMaster);
        send(SendParameters{
            to: contractAddress(receiverInit),
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: InternalTransfer{
                queryId: msg.queryId,
                amount: msg.amount,
                from: self.owner,
                responseAddress: msg.responseDestination,
                forwardTonAmount: msg.forwardTonAmount,
                forwardPayload: msg.forwardPayload
            }.toCell(),
            code: receiverInit.code,
            data: receiverInit.data
        });
    }

    // ── Restore balance if receiver wallet rejected the transfer ────────
    // Without this, balance is deducted but tokens are permanently lost.
    bounced(src: bounced<InternalTransfer>) {
        self.balance += src.amount;
    }

    // ── Burn tokens ─────────────────────────────────────────────────────
    receive(msg: Burn) {
        require(sender() == self.owner, "Only owner can burn");
        require(self.balance >= msg.amount, "Insufficient balance");

        self.balance -= msg.amount;

        send(SendParameters{
            to: self.jettonMaster,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: BurnNotification{
                queryId: msg.queryId,
                amount: msg.amount,
                sender: self.owner,
                responseDestination: msg.responseDestination
            }.toCell()
        });
    }

    // ── Getters ─────────────────────────────────────────────────────────
    get fun get_wallet_data(): WalletData {
        return WalletData{
            balance: self.balance,
            owner: self.owner,
            jettonMaster: self.jettonMaster,
            jettonWalletCode: initOf GSTDJettonWallet(self.owner, self.jettonMaster).code
        };
    }
}

struct WalletData {
    balance: Int as coins;
    owner: Address;
    jettonMaster: Address;
    jettonWalletCode: Cell;
}
