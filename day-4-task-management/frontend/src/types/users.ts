// User-related types for advanced multi-user features
export interface UserProfile {
  username: string;
  bio: string;
  reputationScore: number;
  tasksCreated: number;
  tasksCompleted: number;
  totalEarned: number;
  skills: string[];
  joinedAt: number;
  lastActive: number;
}

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_assigned' | 'task_completed' | 'profile_updated';
  description: string;
  user: string;
  timestamp: number;
}