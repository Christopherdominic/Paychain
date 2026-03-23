const crypto = require('crypto');

const generateBlockchainHash = () => {
  return '0x' + crypto.randomBytes(32).toString('hex');
};

const simulateBlockchainTransaction = async (amount, senderAddress, receiverAddress) => {
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    txHash: generateBlockchainHash(),
    blockNumber: Math.floor(Math.random() * 1000000),
    gasUsed: '21000',
    status: 'success'
  };
};

module.exports = {
  generateBlockchainHash,
  simulateBlockchainTransaction
};
