// Multi-user task ecosystem data management - implementing blog patterns
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/types/tasks';
import { UserProfile, ActivityItem } from '@/types/users';
import { contractReads } from '@/lib/contract-calls';
import { useWallet } from './useWallet';

// Multi-user state interface from the blog
interface AppState {
  myTasks: Task[];           // What I created or am assigned
  communityTasks: Task[];    // What everyone else is doing  
  userProfiles: UserProfile[]; // Everyone's reputation and stats
  pendingTransactions: Map<string, any>; // What's happening right now
  lastSync: number;
}

const initialState: AppState = {
  myTasks: [],
  communityTasks: [],
  userProfiles: [],
  pendingTransactions: new Map(),
  lastSync: 0
};

export function useTaskEcosystem() {
  const { wallet } = useWallet();
  const [appState, setAppState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The smart part: Batch load everything at once (from blog)
  const loadEcosystemData = useCallback(async () => {
    if (!wallet.address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load multiple contract views in parallel (faster than sequential)
      const [communityStatsResult, userProfileResult] = await Promise.all([
        contractReads.getCommunityStats(),
        contractReads.getUserProfile(wallet.address).catch(() => null),
      ]);

      // Mock data for demonstration - in production, these would come from contract reads
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Build React Component Library',
          description: 'Create a comprehensive component library with TypeScript, Storybook documentation, and unit tests. Should include common UI components like buttons, forms, modals, and data tables.',
          creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          assignee: null,
          category: 'development',
          difficulty: 4,
          stxReward: 5000000, // 5 STX in microSTX
          tokenReward: 0,
          status: 'open',
          createdAt: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
          assignedAt: null,
          completedAt: null,
          requiresApproval: true,
        },
        {
          id: '2',
          title: 'Design Brand Guidelines',
          description: 'Create comprehensive brand guidelines including logo usage, color palette, typography, and design principles for a fintech startup.',
          creator: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
          assignee: wallet.address,
          category: 'design',
          difficulty: 3,
          stxReward: 3000000, // 3 STX
          tokenReward: 100,
          status: 'assigned',
          createdAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
          assignedAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          completedAt: null,
          requiresApproval: false,
        }
      ];

      // Smart filtering based on user's relationship to tasks (from blog)
      const myActiveTasks = mockTasks.filter(task => 
        (task.creator === wallet.address || task.assignee === wallet.address) && 
        task.status !== 'completed'
      );
      
      const availableToMe = mockTasks.filter(task =>
        task.creator !== wallet.address && 
        !task.assignee && 
        task.status === 'open'
      );

      // Transform blockchain data into UI-friendly format
      setAppState(prev => ({
        ...prev,
        myTasks: myActiveTasks,
        communityTasks: availableToMe,
        userProfiles: [], // Would be populated from contract reads
        lastSync: Date.now()
      }));

    } catch (error) {
      console.error('Failed to load ecosystem data:', error);
      setError('Failed to load task data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address]);

  // Auto-refresh mechanism for real-time updates
  useEffect(() => {
    loadEcosystemData();
    
    // Set up periodic refresh for community activity
    const refreshInterval = setInterval(() => {
      if (wallet.address) {
        loadEcosystemData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [loadEcosystemData]);

  // Filter functions for different views
  const getTasksByStatus = useCallback((status: string) => {
    return [...appState.myTasks, ...appState.communityTasks].filter(task => 
      task.status === status
    );
  }, [appState]);

  const getTasksByCategory = useCallback((category: string) => {
    return [...appState.myTasks, ...appState.communityTasks].filter(task => 
      task.category === category
    );
  }, [appState]);

  const getUserTaskStats = useCallback(() => {
    return {
      created: appState.myTasks.filter(task => task.creator === wallet.address).length,
      assigned: appState.myTasks.filter(task => task.assignee === wallet.address).length,
      completed: appState.myTasks.filter(task => 
        (task.creator === wallet.address || task.assignee === wallet.address) && 
        task.status === 'completed'
      ).length
    };
  }, [appState, wallet.address]);

  return { 
    appState, 
    isLoading, 
    error,
    loadEcosystemData, 
    getTasksByStatus,
    getTasksByCategory,
    getUserTaskStats
  };
}