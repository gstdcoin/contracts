# User-signed GSTD payments: current boundary and proposed next step

**Status: design proposal; no new contract, deployment or payment mode is activated.**

The aim is a short, understandable payment journey in which users review a transfer in their own TON wallet and pay its network fee. Wallet signatures authorize transfers; they do not prove that an AI answer is correct or remove custody by themselves.

## Safe user experience now

Keep the existing funded ledger and custody-owner-signed withdrawal path while making its boundary visible:

1. Connect a wallet and authenticate ownership. Connecting a wallet, signing a login proof and signing a token transfer are different actions.
2. Before a deposit, show the GSTD amount, destination, network, purpose and expected TON attached for processing. The wallet shows the network fee; attached TON is not an exact fee quote. A rejected wallet prompt creates no paid balance.
3. Credit a deposit only after the canonical token transfer is independently confirmed. A submitted transaction, screenshot or signature is not a confirmed deposit.
4. Show available, reserved and earned GSTD separately. Only funded, accepted work earns rewards: 85% executor, 10% protocol, 5% reserve. Promotional quota is separate.
5. A withdrawal request requires user authorization. The current custody owner must still sign the outgoing transfer. Show requested, awaiting owner signature, submitted and confirmed states accurately. No platform GSTD claim fee is added; TON network charges still exist.

A user's signature on a withdrawal request is not permissionless control over the custody wallet. Existing balances must never be silently moved into a new protocol.

## Future opt-in escrow

A separate, versioned contract would hold a particular funded order, rather than allowing the platform to spend that order's principal. Parties would approve immutable order terms: payer, executor, token identity, GSTD amount, 85/10/5 recipients, acceptance rule, deadlines and failure rules. No administrative emergency withdrawal of customer principal is compatible with a claim of noncustodial escrow.

Do not implement settlement before choosing and testing the acceptance rule. Payer-only acceptance allows a dishonest payer to keep an answer and refuse payment. Executor-only completion allows a dishonest executor to take payment for invalid work. A named arbitrator creates an explicit trust and availability dependency. A validator quorum requires independent membership, Sybil resistance and dispute rules; matching signatures or answer hashes are not a general proof of AI quality. The parties must understand and accept the selected rule before funding. No arbitrator is chosen by this proposal.

For small requests, a bounded prepaid batch may reduce signatures and TON costs. It needs an explicit spending cap, expiry and refund rule; it is not unlimited approval of future charges. Do not promise batching until its contract and client behavior are implemented.

## Required safety and acceptance matrix

| Boundary | Required behavior before activation | Evidence needed |
| --- | --- | --- |
| Canonical token | Accept funding only from the escrow's derived wallet for the frozen canonical GSTD master. Never trust a caller-supplied token name, wallet address or receipt body. | Verified master/wallet code and derivation, counterfeit-wallet and forged-notification tests. |
| Order authorization | Bind signatures to version, network domain, contract, order, parties, amounts, expiry and action. Terms cannot change after funding. | Cross-contract/network, changed-recipient/amount, expired proof and replay tests. |
| Acceptance and disputes | Specify who can authorize settlement, what is proven, deadlines and which party bears each failure risk. | Adversarial payer refusal, bogus completion, unavailable verifier and conflicting-decision tests; agreed product policy. |
| Refunds | Define unfunded expiry, partially/over-funded orders, cancellation, late deposits and disputed funds. A timeout alone cannot imply work was not delivered. | Boundary-time, cancel/settle race and late/duplicate receipt tests. |
| Asynchronous payouts | Account for outbound transfer, acknowledgement, bounce and retry separately. Prevent double settlement and preserve recoverable entitlements on failure. | Canonical Jetton sandbox transfers, deliberate rejection/bounce, duplicate callbacks and retry tests. |
| Gas and storage | Every call funds its processing; principal cannot subsidize unlimited public calls. Users see attached TON separately from actual network fees. | Measured gas across success/failure and repeated low-value calls; storage-reserve exhaustion tests. |
| Accounting | Allocate integer nanotokens deterministically: executor floor(85%), protocol floor(10%), reserve remainder. No bonus minting or unfunded rewards. | Rounding, minimum amounts, large bounds and conservation-of-value tests. |
| Release and recovery | Source must match deployed bytecode and addresses; each client must reject the wrong network/contract/version. Existing custody balances remain on the current path. | Reproducible build, independent review, testnet lifecycle and explicit migration approval. |

## Activation boundary

Current sandbox tests for legacy contracts and canonical transfers are useful evidence, but do not certify this proposed escrow. The existing TON-denominated, owner-controlled `escrow.tact` and `escrow_complete.tact` are not implementations of this design and must not be presented as user-controlled GSTD settlement.

Before real funds: agree the acceptance/dispute rule; implement a narrowly scoped contract and wallet encoding; pass the matrix above; review the immutable patch independently; run a complete testnet deposit/work/settlement/refund lifecycle; verify deployed code and client addresses. A mainnet release and migration require a separate owner signature. Until then the honest product label is **platform balance with user-authorized deposits and custody-owner-signed withdrawals**.
