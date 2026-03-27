# PayChain - Fintech + Blockchain Payment Platform

A hybrid payment platform that allows users to register, create wallets, fund accounts, send money, and execute real blockchain transactions.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Blockchain**: Ethereum (ethers.js) with smart contracts
- **Payments**: Interswitch integration (OAuth + OTP + Payment API)

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
- (Optional) Interswitch Developer account for live payment rails

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
# Edit .env.local with API URL
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/paychain"
JWT_SECRET="your-secret-key"
PORT=5000

# Optional: Interswitch Integration
ISW_CLIENT_ID="your_client_id"
ISW_CLIENT_SECRET="your_client_secret"
ISW_BASE_URL="https://sandbox.interswitchng.com"
ISW_OAUTH_BASE_URL="https://passport-v2.k8.isw.la"
ISW_OAUTH_SCOPE="profile"
ISW_BVN_ENDPOINT="/api/v1/identity/bvn"
ISW_SEND_OTP_ENDPOINT="/api/v1/safetoken/send"
ISW_VERIFY_OTP_ENDPOINT="/api/v1/safetoken/verify"
ISW_PAYMENT_ENDPOINT="/api/v1/payments/initiate"

# Optional: Ethereum Integration
ETHEREUM_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
ETHEREUM_PRIVATE_KEY="your_private_key"
PAYMENT_CONTRACT_ADDRESS="0x_contract_address"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Features

✅ User registration and authentication
✅ Wallet creation and management
✅ **Real Interswitch integration (OAuth + OTP + payments)**
✅ **Real Ethereum blockchain transactions**
✅ OTP-secured fiat transfers
✅ Sandbox fallback mode for payment simulation
✅ Internal money transfers
✅ Smart contract integration
✅ Transaction history with blockchain tracking

## Integration Guides

### Interswitch Integration
1. Create a developer account and app in Interswitch API Marketplace
2. Get sandbox credentials (Client ID and Client Secret)
3. Add Interswitch configuration to backend `.env`
4. Use OTP endpoints and wallet funding APIs to validate flows in sandbox

See `INTERSWITCH_INTEGRATION.md` for detailed endpoint and flow examples.

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
- `POST /api/wallet/fund` - Fund wallet via Interswitch (with simulation fallback)
- `POST /api/wallet/send` - Send money (fiat via OTP flow or crypto via blockchain)

### OTP
- `POST /api/otp/request` - Request OTP for secure actions
- `POST /api/otp/verify` - Verify OTP session

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

1. **Full Integration**: Interswitch + Ethereum configured
2. **Partial**: Only Interswitch or Ethereum configured
3. **Simulation**: No external services (mock mode)

The app automatically detects configuration and falls back gracefully.

## Production Deployment

See `INTEGRATION_GUIDE.md` for production checklist including:
- Mainnet deployment
- Live Interswitch credentials and endpoint verification
- OTP and payment endpoint validation
- Security hardening
- Monitoring setup
