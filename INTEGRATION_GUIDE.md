# PayChain Integration Guide

## Real Blockchain Integration (Ethereum)

### Setup Steps

1. **Get Infura API Key**
   - Sign up at https://infura.io
   - Create a new project
   - Copy the Sepolia testnet endpoint URL

2. **Create Ethereum Wallet**
   - Use MetaMask or generate a new wallet
   - Export the private key (keep it secure!)
   - Get testnet ETH from https://sepoliafaucet.com

3. **Deploy Smart Contract**
   ```bash
   cd backend
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npx hardhat init
   # Copy contracts/PaymentContract.sol to hardhat contracts folder
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Update Backend .env**
   ```
   ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   ETHEREUM_PRIVATE_KEY=your_private_key_here
   PAYMENT_CONTRACT_ADDRESS=0x_deployed_contract_address
   ```

### How It Works

- When `type: 'crypto'` is selected, the app checks if Ethereum is configured
- If configured, it sends a real blockchain transaction via ethers.js
- If not configured, it falls back to simulation mode
- Transaction hash is stored in the database for tracking

---

## Stripe Payment Integration

### Setup Steps

1. **Create Stripe Account**
   - Sign up at https://stripe.com
   - Get your API keys from the Dashboard

2. **Update Backend .env**
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

3. **Update Frontend .env.local**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Install Dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

5. **Test Payment**
   - Use test card: 4242 4242 4242 4242
   - Any future expiry date
   - Any 3-digit CVC

### How It Works

- User enters amount on `/wallet/fund-stripe`
- Backend creates a Stripe PaymentIntent
- Frontend displays Stripe payment form
- On success, wallet balance is updated
- Payment record is saved in database

---

## Testing

### Test Blockchain (without real deployment)
The app automatically falls back to simulation if Ethereum is not configured.

### Test Stripe (with test mode)
1. Use Stripe test keys
2. Use test card numbers from Stripe docs
3. No real money is charged in test mode

---

## Production Checklist

- [ ] Deploy smart contract to mainnet
- [ ] Switch to Stripe live keys
- [ ] Set up Stripe webhooks for payment confirmation
- [ ] Add proper error handling and retry logic
- [ ] Implement transaction monitoring
- [ ] Add gas price optimization for blockchain
- [ ] Set up proper key management (AWS Secrets Manager, etc.)
- [ ] Enable 2FA for user accounts
- [ ] Add rate limiting
- [ ] Set up monitoring and alerts
