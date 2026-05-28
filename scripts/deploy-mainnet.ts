/**
 * GSTD Phase 1 Mainnet Deployment
 *
 * Deploys ONLY the Phase 1 contracts (token + settlement + escrow).
 * DAOVoting, AgentRegistry, Bridge are Phase 2/3 — not deployed here.
 *
 * Deploy order:
 *   1. GSTDJetton        — the GSTD token (TEP-74)
 *   2. TreasuryGold      — collects 10% fee (DEX swap is manual Phase 1)
 *   3. SettlementMaster  — 85/10/5 task payment split + GSTD minting
 *   4. Escrow            — task payment escrow for node operators
 *
 * Post-deploy wiring:
 *   - SetMintAuthority: GSTDJetton ← SettlementMaster (ONE-TIME, irreversible)
 *   - SetGateway: SettlementMaster ← GATEWAY_ADDRESS (your orchestrator)
 *   - MintInitialAllocation: team/ecosystem/liquidity wallets
 *
 * Usage:
 *   cp .env.example .env    # fill all values
 *   npm run build           # compile contracts first
 *   npx ts-node scripts/deploy-mainnet.ts
 */

import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { Address, beginCell, Cell, contractAddress, toNano, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { GSTDJetton }       from '../build/GSTDJetton/GSTDJetton_GSTDJetton';
import { SettlementMaster } from '../build/SettlementMaster/SettlementMaster_SettlementMaster';
import { TreasuryGold }     from '../build/TreasuryGold/TreasuryGold_TreasuryGold';
import { Escrow }           from '../build/EscrowComplete/EscrowComplete_Escrow';

const NETWORK      = process.env.TON_NETWORK || '';
const MNEMONIC     = process.env.DEPLOYER_MNEMONIC || '';
const ADMIN_WALLET = process.env.ADMIN_WALLET || '';
const GATEWAY_ADDR = process.env.GATEWAY_ADDRESS || '';  // orchestrator (gstdbot backend)

// Allocation wallets (set in .env)
const TEAM_WALLET      = process.env.TEAM_WALLET      || '';
const ECOSYSTEM_WALLET = process.env.ECOSYSTEM_WALLET || '';
const LIQUIDITY_WALLET = process.env.LIQUIDITY_WALLET || '';

// Allocation amounts (GSTD, human-readable — script converts to nanoGSTD)
const TEAM_AMOUNT      = BigInt(process.env.TEAM_AMOUNT      || '100000000');  // 100M
const ECOSYSTEM_AMOUNT = BigInt(process.env.ECOSYSTEM_AMOUNT || '200000000');  // 200M
const LIQUIDITY_AMOUNT = BigInt(process.env.LIQUIDITY_AMOUNT || '100000000');  // 100M

const NANO = BigInt('1000000000');

const ENDPOINTS: Record<string, string> = {
    mainnet: 'https://toncenter.com/api/v2/jsonRPC',
    testnet: 'https://testnet.toncenter.com/api/v2/jsonRPC',
};

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function waitSeqno(wallet: any, seqno: number) {
    for (let i = 0; i < 40; i++) {
        await sleep(3000);
        const cur = await wallet.getSeqno();
        if (cur > seqno) return;
    }
    throw new Error('Transaction not confirmed after 120s');
}

function confirm(question: string): Promise<boolean> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(`${question} (yes/no): `, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

function buildMetadataCell(): Cell {
    return beginCell()
        .storeUint(0, 8)
        .storeStringTail(JSON.stringify({
            name:        'GSTD Token',
            description: 'AI Compute Network Governance & Utility Token',
            symbol:      'GSTD',
            decimals:    '9',
            image:       'https://app.gstdtoken.com/gstd-logo.png',
        }))
        .endCell();
}

async function main() {
    // ── Pre-flight checks ─────────────────────────────────────────────────
    if (NETWORK !== 'mainnet') {
        console.error('❌ TON_NETWORK must be "mainnet". Currently:', NETWORK || '(not set)');
        console.error('   For testnet use: npx ts-node scripts/deploy-testnet.ts');
        process.exit(1);
    }
    const missing = ['DEPLOYER_MNEMONIC', 'ADMIN_WALLET', 'GATEWAY_ADDRESS',
                     'TEAM_WALLET', 'ECOSYSTEM_WALLET', 'LIQUIDITY_WALLET']
        .filter(k => !process.env[k]);
    if (missing.length) {
        console.error('❌ Missing env vars:', missing.join(', '));
        console.error('   Copy .env.example → .env and fill all values');
        process.exit(1);
    }

    const adminAddr   = Address.parse(ADMIN_WALLET);
    const gatewayAddr = Address.parse(GATEWAY_ADDR);

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   GSTD Phase 1 — MAINNET DEPLOYMENT                 ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Admin wallet : ${ADMIN_WALLET.slice(0,20)}...`);
    console.log(`║  Gateway      : ${GATEWAY_ADDR.slice(0,20)}...`);
    console.log(`║  Allocations  : Team ${TEAM_AMOUNT}M / Eco ${ECOSYSTEM_AMOUNT}M / Liq ${LIQUIDITY_AMOUNT}M GSTD`);
    console.log('║  Contracts    : GSTDJetton, TreasuryGold, Settlement, Escrow');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log('⚠️  WARNING: This deploys to TON MAINNET with real funds.');
    console.log('   SetMintAuthority is IRREVERSIBLE after this script completes.\n');

    const ok = await confirm('Have you verified the testnet deployment and are ready for mainnet?');
    if (!ok) { console.log('Aborted.'); process.exit(0); }

    // ── Connect ───────────────────────────────────────────────────────────
    const client   = new TonClient({ endpoint: ENDPOINTS.mainnet, apiKey: process.env.TON_API_KEY });
    const keyPair  = await mnemonicToPrivateKey(MNEMONIC.split(' '));
    const wallet   = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
    const provider = client.open(wallet);

    const deployer = wallet.address;
    console.log(`\nDeployer: ${deployer.toString()}`);
    const balance = await client.getBalance(deployer);
    console.log(`Balance: ${Number(balance) / 1e9} TON`);

    if (Number(balance) < toNano('5')) {
        console.error('❌ Insufficient balance. Need ≥ 5 TON for gas.');
        process.exit(1);
    }

    let seqno = await provider.getSeqno();
    const deployed: Record<string, string> = {};

    // ── 1. GSTDJetton ─────────────────────────────────────────────────────
    console.log('\n1️⃣  Deploying GSTDJetton...');
    const jettonInit = await GSTDJetton.init(adminAddr, buildMetadataCell());
    const jettonAddr = contractAddress(0, jettonInit);
    deployed.GSTDJetton = jettonAddr.toString();

    if (!(await client.isContractDeployed(jettonAddr))) {
        const jetton = client.open(new GSTDJetton(jettonAddr, jettonInit));
        await jetton.send(provider.sender(keyPair.secretKey), { value: toNano('0.5') }, {
            $$type: 'Deploy', queryId: BigInt(Date.now()),
        });
        await waitSeqno(provider, seqno++);
        console.log(`   ✅ GSTDJetton: ${jettonAddr}`);
    } else {
        console.log(`   ✓  Already deployed: ${jettonAddr}`);
    }

    // ── 2. TreasuryGold ───────────────────────────────────────────────────
    console.log('\n2️⃣  Deploying TreasuryGold (Phase 1: manual gold conversion)...');
    // Phase 1: DEX router = zero address, gold conversion is manual by admin
    const ZERO_ADDR = Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
    const XAUT_ADDR = process.env.XAUT_JETTON_MASTER
        ? Address.parse(process.env.XAUT_JETTON_MASTER)
        : ZERO_ADDR;

    const treasuryInit = await TreasuryGold.init(adminAddr, XAUT_ADDR, ZERO_ADDR);
    const treasuryAddr = contractAddress(0, treasuryInit);
    deployed.TreasuryGold = treasuryAddr.toString();

    if (!(await client.isContractDeployed(treasuryAddr))) {
        const treasury = client.open(new TreasuryGold(treasuryAddr, treasuryInit));
        await treasury.send(provider.sender(keyPair.secretKey), { value: toNano('0.3') }, {
            $$type: 'Deploy', queryId: BigInt(Date.now()),
        });
        await waitSeqno(provider, seqno++);
        console.log(`   ✅ TreasuryGold: ${treasuryAddr}`);
    } else {
        console.log(`   ✓  Already deployed: ${treasuryAddr}`);
    }

    // ── 3. SettlementMaster ───────────────────────────────────────────────
    console.log('\n3️⃣  Deploying SettlementMaster...');
    const settlementInit = await SettlementMaster.init(adminAddr, jettonAddr, treasuryAddr, adminAddr);
    const settlementAddr = contractAddress(0, settlementInit);
    deployed.SettlementMaster = settlementAddr.toString();

    if (!(await client.isContractDeployed(settlementAddr))) {
        const settlement = client.open(new SettlementMaster(settlementAddr, settlementInit));
        await settlement.send(provider.sender(keyPair.secretKey), { value: toNano('0.3') }, {
            $$type: 'Deploy', queryId: BigInt(Date.now()),
        });
        await waitSeqno(provider, seqno++);
        console.log(`   ✅ SettlementMaster: ${settlementAddr}`);
    } else {
        console.log(`   ✓  Already deployed: ${settlementAddr}`);
    }

    // ── 4. Escrow ─────────────────────────────────────────────────────────
    console.log('\n4️⃣  Deploying Escrow...');
    const escrowInit = await Escrow.init(adminAddr, treasuryAddr);
    const escrowAddr = contractAddress(0, escrowInit);
    deployed.Escrow = escrowAddr.toString();

    if (!(await client.isContractDeployed(escrowAddr))) {
        const escrow = client.open(new Escrow(escrowAddr, escrowInit));
        await escrow.send(provider.sender(keyPair.secretKey), { value: toNano('0.3') }, {
            $$type: 'Deploy', queryId: BigInt(Date.now()),
        });
        await waitSeqno(provider, seqno++);
        console.log(`   ✅ Escrow: ${escrowAddr}`);
    } else {
        console.log(`   ✓  Already deployed: ${escrowAddr}`);
    }

    // ── 5. Pre-mint initial allocations (BEFORE authority lock) ───────────
    console.log('\n5️⃣  Pre-minting initial allocations...');
    console.log(`   Team      : ${TEAM_AMOUNT}M GSTD → ${TEAM_WALLET}`);
    console.log(`   Ecosystem : ${ECOSYSTEM_AMOUNT}M GSTD → ${ECOSYSTEM_WALLET}`);
    console.log(`   Liquidity : ${LIQUIDITY_AMOUNT}M GSTD → ${LIQUIDITY_WALLET}`);
    const mintOk = await confirm('   Confirm initial allocation mint?');
    if (mintOk) {
        const jetton = client.open(new GSTDJetton(jettonAddr));
        await jetton.send(provider.sender(keyPair.secretKey), { value: toNano('0.5') }, {
            $$type: 'MintInitialAllocation',
            teamAddr:        Address.parse(TEAM_WALLET),
            teamAmount:      TEAM_AMOUNT * NANO,
            ecosystemAddr:   Address.parse(ECOSYSTEM_WALLET),
            ecosystemAmount: ECOSYSTEM_AMOUNT * NANO,
            liquidityAddr:   Address.parse(LIQUIDITY_WALLET),
            liquidityAmount: LIQUIDITY_AMOUNT * NANO,
        });
        await waitSeqno(provider, seqno++);
        console.log(`   ✅ Allocated ${TEAM_AMOUNT + ECOSYSTEM_AMOUNT + LIQUIDITY_AMOUNT}M GSTD`);
    } else {
        console.log('   ⚠️  Skipped. Call MintInitialAllocation manually BEFORE SetMintAuthority.');
    }

    // ── 6. Lock mint authority to SettlementMaster (IRREVERSIBLE) ─────────
    console.log('\n6️⃣  Locking mint authority to SettlementMaster...');
    console.log(`   This is IRREVERSIBLE. Settlement address: ${settlementAddr}`);
    const lockOk = await confirm('   Confirm lock?');
    if (!lockOk) {
        console.log('   ⚠️  Skipped. Run SetMintAuthority manually when ready.');
    } else {
        const jetton = client.open(new GSTDJetton(jettonAddr));
        await jetton.send(provider.sender(keyPair.secretKey), { value: toNano('0.05') }, {
            $$type: 'SetMintAuthority',
            newAuthority: settlementAddr,
        });
        await waitSeqno(provider, seqno++);
        console.log('   ✅ Mint authority permanently locked to SettlementMaster');
    }

    // ── 7. Set gateway on SettlementMaster ────────────────────────────────
    console.log('\n7️⃣  Setting gateway on SettlementMaster...');
    console.log(`   Gateway: ${gatewayAddr}`);
    const settlement = client.open(new SettlementMaster(settlementAddr));
    await settlement.send(provider.sender(keyPair.secretKey), { value: toNano('0.05') }, {
        $$type: 'SetGateway',
        gateway: gatewayAddr,
    });
    await waitSeqno(provider, seqno++);
    console.log('   ✅ Gateway set');

    // ── Save deployment record ─────────────────────────────────────────────
    const record = {
        network:     'mainnet',
        phase:       1,
        deployedAt:  new Date().toISOString(),
        deployer:    deployer.toString(),
        admin:       ADMIN_WALLET,
        gateway:     GATEWAY_ADDR,
        contracts:   deployed,
        phase2_todo: [
            'Deploy DAOVoting (fix TON-weighted voting first)',
            'Deploy AgentRegistry (fix counter underflow first)',
            'Transfer SettlementMaster.owner to DAOVoting',
            'Transfer TreasuryGold.owner to DAOVoting',
            'Implement TreasuryGold DEX swap integration',
        ],
        phase3_todo: [
            'Deploy GstdBridge (implement swap-in first)',
            'Deploy ProviderRegistry (fix Jetton integration first)',
            'Deploy SlashMechanics (fix message type mismatch first)',
        ],
    };

    const outPath = path.join(__dirname, '..', 'deployment-mainnet.json');
    fs.writeFileSync(outPath, JSON.stringify(record, null, 2));

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   DEPLOYMENT COMPLETE ✅                             ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    for (const [name, addr] of Object.entries(deployed)) {
        console.log(`  ${name.padEnd(20)}: ${addr}`);
    }
    console.log('\n📋 Next steps:');
    console.log('  1. Verify on https://tonscan.org');
    console.log('  2. Set env vars in Vercel dashboard:');
    console.log(`       NEXT_PUBLIC_TON_JETTON=${deployed.GSTDJetton}`);
    console.log(`       NEXT_PUBLIC_SETTLEMENT=${deployed.SettlementMaster}`);
    console.log(`       NEXT_PUBLIC_TREASURY=${deployed.TreasuryGold}`);
    console.log(`       NEXT_PUBLIC_ESCROW=${deployed.Escrow}`);
    console.log('  3. Update gstdbot env: GSTD_JETTON_ADDRESS + GSTD_SETTLEMENT_ADDRESS');
    console.log(`\n📄 Record saved: ${outPath}`);
}

main().catch(err => { console.error('DEPLOY FAILED:', err.message); process.exit(1); });
