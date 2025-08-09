// User profile management for advanced features
'use client';

import { useState, useCallback, useEffect } from 'react';
import { UserProfile } from '@/types/users';
import { contractReads } from '@/lib/contract-calls';
import { useWallet } from './useWallet';

export function useUserProfiles() {
  const { wallet } = useWallet();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async (userAddress?: string) => {
    const addressToLoad = userAddress || wallet.address;
    if (!addressToLoad) return;

    setIsLoading(true);
    setError(null);

    try {
      const profileData = await contractReads.getUserProfile(addressToLoad);
      
      if (profileData && profileData.value) {
        const profile: UserProfile = {
          username: profileData.value.username || '',
          bio: profileData.value.bio || '',
          reputationScore: Number(profileData.value['reputation-score']) || 0,
          tasksCreated: Number(profileData.value['tasks-created']) || 0,
          tasksCompleted: Number(profileData.value['tasks-completed']) || 0,
          totalEarned: Number(profileData.value['total-earned']) || 0,
          skills: profileData.value.skills || [],
          joinedAt: Number(profileData.value['joined-at']) || 0,
          lastActive: Number(profileData.value['last-active']) || 0,
        };

        if (addressToLoad === wallet.address) {
          setCurrentUserProfile(profile);
        }
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setError('Failed to load profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address]);

  const createProfile = useCallback(async (
    username: string, 
    bio: string, 
    skills: string[]
  ): Promise<boolean> => {
    if (!wallet.address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate profile creation - in production, this would be a contract call
      const mockProfile: UserProfile = {
        username,
        bio,
        reputationScore: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        totalEarned: 0,
        skills,
        joinedAt: Math.floor(Date.now() / 1000),
        lastActive: Math.floor(Date.now() / 1000),
      };

      setCurrentUserProfile(mockProfile);
      return true;
    } catch (error) {
      console.error('Failed to create profile:', error);
      setError('Failed to create profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address]);

  const updateProfile = useCallback(async (
    bio: string, 
    skills: string[]
  ): Promise<boolean> => {
    if (!wallet.address || !currentUserProfile) {
      setError('No profile to update');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Optimistically update profile
      const updatedProfile: UserProfile = {
        ...currentUserProfile,
        bio,
        skills,
        lastActive: Math.floor(Date.now() / 1000),
      };

      setCurrentUserProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, currentUserProfile]);

  // Load user profile on wallet connection
  useEffect(() => {
    if (wallet.address) {
      loadUserProfile();
    } else {
      setCurrentUserProfile(null);
    }
  }, [wallet.address, loadUserProfile]);

  return {
    currentUserProfile,
    isLoading,
    error,
    loadUserProfile,
    createProfile,
    updateProfile
  };
}