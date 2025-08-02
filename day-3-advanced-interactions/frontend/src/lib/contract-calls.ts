// Contract interaction utilities with type safety and error handling

import { 
  stringAsciiCV,
  uintCV
} from '@stacks/transactions';
import { network, contractAddress, contractName } from './stacks';

export interface ContractCallOptions {
  functionName: string;
  functionArgs: any[];
  postConditions?: any[];
  fee?: number;
}

export interface WriteContractResult {
  txId: string;
  transaction: any;
}

// Simplified wrapper for contract calls (browser-based transactions via Stacks Connect)
export async function prepareContractCall(options: ContractCallOptions) {
  return {
    contractAddress,
    contractName,
    functionName: options.functionName,
    functionArgs: options.functionArgs,
    postConditions: options.postConditions || [],
  };
}

// Specific contract function wrappers
export const contractFunctions = {
  // Update global greeting (costs STX)
  setGreetingWithPayment: (message: string, cost: number = 1000000) => ({
    functionName: 'set-greeting-with-payment',
    functionArgs: [stringAsciiCV(message)],
    postConditions: [], // Post conditions will be handled by Stacks Connect
  }),

  // Update personal greeting (free)
  setPersonalGreeting: (message: string) => ({
    functionName: 'set-personal-greeting-advanced',
    functionArgs: [stringAsciiCV(message)],
  }),

  // Like a greeting entry
  likeGreeting: (entryId: number) => ({
    functionName: 'like-greeting',
    functionArgs: [uintCV(entryId)],
  }),
};

// Error message translator for user-friendly messages
export function translateContractError(error: string): string {
  if (error.includes('err u100')) return 'Not authorized to perform this action';
  if (error.includes('err u101')) return 'Message is too long (max 100 characters)';
  if (error.includes('err u102')) return 'Message cannot be empty';
  if (error.includes('err u103')) return 'Insufficient payment for this update';
  if (error.includes('err u104')) return 'Greeting entry not found';
  if (error.includes('err u105')) return 'You have already liked this greeting';
  if (error.includes('err u106')) return 'You cannot like your own greeting';
  
  // Handle common wallet/network errors
  if (error.includes('User rejected')) return 'Transaction cancelled by user';
  if (error.includes('Insufficient funds')) return 'Not enough STX to complete transaction';
  if (error.includes('Network error')) return 'Network connection failed - please try again';
  
  return `Transaction failed: ${error}`;
}