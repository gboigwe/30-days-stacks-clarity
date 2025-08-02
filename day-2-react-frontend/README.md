# Day 2: React Frontend for Stacks dApp

**30 Days of Clarity & Stacks.js Tutorial Series - Day 2**

This project demonstrates building a modern React frontend that connects to the Clarity 3.0 smart contract from Day 1. You'll learn how to integrate React 19, Next.js 15, and Stacks.js 8.x with SIP-030 wallet connections.

## What This Project Demonstrates

- **Modern Web3 Stack**: React 19, Next.js 15, TypeScript, Tailwind CSS
- **Stacks.js 8.x Integration**: Latest wallet connection standards (SIP-030)
- **Contract Reading**: Calling read-only functions from your Clarity contract
- **Clarity 3.0 Features**: Displaying `stacks-block-height` and `tenure-height`
- **Type-Safe Development**: Full TypeScript integration for blockchain interactions

## Project Structure

```
day-2-react-frontend/
├── contracts/                    # Clarity smart contracts
│   └── hello-world.clar         # Your Day 1 contract
├── frontend/                    # React application
│   ├── src/
│   │   ├── app/                # Next.js 15 App Router
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── page.tsx        # Main page
│   │   │   └── globals.css     # Global styles
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useWallet.ts    # Wallet connection logic
│   │   │   └── useContract.ts  # Contract reading logic
│   │   └── lib/
│   │       └── stacks.ts       # Stacks configuration
│   ├── package.json
│   └── .env.local              # Environment variables
├── tests/                      # Contract tests
├── Clarinet.toml              # Clarinet configuration
└── README.md                  # This file
```

## Prerequisites

- Node.js 18+ and npm
- Clarinet (for contract development)
- A Stacks wallet (Hiro Wallet, Xverse, etc.)

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Clarinet dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 2. Configure Environment Variables

Update `frontend/.env.local` with your contract details:

```env
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST000000000000000000002AMW42H.hello-world
```

### 3. Start the Development Server

```bash
# Start the Next.js development server
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see your dApp!

## Contract Functions Used

This frontend reads data from these contract functions:

### Read-Only Functions
- `get-greeting()` - Returns the current greeting string
- `get-block-info()` - Shows Clarity 3.0 block height information
- `get-stats()` - Returns contract statistics (owner, update count)
- `get-owner()` - Returns the contract owner address

## Key Components Explained

### Wallet Connection (`useWallet.ts`)
```typescript
const { address, isConnected, connectWallet, disconnectWallet } = useWallet();
```
- Uses Stacks.js 8.x with SIP-030 standard
- Supports all major Stacks wallets
- Persists connection across page reloads

### Contract Reading (`useContract.ts`)
```typescript
const { data: greeting, isLoading } = useContractRead('get-greeting');
```
- Calls read-only contract functions
- Handles loading states and errors
- Converts Clarity Values to JavaScript objects

### Stacks Configuration (`lib/stacks.ts`)
```typescript
export const network = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();
```
- Centralized network configuration
- Environment-based network switching
- Type-safe contract constants

## Features Demonstrated

### Modern React Patterns
- **Custom Hooks**: Encapsulate blockchain logic
- **TypeScript**: Full type safety for Web3 interactions  
- **Error Handling**: Proper async error management
- **Loading States**: User-friendly loading indicators

### Stacks.js 8.x Features
- **SIP-030 Wallet Standard**: Works with all modern Stacks wallets
- **Simplified API**: Easier wallet connections vs. older versions
- **Better TypeScript Support**: Improved developer experience

### Clarity 3.0 Integration
- **Block Height Functions**: Uses `stacks-block-height` and `tenure-height`
- **Modern Error Handling**: Demonstrates new Clarity patterns
- **Read-Only Calls**: Free contract interactions

## Testing the Application

1. **Connect Wallet**: Click "Connect Wallet" and choose your Stacks wallet
2. **View Contract Data**: See the greeting and statistics from your contract
3. **Observe Block Info**: Watch Clarity 3.0 block height data update
4. **Check Console**: View detailed logging for debugging

## Deployment

### Deploy Contract to Testnet
```bash
# Deploy using Clarinet
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```

### Deploy Frontend to Vercel
```bash
cd frontend
npm run build
# Deploy to Vercel, Netlify, or your preferred platform
```

## What's Next?

This is Day 2 of the 30-day tutorial series. Tomorrow (Day 3) we'll add:

- **Write Functionality**: Update the contract from the frontend
- **Transaction Signing**: Handle STX transactions with user wallets
- **Transaction Status**: Track pending/confirmed transactions
- **Error Handling**: Manage transaction failures gracefully
- **Optimistic UI**: Update UI before transactions confirm

## Common Issues

**Wallet Won't Connect**
- Ensure you have a Stacks wallet installed
- Check that your wallet supports the testnet
- Verify environment variables are correct

**Contract Data Not Loading**
- Confirm your contract address in `.env.local`
- Check that the contract is deployed to testnet
- Verify network configuration matches your deployment

**TypeScript Errors**
- Run `npm install` in both root and frontend directories
- Ensure all dependencies are installed correctly
- Check that TypeScript configuration is valid

## Resources

- [Stacks.js 8.x Documentation](https://stacks.js.org/)
- [Next.js 15 App Router Guide](https://nextjs.org/docs/app)
- [Clarity 3.0 Reference](https://docs.stacks.co/docs/clarity/)
- [SIP-030 Wallet Standard](https://github.com/stacksgov/sips/pull/134)

---

**Part of the 30 Days of Clarity & Stacks.js Tutorial Series**

- [Day 1: Hello Stacks - Your First Clarity 3.0 Smart Contract](../day-1-hello-stacks/)
- **Day 2: Building a Modern React Frontend** (You are here)
- Day 3: Adding Write Functionality and Transaction Management (Coming next)

Built with ❤️ for the Stacks ecosystem