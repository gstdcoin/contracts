# GSTD TON contracts

TON smart-contract sources, deployment records and sandbox tests for the GSTD compute project. These contracts have not received an independent security audit. Source availability does not mean a contract is deployed, connected to platform payments or safe to fund.

## What is used today

- The existing [canonical GSTD Jetton](https://tonviewer.com/EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO) has 1 billion issued tokens and disabled minting. `GSTDJetton.tact` here is **not** the deployed master's source and must not be used to create a replacement emission.
- Accepted paid compute is accounted for by the [platform money ledger](https://github.com/gstdcoin/ai/blob/main/docs/FINANCE_V2.md): **85% executor / 10% protocol / 5% reserve**. The reserve is not a token burn. Free or promotional requests do not create withdrawable GSTD, and presence alone earns nothing.
- [Blockchain withdrawals](https://github.com/gstdcoin/ai/blob/main/docs/WITHDRAWALS_AND_PRIVACY.md) use custody-owner-signed standard Jetton transfers. They do not use a legacy Settlement/Escrow sender. `scripts/settle-rewards.ts` is deliberately disabled to prevent duplicate or unverified payouts.
- A funded end-to-end deposit, accepted job and owner-signed mainnet withdrawal remains an acceptance gate. Sandbox tests do not prove that cycle or establish platform backing.

## Source and deployment status

Public addresses and historical deployment records are in [deployment-mainnet.json](deployment-mainnet.json). An active account with code is not proof that it matches the current source or participates in production payments.

| Component | Current boundary |
|---|---|
| Canonical GSTD token | Existing frozen Jetton; this repo does not replace its master |
| EcosystemTreasury | Matched the reviewed build in the October 2026 check; owner-controlled; not automatic task settlement |
| SettlementMaster / deployed V2 and Escrow | Current compiled source did not match the checked deployed code; no verified production task-settlement integration |
| AgentRegistry / DAOVoting | Legacy deployment records exist; the legacy DAO has a known quorum limitation |
| AgentRegistryV2 / DAOVotingV2 | Source and tests; not a claim of deployed governance |
| SettlementRouter, SovereignVault, ProviderRegistry, SlashMechanics | Design/research sources, outside the current compute payment path |
| Bridge | [Deferred research](https://github.com/gstdcoin/gstd-bridge), not a usable transfer service |

Nothing here establishes automatic swaps from arbitrary currencies, automatic buybacks/burns, NaaS staking yields or permissionless control of the custody wallet. A new contract deployment needs separate review, testnet acceptance and the owner's wallet signature.

## Local development and read-only verification

```bash
npm ci
npm run build
npm test
npm run verify:token
```

`build` compiles Tact sources locally; it does not deploy them. `verify:token` uses public network reads to check the canonical master, fixed issuance, empty admin, wallet-code hash and address derivation. `npm run verify` performs additional read-only account/code checks, not a full behavioral audit. Do not treat a successful getter or build as proof of payouts.

[Canonical transfer tests](tests/CanonicalJettonWallet.spec.ts) and the [public wallet fixture](tests/fixtures/canonical-gstd-wallet.json) exercise the platform's standard TEP-74 transfer payload (`0x0f8a7ea5`) in an isolated TON sandbox. The internal receipt is `0x178d4519`; the unrelated `0x558e297b` header was rejected by the canonical wallet. These checks do not use private keys, send a mainnet transfer or treat the legacy pool's token balance as platform collateral. Gas assumptions still require real-chain acceptance.

## Documentation

- [Historical README and obsolete architecture](docs/ARCHIVED_CONTRACTS_README.md) — retained for provenance, not operating instructions.
- [P2P settlement proposal](docs/P2P_SETTLEMENT_RFC.md) — a proposal, not an enabled payment mechanism.
- [Platform and API](https://github.com/gstdcoin/ai) · [Compute node](https://github.com/gstdcoin/gstdbot) · [Public website](https://gstdtoken.com).

## License

[PolyForm Noncommercial License 1.0.0](LICENSE) with an additional permission for participation in the GSTD network. Commercial use by companies requires a separate license. This is source-available, not an OSI open-source license; earlier MIT releases retain their original license.
