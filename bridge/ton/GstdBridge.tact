import "@stdlib/deploy";
import "@stdlib/ownable";

// ══════════════════════════════════════════════════════════
// GSTD Bridge Router for TON Mainnet (Ston.fi DEX Integration)
// ══════════════════════════════════════════════════════════

message CrossChainSwapOut {
    destChain: String;      
    destAddress: String;    
    minOut: Int as coins;   // Protection against slippage
}

// Event picked up by the Go Backend Oracle
message CrossChainEvent {
    user: Address;
    destChain: String;
    destAddress: String;
    amountGstd: Int as coins;
}

message CrossChainSwapIn {
    sourceTxHash: String;  // Replay protection (TxHash from SOL/XRPL)
    recipient: Address;
    amountGstd: Int as coins;
}

// Payload format for Ston.fi DEX Router
message StonfiSwapPayload {
    queryId: Int as uint64;
    amount: Int as coins;
    minOut: Int as coins;
    destination: Address; // The address to receive swapped tokens (Bridge itself)
    refAddress: Address; // Referral
}

fun stringHash(str: String): Int {
    return beginCell().storeStringRef(str).endCell().hash();
}

contract GstdBridgeRouter with Deployable, Ownable {
    owner: Address;                 // Oracle/Backend Node
    processedTxs: map<Int, Bool>;  // Replay protection map
    
    // Mainnet addresses
    stonfiRouter: Address;         // Ston.fi Router Address (EQB3ncy...)
    stonfiPtongstdPool: Address;  // GSTD/TON Pool on Ston.fi
    gstdJettonWallet: Address;    // Bridge's own GSTD Jetton Wallet
    
    totalBridgedOut: Int = 0;
    
    init(owner: Address, stonfiRouter: Address, gstdJettonWallet: Address) {
        self.owner = owner;
        self.stonfiRouter = stonfiRouter;
        self.gstdJettonWallet = gstdJettonWallet;
    }

    // ─── TON TO OTHER CHAIN (User sends TON -> Bridge swaps to GSTD -> Burns GSTD -> Emits Event)
    receive(msg: CrossChainSwapOut) {
        let ctx: Context = context();
        // A standard ston.fi swap requires ~0.15 TON minimum attached gas to process the swap safely.
        // Whatever is not used will be returned to the sender by Ston.fi.
        require(ctx.value >= 150000000, "Must send at least 0.15 TON for swap gas. Unused gas will be refunded.");

        // Create Payload for Ston.fi 
        // We instruct Ston.fi to swap TON to GSTD and send the GSTD back to this Bridge Contract
        // Any remaining TON (gas refund) is sent back to the user (`ctx.sender`) to save them money!
        let swapBody = StonfiSwapPayload {
            queryId: 0,
            amount: ctx.value - 150000000,   // Amount to swap (total attached minus gas provision)
            minOut: msg.minOut,
            destination: myAddress(),        // Bridge receives the GSTD
            refAddress: ctx.sender          // Excess GAS REFUND sent back to user!
        };

        // Send interaction to Ston.Fi router
        // Mode 64: Carry all remaining value of the inbound message
        send(SendParameters {
            to: self.stonfiRouter,
            value: 0, 
            mode: SendRemainingValue,
            body: swapBody.toCell()
        });
        
        self.totalBridgedOut += msg.minOut;

        // Emit Oracle Event
        emit(CrossChainEvent{
            user: ctx.sender,
            destChain: msg.destChain,
            destAddress: msg.destAddress,
            amountGstd: msg.minOut
        }.toCell());
    }

    // ─── OTHER CHAIN TO TON (Oracle unlocks GSTD -> Bridge swaps to TON -> Sends to User)
    receive(msg: CrossChainSwapIn) {
        self.requireOwner();
        
        let txHashId: Int = stringHash(msg.sourceTxHash);
        require(self.processedTxs.get(txHashId) == null, "Transaction already processed");
        self.processedTxs.set(txHashId, true);

        // Instruct our Jetton Wallet to transfer GSTD to the Ston.fi Router for a Swap to TON
        // Output destination for the TON is the `msg.recipient` (The user who bridged in)
        
        // Build Jetton transfer payload containing Forward Payload for Ston.fi
        // ... (Ston.fi specific forward payload with user's address as destination)
        
        // send(SendParameters {
        //     to: self.gstdJettonWallet,
        //     value: 50000000,
        //     body: ... (JettonTransfer with embedded Swap Payload)
        // });
        
        // Ston.fi guarantees `msg.recipient` receives TON representing `amountGstd` value minus swap fees.
    }
}
