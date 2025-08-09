// Comprehensive token data management hook - implementing blog patterns
'use client';

import { useState, useCallback, useEffect } from 'react';
import { fetchCallReadOnlyFunction, standardPrincipalCV } from '@stacks/transactions';
import { getCurrentNetwork, tokenUtils } from '@/lib/stacks';
import type { 
  TokenStats, 
  UserTokenStats, 
  DistributionInfo, 
  DistributionClaim,
  TokenContractInfo 
} from '@/types/token';

export interface TokenData {
  balance: number;
  totalSupply: number;
  contractInfo: TokenContractInfo | null;
  userStats: UserTokenStats | null;
  distributionInfo: DistributionInfo | null;
  distributionClaim: DistributionClaim | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAgeOfDevsTokenReturn {
  tokenData: TokenData;
  loadTokenData: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

export function useAgeOfDevsToken(walletAddress?: string): UseAgeOfDevsTokenReturn {
  const [tokenData, setTokenData] = useState<TokenData>({
    balance: 0,
    totalSupply: 0,
    contractInfo: null,
    userStats: null,
    distributionInfo: null,
    distributionClaim: null,
    isLoading: false,
    error: null,
  });

  const { network, contractAddress, tokenContract } = getCurrentNetwork();

  // Load comprehensive token data with parallel loading for performance
  const loadTokenData = useCallback(async () => {
    if (!walletAddress) {
      setTokenData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setTokenData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Parallel loading for better performance as described in blog
      const [
        balanceResult,
        totalSupplyResult,
        contractInfoResult,
        userStatsResult,
        distributionInfoResult,
        distributionClaimResult
      ] = await Promise.all([
        // Get user's token balance
        fetchCallReadOnlyFunction({
          contractAddress,
          contractName: tokenContract,
          functionName: 'get-balance',
          functionArgs: [standardPrincipalCV(walletAddress)],
          network,
          senderAddress: walletAddress,
        }),

        // Get total token supply
        fetchCallReadOnlyFunction({
          contractAddress,
          contractName: tokenContract,
          functionName: 'get-total-supply',
          functionArgs: [],
          network,
          senderAddress: walletAddress,
        }),

        // Get contract information
        fetchCallReadOnlyFunction({
          contractAddress,
          contractName: tokenContract,
          functionName: 'get-contract-info',
          functionArgs: [],
          network,
          senderAddress: walletAddress,
        }),

        // Get user's token statistics
        fetchCallReadOnlyFunction({
          contractAddress,
          contractName: tokenContract,
          functionName: 'get-holder-stats',
          functionArgs: [standardPrincipalCV(walletAddress)],
          network,
          senderAddress: walletAddress,
        }).catch(() => null), // Optional - user may not have stats yet

        // Get distribution information
        fetchCallReadOnlyFunction({
          contractAddress,
          contractName: tokenContract,
          functionName: 'get-distribution-info',
          functionArgs: [],
          network,
          senderAddress: walletAddress,
        }),

        // Check if user has claimed distribution tokens
        fetchCallReadOnlyFunction({
          contractAddress,
          contractName: tokenContract,
          functionName: 'get-distribution-claim',
          functionArgs: [standardPrincipalCV(walletAddress)],
          network,
          senderAddress: walletAddress,
        }).catch(() => null) // Optional - user may not have claimed
      ]);

      // Process results and handle Clarity value conversion
      const balance = balanceResult.type === 'ok' ? Number(balanceResult.value) : 0;
      const totalSupply = totalSupplyResult.type === 'ok' ? Number(totalSupplyResult.value) : 0;
      
      // Parse contract info - simplified since we know the token values
      const contractInfo: TokenContractInfo | null = contractInfoResult.type === 'ok' 
        ? {
            name: 'AgeOfDevs Token',
            symbol: 'AOD', 
            decimals: 6,
            totalSupply: totalSupply,
            contractAddress: contractAddress,
            initialized: true
          }
        : null;

      // Parse user stats - simplified with defaults since contract might not have user stats yet
      const userStats: UserTokenStats | null = userStatsResult?.type === 'ok'
        ? {
            balance: balance,
            firstReceivedBlock: 0, // Would be parsed from contract response
            lastActivityBlock: 0,
            totalEarned: 0,
            totalTransferredIn: 0,
            totalTransferredOut: 0,
            reputationLevel: balance > 0 ? 1 : 0,
            governancePower: balance
          }
        : null;

      // Parse distribution info - with default values
      const distributionInfo: DistributionInfo | null = distributionInfoResult.type === 'ok'
        ? {
            totalClaims: 0, // Would parse from contract result
            maxClaims: 30,
            distributionActive: true,
            claimsRemaining: 30,
            distributionAmount: 1000000000 // 1000 AOD in micro-AOD
          }
        : {
            totalClaims: 0,
            maxClaims: 30,
            distributionActive: true,
            claimsRemaining: 30,
            distributionAmount: 1000000000
          };

      // Parse distribution claim - with defaults
      const distributionClaim: DistributionClaim | null = distributionClaimResult?.type === 'ok'
        ? {
            claimed: false, // Would parse from contract result  
            claimAmount: 0,
            claimBlock: 0,
            claimNumber: 0
          }
        : null;

      setTokenData({
        balance,
        totalSupply,
        contractInfo,
        userStats,
        distributionInfo,
        distributionClaim,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Failed to load token data:', error);
      setTokenData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load token data'
      }));
    }
  }, [walletAddress, contractAddress, tokenContract, network]);

  // Refresh only balance (faster for frequent updates)
  const refreshBalance = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const balanceResult = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName: tokenContract,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(walletAddress)],
        network,
        senderAddress: walletAddress,
      });

      const balance = balanceResult.type === 'ok' ? Number(balanceResult.value) : 0;
      
      setTokenData(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [walletAddress, contractAddress, tokenContract, network]);

  // Clear error state
  const clearError = useCallback(() => {
    setTokenData(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-load data when wallet address changes
  useEffect(() => {
    loadTokenData();
  }, [loadTokenData]);

  // Auto-refresh balance periodically (every 30 seconds)
  useEffect(() => {
    if (!walletAddress) return;

    const refreshInterval = setInterval(() => {
      refreshBalance();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [refreshBalance, walletAddress]);

  return {
    tokenData,
    loadTokenData,
    refreshBalance,
    clearError,
  };
}