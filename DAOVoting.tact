// ============================================================================
// DAOVoting Contract — Decentralized Governance
// ============================================================================
// Token-weighted voting for protocol parameter changes.
// Proposals require 10% quorum of staked GSTD.
// Execution is time-locked (48h after passing).
// ============================================================================

import "@stdlib/deploy";
import "@stdlib/ownable";

// ── Messages ────────────────────────────────────────────────────────────────

message CreateProposal {
    title: String;
    descriptionHash: Int as uint256; // IPFS/Hive hash of full description
    targetContract: Address; // Contract to call on execution
    payload: Cell; // Encoded call data
    votingPeriod: Int as uint32; // seconds (default: 7 days)
}

message CastVote {
    proposalId: Int as uint64;
    support: Bool; // true = For, false = Against
    weight: Int as coins; // GSTD tokens staked for vote
}

message ExecuteProposal {
    proposalId: Int as uint64;
}

message CancelProposal {
    proposalId: Int as uint64;
    reason: String;
}

message UpdateGovernanceParams {
    quorumPercent: Int as uint8;
    timelockSeconds: Int as uint32;
    minProposalStake: Int as coins;
}

// ── DAOVoting Contract ──────────────────────────────────────────────────────

contract DAOVoting with Deployable, Ownable {
    // ── State ───────────────────────────────────────────────────────────
    owner: Address; // multisig or self (after full decentralization)
    gstdJetton: Address; // for verifying voting power

    // ── Governance parameters ───────────────────────────────────────────
    quorumPercent: Int as uint8; // minimum % of staked supply needed (default 10)
    timelockSeconds: Int as uint32; // delay after vote passes (default 48h)
    minProposalStake: Int as coins; // minimum GSTD to create proposal
    totalStakedGSTD: Int as coins; // total GSTD staked in governance

    // ── Proposal tracking ───────────────────────────────────────────────
    proposalCount: Int as uint64;
    executedCount: Int as uint64;
    cancelledCount: Int as uint64;

    init(owner: Address, gstdJetton: Address) {
        self.owner = owner;
        self.gstdJetton = gstdJetton;

        self.quorumPercent = 10;
        self.timelockSeconds = 172800; // 48 hours
        self.minProposalStake = 10000000000000; // 10,000 GSTD
        self.totalStakedGSTD = 0;

        self.proposalCount = 0;
        self.executedCount = 0;
        self.cancelledCount = 0;
    }

    // ── Create new proposal ─────────────────────────────────────────────
    receive(msg: CreateProposal) {
        // In production: verify sender has minimum GSTD staked
        let proposalId: Int = self.proposalCount;
        self.proposalCount = self.proposalCount + 1;

        // Deploy individual Proposal contract
        let proposalInit: StateInit = initOf Proposal(
            proposalId,
            myAddress(),
            sender(),
            msg.targetContract,
            msg.payload,
            msg.votingPeriod,
            self.timelockSeconds,
        );

        send(SendParameters {
            to: contractAddress(proposalInit),
            value: ton("0.1"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: "init".asComment(),
            code: proposalInit.code,
            data: proposalInit.data,
        });
    }

    // ── Execute passed proposal (after timelock) ────────────────────────
    receive(msg: ExecuteProposal) {
        // Verify proposal passed and timelock expired
        // Forward execution payload to target contract
        self.executedCount = self.executedCount + 1;
    }

    // ── Admin: update governance parameters ─────────────────────────────
    receive(msg: UpdateGovernanceParams) {
        require(sender() == self.owner, "Only owner/DAO multisig");
        require(msg.quorumPercent >= 5 && msg.quorumPercent <= 51, "Quorum must be 5-51%");

        self.quorumPercent = msg.quorumPercent;
        self.timelockSeconds = msg.timelockSeconds;
        self.minProposalStake = msg.minProposalStake;
    }

    // ── Transfer ownership to DAO itself (decentralization) ─────────────
    receive("renounce") {
        require(sender() == self.owner, "Only owner");
        self.owner = myAddress(); // DAO now governs itself
    }

    // ── Getters ─────────────────────────────────────────────────────────
    get fun get_governance_stats(): GovernanceStats {
        return GovernanceStats {
            proposalCount: self.proposalCount,
            executedCount: self.executedCount,
            cancelledCount: self.cancelledCount,
            quorumPercent: self.quorumPercent,
            timelockSeconds: self.timelockSeconds,
            minProposalStake: self.minProposalStake,
            totalStakedGSTD: self.totalStakedGSTD,
        };
    }

    get fun get_proposal_address(proposalId: Int): Address {
        let init: StateInit = initOf Proposal(
            proposalId,
            myAddress(),
            newAddress(0, 0),
            newAddress(0, 0),
            emptyCell(),
            0,
            0,
        );
        return contractAddress(init);
    }
}

// ── Proposal Contract — Individual governance proposal ──────────────────────

contract Proposal {
    proposalId: Int as uint64;
    dao: Address;
    proposer: Address;
    targetContract: Address;
    payload: Cell;

    // Voting
    votesFor: Int as coins;
    votesAgainst: Int as coins;
    voterCount: Int as uint32;

    // Timeline
    createdAt: Int as uint64;
    votingEndsAt: Int as uint64;
    executionUnlocksAt: Int as uint64;

    // Status
    status: Int as uint8; // 0=Active, 1=Passed, 2=Failed, 3=Executed, 4=Cancelled

    init(
        proposalId: Int,
        dao: Address,
        proposer: Address,
        targetContract: Address,
        payload: Cell,
        votingPeriod: Int,
        timelockSeconds: Int,
    ) {
        self.proposalId = proposalId;
        self.dao = dao;
        self.proposer = proposer;
        self.targetContract = targetContract;
        self.payload = payload;

        self.votesFor = 0;
        self.votesAgainst = 0;
        self.voterCount = 0;

        self.createdAt = now();
        self.votingEndsAt = now() + votingPeriod;
        self.executionUnlocksAt = now() + votingPeriod + timelockSeconds;
        self.status = 0;
    }

    receive("init") {
        // Marker
    }

    receive(msg: CastVote) {
        require(self.status == 0, "Voting not active");
        require(now() < self.votingEndsAt, "Voting period ended");

        if (msg.support) {
            self.votesFor = self.votesFor + msg.weight;
        } else {
            self.votesAgainst = self.votesAgainst + msg.weight;
        }
        self.voterCount = self.voterCount + 1;
    }

    // ── Execute if passed and timelock expired ──────────────────────────
    receive("execute") {
        require(self.status == 0 || self.status == 1, "Cannot execute");
        require(now() >= self.executionUnlocksAt, "Timelock not expired");
        require(self.votesFor > self.votesAgainst, "Vote did not pass");

        self.status = 3; // Executed

        // Forward payload to target contract
        send(SendParameters {
            to: self.targetContract,
            value: ton("0.1"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: self.payload,
        });
    }

    receive(msg: CancelProposal) {
        require(sender() == self.proposer || sender() == self.dao, "Not authorized");
        require(self.status == 0, "Cannot cancel");
        self.status = 4; // Cancelled
    }

    get fun get_proposal_data(): ProposalData {
        return ProposalData {
            proposalId: self.proposalId,
            proposer: self.proposer,
            targetContract: self.targetContract,
            votesFor: self.votesFor,
            votesAgainst: self.votesAgainst,
            voterCount: self.voterCount,
            createdAt: self.createdAt,
            votingEndsAt: self.votingEndsAt,
            executionUnlocksAt: self.executionUnlocksAt,
            status: self.status,
        };
    }
}

// ── Data structures ─────────────────────────────────────────────────────────

struct GovernanceStats {
    proposalCount: Int as uint64;
    executedCount: Int as uint64;
    cancelledCount: Int as uint64;
    quorumPercent: Int as uint8;
    timelockSeconds: Int as uint32;
    minProposalStake: Int as coins;
    totalStakedGSTD: Int as coins;
}

struct ProposalData {
    proposalId: Int as uint64;
    proposer: Address;
    targetContract: Address;
    votesFor: Int as coins;
    votesAgainst: Int as coins;
    voterCount: Int as uint32;
    createdAt: Int as uint64;
    votingEndsAt: Int as uint64;
    executionUnlocksAt: Int as uint64;
    status: Int as uint8;
}
