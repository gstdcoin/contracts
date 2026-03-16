const { Keypair } = require('@solana/web3.js');
const { Wallet } = require('xrpl');
const crypto = require('crypto');

// Generate Solana Keypair
const solKeypair = Keypair.generate();
console.log('--- SOLANA MAINNET BRIDGE ORACLE ---');
console.log('PubKey:', solKeypair.publicKey.toBase58());
console.log('Secret:', Buffer.from(solKeypair.secretKey).toString('hex'));

// Generate XRPL Keypair
const xrplWallet = Wallet.generate();
console.log('--- XRPL MAINNET BRIDGE ORACLE ---');
console.log('Address:', xrplWallet.address);
console.log('Seed:', xrplWallet.seed);

// Generate TON Address (Simulated random hash for contract address)
const randomTonBuf = crypto.randomBytes(32);
const tonBase64Uri = randomTonBuf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
const tonAddress = `EQ${tonBase64Uri.substring(0, 46)}`;
console.log('--- TON MAINNET BRIDGE CONTRACT ---');
console.log('Address:', tonAddress);
