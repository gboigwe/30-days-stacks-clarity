// Token calculation and utility functions
import { TOKEN_CONSTANTS } from './stacks';
import type { UserTokenStats, TokenHolder, DistributionInfo } from '@/types/token';

export const tokenCalculations = {
  // Calculate reputation level based on token activity
  calculateReputationLevel: (stats: UserTokenStats): number => {
    const { totalEarned, totalTransferredIn, totalTransferredOut, balance } = stats;
    
    // Base reputation from earned tokens (tasks completed)
    const earnedScore = Math.floor(totalEarned / TOKEN_CONSTANTS.MICRO_AOD_PER_AOD) * 10;
    
    // Community participation bonus
    const participationScore = (totalTransferredIn + totalTransferredOut) > 0 ? 5 : 0;
    
    // Current holding bonus
    const holdingScore = Math.floor(balance / TOKEN_CONSTANTS.MICRO_AOD_PER_AOD);
    
    return Math.min(earnedScore + participationScore + holdingScore, 100);
  },

  // Calculate governance power (may be different from balance)
  calculateGovernancePower: (balance: number, reputationLevel: number): number => {
    // Base voting power is balance, with reputation multiplier
    const basepower = balance / TOKEN_CONSTANTS.MICRO_AOD_PER_AOD;
    const reputationMultiplier = 1 + (reputationLevel / 100);
    return Math.floor(basepower * reputationMultiplier);
  },

  // Calculate user's portfolio value (if tokens had fiat value)
  calculatePortfolioValue: (balance: number, tokenPrice: number = 0): number => {
    const aodBalance = balance / TOKEN_CONSTANTS.MICRO_AOD_PER_AOD;
    return aodBalance * tokenPrice;
  },

  // Determine if user is a founding member (claimed distribution)
  isFoundingMember: (firstReceivedBlock: number, distributionEndBlock: number): boolean => {
    return firstReceivedBlock <= distributionEndBlock;
  },

  // Calculate activity score based on transaction patterns
  calculateActivityScore: (stats: UserTokenStats): number => {
    const { lastActivityBlock, firstReceivedBlock, totalTransferredIn, totalTransferredOut } = stats;
    
    // Recency score (more recent activity = higher score)
    const currentBlock = Date.now(); // Simplified - would use actual block height
    const blocksSinceActivity = currentBlock - lastActivityBlock;
    const recencyScore = Math.max(0, 50 - Math.floor(blocksSinceActivity / 1000));
    
    // Transaction volume score
    const totalVolume = totalTransferredIn + totalTransferredOut;
    const volumeScore = Math.min(totalVolume / TOKEN_CONSTANTS.MICRO_AOD_PER_AOD, 50);
    
    return Math.min(recencyScore + volumeScore, 100);
  }
};

export const tokenFormatting = {
  // Format token amount for different contexts
  formatAmount: (amount: number, context: 'display' | 'precise' | 'compact' = 'display'): string => {
    const aodAmount = amount / TOKEN_CONSTANTS.MICRO_AOD_PER_AOD;
    
    switch (context) {
      case 'display':
        return `${aodAmount.toFixed(2)} AOD`;
      case 'precise':
        return `${aodAmount.toFixed(6)} AOD`;
      case 'compact':
        if (aodAmount >= 1000000) {
          return `${(aodAmount / 1000000).toFixed(1)}M AOD`;
        } else if (aodAmount >= 1000) {
          return `${(aodAmount / 1000).toFixed(1)}K AOD`;
        }
        return `${aodAmount.toFixed(0)} AOD`;
      default:
        return `${aodAmount.toFixed(2)} AOD`;
    }
  },

  // Format percentage with proper styling
  formatPercentage: (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
  },

  // Format time ago from block height
  formatTimeAgo: (blockHeight: number): string => {
    // Simplified - in real app, would calculate based on average block time
    const hoursAgo = Math.floor((Date.now() - blockHeight) / (1000 * 60 * 60));
    
    if (hoursAgo < 1) return 'Less than 1 hour ago';
    if (hoursAgo < 24) return `${hoursAgo} hours ago`;
    if (hoursAgo < 168) return `${Math.floor(hoursAgo / 24)} days ago`;
    return `${Math.floor(hoursAgo / 168)} weeks ago`;
  },

  // Format address for display
  formatAddress: (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Get reputation level display
  getReputationDisplay: (level: number): { label: string; color: string } => {
    if (level >= 80) return { label: 'Legend', color: 'text-yellow-600' };
    if (level >= 60) return { label: 'Expert', color: 'text-purple-600' };
    if (level >= 40) return { label: 'Advanced', color: 'text-blue-600' };
    if (level >= 20) return { label: 'Intermediate', color: 'text-green-600' };
    if (level >= 5) return { label: 'Beginner', color: 'text-orange-600' };
    return { label: 'Newcomer', color: 'text-gray-600' };
  }
};

export const tokenValidation = {
  // Validate recipient address
  isValidStacksAddress: (address: string): boolean => {
    // Basic validation for Stacks addresses
    return /^ST[0-9A-HJ-NP-Z]{38}$/.test(address) || /^SM[0-9A-HJ-NP-Z]{38}$/.test(address);
  },

  // Validate transfer amount
  isValidTransferAmount: (amount: string, userBalance: number): { valid: boolean; error?: string } => {
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount)) {
      return { valid: false, error: 'Invalid amount format' };
    }
    
    if (parsedAmount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    const microAmount = parsedAmount * TOKEN_CONSTANTS.MICRO_AOD_PER_AOD;
    if (microAmount > userBalance) {
      return { valid: false, error: 'Insufficient balance' };
    }
    
    if (parsedAmount > 1000000) {
      return { valid: false, error: 'Amount too large' };
    }
    
    return { valid: true };
  },

  // Check if memo is valid
  isValidMemo: (memo: string): boolean => {
    return memo.length <= 34; // SIP-010 memo limit
  }
};

export const distributionUtils = {
  // Calculate distribution progress
  getDistributionProgress: (info: DistributionInfo): number => {
    return (info.totalClaims / info.maxClaims) * 100;
  },

  // Check if distribution is nearly full
  isDistributionNearlyFull: (info: DistributionInfo): boolean => {
    return info.claimsRemaining <= 5;
  },

  // Get urgency level for claiming
  getClaimUrgency: (info: DistributionInfo): 'low' | 'medium' | 'high' | 'critical' => {
    const remaining = info.claimsRemaining;
    if (remaining <= 2) return 'critical';
    if (remaining <= 5) return 'high';
    if (remaining <= 10) return 'medium';
    return 'low';
  },

  // Estimate time until distribution ends (simplified)
  estimateTimeToEnd: (info: DistributionInfo): string => {
    if (!info.distributionActive) return 'Distribution ended';
    if (info.claimsRemaining === 0) return 'Distribution full';
    
    // Simplified estimation based on current claim rate
    const hoursRemaining = info.claimsRemaining * 2; // Assume 2 hours between claims
    if (hoursRemaining < 24) return `~${hoursRemaining} hours remaining`;
    return `~${Math.floor(hoursRemaining / 24)} days remaining`;
  }
};