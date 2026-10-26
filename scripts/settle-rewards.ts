/**
 * Retired legacy settlement sender.
 * It did not reserve claims or verify final Jetton receipts, and retrying with
 * fresh task IDs could repeat a payment. The platform now uses backed v2
 * internal credits with a single 85/10/5 split and no claim fee.
 *
 * This command deliberately exits before loading any mnemonic or contacting
 * mainnet. On-chain withdrawals require a separately verified implementation.
 */
throw new Error('Legacy settlement sender disabled: use the v2 platform ledger. Mainnet withdrawals are not enabled.');
export {};
