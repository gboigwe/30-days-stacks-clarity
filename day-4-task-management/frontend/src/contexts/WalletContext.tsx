// Wallet context for multi-user task ecosystem
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showConnect, openSignatureRequestPopup } from '@stacks/connect';
import { AppConfig, UserSession, showContractCall } from '@stacks/connect';
import { STACKS_MOCKNET, STACKS_TESTNET } from '@stacks/network';
import { fetchCallReadOnlyFunction } from '@stacks/transactions';

export interface WalletData {
  isConnected: boolean;
  address: string | null;
  publicKey: string | null;
  network: 'testnet' | 'mocknet';
}

interface WalletContextType {
  wallet: WalletData;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  callContract: (contractName: string, functionName: string, functionArgs: any[]) => Promise<any>;
  readContract: (contractName: string, functionName: string, functionArgs?: any[]) => Promise<any>;
  userSession: UserSession | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [wallet, setWallet] = useState<WalletData>({
    isConnected: false,
    address: null,
    publicKey: null,
    network: 'testnet'
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
      setWallet({
        isConnected: true,
        address: userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet || null,
        publicKey: (userData as any)?.publicKey || null,
        network: 'testnet'
      });
    }
  };

  const connectWallet = async () => {
    showConnect({
      appDetails: {
        name: 'Task Ecosystem',
        icon: window.location.origin + '/stacks-logo.png',
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
      publicKey: null,
      network: 'testnet'
    });
  };

  const getNetwork = () => {
    return wallet.network === 'testnet' ? STACKS_TESTNET : STACKS_MOCKNET;
  };

  const callContract = async (contractName: string, functionName: string, functionArgs: any[]) => {
    if (!wallet.isConnected || !userSession?.isUserSignedIn()) {
      throw new Error('Wallet not connected');
    }

    return new Promise((resolve, reject) => {
      showContractCall({
        network: getNetwork(),
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName,
        functionName,
        functionArgs,
        onFinish: (data) => {
          console.log('Transaction submitted:', data.txId);
          resolve(data);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  };

  const readContract = async (contractName: string, functionName: string, functionArgs: any[] = []) => {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
      const network = getNetwork();

      const result = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        network,
        senderAddress: wallet.address || contractAddress,
      });

      return result;
    } catch (error) {
      console.error('Failed to read contract:', error);
      throw error;
    }
  };

  const value: WalletContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    callContract,
    readContract,
    userSession,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}