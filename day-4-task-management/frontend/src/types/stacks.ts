// Stacks-related type definitions for multi-user patterns
export interface WalletInfo {
  isConnected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet' | 'devnet';
}

export interface TransactionInfo {
  txId: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export interface ContractCallResult {
  txId: string;
  success: boolean;
  error?: string;
}