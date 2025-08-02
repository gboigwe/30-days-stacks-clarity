'use client';

import { Wallet, LogOut, User, ExternalLink } from 'lucide-react';

interface WalletConnectionProps {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnection({ 
  address, 
  isConnected, 
  isLoading, 
  onConnect, 
  onDisconnect 
}: WalletConnectionProps) {
  if (isConnected && address) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Wallet Connected</h3>
              <p className="text-sm text-gray-600">Ready to interact with blockchain</p>
            </div>
          </div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Address:</p>
              <p className="font-mono text-sm text-gray-900 break-all">
                {address.slice(0, 8)}...{address.slice(-8)}
              </p>
            </div>
            <div className="flex space-x-2">
              <a
                href={`https://explorer.stacks.co/address/${address}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View on Stacks Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onDisconnect}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Disconnect wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>• You can now update greetings and interact with the smart contract</p>
          <p>• All transactions will require confirmation in your wallet</p>
          <p>• STX will be deducted for global greeting updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect Your Stacks Wallet
        </h3>
        
        <p className="text-gray-600 mb-6">
          Connect your wallet to interact with the smart contract and update greetings on the blockchain.
        </p>

        <button
          onClick={onConnect}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>Supported wallets:</p>
          <div className="flex justify-center space-x-4">
            <span>• Hiro Wallet</span>
            <span>• Xverse</span>
            <span>• Leather</span>
          </div>
        </div>
      </div>
    </div>
  );
}