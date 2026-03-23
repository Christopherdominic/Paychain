const { ethers } = require('ethers');

let provider = null;
let wallet = null;
let contract = null;

const initializeEthereum = () => {
  if (!process.env.ETHEREUM_RPC_URL || !process.env.ETHEREUM_PRIVATE_KEY) {
    return false;
  }

  try {
    provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);

    if (process.env.PAYMENT_CONTRACT_ADDRESS) {
      const contractABI = [
        "function sendPayment(address recipient, string transactionId) external payable",
        "function deposit(string reference) external payable",
        "function getBalance(address account) external view returns (uint256)",
        "event PaymentSent(address indexed from, address indexed to, uint256 amount, string transactionId, uint256 timestamp)",
        "event PaymentReceived(address indexed from, uint256 amount, string reference, uint256 timestamp)"
      ];
      contract = new ethers.Contract(
        process.env.PAYMENT_CONTRACT_ADDRESS,
        contractABI,
        wallet
      );
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Ethereum:', error.message);
    return false;
  }
};

const isConfigured = () => {
  return provider !== null && wallet !== null;
};

const sendBlockchainTransaction = async (recipientAddress, amount, transactionId) => {
  if (!isConfigured()) {
    throw new Error('Ethereum not configured');
  }

  try {
    const amountInWei = ethers.parseEther(amount.toString());

    if (contract) {
      // Use smart contract
      const tx = await contract.sendPayment(recipientAddress, transactionId, {
        value: amountInWei,
        gasLimit: 100000
      });

      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: 'success'
      };
    } else {
      // Direct transfer
      const tx = await wallet.sendTransaction({
        to: recipientAddress,
        value: amountInWei
      });

      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: 'success'
      };
    }
  } catch (error) {
    throw new Error(`Blockchain transaction failed: ${error.message}`);
  }
};

const depositToContract = async (amount, reference) => {
  if (!isConfigured() || !contract) {
    throw new Error('Smart contract not configured');
  }

  try {
    const amountInWei = ethers.parseEther(amount.toString());

    const tx = await contract.deposit(reference, {
      value: amountInWei,
      gasLimit: 100000
    });

    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: 'success'
    };
  } catch (error) {
    throw new Error(`Deposit failed: ${error.message}`);
  }
};

const getWalletAddress = () => {
  return wallet ? wallet.address : null;
};

const getBalance = async (address) => {
  if (!isConfigured()) {
    throw new Error('Ethereum not configured');
  }

  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
};

// Initialize on module load
initializeEthereum();

module.exports = {
  isConfigured,
  sendBlockchainTransaction,
  depositToContract,
  getWalletAddress,
  getBalance
};
