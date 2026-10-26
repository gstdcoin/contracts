# GSTD Contracts — Development Guide

## Stack
- **Language**: Tact (TON blockchain)
- **Compiler**: `@tact-lang/compiler`, invoked directly (no Blueprint framework in this repo despite what earlier docs here said)
- **Tests**: `@ton/sandbox` (real TON contract emulator) + Jest, in `tests/*.spec.ts`

## Build
```bash
npm install
npm run build     # ./node_modules/.bin/tact --config tact.config.json → compiles all contracts to /build/
npx jest           # run contract tests (tests/*.spec.ts, real sandbox emulation, not mocks)
```

## Key contracts
| File | Purpose |
|------|---------|
| `GSTDJetton.tact` | GSTD token (Jetton) |
| `SettlementMaster.tact` | Task payment settlement (v2 adds quorum-attested P2P settlement) |
| `AgentRegistry.tact` | On-chain node/agent registry |
| `DAOVoting.tact` | Governance voting |

Contract sources live at the repo root (`*.tact`), not under `contracts/`.

## Deploy
No Blueprint `run` scripts here — deployment is via standalone TypeScript
scripts against `@ton/ton`, either mnemonic-signed or wallet-signed (TON
Connect, no mnemonic ever touches the script):
```bash
npm run deploy:testnet   # scripts/deploy-testnet.ts
npm run deploy:mainnet   # scripts/deploy-mainnet.ts (Phase 1: EcosystemTreasury, SettlementMaster, Escrow)
npx ts-node --project tsconfig.deploy.json scripts/deploy-settlement-v2.ts        # mnemonic-signed
npx ts-node --project tsconfig.deploy.json scripts/tonconnect-deploy-settlement-v2.ts  # wallet-signed, no mnemonic
```
After deploy: update `deployment-mainnet.json` and the address constants in
`gstdcoin/ai`'s `frontend/src/lib/config.ts`.

## CI
`ci.yml` installs the lockfile, audits all dependencies at high/critical severity, runs 21 Jest sandbox tests, then compiles all Tact projects. Use `npm test` locally.

The Zod and protobuf overrides were verified in an isolated copy: the compiler built 18 BOC artifacts with exactly the same SHA-256 hashes before and after the dependency update. Do not regenerate or overwrite an operator's uncommitted build files to repeat that comparison; use a clean copy.

## DO NOT
- Do not deploy to mainnet without testnet verification
- Do not commit wallet mnemonics or private keys
- Do not deploy new SettlementMaster contract messages without weighing that
  they have not had an external security audit (see docs/P2P_SETTLEMENT_RFC.md §7)
