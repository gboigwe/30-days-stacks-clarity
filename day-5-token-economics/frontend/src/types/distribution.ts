// Token distribution related types

export interface DistributionConfig {
  maxClaims: number;
  tokensPerClaim: number;
  isActive: boolean;
  startBlock?: number;
  endBlock?: number;
}

export interface DistributionStatus {
  currentClaims: number;
  remainingClaims: number;
  isEligible: boolean;
  hasClaimedBefore: boolean;
  claimInProgress: boolean;
  estimatedGasFee: number;
}

export interface CommunityStats {
  foundingMembers: number;
  activeHolders: number;
  totalDistributed: number;
  averageHolding: number;
  topHolders: TokenHolder[];
  recentActivity: TokenActivity[];
}

export interface TokenLeaderboard {
  topHolders: Array<{
    rank: number;
    address: string;
    balance: number;
    percentage: number;
    reputationLevel: number;
    isFounder: boolean;
  }>;
  topEarners: Array<{
    rank: number;
    address: string;
    totalEarned: number;
    tasksCompleted: number;
    avgEarnPerTask: number;
  }>;
  mostActive: Array<{
    rank: number;
    address: string;
    transactionCount: number;
    lastActivity: number;
    activityScore: number;
  }>;
}

import type { TokenHolder, TokenActivity } from './token';