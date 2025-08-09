// Real-time transaction monitoring - from the blog
'use client';

import { useAdvancedTransactions } from '@/hooks/useAdvancedTransactions';
import { CheckCircle, Clock, AlertCircle, X, ExternalLink } from 'lucide-react';

export default function TransactionMonitor() {
  const { transactions, clearTransaction } = useAdvancedTransactions();

  const transactionEntries = Object.entries(transactions);
  
  if (transactionEntries.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm space-y-2">
      {transactionEntries.map(([txId, tx]) => (
        <div
          key={txId}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-up"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {tx.status === 'pending' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-stacks-purple"></div>
                )}
                {tx.status === 'confirmed' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {tx.status === 'failed' && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">
                  Transaction {txId.slice(0, 8)}...
                </h4>
                
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  Status: {tx.status}
                  {tx.error && <span className="text-red-600 block">Error: {tx.error}</span>}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tx.status === 'pending' && (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Confirming...
                      </>
                    )}
                    {tx.status === 'confirmed' && (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirmed
                      </>
                    )}
                    {tx.status === 'failed' && (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                      </>
                    )}
                  </span>
                  
                  {tx.status === 'confirmed' && (
                    <a
                      href={`https://explorer.stacks.co/txid/${tx.txId}?chain=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stacks-purple hover:text-purple-700 text-xs font-medium flex items-center"
                    >
                      View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => clearTransaction(txId)}
              className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}