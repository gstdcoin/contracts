# Escrow v2: free Testnet preparation

These commands use the valueless `tGSTD` asset and fixed TON Testnet RPC. They never load wallet private keys, sign a wallet message or call a broadcast endpoint. They do not deploy the legacy treasury/settlement stack and do not alter mainnet addresses.

Use Node.js 22 and npm 11.13.0:

```sh
npm ci
npm run build
npm run escrow:testnet:preflight
```

The preflight defaults to the fixed `testnet.tonapi.io` endpoint. It reads parameter 19 from the raw on-chain configuration and also verifies the masterchain header global ID `-3`. It uses chain time. Select the fixed Toncenter Testnet endpoint with `ESCROW_TESTNET_RPC_PROVIDER=toncenter`. `ESCROW_TESTNET_TONAPI_KEY` and `ESCROW_TESTNET_TONCENTER_API_KEY` are optional for their selected provider; no mainnet key is read. Requests are at least 1.1 seconds apart, time out, and retry 429/503 at most twice while respecting short Retry-After values. A rate limit does not switch providers silently.

Prepare four distinct wallet accounts in your wallet app on Testnet. Get free test coins using the official [TON Testgiver procedure](https://docs.ton.org/onboarding/wallet-apps/get-coins). Use public addresses marked as Testnet. Never paste a mnemonic into this tool, the compute worker or chat. Wallets still need to approve their own messages.

For a Windows operator without existing Testnet wallets, `escrow:testnet:wallets` creates four independent 24-word TON mnemonics and Wallet V5R1 accounts with wallet network ID `-3`. It requires PowerShell 7 (`pwsh.exe`) on PATH. Give it new paths outside every Git checkout, with existing parent directories:

```powershell
npm run escrow:testnet:wallets -- --vault C:/GSTD-local/testnet-private --public C:/GSTD-local/public-testnet-wallets.json
npm run escrow:testnet:wallets -- verify --vault C:/GSTD-local/testnet-private --public C:/GSTD-local/public-testnet-wallets.json
```

The tool restricts the vault directory to the current Windows user and SYSTEM before generating secrets. It saves the mnemonic bundle with Windows DPAPI `CurrentUser` encryption, never as plaintext, verifies the directory ACL, and derives all four addresses again from the encrypted bundle before reporting success. It preserves existing files, rejects vault paths inside Git repositories and mainnet configuration, and emits only public addresses. The public JSON is compatible with `escrow:testnet:prepare`. These commands make no network requests, signatures or broadcasts and do not initialize the accounts on chain.

Keep this encrypted vault and its Windows profile available: DPAPI recovery depends on the same Windows user/profile and machine. It is a local Testnet operator tool, not a portable wallet backup or a compute-node key store. Never use these test accounts for assets with real value. Do not upload the encrypted bundle to GitHub, CI or a worker. The ordinary preparation commands above continue to handle public data only.

Create a local JSON object with public `payer`, `worker`, `protocol` and `reserve` addresses. Then:

```sh
npm run escrow:testnet:prepare -- --wallets /path/to/public-wallets.json --out /path/to/new-session.json
npm run escrow:testnet:transaction -- --session /path/to/new-session.json --step mint --out /path/to/new-wallet-request.json
```

Output files must be new paths. The session contains public constructor inputs, compiled code hashes and message templates. Before signing each step, generate a fresh TonConnect `sendTransaction` request with `escrow:testnet:transaction`. It specifies network `-3`, the exact signing wallet, one message and a fresh `validUntil`. The tool regenerates payloads from validated inputs rather than trusting stored arbitrary messages. It rejects changed compiled code and a host clock more than five minutes from chain time. Send the request through your reviewed TonConnect client; these commands do not send it.

The successful-cycle order is `mint`, `success-sync`, `success-fund-0`, `success-fund-1`, `success-fund-2`, `success-accept`, then `success-claim-0`, `success-claim-1`, `success-claim-2`. The beneficiaries sign their own claims. Check funding mask 7 before acceptance and confirmed beneficiary balances after claims; submitting a request is not receipt verification. Query IDs correlate operations; they are not general idempotency keys. Check chain receipts before repeating an uncertain wallet request.

If the successful cycle takes longer than two minutes, prepare a fresh session before the refund experiment and mint the valueless test tokens for that session. Constructor deadlines cannot be extended by editing an already used session.

The partial-refund order is `refund-sync`, `refund-fund`, then, after the recorded refund deadline, `refund-expire` and `refund-claim`. Only the payer receives the refund. The session uses one 1-token success budget and one partial-refund scenario by default. Its token amount is capped at 100 test tokens per task.

`attachedBudgetsNanoTON` totals attached message values. It is not the consumed gas fee or an estimate of mainnet costs: change can return and contracts retain storage balances. Check available test-coin balances before each signature. Record real transaction hashes, successful traces, beneficiary/refund deltas and complete fee totals before claiming a live Testnet lifecycle.

Three Sandbox tests execute these exact encoded requests, including the metadata-bearing test token, the canonical token wallets, independent 85/10/5 recipients, a partial refund and mainnet rejection. A fourth test executes the whole plan through four independent, signed Wallet V5R1 accounts, verifies wallet sequence numbers, beneficiary balances, cleared transfer-pending flags, expiry and the payer refund. Test keys exist only in the test process. The historical v1 beta result remains separate from v2.

## Public Testnet result, 2026-11-18

The v2 lifecycle was executed on the public TON Testnet using four fresh Wallet V5R1 accounts with separate keys. These are separate signing accounts under one local operator, not an independent-custodian security audit. Keys stayed in a Windows DPAPI vault outside Git; no production worker, CI job or repository received them. The official Acton faucet supplied four free test coins in two accepted guest claims; its limits were respected. No assets with real value were spent.

The accepted task had funding mask `7` and final state `1`. Beneficiaries received exactly `850000000`, `100000000` and `50000000` nano-tGSTD (85/10/5 of one test token). Every beneficiary remaining entitlement and transfer-pending flag was zero. A separate task received `425000000` nano-tGSTD before its deadline. Payer balance became zero after that funding; after expiry, task state was `2` and payer received the full `425000000` refund. The refund used the unspent test tokens from the successful session, with a newly prepared deadline.

[Public evidence](evidence/escrow-v2-testnet-20261118.json) records the task/master/actor addresses, all 13 wallet-request transaction hashes, confirmed balances and fee totals. Those requests produced 80 account transactions. The sum of their `total_fees` was `71969367` nanoTON (`0.071969367` Testnet TON), and compute used 616263 gas units. This includes minting and both escrow cycles; it excludes initial wallet activation, native-coin gas top-ups and faucet transfers. It is an observation under Testnet configuration, not a mainnet gas quote.

Read-only inspection also matched the active on-chain code hashes of all 17 involved accounts to the compiled master, two tasks, six shares, four canonical token wallets and four signing wallets. The public evidence records each address and verified code hash.

Four one-nanoton TEP-74 notifications to ordinary signing wallets had `cskip_no_gas`, matching the signed-wallet Sandbox test. These ancillary notifications could not execute. The token credits and canonical excess acknowledgements completed, as verified by token balances and cleared pending flags. No failure in a share, coordinator or canonical token wallet was accepted as success. Consumers must verify confirmed token-wallet state rather than assuming that a wallet notification executed.

Preparation tools still do not sign or broadcast. For this operator run, a local signing harness regenerated each request from the validated session, verified network configuration `-3` and chain time, matched all four actors to the encrypted local vault, checked available test gas, submitted each signed wallet request once, and saved a journal before submission. Each next step waited for a complete transaction trace; an uncertain request was not automatically re-signed. Mainnet activation and the platform production rollout remain separate release checks.
