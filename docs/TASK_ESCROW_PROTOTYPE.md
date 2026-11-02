# Coordinated funded-task escrow — sandbox only

This is NOT a deployed payment mode, replacement for the platform ledger, or a
production-ready feature. See BENEFICIARY_REWARD_ACCOUNT.md for migration limits.

## Invariants implemented

One GstdTaskEscrow coordinator binds payer, worker, protocol/reserve recipients,
task identifier, GSTD budget, expiry and pinned canonical token-wallet code.
It derives three isolated GstdEscrowShare contracts. Amounts are calculated by
the coordinator as85%,10% and the exact remainder5%; budget must be at least100nanoGSTD.

A share recognizes funding only from its derived canonical GSTD wallet. Once its
notified deposits cover the required amount it reports readiness to its coordinator.
Only the exact derived share may set its readiness bit. Funds cannot leave a pending
share. Payer acceptance requires all three funding bits and an unexpired task.

The coordinator makes one irreversible accepted/refunded decision for ALL shares.
A payer cannot accept only the worker share and later recover the fee shares.
Children accept decisions only from their coordinator. A failed/delayed delivery
does not authorize another recipient: anyone may fund SyncTask to repeat the same
immutable decision. Delayed pending-state messages cannot downgrade accepted shares.

After acceptance, each share pays only its fixed beneficiary. After expiry without
acceptance, shares refund only the payer. Anyone can trigger the expiry decision,
but cannot receive the refund. Transfers use real canonical wallet balance, not a
shadow credit counter. An uncertain transfer must be checked before a user retries;
queryId is correlation, not idempotency.

## Funding and failure behavior

Deploy/synchronize before depositing. Standard token deposits must carry a forward
notification budget; tests use0.01TON. Without a notification, actual tokens may
arrive while readiness stays false. The safe outcome is refusal to accept and a
payer refund after expiry. ReportFunding can retry a readiness callback after a
notified deposit; it cannot fabricate unnotified funding.

Transfers attach0.05TON and require a0.08TON caller budget. Sync/accept/refund decisions
require0.30TON to send three0.08TON child messages. These are prototype constants,
NOT production fee estimates or a promise of returned change. Native TON remains
for storage. This per-task design has substantial deployment/gas overhead; it is
unsuitable for advertising economical per-token micropayments without batching,
measured fees and further UX work. Foreign assets are unsupported.

## Explicit trust and rollout gaps

- The payer explicitly accepts work. No computation proof or dispute arbitration.
- Recipient tuple is constructor-bound but not globally hardcoded. A trusted funding
  UI/task agreement must verify canonical protocol/reserve recipients before funding.
- Do not copy an arbitrary escrow address from another person.
- No platform task runner, TonConnect UI, paid-ledger migration or production backing
  movement is connected to this prototype.
- Canonical mainnet master is fixed. Testnet asset configuration and verification
  must be implemented before any mainnet deployment.
- A complete independent security audit, funded wallet test and economic/gas review
  remain prerequisites. Existing owner-signed payments are unchanged.

## Sandbox verification

Eight focused tests execute the real canonical wallet code: complete85/10/5 payout;
all-share expiry refund; partial funding/top-up; missing-notification recovery;
forged readiness/decisions; oversized-transfer retry; late deployment/exact deadline;
actually undelivered commit recovery from a snapshot without queued messages;
delayed phase-zero rejection; repeated readiness and insufficient-gas rollback.

The generator scripts/generate-money-rehearsal.cjs also produces synthetic canonical
deposit/withdrawal receipts for the platform's cross-module moneyJourney test.
No test signs or broadcasts a real wallet transaction.
