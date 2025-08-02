'use client';

import { useState, useCallback, useRef } from 'react';
import { OptimisticUpdate } from '@/types/stacks';

interface OptimisticState<T> {
  current: T;
  original: T;
  updates: Record<string, OptimisticUpdate>;
  isPending: boolean;
}

export function useOptimisticUpdate<T>(initialValue: T) {
  const [state, setState] = useState<OptimisticState<T>>({
    current: initialValue,
    original: initialValue,
    updates: {},
    isPending: false,
  });
  
  const updateIdCounter = useRef(0);

  // Apply an optimistic update immediately
  const applyOptimisticUpdate = useCallback((
    updateFn: (current: T) => T,
    type: string = 'generic'
  ): string => {
    const updateId = `update-${++updateIdCounter.current}`;
    
    setState(prev => {
      const newValue = updateFn(prev.current);
      
      const update: OptimisticUpdate = {
        id: updateId,
        type: type as any,
        oldValue: prev.current,
        newValue,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        current: newValue,
        updates: {
          ...prev.updates,
          [updateId]: update,
        },
        isPending: true,
      };
    });

    return updateId;
  }, []);

  // Confirm an optimistic update (make it permanent)
  const confirmUpdate = useCallback((updateId: string) => {
    setState(prev => {
      const { [updateId]: confirmedUpdate, ...remainingUpdates } = prev.updates;
      
      if (!confirmedUpdate) return prev;

      return {
        ...prev,
        original: prev.current, // Make current value the new baseline
        updates: remainingUpdates,
        isPending: Object.keys(remainingUpdates).length > 0,
      };
    });
  }, []);

  // Revert an optimistic update (undo it)
  const revertUpdate = useCallback((updateId: string) => {
    setState(prev => {
      const { [updateId]: revertedUpdate, ...remainingUpdates } = prev.updates;
      
      if (!revertedUpdate) return prev;

      // Revert to original and reapply remaining updates
      let newCurrent = prev.original;
      Object.values(remainingUpdates).forEach(update => {
        // This is simplified - in practice you'd need more sophisticated merging
        newCurrent = update.newValue;
      });

      return {
        ...prev,
        current: newCurrent,
        updates: remainingUpdates,
        isPending: Object.keys(remainingUpdates).length > 0,
      };
    });
  }, []);

  // Revert all pending updates
  const revertAllUpdates = useCallback(() => {
    setState(prev => ({
      ...prev,
      current: prev.original,
      updates: {},
      isPending: false,
    }));
  }, []);

  // Update the baseline value (when real data arrives)
  const updateBaseline = useCallback((newValue: T) => {
    setState(prev => ({
      ...prev,
      original: newValue,
      current: Object.keys(prev.updates).length === 0 ? newValue : prev.current,
    }));
  }, []);

  // Reset everything to a new value
  const reset = useCallback((newValue: T) => {
    setState({
      current: newValue,
      original: newValue,
      updates: {},
      isPending: false,
    });
  }, []);

  // Get pending update count
  const getPendingCount = useCallback(() => {
    return Object.keys(state.updates).length;
  }, [state.updates]);

  // Get updates by type
  const getUpdatesByType = useCallback((type: string) => {
    return Object.values(state.updates).filter(update => update.type === type);
  }, [state.updates]);

  return {
    // Current state
    value: state.current,
    originalValue: state.original,
    isPending: state.isPending,
    updates: state.updates,
    pendingCount: getPendingCount(),

    // Actions
    applyOptimisticUpdate,
    confirmUpdate,
    revertUpdate,
    revertAllUpdates,
    updateBaseline,
    reset,

    // Queries
    getUpdatesByType,
    hasUpdates: Object.keys(state.updates).length > 0,
    hasUpdate: (updateId: string) => updateId in state.updates,
    getUpdate: (updateId: string) => state.updates[updateId],
  };
}

// Specialized hook for greeting updates
export function useOptimisticGreeting(initialGreeting: string) {
  const optimistic = useOptimisticUpdate(initialGreeting);

  const updateGreeting = useCallback((newGreeting: string) => {
    return optimistic.applyOptimisticUpdate(
      () => newGreeting,
      'greeting'
    );
  }, [optimistic]);

  return {
    ...optimistic,
    updateGreeting,
    greeting: optimistic.value,
  };
}

// Specialized hook for like counts
export function useOptimisticLikes(initialLikes: number) {
  const optimistic = useOptimisticUpdate(initialLikes);

  const addLike = useCallback(() => {
    return optimistic.applyOptimisticUpdate(
      (current) => current + 1,
      'like'
    );
  }, [optimistic]);

  return {
    ...optimistic,
    addLike,
    likes: optimistic.value,
  };
}