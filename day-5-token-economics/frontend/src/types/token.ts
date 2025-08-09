// Token-related type definitions for the AgeOfDevs token system

export interface TokenBalance {
  balance: number;
  microBalance: number; // Balance in micro-AOD (6 decimals)
}

export interface TokenStats {
  totalSupply: number;
  circulatingSupply: number;
  totalHolders: number;
  distributionClaimed: number;
  distributionRemaining: number;
}

export interface UserTokenStats {
  balance: number;
  firstReceivedBlock: number;
  lastActivityBlock: number;
  totalEarned: number;
  totalTransferredIn: number;
  totalTransferredOut: number;
  reputationLevel: number;
  governancePower: number;
}

export interface DistributionClaim {
  claimed: boolean;
  claimAmount: number;
  claimBlock: number;
  claimNumber: number;
}

export interface DistributionInfo {
  totalClaims: number;
  maxClaims: number;
  distributionActive: boolean;
  claimsRemaining: number;
  distributionAmount: number;
}

export interface TokenTransfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  memo?: string;
  blockHeight: number;
  timestamp: number;
  txId: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TokenHolder {
  address: string;
  balance: number;
  percentage: number;
  reputationLevel: number;
  governancePower: number;
  firstReceivedBlock: number;
  isFoundingMember: boolean;
  claimNumber?: number;
}

export interface TokenActivity {
  id: string;
  type: 'transfer' | 'mint' | 'distribution_claim' | 'task_reward';
  description: string;
  amount: number;
  user: string;
  blockHeight: number;
  timestamp: number;
  txId?: string;
}

export interface TokenContractInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  contractAddress: string;
  initialized: boolean;
}

export interface ClaimResult {
  success: boolean;
  message: string;
  tokensReceived: number;
  claimNumber: number;
  blockHeight: number;
  distributionActive: boolean;
  txId?: string;
}

export interface TransferFormData {
  recipient: string;
  amount: string;
  memo?: string;
}

export interface TokenUtility {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  requiredBalance?: number;
}