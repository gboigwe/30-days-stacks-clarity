// Contract interaction utilities for advanced patterns
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
  listCV,
  boolCV
} from '@stacks/transactions';
import { getCurrentNetwork } from './stacks';

const { network, contractAddress, taskManagerContract, userProfilesContract } = getCurrentNetwork();

// Advanced read functions for multi-user data loading
export const contractReads = {
  // Task-related reads
  async getTask(taskId: number) {
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: taskManagerContract,
      functionName: 'get-task',
      functionArgs: [uintCV(taskId)],
      network,
      senderAddress: contractAddress,
    });
    return cvToJSON(result);
  },

  async getUserProfile(userAddress: string) {
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: taskManagerContract,
      functionName: 'get-user-profile',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: contractAddress,
    });
    return cvToJSON(result);
  },

  async getCommunityStats() {
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: taskManagerContract,
      functionName: 'get-community-stats',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });
    return cvToJSON(result);
  },

  async getUserReputation(userAddress: string) {
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: taskManagerContract,
      functionName: 'get-user-reputation',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: contractAddress,
    });
    return cvToJSON(result);
  },

  async getTasksByCategory(category: string) {
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: taskManagerContract,
      functionName: 'get-tasks-by-category',
      functionArgs: [stringAsciiCV(category)],
      network,
      senderAddress: contractAddress,
    });
    return cvToJSON(result);
  },

  // User profiles contract reads
  async getExtendedProfile(userAddress: string) {
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: userProfilesContract,
      functionName: 'get-extended-profile',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: contractAddress,
    });
    return cvToJSON(result);
  },

  async getUserStats(userAddress: string) {
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: userProfilesContract,
      functionName: 'get-user-stats',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: contractAddress,
    });
    return cvToJSON(result);
  }
};

// Function argument builders for contract calls
export const buildFunctionArgs = {
  createTask: (title: string, description: string, category: string, difficulty: number, stxReward: number) => [
    stringAsciiCV(title),
    stringAsciiCV(description),
    stringAsciiCV(category),
    uintCV(difficulty),
    uintCV(stxReward)
  ],

  applyForTask: (taskId: number, message: string) => [
    uintCV(taskId),
    stringAsciiCV(message)
  ],

  assignTask: (taskId: number, assignee: string) => [
    uintCV(taskId),
    standardPrincipalCV(assignee)
  ],

  completeTask: (taskId: number) => [
    uintCV(taskId)
  ],

  createProfile: (username: string, bio: string, skills: string[]) => [
    stringAsciiCV(username),
    stringAsciiCV(bio),
    listCV(skills.map(skill => stringAsciiCV(skill)))
  ]
};