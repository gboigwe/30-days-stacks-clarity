// Type definitions for Stacks blockchain interactions

export type TransactionState = 
  | 'idle'        // Nothing happening
  | 'signing'     // Wallet is open, user deciding
  | 'pending'     // Submitted, waiting for confirmation
  | 'confirmed'   // Successfully completed
  | 'failed'      // Something went wrong
  | 'cancelled';  // User cancelled in wallet

export interface TransactionInfo {
  id: string;
  state: TransactionState;
  functionName: string;
  args: any[];
  error?: string;
  result?: any;
  timestamp: number;
}

export interface OptimisticUpdate {
  id: string;
  type: 'greeting' | 'personal-greeting' | 'like';
  oldValue: any;
  newValue: any;
  timestamp: number;
}