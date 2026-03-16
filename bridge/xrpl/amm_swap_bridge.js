/**
 * ══════════════════════════════════════════════════════════
 * GSTD Bridge Scripts for XRPL Mainnet (AMM Integration)
 * ══════════════════════════════════════════════════════════
 * 
 * The XRPL functions differently from TON/Solana. It does not use 
 * Turing-complete Smart Contracts. Instead, it relies on protocol-level 
 * features:
 * - XLS-30d: Native AMM (Automated Market Maker)
 * - Escrow / TrustLines / Cross-Currency Payments
 * 
 * To bridge OUT of XRPL (XRPL -> Other Chain):
 * User signs a Cross-Currency Payment transaction swapping XRP for GSTD 
 * natively on the XRPL AMM and designating the GSTD Bridge Account as the destination.
 * 
 * To bridge INTO XRPL (Other Chain -> XRPL):
 * The Bridge Oracle signs an XRPL Payment that swaps the locked GSTD back to XRP 
 * natively on the XRPL AMM and delivers XRP to the user's XRPL address.
 */

const { Client, Wallet, xrpToDrops } = require('xrpl');

class XRPLGstdBridge {
    constructor(rpcUrl, oracleSeed, gstdIssuer) {
        this.client = new Client(rpcUrl);
        this.oracleWallet = Wallet.fromSeed(oracleSeed);
        this.gstdIssuer = gstdIssuer; // The account that issued GSTD on XRPL
    }

    async connect() {
        await this.client.connect();
    }

    async disconnect() {
        await this.client.disconnect();
    }

    /**
     * ─── OTHER CHAIN TO XRPL (Oracle unlocks GSTD -> Bridge swaps to XRP -> Sends to User)
     * 
     * The Oracle creates a native XRPL Cross-Currency Payment.
     * Pathfinding will automatically route it through the GSTD/XRP AMM pool.
     */
    async executeCrossChainSwapIn(userAddress, amountGstd, sourceTxHash) {
        // 1. In a production scenario, you would first check a database or use 
        // a "memo" field check to prevent Replay Attacks for `sourceTxHash`.

        console.log(`[XRPL Bridge] Fulfilling cross-chain swap from ${sourceTxHash} to ${userAddress}`);

        const paymentTx = {
            TransactionType: "Payment",
            Account: this.oracleWallet.address,
            Destination: userAddress,
            // To ensure minimal fees and execution despite small AMM slippage,
            // we use the tfPartialPayment flag (131072). This allows the payment to succeed 
            // even if a slightly lower amount resolves due to AMM curve dynamics.
            Flags: 131072, 
            Amount: {
                currency: "GSTD", // Currency Code (Hex or 3-char)
                value: amountGstd.toString(),
                issuer: this.gstdIssuer
            },
            SendMax: {
                currency: "GSTD",
                value: amountGstd.toString(),
                issuer: this.gstdIssuer
            },
            Memos: [
                {
                    Memo: {
                        MemoData: Buffer.from(sourceTxHash).toString('hex'),
                        MemoFormat: Buffer.from("text/plain").toString('hex'),
                        MemoType: Buffer.from("bridge_source_tx").toString('hex')
                    }
                }
            ]
        };

        // 2. Submit payment to the XRPL Ledger
        // autofill() automatically calculates the lowest possible network Fee (~12-15 drops = 0.000015 XRP)
        const prepared = await this.client.autofill(paymentTx);
        const signed = this.oracleWallet.sign(prepared);
        const result = await this.client.submitAndWait(signed.tx_blob);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log(`[XRPL Bridge] ✅ Successfully released GSTD/XRP to ${userAddress}. Hash: ${result.result.hash}`);
            return result.result.hash;
        } else {
            throw new Error(`XRPL Payment failed: ${result.result.meta.TransactionResult}`);
        }
    }

    /**
     * ─── XRPL TO OTHER CHAIN (User sends XRP -> Bridge swaps to GSTD -> Emits Event)
     * 
     * Users execute this on their end. The Go Backend Oracle listens for it.
     */
    async listenForCrossChainSwapOut(callback) {
        this.client.request({
            command: "subscribe",
            accounts: [this.oracleWallet.address]
        });

        this.client.on("transaction", (tx) => {
            if (tx.transaction.TransactionType === "Payment" && tx.transaction.Destination === this.oracleWallet.address) {
                // A user has transferred XRP or GSTD to the Bridge account!
                const destChainHex = tx.transaction.Memos?.find(m => Buffer.from(m.Memo.MemoType, 'hex').toString() === "dest_chain")?.Memo.MemoData;
                const destAddressHex = tx.transaction.Memos?.find(m => Buffer.from(m.Memo.MemoType, 'hex').toString() === "dest_address")?.Memo.MemoData;
                
                if (destChainHex && destAddressHex) {
                    const destChain = Buffer.from(destChainHex, 'hex').toString();
                    const destAddress = Buffer.from(destAddressHex, 'hex').toString();
                    
                    console.log(`[XRPL Event] Bridge Swap Out Detected: ${destChain} -> ${destAddress}`);
                    
                    // The backend invokes the cross-chain logic
                    callback({
                        user: tx.transaction.Account,
                        destChain,
                        destAddress,
                        amountRaw: tx.transaction.Amount,
                        txHash: tx.transaction.hash
                    });
                }
            }
        });
        console.log(`[XRPL Bridge Listener] Listening for inbound swaps to ${this.oracleWallet.address}...`);
    }
}

module.exports = XRPLGstdBridge;
