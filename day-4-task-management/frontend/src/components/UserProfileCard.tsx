// User profile display component
'use client';

import { UserProfile } from '@/types/users';
import { useWallet } from '@/hooks/useWallet';
import { User, Award, Briefcase, DollarSign, Calendar, Star } from 'lucide-react';

interface UserProfileCardProps {
  profile: UserProfile | null;
}

export default function UserProfileCard({ profile }: UserProfileCardProps) {
  const { wallet } = useWallet();

  const formatSTX = (microStx: number): string => {
    const stx = microStx / 1_000_000;
    return `${stx.toFixed(2)} STX`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getReputationLevel = (score: number): string => {
    if (score >= 50) return 'Gold';
    if (score >= 20) return 'Silver';
    if (score >= 5) return 'Bronze';
    return 'Beginner';
  };

  const getReputationColor = (level: string): string => {
    const colors = {
      Gold: 'text-yellow-600',
      Silver: 'text-gray-600',
      Bronze: 'text-orange-600',
      Beginner: 'text-green-600'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600';
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Yet</h3>
        <p className="text-gray-600 mb-6">
          Create a profile to showcase your skills and track your reputation in the community.
        </p>
        <button className="bg-stacks-purple hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium focus-ring transition-colors">
          Create Profile
        </button>
      </div>
    );
  }

  const reputationLevel = getReputationLevel(profile.reputationScore);
  const reputationColor = getReputationColor(reputationLevel);

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-stacks-purple rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">@{profile.username}</h2>
              <div className="flex items-center mt-1">
                <Award className="h-4 w-4 mr-1" />
                <span className={`text-sm font-medium ${reputationColor}`}>
                  {reputationLevel} Member
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {profile.reputationScore} reputation
                </span>
              </div>
            </div>
          </div>
          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Edit Profile
          </button>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <p className="text-gray-700">{profile.bio || 'No bio available'}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No skills listed</span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.tasksCreated}</div>
            <div className="text-sm text-gray-600">Tasks Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.tasksCompleted}</div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatSTX(profile.totalEarned)}
            </div>
            <div className="text-sm text-gray-600">Total Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.reputationScore}</div>
            <div className="text-sm text-gray-600">Reputation</div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">Member since</span>
            </div>
            <span className="text-gray-900 font-medium">
              {formatDate(profile.joinedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">Completion rate</span>
            </div>
            <span className="text-gray-900 font-medium">
              {profile.tasksCompleted > 0 
                ? `${Math.round((profile.tasksCompleted / (profile.tasksCreated + profile.tasksCompleted)) * 100)}%`
                : 'N/A'
              }
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">Average rating</span>
            </div>
            <span className="text-gray-900 font-medium">4.8/5.0</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">Average task value</span>
            </div>
            <span className="text-gray-900 font-medium">
              {profile.tasksCompleted > 0 
                ? formatSTX(Math.floor(profile.totalEarned / profile.tasksCompleted))
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">First Task</div>
            <div className="text-xs text-gray-600">Created your first task</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Reliable</div>
            <div className="text-xs text-gray-600">100% completion rate</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Community Member</div>
            <div className="text-xs text-gray-600">Active for 30+ days</div>
          </div>
        </div>
      </div>
    </div>
  );
}