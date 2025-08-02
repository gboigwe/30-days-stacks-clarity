'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { pollTransactionStatus, TransactionStatus } from '@/lib/transaction-utils';
import { TransactionInfo, TransactionState } from '@/types/stacks';

interface TransactionManager {
  transactions: Record<string, TransactionInfo>;
  activeCount: number;
  pendingCount: number;
}

export function useTransactionState() {
  const [manager, setManager] = useState<TransactionManager>({
    transactions: {},
    activeCount: 0,
    pendingCount: 0,
  });
  
  const pollingRefs = useRef<Record<string, boolean>>({});

  // Add a new transaction to track
  const addTransaction = useCallback((
    txId: string,
    functionName: string,
    args: any[]
  ) => {
    const transaction: TransactionInfo = {
      id: txId,
      state: 'pending',
      functionName,
      args,
      timestamp: Date.now(),
    };

    setManager(prev => ({
      transactions: {
        ...prev.transactions,
        [txId]: transaction,
      },
      activeCount: prev.activeCount + 1,
      pendingCount: prev.pendingCount + 1,
    }));

    // Start polling for this transaction
    startPolling(txId);
  }, []);

  // Update transaction state
  const updateTransaction = useCallback((
    txId: string,
    updates: Partial<TransactionInfo>
  ) => {
    setManager(prev => {
      const currentTx = prev.transactions[txId];
      if (!currentTx) return prev;

      const updatedTx = { ...currentTx, ...updates };
      const isCompleting = 
        (currentTx.state === 'pending' || currentTx.state === 'signing') &&
        (updates.state === 'confirmed' || updates.state === 'failed' || updates.state === 'cancelled');

      return {
        transactions: {
          ...prev.transactions,
          [txId]: updatedTx,
        },
        activeCount: isCompleting ? prev.activeCount - 1 : prev.activeCount,
        pendingCount: 
          currentTx.state === 'pending' && updates.state !== 'pending'
            ? prev.pendingCount - 1
            : prev.pendingCount,
      };
    });
  }, []);

  // Start polling a transaction
  const startPolling = useCallback((txId: string) => {
    if (pollingRefs.current[txId]) return; // Already polling
    
    pollingRefs.current[txId] = true;

    pollTransactionStatus(
      txId,
      (status: TransactionStatus) => {
        updateTransaction(txId, {
          state: status.status,
          error: status.error,
          result: status.result,
        });

        // Stop polling when complete
        if (status.status === 'confirmed' || status.status === 'failed') {
          pollingRefs.current[txId] = false;
        }
      }
    ).catch((error) => {
      updateTransaction(txId, {
        state: 'failed',
        error: error.message,
      });
      pollingRefs.current[txId] = false;
    });
  }, [updateTransaction]);

  // Remove a transaction from tracking
  const removeTransaction = useCallback((txId: string) => {
    pollingRefs.current[txId] = false;
    
    setManager(prev => {
      const { [txId]: removed, ...remaining } = prev.transactions;
      if (!removed) return prev;

      const wasActive = 
        removed.state === 'pending' || 
        removed.state === 'signing';
      const wasPending = removed.state === 'pending';

      return {
        transactions: remaining,
        activeCount: wasActive ? prev.activeCount - 1 : prev.activeCount,
        pendingCount: wasPending ? prev.pendingCount - 1 : prev.pendingCount,
      };
    });
  }, []);

  // Clear all completed transactions
  const clearCompleted = useCallback(() => {
    setManager(prev => {
      const activeTxs = Object.entries(prev.transactions)
        .filter(([_, tx]) => 
          tx.state === 'pending' || 
          tx.state === 'signing'
        )
        .reduce((acc, [id, tx]) => ({ ...acc, [id]: tx }), {});

      return {
        transactions: activeTxs,
        activeCount: Object.keys(activeTxs).length,
        pendingCount: (Object.values(activeTxs) as TransactionInfo[])
          .filter(tx => tx.state === 'pending').length,
      };
    });
  }, []);

  // Get transactions by state
  const getTransactionsByState = useCallback((state: TransactionState) => {
    return Object.values(manager.transactions)
      .filter(tx => tx.state === state)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [manager.transactions]);

  // Get recent transactions (last 10)
  const getRecentTransactions = useCallback(() => {
    return Object.values(manager.transactions)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [manager.transactions]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      Object.keys(pollingRefs.current).forEach(txId => {
        pollingRefs.current[txId] = false;
      });
    };
  }, []);

  return {
    // State
    transactions: manager.transactions,
    activeCount: manager.activeCount,
    pendingCount: manager.pendingCount,
    hasActiveTransactions: manager.activeCount > 0,
    hasPendingTransactions: manager.pendingCount > 0,

    // Actions
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearCompleted,

    // Queries
    getTransactionsByState,
    getRecentTransactions,
    getTransaction: (txId: string) => manager.transactions[txId],

    // Computed states
    pendingTransactions: getTransactionsByState('pending'),
    confirmedTransactions: getTransactionsByState('confirmed'),
    failedTransactions: getTransactionsByState('failed'),
    recentTransactions: getRecentTransactions(),
  };
}