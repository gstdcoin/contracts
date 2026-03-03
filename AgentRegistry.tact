// ============================================================================
// AgentRegistry Contract — Node Identity & Reputation
// ============================================================================
// Manages node registration, Genesis Lock verification,
// reputation tracking, and capability advertisement.
// Each node gets a unique on-chain identity.
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

// ── AgentRegistry Contract ──────────────────────────────────────────────────

contract AgentRegistry with Deployable, Ownable {
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
    }

    // ── Register new node ───────────────────────────────────────────────
    receive(msg: RegisterNode) {
        // Verify Genesis hash matches current manifest
        if (self.genesisManifestHash != 0) {
            require(
                msg.genesisHash == self.genesisManifestHash,
                "Genesis manifest mismatch — update your node software",
            );
        }

        // Deploy individual Node Identity contract
        let nodeInit: StateInit = initOf NodeIdentity(
            msg.nodeId,
            myAddress(),
            sender(),
            msg.nodeType,
            msg.capabilities,
            msg.region,
        );

        send(SendParameters {
            to: contractAddress(nodeInit),
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
        // Any verified node can report a violation
        // Forward to node identity for status update
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
    fun getNodeAddress(nodeId: Int): Address {
        let nodeInit: StateInit = initOf NodeIdentity(
            nodeId,
            myAddress(),
            newAddress(0, 0),
            0,
            0,
            0,
        );
        return contractAddress(nodeInit);
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
        self.qualityScore = self.qualityScore + msg.qualityDelta;
        self.uptimeScore = self.uptimeScore + msg.uptimeDelta;
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
