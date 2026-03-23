# PayChain - Fintech + Blockchain Payment Platform

A hybrid payment platform that allows users to register, create wallets, fund accounts, send money, and execute real blockchain transactions.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Stripe React
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Blockchain**: Ethereum (ethers.js) with smart contracts
- **Payments**: Stripe integration

## Project Structure

```
paychain/
├── backend/          # Express.js API
│   ├── contracts/    # Solidity smart contracts
│   ├── scripts/      # Deployment scripts
│   └── src/          # Application code
└── frontend/         # Next.js application
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn
- (Optional) Infura account for Ethereum
- (Optional) Stripe account for payments

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with API URL and Stripe key
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/paychain"
JWT_SECRET="your-secret-key"
PORT=5000

# Optional: Stripe Integration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional: Ethereum Integration
ETHEREUM_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
ETHEREUM_PRIVATE_KEY="your_private_key"
PAYMENT_CONTRACT_ADDRESS="0x_contract_address"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Features

✅ User registration and authentication
✅ Wallet creation and management
✅ **Real Stripe payment integration**
✅ **Real Ethereum blockchain transactions**
✅ Mock payment gateway (fallback)
✅ Internal money transfers
✅ Smart contract integration
✅ Transaction history with blockchain tracking

## Integration Guides

### Stripe Integration
1. Sign up at https://stripe.com
2. Get test API keys from Dashboard
3. Add keys to `.env` files
4. Test with card: 4242 4242 4242 4242

### Ethereum Integration
1. Get Infura API key from https://infura.io
2. Create/import Ethereum wallet
3. Deploy smart contract (see `backend/contracts/README.md`)
4. Add configuration to `.env`

See `INTEGRATION_GUIDE.md` for detailed setup instructions.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Wallet
- `GET /api/wallet` - Get wallet details
- `POST /api/wallet/fund` - Fund wallet (mock)
- `POST /api/wallet/send` - Send money

### Payments
- `POST /api/payment/stripe/create` - Create Stripe payment
- `POST /api/payment/stripe/confirm` - Confirm payment

### Transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:id` - Get transaction details

## Smart Contract

The `PaymentContract.sol` enables:
- On-chain payment transfers
- Deposit tracking with references
- Event emission for transparency
- Balance queries

Deploy using Hardhat (see `backend/contracts/README.md`)

## Development Mode

The app works in three modes:

1. **Full Integration**: Stripe + Ethereum configured
2. **Partial**: Only Stripe or Ethereum configured
3. **Simulation**: No external services (mock mode)

The app automatically detects configuration and falls back gracefully.

## Production Deployment

See `INTEGRATION_GUIDE.md` for production checklist including:
- Mainnet deployment
- Live Stripe keys
- Webhook configuration
- Security hardening
- Monitoring setup
