// Simplified wallet hook for token frontend
'use client';

import { useState, useEffect } from 'react';
import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { getCurrentNetwork } from '@/lib/stacks';

interface WalletData {
  isConnected: boolean;
  address: string | null;
  network: 'testnet' | 'devnet' | 'mainnet';
}

const appConfig = new AppConfig(['store_write', 'publish_data']);

export function useWallet() {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [wallet, setWallet] = useState<WalletData>({
    isConnected: false,
    address: null,
    network: 'devnet'
  });

  useEffect(() => {
    if (userSession?.isSignInPending()) {
      userSession.handlePendingSignIn().then(() => {
        updateWalletData();
      });
    } else if (userSession?.isUserSignedIn()) {
      updateWalletData();
    }
  }, [userSession]);

  const updateWalletData = () => {
    if (userSession?.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const networkConfig = getCurrentNetwork();
      
      setWallet({
        isConnected: true,
        address: userData?.profile?.stxAddress?.testnet || 
                userData?.profile?.stxAddress?.mainnet || 
                userData?.profile?.stxAddress?.devnet || null,
        network: networkConfig.network.toString().includes('testnet') ? 'testnet' : 'devnet'
      });
    }
  };

  const connectWallet = async () => {
    showConnect({
      appDetails: {
        name: 'AgeOfDevs Token',
        icon: window.location.origin + '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        updateWalletData();
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession?.signUserOut('/');
    setWallet({
      isConnected: false,
      address: null,
      network: 'devnet'
    });
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    userSession,
  };
}