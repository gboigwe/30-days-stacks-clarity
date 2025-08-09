// Enhanced wallet management for multi-user patterns
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { WalletInfo } from '@/types/stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletInfo>({
    isConnected: false,
    address: null,
    network: 'devnet'
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Check existing connection on load
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        updateWalletInfo(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      updateWalletInfo(userData);
    }
  }, []);

  const updateWalletInfo = (userData: any) => {
    setWallet({
      isConnected: true,
      address: userData.profile.stxAddress.devnet || userData.profile.stxAddress.testnet,
      network: 'devnet' // Default to devnet for development
    });
  };

  const connectWallet = useCallback(() => {
    setIsConnecting(true);
    
    showConnect({
      appDetails: {
        name: 'Task Ecosystem',
        icon: '/icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setIsConnecting(false);
        if (userSession.isUserSignedIn()) {
          const userData = userSession.loadUserData();
          updateWalletInfo(userData);
        }
      },
      onCancel: () => {
        setIsConnecting(false);
      },
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    userSession.signUserOut('/');
    setWallet({
      isConnected: false,
      address: null,
      network: 'devnet'
    });
  }, []);

  return {
    wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    userSession
  };
};