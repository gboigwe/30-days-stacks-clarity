// Task-related types matching the blog's multi-user patterns
export interface Task {
  id: string;
  title: string;
  description: string;
  creator: string;
  assignee: string | null;
  category: string;
  difficulty: number; // 1-5 scale
  stxReward: number;
  tokenReward: number;
  status: 'open' | 'assigned' | 'completed' | 'disputed';
  createdAt: number;
  assignedAt: number | null;
  completedAt: number | null;
  requiresApproval: boolean;
  isOptimistic?: boolean; // For optimistic UI
}

export interface CreateTaskData {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  reward: number;
}