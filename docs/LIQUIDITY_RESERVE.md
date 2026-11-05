# GSTD / XAUt0 liquidity reserve — candidate, not deployed

## What operators and users receive

Accepted paid work allocates 85% to its executor, 10% to the protocol and 5% to the reserve. The reserve is separate from user balances. Pool liquidity may improve exchange access; it is not a guaranteed gold return, a stable redemption price, or an individual claim on LP tokens for a node operator. Node earnings depend on accepted paid work, its price and the operator's own costs.

The intended pool is STON.fi `EQA--JXG8VSyBJmLMqb2J2t4Pya0TS9SXHh7vHh8Iez25sLp`, containing GSTD and XAUt0. Do not substitute a ticker match for its pinned asset addresses. A small pool cannot absorb large sales at a stable price.

## Current evidence and limits

`GstdLiquidityReserve.tact` is a paused-by-default candidate. It has NOT been deployed and automatic mainnet reserve funding is NOT enabled. No customer backing was transferred. Existing escrow addresses and commitments are unchanged.

Six component tests and two isolated integration tests passed on 2026-11-05. The integrations execute captured public STON.fi router, pool, LP-account and LP-wallet code with their exact TVM libraries in TON Sandbox. They demonstrate an actual LP mint and a minimum-LP failure followed by a complete GSTD refund. All test funds exist only inside the emulator. These tests are not an external audit or a funded mainnet acceptance test.

The prototype has NO LP withdrawal method. This is a pending governance decision, not approval for permanent locking. Do not deploy or fund it before deciding LP custody and recovery policy.

## Contract controls

- Canonical GSTD wallet code and pool LP-wallet / LP-account code hashes are pinned; router, pool and other-token wallet destinations are fixed.
- Fresh signed quotes bind this contract, operation sequence, amount, minimum LP and expiry. Invalid signatures and replays are rejected before external-message acceptance.
- One unresolved operation at a time; immutable batch, daily, cooldown and minimum-LP limits. Invalid or missing quotes pause spending rather than inventing a price.
- The quote oracle is a trust dependency, not an independent market proof. Its authorization cannot redirect tokens, but an unsound permitted quote can still lose economic value.
- Sending is not settlement. Only an authenticated LP-wallet mint notification records received LP. Refund submission does not itself clear pending state.
- Real STON.fi refunds do not forward token notifications. A canonical GSTD-wallet self-transfer verifies restoration of the complete accounted token balance before the pending reserve amount is restored. Failed or incomplete recovery keeps the operation unresolved.
- TON for execution and recovery is funded separately. SDK attached-message budgets (1 TON execution, 0.8 TON LP-account recovery) are not measured net fees or a promise of profitability.

## Reproduce without real transfers

```sh
npm ci
npm run test:liquidity
```

This builds only the new project. The two integration tests explicitly skip when no public chain snapshot is supplied; that skip is not a successful full-cycle result.

For the opt-in integration (read-only public API requests; no wallet keys):

```sh
node scripts/capture-liquidity-fork.mjs /tmp/gstd-ston-fork.json
GSTD_STON_FORK_FIXTURE=/tmp/gstd-ston-fork.json npm run test:liquidity
```

The snapshot is captured sequentially with bounded requests and unchanged code/data checks, not at an atomic block. It contains third-party deployed code and remains local; do not commit it. Public interface facts are recorded in `tests/fixtures/canonical-gstd-xaut-pool.json`. SDK payload parity is tested against `@ston-fi/sdk` 2.7.0. Protocol reference: https://github.com/ston-fi/dex-core-v2 (reviewed commit af0a955cc835af9697cd383e201fefcbe1a6a87e).

## Required before activation

1. Decide LP custody, delayed recovery and administrator authority; review the resulting contract and repeat the tests.
2. Implement a durable reserve-only funding journal that debits only released reserve funds, reconciles canonical on-chain receipts, and cannot spend customer liabilities or fund twice after a retry.
3. Implement quote simulation, stale-price checks, price-impact limits and a measured gas/value threshold. Skip uneconomic batches; never replenish merely to display activity.
4. Integrate the keeper and public operation status, including unresolved/refunded operations. Never expose signing secrets or offer arbitrary transaction payloads.
5. Complete testnet verification required by this repository, then an owner-signed bounded mainnet acceptance cycle. The fixed mainnet pool is not a live testnet pool.
6. Record deployment, immutable limits, oracle and owner addresses, executable hashes and verified LP balances. Enable only after these checks.

## UI language

Use: Reserve accumulated; Waiting for an economical batch; Awaiting chain confirmation; LP received; Refund pending; Refunded; Paused.

Show the pool link, reserve amount, separate TON budget, minimum expected LP, actual received LP and transaction links. Explain the benefit as deeper liquidity and possible pool fees; never display guaranteed node income from reserve liquidity. New operators should need neither shell commands nor manual contract payload construction.
