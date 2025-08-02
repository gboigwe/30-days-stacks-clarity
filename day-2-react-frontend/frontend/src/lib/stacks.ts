import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

// Network configuration
export const network = 
  process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
    ? STACKS_MAINNET 
    : STACKS_TESTNET;

export const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const contractName = 'hello-world';

// This will be used throughout your app
export const CONTRACT_PRINCIPAL = `${contractAddress}.${contractName}`;