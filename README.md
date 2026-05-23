# GSTD Smart Contracts

> The on-chain backbone of the GSTD decentralized compute network.  
> Built on TON blockchain in [Tact](https://tact-lang.org) — compiled, auditable, unstoppable.

---

## What is GSTD?

GSTD is an open-source decentralized network where anyone can run a node, earn tokens, and own a piece of the AI + blockchain infrastructure of the future. No central servers. No gatekeepers. The protocol is governed entirely by GSTD token holders.

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
             (node)  (gold)  (GSTD←DEX)
                        │
                        ▼
               ┌─────────────────┐
               │  TreasuryGold   │  ← accumulates, backs GSTD
               └─────────────────┘

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
| **TreasuryGold** | `TreasuryGold.tact` | Accumulates 10% of revenue, backs GSTD with real assets |

### Governance

| Contract | File | Description |
|---|---|---|
| **DAOVoting** | `DAOVoting.tact` | Token-weighted DAO, 10% quorum, 48h timelock on all changes |
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

### GSTD as the Base Routing Asset

Every payment made to use the network (AI inference, RPC endpoints, compute jobs) is routed through `SettlementRouter`, which swaps it to GSTD on-chain before settling. This means:

- **Every service use creates buy pressure on GSTD**
- No dependency on manual buybacks — it is structural and automatic
- Users can pay in any asset (TON, USDT, SOL, XRP); GSTD absorbs it all

### Revenue Split

```
User pays 1 TON for AI inference
         │
         ├── 85% (0.85 TON) → Node operator (immediate payment)
         ├── 10% (0.10 TON) → TreasuryGold (gold reserve)
         └──  5% (0.05 TON) → Buy GSTD on DEX → BURN
```

### NaaS Staking Tiers

| Tier | Stake | Chains | Reward multiplier |
|---|---|---|---|
| Explorer | 1,000 GSTD | 3 chains | 1× |
| Provider | 10,000 GSTD | 10 chains | 1.5× |
| Validator | 50,000 GSTD | 25 chains | 2× |
| Sovereign | 500,000 GSTD | 50+ chains | 3× |

Higher tiers also increase governance voting weight and receive priority task routing.

### Slashing (NaaS)

| Condition | Slash | Note |
|---|---|---|
| Downtime > 10 min | 0.1% of stake | Auto-detected |
| Downtime > 1 hour | 1.0% of stake | Auto-detected |
| Wrong RPC response | 2.0% of stake | 10% goes to challenger, 90% burned |
| Downtime > 24 hours | 5.0% + tier downgrade | — |
| Proven fraud | 100% (jailed) | — |

### Governance

- **Minimum proposal stake:** 10,000 GSTD
- **Quorum:** 10% of staked supply must vote
- **Timelock:** 48 hours between passing and execution
- **What DAO controls:** Revenue split percentages, base rates, contract addresses, slash parameters, new feature activation
- **What DAO cannot do:** Take funds from workers, freeze individual wallets

---

## Deployed Contracts (TON Mainnet)

| Contract | Address |
|---|---|
| GSTDJetton | `EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO` |
| AgentRegistry | `EQDtWcGCQXLFdh7TmkL5QFbFNYXxL9mjOk4ehmsNFwCtsDoT` |
| DAOVoting | `EQBa-hyO3JkcRJNyYKKOqBjsQ6KAS-dAHj6rf8KOuH4Jzls5` |
| Escrow | `EQCucUHZGCr8KwBalmumsITvtMBtc5ZylAfw7sJk5SXpBWVh` |

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

```bash
node scripts/deploy-mainnet.js
```

---

## Ecosystem

| Repo | Description |
|---|---|
| [gstdcoin/web](https://github.com/gstdcoin/web) | Landing page |
| [gstdcoin/ai](https://github.com/gstdcoin/ai) | Dashboard + Vercel serverless API |
| [gstdcoin/gstdbot](https://github.com/gstdcoin/gstdbot) | Node OS software |
| [gstdcoin/gstd-bridge](https://github.com/gstdcoin/gstd-bridge) | Cross-chain bridge validators |
| **gstdcoin/contracts** | **Smart contracts (this repo)** |

---

## License

MIT — free to use, fork, and deploy. The contracts are yours as much as ours.
