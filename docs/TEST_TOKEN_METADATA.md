# Valueless test token metadata

`TestGstdMasterV2.tact` adds immutable on-chain TEP-64 metadata to the canonical-wallet test asset. It preserves the same testnet-only constructor guard, pinned canonical wallet code, maximum 1000-token mint per request and transfer semantics. It does not modify the production GSTD token or any deployed contract.

The legacy `TestGstdMaster.tact` returns an empty content cell. That remains unchanged so old task derivation, recovery files and on-chain addresses remain valid. V2 has a different code hash and master address; it is an explicit new test asset, not a balance migration or upgrade of legacy test tokens.

The metadata cell uses prefix 0, a SHA-256-keyed dictionary and prefix-0 Snake values for name, symbol, decimals and description. Its human-readable source is `tests/fixtures/test-token-metadata.json`. The sandbox test decodes the actual getter against every fixture field, then mints and settles a 1-token 85/10/5 escrow through the real canonical token wallets. A separate test confirms mainnet rejection. Metadata is stored on-chain, requiring no metadata hosting or extra HTTP service.

References:

- [TEP-64 Token Data Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0064-token-data-standard.md)
- [My Wallet/Gram engine token metadata parser](https://github.com/mytonwallet-org/mytonwallet/blob/3256dc1bcf040634b055da76b892846e36f59737/src/api/chains/ton/util/metadata.ts): its metadata loader rejects content with fewer than eight bits. This supports the compatibility fix; it does not establish that metadata was the sole cause of a particular mobile wallet error.

The platform records the test asset version in new drafts. A missing version continues to select legacy V1. Exported legacy bindings and code hashes must remain byte-identical when adding V2. No pending deposit or withdrawal is automatically cleared, retried or rebound to V2.
