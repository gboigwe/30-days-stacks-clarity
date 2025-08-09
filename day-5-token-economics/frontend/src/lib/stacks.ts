// Enhanced Stacks configuration for token operations
import { STACKS_DEVNET, STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export const NETWORK_CONFIG = {
  devnet: {
    network: STACKS_DEVNET,
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    tokenContract: 'ageofdevs-token',
    explorerUrl: 'http://localhost:8000',
  },
  testnet: {
    network: STACKS_TESTNET,
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
    tokenContract: 'ageofdevs-token',
    explorerUrl: 'https://explorer.stacks.co',
  },
  mainnet: {
    network: STACKS_MAINNET,
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
    tokenContract: 'ageofdevs-token',
    explorerUrl: 'https://explorer.stacks.co',
  }
};

export const getCurrentNetwork = () => {
  const env = process.env.NODE_ENV;
  const networkMode = process.env.NEXT_PUBLIC_NETWORK_MODE || 'devnet';
  
  if (env === 'development' || networkMode === 'devnet') {
    return NETWORK_CONFIG.devnet;
  } else if (networkMode === 'testnet') {
    return NETWORK_CONFIG.testnet;
  } else {
    return NETWORK_CONFIG.mainnet;
  }
};

// Token constants
export const TOKEN_CONSTANTS = {
  DECIMALS: 6,
  SYMBOL: 'AOD',
  NAME: 'AgeOfDevs Token',
  DISTRIBUTION_AMOUNT: 1000, // AOD tokens per claim
  MAX_DISTRIBUTION_CLAIMS: 30,
  MICRO_AOD_PER_AOD: 1_000_000, // 6 decimals
};

// Utility functions for token amounts
export const tokenUtils = {
  // Convert AOD to micro-AOD (for contract calls)
  toMicroAOD: (aod: number): number => {
    return Math.floor(aod * TOKEN_CONSTANTS.MICRO_AOD_PER_AOD);
  },

  // Convert micro-AOD to AOD (for display)
  fromMicroAOD: (microAod: number): number => {
    return microAod / TOKEN_CONSTANTS.MICRO_AOD_PER_AOD;
  },

  // Format AOD for display with proper decimals
  formatAOD: (amount: number, decimals: number = 2): string => {
    return `${amount.toFixed(decimals)} AOD`;
  },

  // Format large numbers with commas
  formatLargeNumber: (num: number): string => {
    return num.toLocaleString();
  },

  // Calculate percentage of total supply
  calculatePercentage: (amount: number, total: number): number => {
    return total > 0 ? (amount / total) * 100 : 0;
  },

  // Validate AOD amount
  isValidAmount: (amount: string | number): boolean => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num > 0 && num <= 1000000; // Max reasonable amount
  },

  // Parse amount from string input
  parseAmount: (amountStr: string): number | null => {
    const cleaned = amountStr.replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
};

// Contract interaction helpers
export const contractUtils = {
  // Get full contract identifier
  getContractId: (contractName: string = TOKEN_CONSTANTS.SYMBOL.toLowerCase()): string => {
    const config = getCurrentNetwork();
    return `${config.contractAddress}.${config.tokenContract}`;
  },

  // Get contract address
  getContractAddress: (): string => {
    return getCurrentNetwork().contractAddress;
  },

  // Get network for contract calls
  getNetwork: () => {
    return getCurrentNetwork().network;
  },

  // Get explorer URL for transaction
  getTxExplorerUrl: (txId: string): string => {
    const config = getCurrentNetwork();
    const chainSuffix = config.network === STACKS_TESTNET ? '?chain=testnet' : '';
    return `${config.explorerUrl}/txid/${txId}${chainSuffix}`;
  },

  // Get explorer URL for contract
  getContractExplorerUrl: (): string => {
    const config = getCurrentNetwork();
    const chainSuffix = config.network === STACKS_TESTNET ? '?chain=testnet' : '';
    return `${config.explorerUrl}/address/${config.contractAddress}${chainSuffix}`;
  }
};