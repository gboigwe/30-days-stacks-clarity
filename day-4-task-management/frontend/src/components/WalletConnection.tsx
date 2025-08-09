// Enhanced wallet connection component for multi-user patterns
'use client';

import { useWallet } from '@/hooks/useWallet';

interface WalletConnectionProps {
  onConnect: () => void;
}

export default function WalletConnectionPrompt({ onConnect }: WalletConnectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 stacks-gradient rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Task Ecosystem
        </h1>
        
        <p className="text-gray-600 mb-8">
          Connect your Stacks wallet to join the multi-user task management community. 
          Create tasks, collaborate with others, and earn STX rewards.
        </p>
        
        <button
          onClick={onConnect}
          className="w-full stacks-gradient text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity focus-ring"
        >
          Connect Wallet
        </button>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Powered by Stacks blockchain</p>
          <p>Multi-user smart contracts with Clarity 3.0</p>
        </div>
      </div>
    </div>
  );
}

export function WalletInfo() {
  const { wallet, disconnectWallet } = useWallet();
  
  if (!wallet.isConnected) return null;

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm">
        <div className="text-gray-900 font-medium">Connected</div>
        <div className="text-gray-600">
          {wallet.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` : ''}
        </div>
      </div>
      <button
        onClick={disconnectWallet}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium focus-ring transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}