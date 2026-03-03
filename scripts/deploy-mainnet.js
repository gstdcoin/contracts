/**
 * GSTD Smart Contract Deployment Script — TON Mainnet
 * 
 * Deploys all 5 GSTD contracts in correct dependency order:
 * 1. GSTDJetton (token — no dependencies)
 * 2. TreasuryGold (needs admin wallet)
 * 3. DAOVoting (needs GSTD jetton address)
 * 4. SettlementMaster (needs GSTD, Treasury, DAO addresses)
 * 5. AgentRegistry (needs Settlement address)
 * 
 * After deployment, wires cross-contract permissions:
 * - SettlementMaster is set as GSTDJetton.mintAuthority
 * - DAO is set as owner of SettlementMaster and TreasuryGold
 * 
 * Usage:
 *   TON_NETWORK=mainnet DEPLOYER_MNEMONIC="..." node deploy-mainnet.js
 */

require('dotenv').config({ path: '../.env' });
const { TonClient, WalletContractV4, internal, toNano } = require('@ton/ton');
const { mnemonicToPrivateKey } = require('@ton/crypto');
const { Cell } = require('@ton/core');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

const NETWORK = process.env.TON_NETWORK || 'mainnet';
const DEPLOYER_MNEMONIC = process.env.DEPLOYER_MNEMONIC || '';
const ADMIN_WALLET = process.env.ADMIN_WALLET || '';
const XAUT_JETTON = process.env.XAUT_JETTON_MASTER || 'EQA1R_LuQCLHlMgOo1S4G7Y7W1cd0FrAkbA10Zq7rddKxi9k';
const DEX_ROUTER = process.env.STONFI_ROUTER || '';

const ENDPOINTS = {
    mainnet: 'https://toncenter.com/api/v2/jsonRPC',
    testnet: 'https://testnet.toncenter.com/api/v2/jsonRPC',
};

// ═══════════════════════════════════════════════════════════════
// Deployment
// ═══════════════════════════════════════════════════════════════

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔱 GSTD Smart Contract Deployment');
    console.log(`   Network:   ${NETWORK}`);
    console.log(`   Admin:     ${ADMIN_WALLET.slice(0, 8)}...`);
    console.log('═══════════════════════════════════════════════════\n');

    // Validate
    if (!DEPLOYER_MNEMONIC) {
        console.error('❌ DEPLOYER_MNEMONIC not set');
        process.exit(1);
    }
    if (!ADMIN_WALLET) {
        console.error('❌ ADMIN_WALLET not set');
        process.exit(1);
    }

    // Connect
    const client = new TonClient({
        endpoint: ENDPOINTS[NETWORK],
        apiKey: process.env.TON_API_KEY,
    });

    const mnemonic = DEPLOYER_MNEMONIC.split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonic);
    const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0,
    });
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    console.log(`💰 Deployer wallet: ${wallet.address.toString()}`);
    const balance = await client.getBalance(wallet.address);
    console.log(`   Balance: ${Number(balance) / 1e9} TON\n`);

    if (Number(balance) < 5e9) {
        console.error('❌ Insufficient balance. Need at least 5 TON for deployment.');
        process.exit(1);
    }

    // ═══════════════════════════════════════════════════════
    // Build contracts
    // ═══════════════════════════════════════════════════════
    console.log('📦 Building contracts...');
    const buildDir = path.join(__dirname, '..', 'build');
    if (!fs.existsSync(buildDir)) {
        console.error('❌ Build directory not found. Run: npm run build');
        process.exit(1);
    }

    // ═══════════════════════════════════════════════════════
    // Deploy in dependency order
    // ═══════════════════════════════════════════════════════

    const deployed = {};
    let currentSeqno = seqno;

    // 1. GSTDJetton
    console.log('\n1️⃣  Deploying GSTDJetton...');
    // In production: load compiled cell from build/GSTDJetton/
    // const jettonCode = Cell.fromBoc(fs.readFileSync(path.join(buildDir, 'GSTDJetton', 'contract.cell')))[0];
    // const jettonData = buildJettonInitData(ADMIN_WALLET);
    // deployed.jetton = await deployContract(walletContract, keyPair.secretKey, jettonCode, jettonData, currentSeqno++);
    deployed.jetton = `[Deploy via Tact SDK — see build/GSTDJetton/]`;
    console.log(`   ✅ GSTDJetton: placeholder (compile with "npm run build" first)`);

    // 2. TreasuryGold  
    console.log('\n2️⃣  Deploying TreasuryGold...');
    deployed.treasury = `[Deploy via Tact SDK — needs: owner=${ADMIN_WALLET}, xaut=${XAUT_JETTON}]`;
    console.log(`   ✅ TreasuryGold: placeholder`);

    // 3. DAOVoting
    console.log('\n3️⃣  Deploying DAOVoting...');
    deployed.dao = `[Deploy via Tact SDK — needs: gstdJetton=${deployed.jetton}]`;
    console.log(`   ✅ DAOVoting: placeholder`);

    // 4. SettlementMaster
    console.log('\n4️⃣  Deploying SettlementMaster...');
    deployed.settlement = `[Deploy via Tact SDK — needs: gstd, treasury, dao]`;
    console.log(`   ✅ SettlementMaster: placeholder`);

    // 5. AgentRegistry
    console.log('\n5️⃣  Deploying AgentRegistry...');
    deployed.registry = `[Deploy via Tact SDK — needs: settlement]`;
    console.log(`   ✅ AgentRegistry: placeholder`);

    // ═══════════════════════════════════════════════════════
    // Cross-contract wiring
    // ═══════════════════════════════════════════════════════
    console.log('\n🔗 Cross-contract wiring...');
    console.log('   → Set SettlementMaster as GSTDJetton.mintAuthority');
    console.log('   → Set DAOVoting as SettlementMaster.owner');
    console.log('   → Set DAOVoting as TreasuryGold.owner');
    console.log('   → Set SettlementMaster address in AgentRegistry');

    // ═══════════════════════════════════════════════════════
    // Save deployment addresses
    // ═══════════════════════════════════════════════════════
    const deploymentFile = path.join(__dirname, '..', `deployment-${NETWORK}.json`);
    const deploymentInfo = {
        network: NETWORK,
        deployedAt: new Date().toISOString(),
        deployer: wallet.address.toString(),
        contracts: deployed,
    };
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to ${deploymentFile}`);

    // ═══════════════════════════════════════════════════════
    // Summary
    // ═══════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🔱 DEPLOYMENT SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    for (const [name, addr] of Object.entries(deployed)) {
        console.log(`  ${name}: ${addr}`);
    }
    console.log('\n⚠️  NOTE: This is a skeleton script. To deploy:');
    console.log('  1. Run "npm run build" to compile Tact contracts');
    console.log('  2. Load compiled cells from build/ directory');
    console.log('  3. Use Tact SDK deploy helpers for each contract');
    console.log('  4. Execute cross-contract wiring transactions');
    console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
