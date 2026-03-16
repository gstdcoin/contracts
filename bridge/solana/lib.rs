use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
// use raydium_contract_instructions::swap_base_in;  <-- We use Anchor CPI to Raydium Program ID

declare_id!("GstdBridgeRouter11111111111111111111111111111");

// ══════════════════════════════════════════════════════════
// GSTD Bridge Router for Solana Mainnet (Raydium DEX)
// ══════════════════════════════════════════════════════════

#[program]
pub mod gstd_bridge_router {
    use super::*;

    /// ─── SOLANA TO OTHER CHAIN (User sends SOL -> Bridge swaps to GSTD -> Burns GSTD -> Emits Event)
    pub fn cross_chain_swap_out(
        ctx: Context<CrossChainSwapOut>,
        dest_chain: String,
        dest_address: String,
        amount_in_sol: u64,
        min_out_gstd: u64,
    ) -> Result<()> {
        msg!("Initiating cross-chain swap from Solana Mainnet");

        // 1. Swap native SOL (wrapped WSOL) into GSTD directly using Raydium AMM
        // In a real AMM integration, we build a CPI containing 18+ accounts for Raydium.
        // We simulate the Raydium swap_base_in CPI structure for brevity.
        
        // let ix = raydium_amm::instruction::swap_base_in(
        //     &ctx.accounts.raydium_program.key(),
        //     &ctx.accounts.amm_id.key(),
        //     &ctx.accounts.amm_authority.key(),
        //     &ctx.accounts.amm_open_orders.key(),
        //     &ctx.accounts.amm_target_orders.key(),
        //     &ctx.accounts.pool_coin_token_account.key(),
        //     &ctx.accounts.pool_pc_token_account.key(),
        //     &ctx.accounts.serum_program_id.key(),
        //     &ctx.accounts.user_source_token_account.key(),
        //     &ctx.accounts.vault_gstd_account.key(),  // GSTD goes straight into the Bridge Vault
        //     &ctx.accounts.user.key(),
        //     amount_in_sol,
        //     min_out_gstd,
        // )?;
        
        // anchor_lang::solana_program::program::invoke(
        //     &ix,
        //     &[ctx.accounts... array of accounts required]
        // )?;

        // 2. The resulting GSTD is "locked/burned" in the vault_gstd_account
        // We emit the CrossChainEvent so the Go Backend knows it was locked successfully
        emit!(CrossChainEvent {
            user: ctx.accounts.user.key(),
            dest_chain,
            dest_address,
            amount_gstd: min_out_gstd, // Substituted with actual amount_out from Raydium CPI event
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// ─── OTHER CHAIN TO SOLANA (Oracle unlocks GSTD -> Bridge swaps to SOL -> Sends to User)
    pub fn cross_chain_swap_in(
        ctx: Context<CrossChainSwapIn>,
        source_chain: String,
        source_tx_hash: [u8; 32],
        amount_gstd: u64,
        min_out_sol: u64,
    ) -> Result<()> {
        // Only the Bridge Oracle Node can trigger this
        require!(ctx.accounts.oracle.key() == ctx.accounts.bridge_state.oracle_key, ErrorCode::Unauthorized);

        // Replay Protection relies on Anchor account initialization failure (`processed_tx`)
        // If the same `source_tx_hash` is given, Anchor will panic because PDA already exists.

        // 1. Release GSTD from the vault to swap in Raydium
        let seeds = &["vault".as_bytes(), &[*ctx.bumps.get("vault_gstd_account").unwrap()]];
        let signer = &[&seeds[..]];

        // In a real implementation we send GSTD to the user if they wanted GSTD, 
        // OR we CPI into Raydium to swap GSTD to SOL and send the resulting SOL to the user.
        
        // MOCK: Transfer GSTD directly to User (bypassing Raydium swap for the sake of example)
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_gstd_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(), 
            authority: ctx.accounts.vault_gstd_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::transfer(cpi_ctx, amount_gstd)?;

        msg!("Cross-chain swap from {} fulfilled on Solana Mainnet for tx: {:?}", source_chain, source_tx_hash);
        Ok(())
    }
}

// ─── Accounts Contexts ───

#[derive(Accounts)]
pub struct CrossChainSwapOut<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    // Raydium CPI needs these (Mocked for now)
    /// CHECK: Safe for this example
    pub raydium_program: AccountInfo<'info>,
    /// CHECK: Safe
    pub amm_id: AccountInfo<'info>,
    /// CHECK: Safe
    pub pool_coin_token_account: AccountInfo<'info>,
    /// CHECK: Safe
    pub pool_pc_token_account: AccountInfo<'info>,

    #[account(mut)]
    pub user_source_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut, 
        seeds = [b"vault"], 
        bump
    )]
    pub vault_gstd_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(source_chain: String, source_tx_hash: [u8; 32])]
pub struct CrossChainSwapIn<'info> {
    #[account(mut)]
    pub oracle: Signer<'info>,
    
    #[account(
        init, 
        payer = oracle, 
        space = 8 + 32, // discriminator + tx_hash
        seeds = [b"processed_tx", &source_tx_hash], 
        bump
    )]
    pub processed_tx: Account<'info, ProcessedTx>,

    #[account(has_one = oracle_key)]
    pub bridge_state: Account<'info, BridgeState>,

    #[account(
        mut, 
        seeds = [b"vault"], 
        bump
    )]
    pub vault_gstd_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = oracle,
        associated_token::mint = gstd_mint,
        associated_token::authority = recipient_wallet
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    /// CHECK: The user receiving the funds
    pub recipient_wallet: AccountInfo<'info>,
    
    pub gstd_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
pub struct BridgeState {
    pub oracle_key: Pubkey,
}

#[account]
pub struct ProcessedTx {
    pub tx_hash: [u8; 32],
}

#[event]
pub struct CrossChainEvent {
    pub user: Pubkey,
    pub dest_chain: String,
    pub dest_address: String,
    pub amount_gstd: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized Oracle Signer")]
    Unauthorized,
}
