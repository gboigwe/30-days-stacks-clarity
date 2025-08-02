'use client';

import { useState, useEffect } from 'react';
import { showConnect, getUserData, isConnected, disconnect } from '@stacks/connect';
import { AppConfig, UserSession } from '@stacks/connect';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create app config and user session
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  // Check for existing connection on page load
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setAddress(userData.profile.stxAddress.testnet);
    }
  }, [userSession]);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      showConnect({
        appDetails: {
          name: 'My First Stacks dApp',
          icon: `${window.location.origin}/favicon.ico`,
        },
        redirectTo: '/',
        onFinish: () => {
          const userData = userSession.loadUserData();
          const stxAddress = userData.profile.stxAddress.testnet;
          setAddress(stxAddress);
          setIsLoading(false);
        },
        onCancel: () => {
          setIsLoading(false);
        },
        userSession,
      });
    } catch (error) {
      console.error('Connection failed:', error);
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut('/');
    setAddress(null);
  };

  return {
    address,
    isConnected: !!address,
    connectWallet,
    disconnectWallet,
    isLoading
  };
}