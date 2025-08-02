// Transaction helper functions and utilities

import { TransactionState } from '@/types/stacks';

export interface TransactionStatus {
  txId: string;
  status: TransactionState;
  error?: string;
  result?: any;
}

// Simplified transaction status polling using Stacks API
export async function pollTransactionStatus(
  txId: string,
  onUpdate: (status: TransactionStatus) => void,
  maxAttempts: number = 30, // 30 attempts = ~5 minutes
  intervalMs: number = 10000 // Check every 10 seconds
): Promise<TransactionStatus> {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        attempts++;
        
        // Use Stacks API to check transaction status
        const response = await fetch(`https://api.testnet.hiro.so/extended/v1/tx/${txId}`);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const tx = await response.json();
        
        let status: TransactionState;
        let result = null;
        let error = null;
        
        switch (tx.tx_status) {
          case 'success':
            status = 'confirmed';
            result = tx.tx_result;
            break;
          case 'abort_by_response':
          case 'abort_by_post_condition':
            status = 'failed';
            error = `Transaction failed: ${tx.tx_status}`;
            break;
          case 'pending':
          default:
            status = 'pending';
            break;
        }
        
        const statusUpdate: TransactionStatus = { 
          txId, 
          status, 
          error: error || undefined, 
          result 
        };
        onUpdate(statusUpdate);
        
        if (status === 'confirmed' || status === 'failed') {
          resolve(statusUpdate);
          return;
        }
        
        if (attempts >= maxAttempts) {
          const timeoutStatus: TransactionStatus = {
            txId,
            status: 'failed',
            error: 'Transaction timeout - taking longer than expected'
          };
          onUpdate(timeoutStatus);
          resolve(timeoutStatus);
          return;
        }
        
        // Continue polling
        setTimeout(checkStatus, intervalMs);
        
      } catch (error: any) {
        const errorStatus: TransactionStatus = {
          txId,
          status: 'failed',
          error: `Failed to check transaction status: ${error.message}`
        };
        onUpdate(errorStatus);
        reject(errorStatus);
      }
    };
    
    checkStatus();
  });
}

// Estimate transaction fees (simplified)
export function estimateTransactionFee(functionName: string): number {
  // Base fee estimates in microSTX
  const baseFees = {
    'set-greeting-with-payment': 2000, // More expensive due to STX transfer
    'set-personal-greeting-advanced': 1000, // Standard contract call
    'like-greeting': 800, // Simple map operation
  };
  
  return baseFees[functionName as keyof typeof baseFees] || 1000;
}

// Format STX amounts for display
export function formatSTX(microSTX: number): string {
  const stx = microSTX / 1000000;
  return `${stx.toLocaleString()} STX`;
}

// Format block heights for display
export function formatBlockHeight(height: number): string {
  return height.toLocaleString();
}

// Calculate time elapsed since block
export function getTimeElapsed(blockHeight: number, currentBlock: number): string {
  const blockDiff = currentBlock - blockHeight;
  const minutes = Math.floor(blockDiff * 10); // ~10 minutes per block
  
  if (minutes < 60) return `${minutes} minutes ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
  return `${Math.floor(minutes / 1440)} days ago`;
}