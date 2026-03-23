const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function deployContract() {
  try {
    // Load environment variables
    require('dotenv').config();

    if (!process.env.ETHEREUM_RPC_URL || !process.env.ETHEREUM_PRIVATE_KEY) {
      console.error('❌ Missing Ethereum configuration in .env file');
      console.log('Please set ETHEREUM_RPC_URL and ETHEREUM_PRIVATE_KEY');
      process.exit(1);
    }

    console.log('🔗 Connecting to Ethereum network...');
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);

    console.log('📝 Deploying from address:', wallet.address);

    // Read contract source
    const contractPath = path.join(__dirname, '../contracts/PaymentContract.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');

    console.log('\n⚠️  Manual Deployment Required');
    console.log('=====================================');
    console.log('To deploy the smart contract:');
    console.log('\n1. Install Hardhat:');
    console.log('   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox');
    console.log('\n2. Initialize Hardhat:');
    console.log('   npx hardhat init');
    console.log('\n3. Copy PaymentContract.sol to contracts/ folder');
    console.log('\n4. Create deployment script in scripts/deploy.js:');
    console.log(`
const hre = require("hardhat");

async function main() {
  const PaymentContract = await hre.ethers.getContractFactory("PaymentContract");
  const contract = await PaymentContract.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
    `);
    console.log('\n5. Deploy:');
    console.log('   npx hardhat run scripts/deploy.js --network sepolia');
    console.log('\n6. Update .env with PAYMENT_CONTRACT_ADDRESS');
    console.log('=====================================\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployContract();
