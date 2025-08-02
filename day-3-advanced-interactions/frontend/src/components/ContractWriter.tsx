'use client';

import { useState } from 'react';
import { Send, DollarSign, User, Loader2 } from 'lucide-react';
import { useContractWrite } from '@/hooks/useContractWrite';
import { formatSTX } from '@/lib/transaction-utils';

interface ContractWriterProps {
  onTransactionStarted?: (txId: string, type: string) => void;
  currentCost?: number;
}

export function ContractWriter({ onTransactionStarted, currentCost = 1000000 }: ContractWriterProps) {
  const [globalMessage, setGlobalMessage] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const writeContract = useContractWrite();

  const handleGlobalUpdate = async () => {
    if (!globalMessage.trim()) return;
    
    try {
      await writeContract.setGlobalGreeting(globalMessage, currentCost);
      
      if (writeContract.txId && onTransactionStarted) {
        onTransactionStarted(writeContract.txId, 'global-greeting');
      }
      
      // Clear form on successful submission
      if (writeContract.isPending) {
        setGlobalMessage('');
      }
    } catch (error) {
      console.error('Failed to update global greeting:', error);
    }
  };

  const handlePersonalUpdate = async () => {
    if (!personalMessage.trim()) return;
    
    try {
      await writeContract.setPersonalGreeting(personalMessage);
      
      if (writeContract.txId && onTransactionStarted) {
        onTransactionStarted(writeContract.txId, 'personal-greeting');
      }
      
      // Clear form on successful submission
      if (writeContract.isPending) {
        setPersonalMessage('');
      }
    } catch (error) {
      console.error('Failed to update personal greeting:', error);
    }
  };

  const isGlobalValid = globalMessage.trim().length > 0 && globalMessage.length <= 100;
  const isPersonalValid = personalMessage.trim().length > 0 && personalMessage.length <= 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Update Greetings</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Global Greeting Update (Costs STX) */}
        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
          <div className="flex items-center mb-3">
            <DollarSign className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="font-medium text-gray-900">Global Greeting</h3>
            <span className="ml-2 px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded">
              Costs {formatSTX(currentCost)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Update the main greeting that everyone sees. This costs STX and appears in the blockchain history.
          </p>

          <div className="space-y-3">
            <div>
              <textarea
                value={globalMessage}
                onChange={(e) => setGlobalMessage(e.target.value)}
                placeholder="Enter your global greeting message..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={100}
                disabled={writeContract.isSigning || writeContract.isPending}
              />
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${globalMessage.length > 90 ? 'text-red-500' : 'text-gray-500'}`}>
                  {globalMessage.length}/100 characters
                </span>
                {!isGlobalValid && globalMessage.length > 0 && (
                  <span className="text-xs text-red-500">Invalid message</span>
                )}
              </div>
            </div>

            <button
              onClick={handleGlobalUpdate}
              disabled={!isGlobalValid || writeContract.isSigning || writeContract.isPending}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {writeContract.isSigning || writeContract.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {writeContract.isSigning ? 'Check Wallet...' : 'Broadcasting...'}
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Update Global ({formatSTX(currentCost)})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Personal Greeting Update (Free) */}
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Personal Greeting</h3>
            <span className="ml-2 px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">
              Free
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Set your personal greeting that's associated with your wallet address. This is free but only costs gas.
          </p>

          <div className="space-y-3">
            <div>
              <textarea
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Enter your personal greeting..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={100}
                disabled={writeContract.isSigning || writeContract.isPending}
              />
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${personalMessage.length > 90 ? 'text-red-500' : 'text-gray-500'}`}>
                  {personalMessage.length}/100 characters
                </span>
                {!isPersonalValid && personalMessage.length > 0 && (
                  <span className="text-xs text-red-500">Invalid message</span>
                )}
              </div>
            </div>

            <button
              onClick={handlePersonalUpdate}
              disabled={!isPersonalValid || writeContract.isSigning || writeContract.isPending}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {writeContract.isSigning || writeContract.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {writeContract.isSigning ? 'Check Wallet...' : 'Broadcasting...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Update Personal (Free)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {writeContract.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {writeContract.error}
            </p>
            <button
              onClick={writeContract.resetState}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Status Display */}
        {writeContract.isSigning && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Please check your wallet to sign the transaction...
            </p>
          </div>
        )}

        {writeContract.isPending && writeContract.txId && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Transaction submitted! ID: <code className="font-mono text-xs">{writeContract.txId}</code>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              This usually takes 30-60 seconds to complete.
            </p>
          </div>
        )}

        {isExpanded && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">How This Works</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Global Greeting:</strong> Updates the main message everyone sees. Requires STX payment and creates a permanent record on the blockchain.
              </p>
              <p>
                <strong>Personal Greeting:</strong> Sets your personal message associated with your wallet. Free to update but requires gas fees.
              </p>
              <p>
                <strong>Transaction Flow:</strong> Click update → Wallet opens → Sign transaction → Wait for confirmation → Success!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}