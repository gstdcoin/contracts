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

Three Sandbox tests execute these exact encoded requests, including the metadata-bearing test token, the canonical token wallets, independent 85/10/5 recipients, a partial refund and mainnet rejection. This verifies payload preparation; it is not evidence that this v2 session was executed on the public Testnet. The historical v1 beta Testnet result does not verify v2.

On 2026-11-18 the live read-only preflight succeeded without an API key: raw configuration and the masterchain header both identified Testnet, using two TonAPI requests. No live v2 transfer was sent.
