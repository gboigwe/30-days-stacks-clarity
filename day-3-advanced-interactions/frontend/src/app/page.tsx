'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContractRead } from '@/hooks/useContract';
import { useTransactionState } from '@/hooks/useTransactionState';
import { useOptimisticGreeting } from '@/hooks/useOptimisticUpdate';

// Components
import { WalletConnection } from '@/components/WalletConnection';
import { ContractReader } from '@/components/ContractReader';
import { ContractWriter } from '@/components/ContractWriter';
import { TransactionStatus } from '@/components/TransactionStatus';

export default function Home() {
  const [optimisticGreeting, setOptimisticGreeting] = useState<string>('');
  const [isOptimisticPending, setIsOptimisticPending] = useState(false);

  // Wallet connection
  const { address, isConnected, connectWallet, disconnectWallet, isLoading } = useWallet();
  
  // Contract data
  const { data: greetingMeta, isLoading: greetingLoading } = useContractRead('get-greeting-with-metadata');
  
  // Transaction management
  const transactionManager = useTransactionState();
  
  // Optimistic greeting management
  const greeting = useOptimisticGreeting(greetingMeta?.message || '');

  // Handle transaction started from ContractWriter
  const handleTransactionStarted = (txId: string, type: string) => {
    // Add transaction to tracking
    transactionManager.addTransaction(txId, type, []);
    
    // If it's a global greeting update, apply optimistic update
    if (type === 'global-greeting') {
      setIsOptimisticPending(true);
    }
  };

  // Monitor transaction completion to revert optimistic updates if needed
  useEffect(() => {
    const pendingGreetingTxs = transactionManager.pendingTransactions
      .filter(tx => tx.functionName === 'set-greeting-with-payment');
    
    if (pendingGreetingTxs.length === 0 && isOptimisticPending) {
      // No more pending greeting transactions, clear optimistic state
      setIsOptimisticPending(false);
      setOptimisticGreeting('');
    }
  }, [transactionManager.pendingTransactions, isOptimisticPending]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Advanced Hello World dApp
          </h1>
          <p className="text-lg text-gray-600 mb-1">
            Day 3: Making Your dApp Interactive - Understanding Blockchain Writing
          </p>
          <p className="text-sm text-gray-500">
            ✨ Now with write capabilities, optimistic UI, and transaction management!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Wallet & Contract Reading */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Wallet Connection */}
              <WalletConnection
                address={address}
                isConnected={isConnected}
                isLoading={isLoading}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
              />

              {/* Contract Reading */}
              <ContractReader 
                optimisticGreeting={optimisticGreeting}
                isOptimisticPending={isOptimisticPending}
              />

              {/* Contract Writing - Only show when wallet is connected */}
              {isConnected && (
                <ContractWriter 
                  onTransactionStarted={handleTransactionStarted}
                  currentCost={greetingMeta?.['current-cost'] || 1000000}
                />
              )}

            </div>

            {/* Right Column - Transaction Status */}
            <div className="space-y-6">
              
              <TransactionStatus
                transactions={transactionManager.transactions}
                pendingCount={transactionManager.pendingCount}
                activeCount={transactionManager.activeCount}
                onClearCompleted={transactionManager.clearCompleted}
                onRemoveTransaction={transactionManager.removeTransaction}
              />

              {/* Tutorial Progress */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  🎯 Day 3 Achievements
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700">Smart contract with write functions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700">Transaction state management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700">Optimistic UI for instant feedback</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700">Error handling & user communication</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700">Real-time transaction monitoring</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">
                  🚀 What's Next?
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    <strong>Day 4:</strong> Building a real-world dApp with task management
                  </p>
                  <p>
                    <strong>Day 5:</strong> Advanced user interactions and social features
                  </p>
                  <p>
                    <strong>Day 6:</strong> Deployment and production optimization
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Part of the <strong>30 Days of Clarity & Stacks.js</strong> tutorial series
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Learn blockchain writing, optimistic UI, and transaction management
          </p>
        </div>
      </div>
    </div>
  );
}