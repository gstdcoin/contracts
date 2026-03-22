// ============================================================================
// GSTD NaaS — Provider Registry & Staking Contract
// ============================================================================
// Implements the Staking Tiers from the Whitepaper:
// - Explorer (1K GSTD): 3 chains
// - Provider (10K GSTD): 10 chains
// - Validator (50K GSTD): 25 chains
// - Sovereign (500K GSTD): 50+ chains
// 
// Locks stakes, assigns tiers, and tracks Slash/Reputation events.
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message(0x4e615352) RegisterProvider {
    chains: Int as uint8; // Number of chains the node wants to serve
}

message(0x41645374) AddStake { } // To top up and upgrade tier

message(0x556e4a61) UnjailProvider { } // Pay penalty or wait time to unjail

message(0x43685372) ChangeSlashRegistry {
    registry: Address;
}

// Internal msg from SlashRegistry
message SlashEvent {
    provider: Address;
    percentage: Int as uint16; // 1-10000 (0.01% - 100%)
    burnedAmount: Int as coins;
}

// ── Provider Data ───────────────────────────────────────────────────────────

struct ProviderInfo {
    tier: Int as uint8;          // 1: Explorer, 2: Provider, 3: Validator, 4: Sovereign
    stakedGSTD: Int as coins;   // Amount of GSTD locked (in nano)
    activeChains: Int as uint8;
    reputation: Int as uint16;   // 0-10000
    jailed: Bool;
    registeredAt: Int as uint64;
}

// ── Contract ────────────────────────────────────────────────────────────────

contract NaaSProviderRegistry with Deployable, Ownable {
    
    owner: Address;             // DAO or Gateway
    slashRegistry: Address;     // Address allowed to slash
    gstdJetton: Address;        // GSTD Jetton Address
    
    // Config
    minStakeExplorer: Int as coins;  
    minStakeProvider: Int as coins;
    minStakeValidator: Int as coins;
    minStakeSovereign: Int as coins;
    
    // Provider state map
    providers: map<Address, ProviderInfo>;
    totalStaked: Int as coins;
    totalProviders: Int as uint32;

    init(owner: Address, gstdJetton: Address) {
        self.owner = owner;
        self.gstdJetton = gstdJetton;
        self.slashRegistry = owner; // Changeable later
        
        // 1 GSTD = 1e9 nanoGSTD
        self.minStakeExplorer =  1000 * 1000000000;
        self.minStakeProvider = 10000 * 1000000000;
        self.minStakeValidator = 50000 * 1000000000;
        self.minStakeSovereign = 500000 * 1000000000;
        
        self.totalStaked = 0;
        self.totalProviders = 0;
    }

    // ── Register or Top-up ──────────────────────────────────────────────────
    // Expects incoming Jetty Transfer Notification (simplified for direct TON equivalent here)
    // Production TEP-74 integration would parse transfer notification.
    
    receive(msg: RegisterProvider) {
        let amount: Int = context().value - ton("0.05"); // reserve for gas
        require(amount >= self.minStakeExplorer, "Stake does not meet minimum (Explorer 1K)");
        
        // Determine tier
        let tier: Int = 1;
        if (amount >= self.minStakeSovereign) { tier = 4; }
        else if (amount >= self.minStakeValidator) { tier = 3; }
        else if (amount >= self.minStakeProvider) { tier = 2; }
        
        // Verify chain limits perfectly match the Whitepaper
        if (tier == 1) { require(msg.chains <= 3, "Explorer tier max 3 chains"); }
        if (tier == 2) { require(msg.chains <= 10, "Provider tier max 10 chains"); }
        if (tier == 3) { require(msg.chains <= 25, "Validator tier max 25 chains"); }
        
        let existing: ProviderInfo? = self.providers.get(sender());
        if (existing == null) {
            // New Provider
            self.providers.set(sender(), ProviderInfo{
                tier: tier,
                stakedGSTD: amount,
                activeChains: msg.chains,
                reputation: 10000, // Max reputation
                jailed: false,
                registeredAt: now()
            });
            self.totalProviders += 1;
        } else {
            // Upgrade Provider
            let e: ProviderInfo = existing!!;
            require(!e.jailed, "Cannot top-up jailed provider");
            e.stakedGSTD += amount;
            
            // Re-evaluate tier
            if (e.stakedGSTD >= self.minStakeSovereign) { e.tier = 4; }
            else if (e.stakedGSTD >= self.minStakeValidator) { e.tier = 3; }
            else if (e.stakedGSTD >= self.minStakeProvider) { e.tier = 2; }
            
            self.providers.set(sender(), e);
        }
        
        self.totalStaked += amount;
    }

    // ── Slashing Mechanism (Called by SlashRegistry/ChallengerProtocol) ─────
    receive(msg: SlashEvent) {
        require(sender() == self.slashRegistry, "Only SlashRegistry can slash");
        
        let existing: ProviderInfo? = self.providers.get(msg.provider);
        require(existing != null, "Provider not found");
        
        let p: ProviderInfo = existing!!;
        let slashAmount: Int = (p.stakedGSTD * msg.percentage) / 10000;
        
        p.stakedGSTD -= slashAmount;
        self.totalStaked -= slashAmount;
        
        // Reputation loss
        p.reputation -= msg.percentage;
        
        // 100% slash (Fraud/Jailed) -> Jailed status
        if (msg.percentage == 10000 || p.stakedGSTD < self.minStakeExplorer || p.reputation < 5000) {
            p.jailed = true;
        }
        
        // Downgrade tier if needed
        if (p.stakedGSTD < self.minStakeSovereign && p.tier == 4) { p.tier = 3; }
        if (p.stakedGSTD < self.minStakeValidator && p.tier == 3) { p.tier = 2; }
        if (p.stakedGSTD < self.minStakeProvider && p.tier == 2) { p.tier = 1; }
        
        self.providers.set(msg.provider, p);
        
        // Send slashed funds to Burn Contract / Treasury
        send(SendParameters {
            to: self.owner,
            value: slashAmount,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "slashed_funds".asComment()
        });
    }

    // ── Admin ───────────────────────────────────────────────────────────────
    receive(msg: ChangeSlashRegistry) {
        require(sender() == self.owner, "Only DAO");
        self.slashRegistry = msg.registry;
    }

    // ── Getters ─────────────────────────────────────────────────────────────
    get fun get_provider(addr: Address): ProviderInfo? {
        return self.providers.get(addr);
    }
    
    get fun get_registry_stats(): map<Int, Int> {
        let stats: map<Int, Int> = emptyMap();
        stats.set(0, self.totalProviders);
        stats.set(1, self.totalStaked);
        return stats;
    }
}
