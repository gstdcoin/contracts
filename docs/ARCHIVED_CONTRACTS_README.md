# Historical contracts overview — archived 28 October 2026

This is a preserved earlier README, not the production settlement specification. Its routing, buyback/burn, minting, staking and deployment instructions include obsolete or unverified designs. Current platform rewards use 85% executor / 10% protocol / 5% reserve in the platform ledger and owner-signed standard Jetton withdrawals. Do not execute historical deployment or funding instructions as a production procedure. See [the current index](../README.md).

---

# GSTD TON contracts

Production token: the existing GSTD Jetton, 1 billion issued, minting disabled. The archived GSTDJetton.tact source is not the deployed master and must not be used to create a replacement emission.

Current platform withdrawals use owner-signed standard Jetton transfers, documented in [the platform withdrawal guide](https://github.com/gstdcoin/ai/blob/main/docs/WITHDRAWALS_AND_PRIVACY.md). They do not use the legacy Settlement/Escrow sender. scripts/settle-rewards.ts is deliberately disabled to prevent duplicate or unverified payouts.

The deployed EcosystemTreasury matched its reviewed build in the October 2026 check. Settlement V2 and Escrow did not match the current compiled sources; this has not been resolved by a README change. No external security audit or trustless production settlement is claimed. Testnet verification is required before any new mainnet contract deployment.

# GSTD Smart Contracts

> TON smart-contract source and deployment records for GSTD.
> Built with [Tact](https://tact-lang.org). The contracts have not received an independent security audit.

> **Deployment status:** some contracts are deployed, but this does not mean the platform task queue is connected to settlement or that users currently receive task payouts. Ownership transfers, newer contract versions, and other integrations remain outstanding. See [`deployment-mainnet.json`](../deployment-mainnet.json) and the status notes below. Do not treat this repository as financial advice or production-ready infrastructure.

---

## What is GSTD?

GSTD is a source-available project developing smart contracts for token settlement, node identity, and governance. Some components are deployed and others remain source code or planned integrations; the protocol is not currently governed entirely by token holders.

**The token is the network. The network is the token.**

---

## Contract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER / dAPP                               │
│                         pays in TON                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
               ┌─────────────────┐
               │ SettlementRouter │  ← forces all payments through GSTD
               │  (any token →    │    via DeDust / Ston.fi DEX
               │   GSTD)         │    creates constant buy pressure
               └────────┬────────┘
                        │ GSTD
                        ▼
               ┌─────────────────┐
               │ SettlementMaster │  ← splits revenue 85 / 10 / 5
               └──┬──────┬──────┬┘
                  │      │      │
           85%    │  10% │   5% │
                  ▼      ▼      ▼
             Worker  Treasury  Burn
             (node) (treasury) (GSTD←DEX)
                        │
                        ▼
               ┌─────────────────────┐
               │  EcosystemTreasury  │  ← accumulates, funds buybacks
               └─────────────────────┘

┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  GSTDJetton  │  │  AgentRegistry  │  │   DAOVoting      │
│  (TEP-74)    │  │  (node identity │  │  (governance     │
│  1B supply   │  │   + reputation) │  │   + parameters)  │
└──────────────┘  └─────────────────┘  └──────────────────┘

┌──────────────────────────────────────────────────────────┐
│               NaaS Provider System                        │
│  ProviderRegistry (staking tiers) + SlashMechanics        │
└──────────────────────────────────────────────────────────┘
```

---

## Contracts

### Core Token

| Contract | File | Description |
|---|---|---|
| **GSTDJetton** | `GSTDJetton.tact` | TEP-74 Jetton, 1B supply, mint-only by SettlementMaster |
| **SettlementMaster** | `SettlementMaster.tact` | Revenue split: 85% worker / 10% treasury / 5% buyback-burn |
| **SettlementRouter** | `SettlementRouter.tact` | Routes any token → GSTD via DeDust/Ston.fi before settlement |
| **EcosystemTreasury** | `EcosystemTreasury.tact` | Accumulates 10% of fees for GSTD buybacks |

### Governance

| Contract | File | Description |
|---|---|---|
| **DAOVoting** | `DAOVoting.tact` | Legacy token-weighted governance contract; quorum limitation blocks intended operation |
| **SovereignVault** | `SovereignVault.tact` | Node liquidity vault — JIT liquidity provision for swaps |

### Node Infrastructure

| Contract | File | Description |
|---|---|---|
| **AgentRegistry** | `AgentRegistry.tact` | On-chain node identity, capability bitmask, reputation tracking |
| **ProviderRegistry** | `naas/ProviderRegistry.tact` | NaaS staking tiers — stake GSTD to unlock chain hosting |
| **SlashMechanics** | `naas/SlashMechanics.tact` | Challenger protocol — penalises downtime and wrong RPC responses |

### Bridge

| Contract | File | Description |
|---|---|---|
| **GstdBridge (TON)** | `bridge/ton/GstdBridge.tact` | TON-side vault for cross-chain bridge (lock-and-unlock) |

### Escrow

| Contract | File | Description |
|---|---|---|
| **Escrow** | `escrow.tact` | Task escrow — holds payment until node delivers result |

---

## Token Economics

The economics below describe design intent. They do not imply that the platform currently routes service payments through these contracts or that rewards are being paid.

### GSTD as the Base Routing Asset

The intended design is to route supported service payments through `SettlementRouter` and swap them to GSTD before settlement. Production routing and integration with platform tasks are not verified. The intended effects are:

- **Every service use creates buy pressure on GSTD**
- No dependency on manual buybacks — it is structural and automatic
- Users can pay in any asset (TON, USDT, SOL, XRP); GSTD absorbs it all

### Intended Revenue Split

```
Illustrative only — not a live production payment
         │
         ├── 85% (0.85 TON) → Node operator (immediate payment)
         ├── 10% (0.10 TON) → EcosystemTreasury (buybacks)
         └──  5% (0.05 TON) → Buy GSTD on DEX → BURN
```

### Planned NaaS Staking Tiers

| Tier | Stake | Chains | Reward multiplier |
|---|---|---|---|
| Explorer | 1,000 GSTD | 3 chains | 1× |
| Provider | 10,000 GSTD | 10 chains | 1.5× |
| Validator | 50,000 GSTD | 25 chains | 2× |
| Sovereign | 500,000 GSTD | 50+ chains | 3× |

ProviderRegistry is not deployed. These tiers and multipliers are not currently available on mainnet.

### Planned Slashing (NaaS)

SlashMechanics is not deployed. The following table is a design specification, not active enforcement.

| Condition | Slash | Note |
|---|---|---|
| Downtime > 10 min | 0.1% of stake | Auto-detected |
| Downtime > 1 hour | 1.0% of stake | Auto-detected |
| Wrong RPC response | 2.0% of stake | 10% goes to challenger, 90% burned |
| Downtime > 24 hours | 5.0% + tier downgrade | — |
| Proven fraud | 100% (jailed) | — |

### Governance

- The legacy DAOVoting contract is deployed, but its effective quorum is unreachable; it cannot currently provide the intended governance.
- DAOVotingV2 fixes known quorum and proposal-address issues in source and tests, but is **not deployed**.
- SettlementMaster and EcosystemTreasury ownership has not been transferred to a functioning DAO. See `deployment-mainnet.json`'s `phase2_todo`.
- Governance parameters documented in contract source do not imply active community control.

---

## Declared TON Mainnet Deployments

| Contract | Address |
|---|---|
| GSTDJetton | `EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO` |
| SettlementMaster | `EQAhuR_cEaIkRqs4gvgXSD-Qw2FRUkkBUZQkTBrFT5n-ZrSS` |
| SettlementMasterV2 | `EQCi-QjafvcYE7wgl9Dc5jAFJrmiy_oGfcobzORb2gZQezhE` |
| EcosystemTreasury | `EQAbtTCsty8-gpX-45eotGWxnYG1c7ew7NFsZ9LJBRiv_Ii_` |
| AgentRegistry | `EQDtWcGCQXLFdh7TmkL5QFbFNYXxL9mjOk4ehmsNFwCtsDoT` |
| DAOVoting | `EQBa-hyO3JkcRJNyYKKOqBjsQ6KAS-dAHj6rf8KOuH4Jzls5` |
| Escrow | `EQCucUHZGCr8KwBalmumsITvtMBtc5ZylAfw7sJk5SXpBWVh` |
| EscrowPhase1Legacy | `EQDqdyFsruwXzlScIVM0c7LKbBb4EOgwLeFO4bpNnuwc7rTF` |

`Escrow` is the canonical address; `EscrowPhase1Legacy` is retained for
historical reference. `deployment-mainnet.json` records both addresses.
An active account with code does not prove contract behavior or that the
contracts are correctly wired together. `npm run verify` performs read-only
account-code checks and verifies the GSTD Jetton master getter; ownership,
permissions, settlement, and wallet flows still require separate checks.

### Audit status (read before relying on this code)

This is an internal review, not an independent audit. Findings from reading the
sources and the on-chain state (`node scripts/onchain-status.mjs`):

- **GSTD token**: a standard TEP-74 jetton, supply fixed at 1,000,000,000 GSTD,
  minting closed (`mintable=false`). `GSTDJetton.tact` in this repo is **not** its
  source and must not be deployed (non-standard opcodes, no TEP-89).
- **SettlementMasterV2** (on-chain) is not verified against the current
  `SettlementMaster.tact` source. The source now binds attestation signatures to the
  contract address and reserves gas for the GSTD bonus transfer; using these fixes
  needs a **new deployment signed by the owner wallet**. No settled tasks exist
  on-chain yet, and nothing outside this repo currently submits settlements.
- **Trust model**: the owner is an EOA admin (DAO transfer is blocked until
  DAOVotingV2 is deployed); the bonus pool is bounded by its balance; quorum
  attestations are only as independent as the registered signer keys.
- **Escrow** is custodial (owner authorizes payouts and `EmergencyWithdraw`);
  `EcosystemTreasury` owner can withdraw funds. Neither provides per-task accounting.
- Not deployed yet: DAOVotingV2, AgentRegistryV2, bridge, slashing.
- Known dependency advisories in the Tact toolchain have no upstream fix.

---

## Build

```bash
npm install
npx blueprint build
```

## Verify

```bash
node scripts/verify-contracts.js
```

## Deploy (mainnet)

Phase 1 contracts (EcosystemTreasury, SettlementMaster, Escrow — GSTDJetton
already exists and is not redeployed):

```bash
npm run build
npx ts-node --project tsconfig.deploy.json scripts/deploy-mainnet.ts
```

AgentRegistry and DAOVoting are also live on mainnet (see table above), but
no deploy script for either is currently committed to this repo — however
they were originally deployed, it wasn't via a script that's still here.

---

## Ecosystem

| Repo | Description |
|---|---|
| [gstdcoin/web](https://github.com/gstdcoin/web) | Landing page |
| [gstdcoin/ai](https://github.com/gstdcoin/ai) | Dashboard and API source |
| [gstdcoin/gstdbot](https://github.com/gstdcoin/gstdbot) | Node OS software |
| [gstdcoin/gstd-bridge](https://github.com/gstdcoin/gstd-bridge) | Cross-chain bridge validators |
| **gstdcoin/contracts** | **Smart contracts (this repo)** |

---

## License

PolyForm Noncommercial License 1.0.0 with an added permission for taking part in the GSTD network — see [LICENSE](../LICENSE). The source is public and free for noncommercial use; commercial use by companies needs a separate license. Not an OSI open-source license. Earlier copies released under MIT remain under MIT.

## Canonical GSTD transfer compatibility

A public mainnet wallet snapshot and regression tests are in `tests/fixtures/canonical-gstd-wallet.json` and `tests/CanonicalJettonWallet.spec.ts`. The canonical master's `get_wallet_address` derives this exact wallet, and its wallet-code hash matches `a46ef8746f4ea669c2ce9455be129b693cd1c638cb021faaac58c7df01e0a163`.

In a local TON sandbox, the actual platform withdrawal payload (`0x0f8a7ea5`, TEP-74) transferred tokens and deployed a previously absent recipient Jetton wallet with the 0.05 TON message budget, including a zero-initial-TON sender-wallet case. The internal receipt used `0x178d4519`. The unrelated generated header `1435380091` (`0x558e297b`) from PR #1 was rejected by the canonical deployed wallet with exit code 65535 and no token balance change. Do not apply that opcode replacement as a production GSTD payout fix; its testnet/local-source claims are a different compatibility question.

These tests clone public code/data only. They do not spend the pool's 499 GSTD, treat it as platform backing, use a signing key or submit a mainnet transfer. Sandbox gas results are not a guarantee against future mainnet configuration changes. A funded end-to-end owner-signed payout remains a separate acceptance gate.

Read-only token verification: `npm run verify:token`. It checks the canonical master, frozen issuance, empty admin, wallet-code hash and derivation of the known pool wallet. It handles `addr_none` correctly; older SDK `getJettonData()` wrappers may throw on the empty admin. This command does not use a signing key or send transactions.
