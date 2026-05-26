# GSTD Contracts — Development Guide

## Stack
- **Language**: Tact (TON blockchain)
- **Compiler**: `@tact-lang/compiler`
- **Tests**: `@tact-lang/ton-jest` (Blueprint framework)

## Build
```bash
npm install
npx blueprint build        # compile all contracts → /build/
npx blueprint test         # run contract tests
```

## Key contracts
| File | Purpose |
|------|---------|
| `contracts/GSTDJetton.tact` | GSTD token (Jetton) |
| `contracts/SettlementMaster.tact` | Task payment settlement |
| `contracts/AgentRegistry.tact` | On-chain node/agent registry |
| `contracts/DAOVoting.tact` | Governance voting |

## Deploy (after building)
```bash
npx blueprint run deployGSTDJetton --testnet    # testnet first
npx blueprint run deployGSTDJetton --mainnet    # then mainnet
```
After deploy: copy contract addresses to Vercel env vars in gstdcoin/ai.

## CI
`ci.yml` runs `tact --check` on every push. Tests are run with `npx blueprint test`.

## DO NOT
- Do not deploy to mainnet without testnet verification
- Do not commit wallet mnemonics or private keys
