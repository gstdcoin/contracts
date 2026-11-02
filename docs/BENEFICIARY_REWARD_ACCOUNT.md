# Beneficiary-controlled GSTD account — sandbox prototype

Status: tested migration primitive, not deployed or enabled by the platform.
The live paid ledger and owner-signed withdrawal route are unchanged.

## What it provides

GstdRewardAccount has one immutable basechain beneficiary and no administrator,
platform signing key, pause switch, pooled balances or arbitrary payout destination.
It derives its canonical GSTD token wallet from pinned mainnet master and wallet-code
hash. Only its beneficiary may submit WithdrawOwnGstd. Tokens always go to that
beneficiary. The user supplies TON for execution; no additional GSTD claim fee exists.

Use this account only after accepted funded rewards have actually been transferred
to its canonical token wallet. It cannot withdraw platform ledger entries, create
earnings, verify inference quality, reserve task budgets or mint tokens.

All GSTD in one account belongs to its beneficiary. The canonical wallet enforces
the real spendable balance. There is no off-chain credit counter or irreversible
voucher consumption on a failed transfer. A failed attempt can therefore be retried
without depending on a custody administrator. Never automatically retry an uncertain
transaction: queryId correlates messages but is NOT an idempotency key. Repeating a
successful partial withdrawal transfers more of the user's remaining funds to the
same user. Inspect recipient receipts and the actual token balance first.

The canonical wallet uses data: balance, owner, master, activation bit. It does NOT
use the generic wallet-code reference layout. Tests assert a known mainnet wallet
address and execute the real canonical code in TON Sandbox.

## Limits

- The contract has not had a complete independent security audit or testnet run.
- Mainnet deployment/funding, ledger migration and platform UI activation are absent.
- The fixed master is the mainnet GSTD master. Do not claim testnet token support:
  a separate explicit testnet configuration/build is needed before testnet deployment.
- Basechain beneficiaries only. Foreign tokens are unsupported and can be stranded.
- Native TON left after gas remains for account storage; this prototype has no
  TON-recovery entry point. Attach only the documented budget.
- No success counter is presented: emitting a transfer is not a delivery receipt.
- No guarantee of correct model execution is introduced by this account.

## Verified locally

Eleven Sandbox cases use the pinned canonical GSTD wallet code:
known address derivation; forged-code deployment rejection; stranger rejection;
zero/underfunded-call rejection; delivery to beneficiary; retry after an unfunded
attempt; oversized attempt followed by valid withdrawal; forged notification
rejection; non-basechain rejection; actual incoming canonical transfer, account-token
wallet initialization, and subsequent withdrawal. No real tokens or signatures used.

## Required migration order

1. Review this account, gas/rent behavior and TON recovery policy; complete testnet
   configuration and verification. Keep the existing owner-signed route available.
2. Review and integrate the sandbox coordinator in TASK_ESCROW_PROTOTYPE.md, which reserves BEFORE execution and allocates
   only accepted paid work: 85% executor, 10% protocol, 5% reserve.
3. Route the executor share to their account with independently verified canonical
   token receipts. A transfer must not also create a withdrawable platform credit.
4. Reconcile outstanding balances and held jobs before moving backing. Historical
   credits cannot be made noncustodial merely by deploying a new account.
5. Add receipt-aware TonConnect deployment/withdrawal UI with exact network, master,
   recipient, amount and TON budget. Never store seed phrases.
6. Exercise a real small deposit, acceptance, failure/refund and self-withdrawal.
   Activate only after conservation and recovery checks pass.

Reference: https://docs.ton.org/payments/jettons
