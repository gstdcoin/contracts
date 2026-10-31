// ============================================================================
// AgentRegistryV2 Contract — Node Identity & Reputation
// ============================================================================
// Manages node registration, Genesis Lock verification,
// reputation tracking, and capability advertisement.
// Each node gets a unique on-chain identity.
//
// Fix vs. v1 (EQDtWcGCQXLFdh7TmkL5QFbFNYXxL9mjOk4ehmsNFwCtsDoT, still live,
// left untouched by this file): getNodeAddress() recomputed a NodeIdentity's
// address via initOf with placeholder args (owner=zero address, nodeType=0,
// capabilities=0, region=0) instead of the real ones used at RegisterNode
// time. Since a contract's address is a hash of its code+initial-data, and
// the initial data is derived from the real constructor args, the
// placeholder address only matches the real deployed NodeIdentity for a
// node that happens to be type 0 (Edge), capabilities 0, region 0 (EU),
// registered by the zero address -- i.e. essentially never in practice.
// UpdateReputation and ReportGenesisViolation both call this same function
// to find where to forward reputation credits/penalties and suspension
// status, so for virtually every real node those messages silently went to
// a non-existent address (SendIgnoreErrors swallows the failure) -- all
// reputation tracking and Genesis-violation suspension has been a no-op
// network-wide. Same bug class as the DAOVoting get_proposal_address fix
// earlier this session. Fixed the same way: record each NodeIdentity's real
// deployed address in a map at RegisterNode time, when the real args are
// still known.
//
// Not deployed yet -- prepared for review; mainnet deploy needs a live
// TonConnect wallet approval, not something to do unilaterally.
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message RegisterNode {
    nodeId: Int as uint256; // SHA-256 of public key
    nodeType: Int as uint8; // 0=Edge, 1=CPU, 2=GPU, 3=Head
    publicKey: Slice; // Ed25519 public key (32 bytes)
    genesisHash: Int as uint256; // SHA-256 of binary manifest
    capabilities: Int as uint32; // bitmask: LLM=1, Embed=2, Vision=4, Code=8
    region: Int as uint8; // 0=EU, 1=US-E, 2=US-W, 3=ASIA-JP, 4=ASIA-SG, 5=AFRICA
}

// Versioned proof-bearing registration. Legacy messages fail closed; state layout is unchanged.
message(0x47535203) RegisterNodeSignedV3 {
    nodeId: Int as uint256;
    publicKey: Int as uint256;
    genesisHash: Int as uint256;
    nodeType: Int as uint8;
    capabilities: Int as uint32;
    region: Int as uint8;
    expiry: Int as uint64;
    signature: Cell;
}

message UpdateNodeStatus {
    nodeId: Int as uint256;
    status: Int as uint8; // 0=Offline, 1=Active, 2=Suspended, 3=Banned
    reason: String;
}

message UpdateReputation {
    nodeId: Int as uint256;
    qualityDelta: Int as int32; // can be negative for poor performance
    uptimeDelta: Int as int32;
    tasksDelta: Int as uint32;
}

message ReportGenesisViolation {
    nodeId: Int as uint256;
    reporterNodeId: Int as uint256;
    evidenceHash: Int as uint256;
}

message SetGenesisManifest {
    version: Int as uint32;
    manifestHash: Int as uint256; // SHA-256 of full binary manifest
}

message SlashNode {
    nodeId: Int as uint256;
    amount: Int as coins;
    reason: String;
}

// ── AgentRegistryV2 Contract ─────────────────────────────────────────────────

contract AgentRegistryV2 with Deployable, Ownable {
    // ── State ───────────────────────────────────────────────────────────
    owner: Address;
    settlementContract: Address;

    // ── Network stats ───────────────────────────────────────────────────
    totalNodes: Int as uint64;
    activeNodes: Int as uint64;
    totalTasksCompleted: Int as uint64;

    // ── Genesis Manifest (current valid version) ────────────────────────
    genesisVersion: Int as uint32;
    genesisManifestHash: Int as uint256;

    // ── Node type counters ──────────────────────────────────────────────
    edgeCount: Int as uint64;
    cpuCount: Int as uint64;
    gpuCount: Int as uint64;
    headCount: Int as uint64;

    // ── Duplicate guard — prevents inflating counters via re-registration ─
    registeredNodes: map<Int, Bool>;

    // Recorded at RegisterNode time, when the real constructor args
    // (owner, nodeType, capabilities, region) are still known — see
    // contract header.
    nodeAddresses: map<Int, Address>;

    init(owner: Address, settlement: Address) {
        self.owner = owner;
        self.settlementContract = settlement;

        self.totalNodes = 0;
        self.activeNodes = 0;
        self.totalTasksCompleted = 0;

        self.genesisVersion = 1;
        self.genesisManifestHash = 0;

        self.edgeCount = 0;
        self.cpuCount = 0;
        self.gpuCount = 0;
        self.headCount = 0;

        self.registeredNodes = emptyMap();
        self.nodeAddresses = emptyMap();
    }

    // ── Register new node ───────────────────────────────────────────────
    receive(msg: RegisterNode) {
        require(false, "Use signed registration V3");
    }

    receive(msg: RegisterNodeSignedV3) {
        require(context().value >= ton("0.1"), "Caller must fund registration");
        require(msg.expiry > now() && msg.expiry <= now() + 3600, "Registration proof expired or too distant");
        require(msg.nodeType <= 3 && msg.region <= 5, "Invalid node attributes");
        let keyBits: Slice = beginCell().storeUint(msg.publicKey, 256).endCell().asSlice();
        require(sha256(keyBits) == msg.nodeId, "Node ID does not match public key");
        let identityHash: Int = beginCell().storeUint(msg.nodeId, 256).storeUint(msg.publicKey, 256)
            .storeUint(msg.genesisHash, 256).storeUint(msg.nodeType, 8)
            .storeUint(msg.capabilities, 32).storeUint(msg.region, 8).endCell().hash();
        let proofHash: Int = beginCell().storeUint(0x47535203, 32).storeAddress(myAddress())
            .storeAddress(sender()).storeUint(identityHash, 256).storeUint(msg.expiry, 64).endCell().hash();
        let sig: Slice = msg.signature.asSlice();
        require(sig.bits() == 512 && sig.refs() == 0, "Invalid registration signature size");
        require(checkSignature(proofHash, sig, msg.publicKey), "Invalid registration signature");
        // Prevent duplicate registration — re-registering would double-count stats
        require(self.registeredNodes.get(msg.nodeId) == null, "Node already registered");

        // Verify Genesis hash matches current manifest
        if (self.genesisManifestHash != 0) {
            require(
                msg.genesisHash == self.genesisManifestHash,
                "Genesis manifest mismatch — update your node software",
            );
        }

        self.registeredNodes.set(msg.nodeId, true);

        // Deploy individual Node Identity contract
        let nodeInit: StateInit = initOf NodeIdentity(
            msg.nodeId,
            myAddress(),
            sender(),
            msg.nodeType,
            msg.capabilities,
            msg.region,
        );
        let nodeAddr: Address = contractAddress(nodeInit);
        self.nodeAddresses.set(msg.nodeId, nodeAddr);

        send(SendParameters {
            to: nodeAddr,
            value: ton("0.05"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: "init".asComment(),
            code: nodeInit.code,
            data: nodeInit.data,
        });

        self.totalNodes = self.totalNodes + 1;
        self.activeNodes = self.activeNodes + 1;

        // Update type counters
        if (msg.nodeType == 0) {
            self.edgeCount = self.edgeCount + 1;
        }
        if (msg.nodeType == 1) {
            self.cpuCount = self.cpuCount + 1;
        }
        if (msg.nodeType == 2) {
            self.gpuCount = self.gpuCount + 1;
        }
        if (msg.nodeType == 3) {
            self.headCount = self.headCount + 1;
        }
    }

    // ── Update reputation (from Settlement after task completion) ────────
    receive(msg: UpdateReputation) {
        require(
            sender() == self.owner || sender() == self.settlementContract,
            "Only owner or Settlement",
        );
        self.totalTasksCompleted = self.totalTasksCompleted + msg.tasksDelta;

        // Forward reputation update to individual Node Identity
        let nodeAddr: Address = self.getNodeAddress(msg.nodeId);
        send(SendParameters {
            to: nodeAddr,
            value: ton("0.03"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: msg.toCell(),
        });
    }

    // ── Report Genesis violation ────────────────────────────────────────
    receive(msg: ReportGenesisViolation) {
        // Only owner (DAO) or Settlement can suspend a node — prevents griefing attacks.
        require(
            sender() == self.owner || sender() == self.settlementContract,
            "Only DAO or Settlement can report violations",
        );
        if (self.activeNodes > 0) { self.activeNodes = self.activeNodes - 1; }
        let nodeAddr: Address = self.getNodeAddress(msg.nodeId);
        send(SendParameters {
            to: nodeAddr,
            value: ton("0.03"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: UpdateNodeStatus {
                nodeId: msg.nodeId,
                status: 2, // Suspended pending investigation
                reason: "Genesis violation reported",
            }.toCell(),
        });
    }

    // ── Admin: Update Genesis Manifest ──────────────────────────────────
    receive(msg: SetGenesisManifest) {
        require(sender() == self.owner, "Only DAO");
        self.genesisVersion = msg.version;
        self.genesisManifestHash = msg.manifestHash;
    }

    // ── Getters ─────────────────────────────────────────────────────────
    get fun get_network_stats(): NetworkStats {
        return NetworkStats {
            totalNodes: self.totalNodes,
            activeNodes: self.activeNodes,
            totalTasksCompleted: self.totalTasksCompleted,
            edgeCount: self.edgeCount,
            cpuCount: self.cpuCount,
            gpuCount: self.gpuCount,
            headCount: self.headCount,
        };
    }

    get fun get_genesis_manifest(): GenesisManifestData {
        return GenesisManifestData {
            version: self.genesisVersion,
            manifestHash: self.genesisManifestHash,
        };
    }

    get fun get_node_address(nodeId: Int): Address {
        return self.getNodeAddress(nodeId);
    }

    // ── Internal ────────────────────────────────────────────────────────
    // Looks up the address actually recorded at RegisterNode time — see
    // contract header. Returns the zero address for an unknown nodeId
    // rather than a StateInit-derived guess that could never correspond
    // to anything real.
    fun getNodeAddress(nodeId: Int): Address {
        let addr: Address? = self.nodeAddresses.get(nodeId);
        if (addr == null) {
            return newAddress(0, 0);
        }
        return addr!!;
    }
}

// ── NodeIdentity — Individual node on-chain identity ────────────────────────

contract NodeIdentity {
    nodeId: Int as uint256;
    registry: Address;
    owner: Address; // wallet that registered the node
    nodeType: Int as uint8;
    capabilities: Int as uint32;
    region: Int as uint8;

    // Reputation metrics
    qualityScore: Int as int64; // cumulative
    uptimeScore: Int as int64;
    tasksCompleted: Int as uint64;
    status: Int as uint8; // 0=Offline, 1=Active, 2=Suspended
    registeredAt: Int as uint64;
    lastActiveAt: Int as uint64;

    init(
        nodeId: Int,
        registry: Address,
        owner: Address,
        nodeType: Int,
        capabilities: Int,
        region: Int,
    ) {
        self.nodeId = nodeId;
        self.registry = registry;
        self.owner = owner;
        self.nodeType = nodeType;
        self.capabilities = capabilities;
        self.region = region;

        self.qualityScore = 0;
        self.uptimeScore = 0;
        self.tasksCompleted = 0;
        self.status = 1; // Active by default
        self.registeredAt = now();
        self.lastActiveAt = now();
    }

    receive("init") {
        // Initialization marker
    }

    receive(msg: UpdateReputation) {
        require(sender() == self.registry, "Only registry");
        let newQ: Int = self.qualityScore + msg.qualityDelta;
        self.qualityScore = newQ < 0 ? 0 : newQ; // floor at 0 — score cannot go negative
        let newU: Int = self.uptimeScore + msg.uptimeDelta;
        self.uptimeScore = newU < 0 ? 0 : newU;
        self.tasksCompleted = self.tasksCompleted + msg.tasksDelta;
        self.lastActiveAt = now();
    }

    receive(msg: UpdateNodeStatus) {
        require(sender() == self.registry, "Only registry");
        self.status = msg.status;
    }

    get fun get_node_info(): NodeInfo {
        return NodeInfo {
            nodeId: self.nodeId,
            owner: self.owner,
            nodeType: self.nodeType,
            capabilities: self.capabilities,
            region: self.region,
            qualityScore: self.qualityScore,
            uptimeScore: self.uptimeScore,
            tasksCompleted: self.tasksCompleted,
            status: self.status,
            registeredAt: self.registeredAt,
            lastActiveAt: self.lastActiveAt,
        };
    }
}

// ── Data structures ─────────────────────────────────────────────────────────

struct NetworkStats {
    totalNodes: Int as uint64;
    activeNodes: Int as uint64;
    totalTasksCompleted: Int as uint64;
    edgeCount: Int as uint64;
    cpuCount: Int as uint64;
    gpuCount: Int as uint64;
    headCount: Int as uint64;
}

struct GenesisManifestData {
    version: Int as uint32;
    manifestHash: Int as uint256;
}

struct NodeInfo {
    nodeId: Int as uint256;
    owner: Address;
    nodeType: Int as uint8;
    capabilities: Int as uint32;
    region: Int as uint8;
    qualityScore: Int as int64;
    uptimeScore: Int as int64;
    tasksCompleted: Int as uint64;
    status: Int as uint8;
    registeredAt: Int as uint64;
    lastActiveAt: Int as uint64;
}
