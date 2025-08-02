'use client';

import { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { TransactionInfo } from '@/types/stacks';
import { formatSTX, getTimeElapsed, formatBlockHeight } from '@/lib/transaction-utils';

interface TransactionStatusProps {
  transactions: Record<string, TransactionInfo>;
  pendingCount: number;
  activeCount: number;
  onClearCompleted: () => void;
  onRemoveTransaction: (txId: string) => void;
}

export function TransactionStatus({ 
  transactions, 
  pendingCount, 
  activeCount,
  onClearCompleted,
  onRemoveTransaction 
}: TransactionStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const transactionList = Object.values(transactions)
    .sort((a, b) => b.timestamp - a.timestamp);

  const recentTransactions = showAll ? transactionList : transactionList.slice(0, 5);

  const getStatusIcon = (state: TransactionInfo['state']) => {
    switch (state) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'signing':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (state: TransactionInfo['state']) => {
    switch (state) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'confirmed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'signing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getStatusText = (state: TransactionInfo['state']) => {
    switch (state) {
      case 'pending':
        return 'Confirming on blockchain...';
      case 'confirmed':
        return 'Successfully confirmed';
      case 'failed':
        return 'Transaction failed';
      case 'cancelled':
        return 'Cancelled by user';
      case 'signing':
        return 'Waiting for signature...';
      default:
        return 'Unknown status';
    }
  };

  const getFunctionDisplayName = (functionName: string) => {
    switch (functionName) {
      case 'set-greeting-with-payment':
        return 'Update Global Greeting';
      case 'set-personal-greeting-advanced':
        return 'Update Personal Greeting';
      case 'like-greeting':
        return 'Like Greeting';
      default:
        return functionName;
    }
  };

  if (transactionList.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Status</h2>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Transactions will appear here after you interact with the contract
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Status</h2>
          {pendingCount > 0 && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              {pendingCount} pending
            </span>
          )}
          {activeCount > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={showAll ? 'Show recent only' : 'Show all transactions'}
          >
            {showAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={onClearCompleted}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Clear completed transactions"
            disabled={transactionList.every(tx => tx.state === 'pending' || tx.state === 'signing')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {recentTransactions.map((tx) => (
          <div
            key={tx.id}
            className={`p-4 rounded-lg border ${getStatusColor(tx.state)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getStatusIcon(tx.state)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">
                      {getFunctionDisplayName(tx.functionName)}
                    </h4>
                    <span className="text-xs opacity-75">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm opacity-75 mt-1">
                    {getStatusText(tx.state)}
                  </p>
                  
                  {/* Show transaction details based on function */}
                  {tx.functionName === 'set-greeting-with-payment' && tx.args[0] && (
                    <p className="text-xs mt-2 font-mono bg-white bg-opacity-50 p-2 rounded">
                      Message: "{tx.args[0].value}"
                    </p>
                  )}
                  
                  {tx.functionName === 'set-personal-greeting-advanced' && tx.args[0] && (
                    <p className="text-xs mt-2 font-mono bg-white bg-opacity-50 p-2 rounded">
                      Personal: "{tx.args[0].value}"
                    </p>
                  )}

                  {tx.error && (
                    <p className="text-xs mt-2 text-red-600 bg-red-100 p-2 rounded">
                      Error: {tx.error}
                    </p>
                  )}

                  {tx.result && tx.state === 'confirmed' && (
                    <div className="text-xs mt-2 bg-white bg-opacity-50 p-2 rounded">
                      <p className="text-green-700">✓ Transaction successful</p>
                      {tx.result.events && tx.result.events.length > 0 && (
                        <p className="text-green-600">
                          {tx.result.events.length} events emitted
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {tx.id && (
                  <a
                    href={`https://explorer.stacks.co/txid/${tx.id}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="View on Stacks Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                
                <button
                  onClick={() => onRemoveTransaction(tx.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Remove from list"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress indicator for pending transactions */}
            {tx.state === 'pending' && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Confirming...</span>
                  <span>Usually takes 30-60 seconds</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-yellow-500 h-1 rounded-full animate-pulse" style={{ width: '45%' }} />
                </div>
              </div>
            )}
          </div>
        ))}

        {!showAll && transactionList.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full p-2 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg"
          >
            Show {transactionList.length - 5} more transactions...
          </button>
        )}
      </div>

      {/* Summary at bottom */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total transactions: {transactionList.length}</span>
          <span>
            Success rate: {
              transactionList.length > 0 
                ? Math.round((transactionList.filter(tx => tx.state === 'confirmed').length / transactionList.length) * 100)
                : 0
            }%
          </span>
        </div>
      </div>
    </div>
  );
}