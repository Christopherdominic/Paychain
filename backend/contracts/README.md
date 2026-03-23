# Smart Contract Deployment Guide

## PaymentContract.sol

This Solidity smart contract handles blockchain payments for PayChain.

### Features
- Send payments to other addresses
- Deposit funds with reference tracking
- Event emission for transaction tracking
- Balance tracking

### Deployment Steps

1. **Install Hardhat**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

2. **Configure Hardhat**
Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.ETHEREUM_RPC_URL,
      accounts: [process.env.ETHEREUM_PRIVATE_KEY]
    }
  }
};
```

3. **Deploy Contract**
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

4. **Update .env**
Add the deployed contract address to your `.env` file:
```
PAYMENT_CONTRACT_ADDRESS=0x_your_deployed_contract_address
```

### Testing Locally

Use Hardhat's local network:
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Contract Functions

- `sendPayment(address recipient, string transactionId)` - Send payment to recipient
- `deposit(string reference)` - Deposit funds with reference
- `getBalance(address account)` - Get balance for an address
