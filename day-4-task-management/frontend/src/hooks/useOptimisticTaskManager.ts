// Optimistic UI patterns for complex operations - from the blog
'use client';

import { useState, useCallback } from 'react';
import { Task, CreateTaskData } from '@/types/tasks';
import { useTaskEcosystem } from './useTaskEcosystem';
import { useWallet } from './useWallet';
import { monitorTransaction, formatTransactionError } from '@/lib/transaction-utils';

export function useOptimisticTaskManager() {
  const { appState, loadEcosystemData } = useTaskEcosystem();
  const { wallet } = useWallet();
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTaskOptimistically = async (taskData: CreateTaskData): Promise<void> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }

    setIsSubmitting(true);
    setError(null);

    // 1. Immediately show the task in UI (optimistic update from blog)
    const optimisticTask: Task = {
      id: `temp-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      difficulty: taskData.difficulty,
      stxReward: Math.floor(taskData.reward * 1000000), // Convert to microSTX
      tokenReward: 0,
      creator: wallet.address,
      assignee: null,
      status: 'open',
      createdAt: Math.floor(Date.now() / 1000),
      assignedAt: null,
      completedAt: null,
      requiresApproval: true,
      isOptimistic: true // Mark as optimistic
    };
    
    setOptimisticTasks(prev => [...prev, optimisticTask]);

    try {
      // 2. Submit to blockchain (simplified for demo)
      // In production, this would use the actual contract call
      const mockTxId = `0x${Math.random().toString(16).substring(2)}`;
      
      // 3. Track the transaction (pattern from blog)
      await new Promise<void>((resolve, reject) => {
        monitorTransaction(mockTxId, (status) => {
          if (status === 'confirmed') {
            // Remove optimistic task and refresh real data
            setOptimisticTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
            loadEcosystemData(); // Get latest blockchain state
            setIsSubmitting(false);
            resolve();
          } else if (status === 'failed') {
            // Handle failure - remove optimistic task
            setOptimisticTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
            setError('Transaction failed. Please try again.');
            setIsSubmitting(false);
            reject(new Error('Transaction failed'));
          }
          // 'pending' status doesn't need action here
        });
      });

    } catch (error) {
      // 4. Remove optimistic task if submission failed
      setOptimisticTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
      const userError = formatTransactionError(error);
      setError(userError);
      setIsSubmitting(false);
      throw new Error(userError);
    }
  };

  const applyForTaskOptimistically = async (taskId: string, message: string): Promise<void> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate application submission
      const mockTxId = `0x${Math.random().toString(16).substring(2)}`;
      
      await new Promise<void>((resolve, reject) => {
        monitorTransaction(mockTxId, (status) => {
          if (status === 'confirmed') {
            loadEcosystemData(); // Refresh to show application
            setIsSubmitting(false);
            resolve();
          } else if (status === 'failed') {
            setError('Failed to apply for task. Please try again.');
            setIsSubmitting(false);
            reject(new Error('Application failed'));
          }
        });
      });

    } catch (error) {
      const userError = formatTransactionError(error);
      setError(userError);
      setIsSubmitting(false);
      throw new Error(userError);
    }
  };

  const completeTaskOptimistically = async (taskId: string): Promise<void> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }

    setIsSubmitting(true);
    setError(null);

    // Optimistically update task status
    const updatedTasks = appState.myTasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed' as const, completedAt: Math.floor(Date.now() / 1000) }
        : task
    );

    try {
      const mockTxId = `0x${Math.random().toString(16).substring(2)}`;
      
      await new Promise<void>((resolve, reject) => {
        monitorTransaction(mockTxId, (status) => {
          if (status === 'confirmed') {
            loadEcosystemData(); // Get actual blockchain state
            setIsSubmitting(false);
            resolve();
          } else if (status === 'failed') {
            // Revert optimistic update
            loadEcosystemData();
            setError('Failed to complete task. Please try again.');
            setIsSubmitting(false);
            reject(new Error('Task completion failed'));
          }
        });
      });

    } catch (error) {
      // Revert optimistic update
      loadEcosystemData();
      const userError = formatTransactionError(error);
      setError(userError);
      setIsSubmitting(false);
      throw new Error(userError);
    }
  };

  // Merge real blockchain data with optimistic updates
  const allTasks = [...appState.myTasks, ...appState.communityTasks, ...optimisticTasks];

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    allTasks, 
    createTaskOptimistically, 
    applyForTaskOptimistically,
    completeTaskOptimistically,
    isSubmitting,
    error,
    clearError
  };
}