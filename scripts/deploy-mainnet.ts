/**
 * GSTD Phase 1 Mainnet Deployment
 *
 * The GSTD token (EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO) already exists
 * on mainnet with 1B supply fully minted and admin key burned. We do NOT redeploy it.
 *
 * Deploy order:
 *   1. EcosystemTreasury — collects 10% fee (Phase 1: simple DAO-managed treasury)
 *   2. SettlementMaster  — 85/10/5 TON split + GSTD pool transfer for worker bonuses
 *   3. Escrow            — task payment escrow for node operators
 *
 * Post-deploy wiring:
 *   - SetGateway: SettlementMaster ← GATEWAY_ADDRESS (your orchestrator)
 *   - SetOwnJettonWallet: SettlementMaster ← SM's computed GSTD jetton wallet address
 *   - Transfer GSTD from your wallet to SM's jetton wallet (worker reward pool)
 *
 * Usage:
 *   npm run build           # compile contracts first
 *   npx ts-node --project tsconfig.deploy.json scripts/deploy-mainnet.ts
 */

import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { Address, beginCell, contractAddress, toNano, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { SettlementMaster }    from '../build/SettlementMaster/SettlementMaster_SettlementMaster';
import { EcosystemTreasury }   from '../build/EcosystemTreasury/EcosystemTreasury_EcosystemTreasury';
import { Escrow }              from '../build/EscrowComplete/EscrowComplete_Escrow';

// Existing GSTD token — 1B minted, admin burned, DO NOT redeploy
const EXISTING_GSTD_JETTON = 'EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO';

const NETWORK      = process.env.TON_NETWORK || '';
const MNEMONIC     = process.env.DEPLOYER_MNEMONIC || '';
const ADMIN_WALLET = process.env.ADMIN_WALLET || '';
const GATEWAY_ADDR = process.env.GATEWAY_ADDRESS || '';  // orchestrator (gstdbot backend)

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


async function main() {
    // ── Pre-flight checks ─────────────────────────────────────────────────
    if (NETWORK !== 'mainnet') {
        console.error('❌ TON_NETWORK must be "mainnet". Currently:', NETWORK || '(not set)');
        console.error('   For testnet use: npx ts-node scripts/deploy-testnet.ts');
        process.exit(1);
    }
    const missing = ['DEPLOYER_MNEMONIC', 'ADMIN_WALLET', 'GATEWAY_ADDRESS']
        .filter(k => !process.env[k]);
    if (missing.length) {
        console.error('❌ Missing env vars:', missing.join(', '));
        process.exit(1);
    }

    const adminAddr   = Address.parse(ADMIN_WALLET);
    const gatewayAddr = Address.parse(GATEWAY_ADDR);
    const gstdJetton  = Address.parse(EXISTING_GSTD_JETTON);

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   GSTD Phase 1 — MAINNET DEPLOYMENT                 ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Admin wallet : ${ADMIN_WALLET.slice(0,20)}...`);
    console.log(`║  Gateway      : ${GATEWAY_ADDR.slice(0,20)}...`);
    console.log(`║  GSTD token   : ${EXISTING_GSTD_JETTON.slice(0,20)}... (existing)`);
    console.log('║  Deploying    : EcosystemTreasury, SettlementMaster, Escrow');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log('⚠️  This deploys to TON MAINNET with real funds.\n');

    const ok = await confirm('Ready to deploy to mainnet?');
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

    if (Number(balance) < toNano('2')) {
        console.error('❌ Insufficient balance. Need ≥ 2 TON for gas.');
        process.exit(1);
    }

    let seqno = await provider.getSeqno();
    const deployed: Record<string, string> = {
        GSTDJetton: EXISTING_GSTD_JETTON, // existing — not redeployed
    };

    // ── 2. EcosystemTreasury ──────────────────────────────────────────────
    // Phase 1 uses the simple EcosystemTreasury (accepts "deposit", DAO withdraws).
    // TreasuryGold (XAUt conversion) is Phase 2 — requires live DEX integration.
    console.log('\n2️⃣  Deploying EcosystemTreasury...');
    const treasuryInit = await EcosystemTreasury.init(adminAddr);
    const treasuryAddr = contractAddress(0, treasuryInit);
    deployed.EcosystemTreasury = treasuryAddr.toString();

    if (!(await client.isContractDeployed(treasuryAddr))) {
        const treasury = client.open(new EcosystemTreasury(treasuryAddr, treasuryInit));
        await treasury.send(provider.sender(keyPair.secretKey), { value: toNano('0.3') }, {
            $$type: 'Deploy', queryId: BigInt(Date.now()),
        });
        await waitSeqno(provider, seqno++);
        console.log(`   ✅ EcosystemTreasury: ${treasuryAddr}`);
    } else {
        console.log(`   ✓  Already deployed: ${treasuryAddr}`);
    }

    // ── 2. SettlementMaster ───────────────────────────────────────────────
    console.log('\n2️⃣  Deploying SettlementMaster...');
    const settlementInit = await SettlementMaster.init(adminAddr, gstdJetton, treasuryAddr, adminAddr);
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

    // ── 3. Escrow ─────────────────────────────────────────────────────────
    console.log('\n3️⃣  Deploying Escrow...');
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

    // ── 4. Set gateway on SettlementMaster ────────────────────────────────
    console.log('\n4️⃣  Setting gateway on SettlementMaster...');
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
            'Deploy DAOVoting',
            'Deploy AgentRegistry',
            'Transfer SettlementMaster.owner to DAOVoting',
            'Transfer EcosystemTreasury.owner to DAOVoting',
            'Deploy TreasuryGold + wire DEX swap integration',
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
    console.log('  2. Fund SM GSTD reward pool:');
    console.log(`       a) Compute SM jetton wallet: get_wallet_address(${settlementAddr}, gstdJetton)`);
    console.log(`       b) Call SetOwnJettonWallet on SettlementMaster with that address`);
    console.log(`       c) Transfer GSTD from your wallet to SM jetton wallet (worker reward pool)`);
    console.log('  3. Set env vars in Vercel dashboard:');
    console.log(`       NEXT_PUBLIC_TON_JETTON=${deployed.GSTDJetton}`);
    console.log(`       NEXT_PUBLIC_SETTLEMENT=${deployed.SettlementMaster}`);
    console.log(`       NEXT_PUBLIC_TREASURY=${deployed.EcosystemTreasury}`);
    console.log(`       NEXT_PUBLIC_ESCROW=${deployed.Escrow}`);
    console.log('  4. Update gstdbot env: GSTD_SETTLEMENT_ADDRESS');
    console.log(`\n📄 Record saved: ${outPath}`);
}

main().catch(err => { console.error('DEPLOY FAILED:', err.message); process.exit(1); });
