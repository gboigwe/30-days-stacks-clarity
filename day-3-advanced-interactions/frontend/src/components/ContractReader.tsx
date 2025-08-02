'use client';

import { useContractRead } from '@/hooks/useContract';
import { OptimisticGreeting } from './OptimisticUI';
import { Blocks, TrendingUp, User, Clock } from 'lucide-react';
import { formatSTX, formatBlockHeight } from '@/lib/transaction-utils';

interface ContractReaderProps {
  optimisticGreeting?: string;
  isOptimisticPending?: boolean;
}

export function ContractReader({ optimisticGreeting, isOptimisticPending }: ContractReaderProps) {
  const { data: greetingMeta, isLoading: greetingLoading } = useContractRead('get-greeting-with-metadata');
  const { data: contractStats, isLoading: statsLoading } = useContractRead('get-contract-stats');
  const { data: blockInfo, isLoading: blockLoading } = useContractRead('get-contract-stats');

  // Use optimistic greeting if available, otherwise use real data
  const displayGreeting = optimisticGreeting || greetingMeta?.message || 'Loading...';
  const isOptimistic = !!optimisticGreeting;

  return (
    <div className="space-y-6">
      {/* Main Greeting Display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Current Global Greeting
        </h2>
        
        <OptimisticGreeting
          greeting={displayGreeting}
          author={greetingMeta?.author}
          isPending={isOptimisticPending}
          isOptimistic={isOptimistic}
          lastUpdated={greetingMeta?.['updated-at'] ? greetingMeta['updated-at'] * 1000 : undefined}
          className="mb-4"
        />

        {greetingLoading && !optimisticGreeting && (
          <div className="text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 mt-2">Loading greeting from blockchain...</p>
          </div>
        )}

        {greetingMeta && !greetingLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span className="font-medium">Author</span>
              </div>
              <p className="font-mono text-xs text-gray-800">
                {greetingMeta.author.slice(0, 12)}...{greetingMeta.author.slice(-8)}
              </p>
            </div>
            
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Update Cost</span>
              </div>
              <p className="font-semibold text-orange-600">
                {formatSTX(greetingMeta['current-cost'])}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contract Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Statistics</h3>
        
        {statsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 mt-2">Loading statistics...</p>
          </div>
        ) : contractStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {contractStats['total-global-updates']}
              </p>
              <p className="text-sm text-blue-600">Total Updates</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Blocks className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatBlockHeight(contractStats['stacks-blocks'])}
              </p>
              <p className="text-sm text-green-600">Current Block</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {formatBlockHeight(contractStats['tenure-blocks'])}
              </p>
              <p className="text-sm text-purple-600">Tenure Height</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Unable to load contract statistics
          </p>
        )}
      </div>

      {/* Clarity 3.0 Block Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Clarity 3.0 Blockchain Info
        </h3>
        
        {blockLoading ? (
          <div className="text-center py-4">
            <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : blockInfo ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Stacks Block Height:</span>
              <span className="font-mono font-medium">{formatBlockHeight(blockInfo['stacks-blocks'])}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tenure Height:</span>
              <span className="font-mono font-medium">{formatBlockHeight(blockInfo['tenure-blocks'])}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Time:</span>
              <span className="font-mono font-medium">
                {Math.floor(blockInfo['estimated-time'] / 60)} minutes
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                ✨ This demonstrates Clarity 3.0's new block height functions that distinguish between fast Stacks blocks and slower tenure blocks.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Block information unavailable
          </p>
        )}
      </div>
    </div>
  );
}