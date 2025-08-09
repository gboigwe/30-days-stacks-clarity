// Transaction utility functions for advanced patterns
export const getTransactionStatus = async (txId: string): Promise<'pending' | 'confirmed' | 'failed'> => {
  // Simplified transaction monitoring - in production, use Stacks API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate random transaction completion
      const outcomes = ['confirmed', 'failed'] as const;
      const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      resolve(Math.random() > 0.8 ? 'failed' : 'confirmed');
    }, Math.random() * 3000 + 2000); // 2-5 seconds
  });
};

export const monitorTransaction = async (
  txId: string,
  onStatusChange: (status: 'pending' | 'confirmed' | 'failed') => void
): Promise<void> => {
  onStatusChange('pending');
  
  const checkStatus = async () => {
    try {
      const status = await getTransactionStatus(txId);
      onStatusChange(status);
      
      if (status === 'pending') {
        // Continue monitoring
        setTimeout(checkStatus, 10000);
      }
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      onStatusChange('failed');
    }
  };
  
  // Start monitoring after a brief delay
  setTimeout(checkStatus, 5000);
};

export const formatTransactionError = (error: any): string => {
  const message = error.message || '';
  
  // Map common Clarity error codes to user-friendly messages
  if (message.includes('(err u100)')) {
    return "You're not authorized to perform this action. Make sure you're the task owner.";
  }
  
  if (message.includes('(err u101)')) {
    return "That task was not found. It may have been deleted or completed.";
  }

  if (message.includes('(err u102)')) {
    return "Invalid task status for this operation.";
  }

  if (message.includes('(err u103)')) {
    return "Insufficient reward amount. Minimum reward is 0.1 STX.";
  }

  if (message.includes('InsufficientFunds')) {
    return "You don't have enough STX to complete this transaction. Check your wallet balance.";
  }

  if (message.includes('UserRejected')) {
    return "Transaction cancelled. No worries!";
  }

  // Fallback for unknown errors
  return "Something went wrong. Please try again or contact support if the problem persists.";
};