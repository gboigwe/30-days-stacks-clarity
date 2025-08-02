'use client';

import { useWallet } from '@/hooks/useWallet';
import { useContractRead } from '@/hooks/useContract';

export default function Home() {
  const { address, isConnected, connectWallet, disconnectWallet, isLoading } = useWallet();
  const { data: greeting, isLoading: greetingLoading } = useContractRead('get-greeting');
  const { data: blockInfo, isLoading: blockLoading } = useContractRead('get-block-info');
  const { data: stats, isLoading: statsLoading } = useContractRead('get-stats');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            My First Stacks dApp
          </h1>
          <p className="text-gray-600 mt-2">
            Connected to your Clarity 3.0 smart contract from Day 1
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Wallet</h2>
          
          {isConnected ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Connected Address:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {address}
              </p>
              <button 
                onClick={disconnectWallet}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isLoading}
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        {/* Contract Data */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contract Data</h2>
          
          {/* Current Greeting */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700">Current Greeting:</h3>
            {greetingLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <p className="text-lg font-semibold text-blue-600">
                {greeting || 'No greeting found'}
              </p>
            )}
          </div>

          {/* Contract Stats */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Contract Statistics:</h3>
            {statsLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : stats ? (
              <div className="space-y-1 text-sm">
                <p>Owner: <span className="font-mono text-xs">{stats.owner}</span></p>
                <p>Update Count: <span className="font-mono">{stats['update-count']}</span></p>
                <p>Total Updates: <span className="font-mono">{stats['total-updates']}</span></p>
              </div>
            ) : (
              <p className="text-gray-500">No stats available</p>
            )}
          </div>

          {/* Clarity 3.0 Block Info */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Clarity 3.0 Block Info:</h3>
            {blockLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : blockInfo ? (
              <div className="space-y-1 text-sm">
                <p>Stacks Blocks: <span className="font-mono">{blockInfo['stacks-blocks']}</span></p>
                <p>Tenure Blocks: <span className="font-mono">{blockInfo['tenure-blocks']}</span></p>
                <p>Est. Time: <span className="font-mono">{blockInfo['estimated-time']}s</span></p>
              </div>
            ) : (
              <p className="text-gray-500">No block info available</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How to use this dApp:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Click "Connect Wallet" to connect your Stacks wallet</li>
            <li>2. View the greeting and statistics from your Day 1 smart contract</li>
            <li>3. Observe the Clarity 3.0 block height features in action</li>
            <li>4. Tomorrow we'll add write functionality to update the contract!</li>
          </ul>
        </div>

      </div>
    </div>
  );
}