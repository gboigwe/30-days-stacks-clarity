// Advanced error parsing for blockchain operations
export const translateBlockchainError = (error: any): string => {
  const message = error.message || '';

  // Map common Clarity error codes to helpful messages
  if (message.includes('(err u100)')) {
    return "You're not authorized to do that. Make sure you're the task owner.";
  }
  
  if (message.includes('(err u101)')) {
    return "That task was not found. It may have been completed or cancelled.";
  }
  
  if (message.includes('(err u102)')) {
    return "Invalid task status. The task may already be assigned or completed.";
  }

  if (message.includes('(err u103)')) {
    return "Reward amount too low. Minimum reward is 0.1 STX.";
  }

  if (message.includes('(err u110)')) {
    return "You already have a profile. Try updating your existing profile instead.";
  }

  if (message.includes('(err u111)')) {
    return "No profile found. Please create a profile first.";
  }

  if (message.includes('InsufficientFunds')) {
    return "You don't have enough STX to complete this action. Check your wallet balance.";
  }

  if (message.includes('UserRejected')) {
    return "Transaction cancelled. No worries!";
  }

  if (message.includes('network')) {
    return "Network connection issue. Please check your internet and try again.";
  }

  // Fallback for unknown errors
  return "Something went wrong. Please try again or contact support if the problem persists.";
};

export const isTransientError = (error: any): boolean => {
  const message = error.message || '';
  
  // These errors might resolve if retried
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('rate limit')
  );
};