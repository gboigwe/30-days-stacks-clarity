// Token transfer and distribution operations hook
'use client';

import { useState, useCallback } from 'react';
import { showContractCall } from '@stacks/connect';
import { 
  uintCV, 
  standardPrincipalCV, 
  someCV, 
  noneCV, 
  bufferCV 
} from '@stacks/transactions';
import { getCurrentNetwork, tokenUtils } from '@/lib/stacks';
import type { ClaimResult } from '@/types/token';

type TransferState = 'idle' | 'signing' | 'pending' | 'completed' | 'failed';

interface TransferResult {
  success: boolean;
  txId?: string;
  error?: string;
}

export function useTokenTransfers() {
  const [transferState, setTransferState] = useState<TransferState>('idle');
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { network, contractAddress, tokenContract } = getCurrentNetwork();

  // Transfer tokens to another user
  const transferTokens = useCallback(async (
    recipient: string,
    amount: number,
    memo?: string
  ): Promise<TransferResult> => {
    try {
      setTransferState('signing');
      setError(null);

      // Convert AOD to micro-AOD (6 decimals)
      const amountInMicroAOD = tokenUtils.toMicroAOD(amount);

      const functionArgs = [
        uintCV(amountInMicroAOD),
        standardPrincipalCV(recipient), // from - will be set to tx-sender by wallet
        standardPrincipalCV(recipient), // to
        memo ? someCV(bufferCV(new TextEncoder().encode(memo.slice(0, 34)))) : noneCV()
      ];

      setTransferState('pending');

      const result = await new Promise<any>((resolve, reject) => {
        showContractCall({
          network,
          contractAddress,
          contractName: tokenContract,
          functionName: 'transfer',
          functionArgs,
          onFinish: (data) => {
            console.log('Transfer transaction submitted:', data.txId);
            resolve(data);
          },
          onCancel: () => {
            reject(new Error('Transaction cancelled by user'));
          },
        });
      });

      setLastTxId(result.txId);
      setTransferState('completed');

      return {
        success: true,
        txId: result.txId
      };

    } catch (error) {
      console.error('Transfer failed:', error);
      setTransferState('failed');
      const errorMessage = error instanceof Error ? error.message : 'Transfer failed';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [network, contractAddress, tokenContract]);

  // Claim community distribution tokens
  const claimCommunityTokens = useCallback(async (): Promise<ClaimResult> => {
    try {
      setTransferState('signing');
      setError(null);

      setTransferState('pending');

      const result = await new Promise<any>((resolve, reject) => {
        showContractCall({
          network,
          contractAddress,
          contractName: tokenContract,
          functionName: 'claim-community-distribution',
          functionArgs: [],
          onFinish: (data) => {
            console.log('Claim transaction submitted:', data.txId);
            resolve(data);
          },
          onCancel: () => {
            reject(new Error('Transaction cancelled by user'));
          },
        });
      });

      setLastTxId(result.txId);
      setTransferState('completed');

      // In a real app, you'd wait for transaction confirmation to get the actual result
      // For now, return optimistic data
      return {
        success: true,
        message: 'Welcome to the AgeOfDevs community!',
        tokensReceived: 1000, // 1000 AOD
        claimNumber: 0, // Would be actual claim number from transaction result
        blockHeight: 0, // Would be actual block height
        distributionActive: true,
        txId: result.txId
      };

    } catch (error) {
      console.error('Claim failed:', error);
      setTransferState('failed');
      const errorMessage = error instanceof Error ? error.message : 'Claim failed';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        tokensReceived: 0,
        claimNumber: 0,
        blockHeight: 0,
        distributionActive: false
      };
    }
  }, [network, contractAddress, tokenContract]);

  // Reset transfer state
  const resetTransferState = useCallback(() => {
    setTransferState('idle');
    setError(null);
    setLastTxId(null);
  }, []);

  // Check transaction status (simplified - would use real API in production)
  const checkTransactionStatus = useCallback(async (txId: string): Promise<'pending' | 'confirmed' | 'failed'> => {
    // In a real app, you'd query the Stacks API or node to check transaction status
    // For now, return pending
    return 'pending';
  }, []);

  return {
    transferTokens,
    claimCommunityTokens,
    transferState,
    lastTxId,
    error,
    resetTransferState,
    checkTransactionStatus,
  };
}