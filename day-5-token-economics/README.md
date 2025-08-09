# Day 5: Token Economics - AgeOfDevs Cryptocurrency

This project implements a complete SIP-010 token system with community distribution mechanics, representing Day 5 of the "30 Days of Stacks & Clarity" tutorial series.

## Features

### Smart Contracts
- **AgeOfDevs Token**: Full SIP-010 compliant cryptocurrency
- **Community Distribution**: First 30 users get 1,000 AOD tokens each
- **Token Integration**: Rewards for task completion from Day 4
- **Advanced Tracking**: Holder statistics and reputation system

### Frontend Application
- **Token Dashboard**: Balance, supply, and community stats
- **Distribution Interface**: Claim your free tokens
- **Transfer System**: Send tokens to other community members
- **Community Features**: Leaderboards and holder statistics

## Getting Started

### Prerequisites
- Node.js 18+ 
- Clarinet 2.0+
- Stacks wallet with testnet STX

### Installation

```bash
# Clone and setup contracts
cd day-5-token-economics
clarinet check

# Setup frontend
cd frontend
npm install
npm run dev
```

### Token Distribution

The first 30 people can claim 1,000 AgeOfDevs (AOD) tokens each:
1. Connect your Stacks testnet wallet
2. Click "Claim Community Tokens" 
3. Confirm the transaction
4. Receive 1,000 AOD tokens instantly

## Token Utility

- **Governance**: Vote on community proposals
- **Premium Features**: Access exclusive tools and content
- **Task Rewards**: Earn tokens by completing tasks
- **Community Status**: Reputation and recognition

## Technical Implementation

### SIP-010 Standard Compliance
All required functions implemented for full wallet and exchange compatibility:
- `transfer`
- `get-balance`
- `get-total-supply`
- `get-name`, `get-symbol`, `get-decimals`

### Advanced Features
- Community distribution with fair launch mechanics
- Integration with multi-user task management
- Reputation tracking and governance preparation
- Modern React frontend with optimistic UI

## Educational Value

This project demonstrates:
- SIP-010 token standard implementation
- Community building through tokenomics
- Integration between different blockchain systems
- Modern dApp architecture patterns
- Production-ready deployment strategies

---

**Part of the 30 Days of Stacks & Clarity Series**
Learn more: [Tutorial Series](https://github.com/your-username/30-days-stacks-clarity)