// Contract-specific type definitions

export interface GreetingMetadata {
  message: string;
  author: string;
  'updated-at': number;
  'update-count': number;
  'current-cost': number;
}

export interface UserProfile {
  'personal-greeting': string;
  'total-updates': number;
  'global-updates': number;
  'last-update': number;
  'stx-spent': number;
}

export interface ContractStats {
  'total-global-updates': number;
  'current-update-cost': number;
  'contract-owner': string;
  'stacks-blocks': number;
  'tenure-blocks': number;
  'estimated-time': number;
}

export interface GreetingHistoryEntry {
  message: string;
  author: string;
  'block-height': number;
  'tenure-height': number;
  'stx-paid': number;
  likes: number;
}