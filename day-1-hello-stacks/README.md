# Day 1 - Hello Stacks Clarity 3.0

This directory contains the complete working code for Day 1 of the 30-day Stacks & Clarity tutorial series.

## 📁 Project Structure

```
day-1-hello-stacks/
├── Clarinet.toml                 # Project configuration
├── package.json                  # Node.js dependencies for testing
├── package-lock.json             # Lock file
├── README.md                     # This file
├── .gitignore                    # Git ignore rules
├── contracts/
│   └── hello-world.clar          # Main smart contract
├── tests/
│   └── hello-world.test.ts       # Unit tests
├── deployments/
│   ├── default.devnet-plan.yaml  # Devnet deployment
│   ├── default.testnet-plan.yaml # Testnet deployment
│   └── default.mainnet-plan.yaml # Mainnet deployment
└── settings/
    ├── Devnet.toml               # Local development settings
    ├── Testnet.toml              # Testnet settings
    └── Mainnet.toml              # Mainnet settings
```

## 🚀 Quick Start

### Prerequisites
- [Clarinet](https://docs.hiro.so/tools/clarinet) installed
- Node.js 18+ installed

### Setup
```bash
# Clone the repository
git clone https://github.com/gboigwe/30-days-stacks-clarity.git
cd 30-days-stacks-clarity/day-1-hello-stacks

# Install testing dependencies
npm install

# Check contract syntax
clarinet check

# Run tests
npm run test

# Start local development console
clarinet console
```

## 📖 What You'll Learn

- Setting up a modern Clarity 3.0 development environment
- Understanding the difference between `block-height` and `stacks-block-height`
- Writing basic smart contracts with proper error handling
- Testing smart contracts with the latest Clarinet testing framework
- Deploying contracts to different networks

## 🔗 Tutorial

Read the complete Day 1 tutorial: [Day 1: Hello Stacks - Your First Clarity 3.0 Smart Contract](../../README.md#day-1)

## 🧪 Testing

This project uses the latest Clarinet testing framework. Tests are written in TypeScript and run with `npm run test`.

### Test Examples
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test tests/hello-world.test.ts
```

## 🚀 Deployment

### Testnet Deployment
```bash
# Generate deployment plan
clarinet deployment generate --testnet

# Apply deployment
clarinet deployment apply --testnet
```

### Local Development
```bash
# Start Clarinet console
clarinet console

# In console, try these commands:
(contract-call? .hello-world get-greeting)
(contract-call? .hello-world get-block-info)
```

## 📝 Key Concepts Demonstrated

1. **Clarity 3.0 Syntax**: Using `stacks-block-height` instead of deprecated `block-height`
2. **Error Handling**: Proper use of constants and assertions
3. **Type Safety**: Comprehensive type definitions
4. **Testing**: Modern unit testing with Clarinet SDK
5. **Deployment**: Multi-network deployment configuration

## 🔍 Next Steps

After completing Day 1, continue to [Day 2: Building a Modern React Frontend](../day-2-react-frontend/README.md)

---

*Part of the 30 Days of Stacks & Clarity tutorial series*