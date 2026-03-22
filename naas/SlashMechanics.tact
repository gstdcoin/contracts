// ============================================================================
// GSTD NaaS — Slashing Registry & Challenger Protocol
// ============================================================================
// Applies the 4 slash conditions from the Whitepaper:
// - Downtime > 10m: 0.1% slash
// - Downtime > 1h: 1.0% slash
// - Wrong RPC response (Challenge): 2.0% slash 
//   (10% goes to challenger, 90% burned)
// - Downtime > 24h: 5.0% + downgrade
// - Proven Fraud: 100% (jailed)
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message ReportDowntime {
    provider: Address;
    downtimeMinutes: Int as uint32;
    proofOracleTimestamp: Int as uint64;
}

message ChallengeRpcResponse {
    targetProvider: Address;
    challenger: Address;
    blockNumber: Int as uint64;
    expectedHash: Int as uint256;
    receivedHash: Int as uint256;
}

message ApproveSlash {
    provider: Address;
    percentage: Int as uint16; // Basis points (100 = 1%)
    burnAmount: Int as coins;
}

message ExecuteSlash {
    provider: Address;
    percentage: Int as uint16;
}

// ── Contract ────────────────────────────────────────────────────────────────

contract SlashRegistry with Deployable, Ownable {
    
    owner: Address;                 // DAO
    providerRegistry: Address;      // Reference to NaaSProviderRegistry
    oracleNetwork: Address;         // Authorized oracle to report uptime
    
    // Total slashed metrics
    totalSlashedEvents: Int as uint64;

    init(owner: Address, providerRegistry: Address, oracle: Address) {
        self.owner = owner;
        self.providerRegistry = providerRegistry;
        self.oracleNetwork = oracle;
        self.totalSlashedEvents = 0;
    }

    // ── 1. Automatic Downtime Slashing (Reported by Oracle) ─────────────────
    receive(msg: ReportDowntime) {
        require(sender() == self.oracleNetwork, "Only trusted Oracle network can report downtime");
        require(msg.downtimeMinutes >= 10, "Downtime too small for slashing");

        let slashPercent: Int = 0; // Basis points
        
        // 10 minutes -> 0.1% (10 bps)
        if (msg.downtimeMinutes >= 10 && msg.downtimeMinutes < 60) {
            slashPercent = 10;
        } 
        // 1 hour -> 1% (100 bps)
        else if (msg.downtimeMinutes >= 60 && msg.downtimeMinutes < 1440) {
            slashPercent = 100;
        } 
        // 24 hours -> 5% (500 bps)
        else if (msg.downtimeMinutes >= 1440) {
            slashPercent = 500;
        }

        if (slashPercent > 0) {
            self.totalSlashedEvents = self.totalSlashedEvents + 1;
            
            // Forward slash command to ProviderRegistry
            send(SendParameters {
                to: self.providerRegistry,
                value: ton("0.05"),
                mode: SendIgnoreErrors,
                bounce: false,
                body: ExecuteSlash {
                    provider: msg.provider,
                    percentage: slashPercent
                }.toCell()
            });
        }
    }

    // ── 2. Challenger Protocol (Wrong RPC state) ────────────────────────────
    receive(msg: ChallengeRpcResponse) {
        // Here we simulate the consensus validation. 
        // In reality, this requires multi-sig from 2/3 validator nodes or an optimistic rollup fraud proof.
        // For now, if the DAO or Oracle confirms the hashes don't match, we slash 2%.
        require(sender() == self.oracleNetwork || sender() == self.owner, "Only DAO/Oracle can finalize challenges");
        
        require(msg.expectedHash != msg.receivedHash, "Hashes match, no fraud");

        self.totalSlashedEvents = self.totalSlashedEvents + 1;

        // 2% (200 bps) slash for wrong RPC data
        send(SendParameters {
            to: self.providerRegistry,
            value: ton("0.05"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: ExecuteSlash {
                provider: msg.targetProvider,
                percentage: 200
            }.toCell()
        });

        // Challenger reward logic: 
        // The ProviderRegistry burns the slashed amount directly.
        // A portion can be specifically minted or routed back to Challenger via the main Settlement contract.
        // (Handled separately in RevenueFlywheel)
    }

    // ── 3. Manual / Malicious Fraud Slashing (DAO Voting) ───────────────────
    receive(msg: ApproveSlash) {
        require(sender() == self.owner, "Only DAO can unilaterally slash"); // (e.g., 100% jail)
        require(msg.percentage <= 10000, "Max 100%");
        
        self.totalSlashedEvents = self.totalSlashedEvents + 1;

        send(SendParameters {
            to: self.providerRegistry,
            value: ton("0.05"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: ExecuteSlash {
                provider: msg.provider,
                percentage: msg.percentage
            }.toCell()
        });
    }

    // ── Getters ─────────────────────────────────────────────────────────────
    get fun get_registry_info(): Address {
        return self.providerRegistry;
    }
    
    get fun get_oracle(): Address {
        return self.oracleNetwork;
    }

    get fun get_total_slashes(): Int {
        return self.totalSlashedEvents;
    }
}
