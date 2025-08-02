'use client';

import { useState, useCallback } from 'react';
import { showContractCall } from '@stacks/connect';
import { AppConfig, UserSession } from '@stacks/connect';
import { contractFunctions, translateContractError } from '@/lib/contract-calls';
import { TransactionState } from '@/types/stacks';

interface WriteContractState {
  state: TransactionState;
  txId?: string;
  error?: string;
  result?: any;
}

export function useContractWrite() {
  const [writeState, setWriteState] = useState<WriteContractState>({ state: 'idle' });
  
  // Create app config and user session
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  const executeWrite = useCallback(async (
    functionName: string,
    args: any[],
    options?: { postConditions?: any[]; fee?: number }
  ) => {
    if (!userSession.isUserSignedIn()) {
      setWriteState({ state: 'failed', error: 'Please connect your wallet first' });
      return;
    }

    try {
      setWriteState({ state: 'signing' });

      // Show the contract call interface
      showContractCall({
        appDetails: {
          name: 'Advanced Hello World dApp',
          icon: `${window.location.origin}/favicon.ico`,
        },
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0],
        contractName: 'advanced-hello-world',
        functionName,
        functionArgs: args,
        postConditions: options?.postConditions || [],
        onFinish: (data) => {
          setWriteState({ 
            state: 'pending', 
            txId: data.txId 
          });
        },
        onCancel: () => {
          setWriteState({ state: 'cancelled' });
        },
      });

    } catch (error: any) {
      const friendlyError = translateContractError(error.message);
      setWriteState({ 
        state: 'failed', 
        error: friendlyError 
      });
    }
  }, [userSession]);

  // Specific contract function helpers
  const setGlobalGreeting = useCallback((message: string, cost?: number) => {
    const contractCall = contractFunctions.setGreetingWithPayment(message, cost);
    return executeWrite(
      contractCall.functionName, 
      contractCall.functionArgs,
      { postConditions: contractCall.postConditions }
    );
  }, [executeWrite]);

  const setPersonalGreeting = useCallback((message: string) => {
    const contractCall = contractFunctions.setPersonalGreeting(message);
    return executeWrite(contractCall.functionName, contractCall.functionArgs);
  }, [executeWrite]);

  const likeGreeting = useCallback((entryId: number) => {
    const contractCall = contractFunctions.likeGreeting(entryId);
    return executeWrite(contractCall.functionName, contractCall.functionArgs);
  }, [executeWrite]);

  const resetState = useCallback(() => {
    setWriteState({ state: 'idle' });
  }, []);

  const updateTransactionState = useCallback((newState: TransactionState, data?: any) => {
    setWriteState(prev => ({
      ...prev,
      state: newState,
      ...data
    }));
  }, []);

  return {
    // State
    ...writeState,
    isIdle: writeState.state === 'idle',
    isSigning: writeState.state === 'signing',
    isPending: writeState.state === 'pending',
    isConfirmed: writeState.state === 'confirmed',
    isFailed: writeState.state === 'failed',
    isCancelled: writeState.state === 'cancelled',
    
    // Actions
    setGlobalGreeting,
    setPersonalGreeting,
    likeGreeting,
    resetState,
    updateTransactionState,
    
    // Generic write function
    executeWrite,
  };
}