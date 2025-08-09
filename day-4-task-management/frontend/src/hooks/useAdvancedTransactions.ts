// Complex transaction operations from the blog
'use client';

import { useState, useCallback } from 'react';
import { TransactionInfo } from '@/types/stacks';
import { monitorTransaction, formatTransactionError } from '@/lib/transaction-utils';

interface TransactionState {
  [txId: string]: TransactionInfo;
}

export function useAdvancedTransactions() {
  const [transactions, setTransactions] = useState<TransactionState>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const submitTransaction = useCallback(async (
    operation: string,
    contractCall: () => Promise<string>
  ): Promise<string> => {
    setIsProcessing(true);
    
    try {
      // Execute the contract call
      const txId = await contractCall();
      
      // Initialize transaction tracking
      setTransactions(prev => ({
        ...prev,
        [txId]: {
          txId,
          status: 'pending'
        }
      }));

      // Monitor transaction progress
      monitorTransaction(txId, (status) => {
        setTransactions(prev => ({
          ...prev,
          [txId]: {
            ...prev[txId],
            status
          }
        }));
        
        if (status === 'confirmed' || status === 'failed') {
          setIsProcessing(false);
        }
      });

      return txId;
    } catch (error) {
      setIsProcessing(false);
      throw new Error(formatTransactionError(error));
    }
  }, []);

  const getTransactionStatus = useCallback((txId: string) => {
    return transactions[txId]?.status || 'unknown';
  }, [transactions]);

  const clearTransaction = useCallback((txId: string) => {
    setTransactions(prev => {
      const updated = { ...prev };
      delete updated[txId];
      return updated;
    });
  }, []);

  const clearAllTransactions = useCallback(() => {
    setTransactions({});
  }, []);

  return {
    transactions,
    isProcessing,
    submitTransaction,
    getTransactionStatus,
    clearTransaction,
    clearAllTransactions
  };
}