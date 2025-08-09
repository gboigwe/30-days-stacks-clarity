// Enhanced Stacks configuration for multi-user patterns
import { STACKS_DEVNET, STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export const NETWORK_CONFIG = {
  devnet: {
    network: STACKS_DEVNET,
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    taskManagerContract: 'task-manager',
    userProfilesContract: 'user-profiles',
  },
  testnet: {
    network: STACKS_TESTNET,
    contractAddress: '', // To be filled when deployed
    taskManagerContract: 'task-manager',
    userProfilesContract: 'user-profiles',
  },
  mainnet: {
    network: STACKS_MAINNET,
    contractAddress: '', // To be filled when deployed
    taskManagerContract: 'task-manager',
    userProfilesContract: 'user-profiles',
  }
};

export const getCurrentNetwork = () => {
  // Default to devnet for development
  return NETWORK_CONFIG.devnet;
};