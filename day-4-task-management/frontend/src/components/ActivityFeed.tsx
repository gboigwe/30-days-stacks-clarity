// Community activity feed component
'use client';

import { ActivityItem } from '@/types/users';
import { Activity, Briefcase, User, CheckCircle, Plus } from 'lucide-react';

// Mock activity data - in production, this would come from contract events
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'task_created',
    description: 'created a new development task',
    user: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    timestamp: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
  },
  {
    id: '2',
    type: 'task_completed',
    description: 'completed a design task',
    user: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
    timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  },
  {
    id: '3',
    type: 'task_assigned',
    description: 'was assigned a writing task',
    user: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP',
    timestamp: Math.floor(Date.now() / 1000) - 5400, // 1.5 hours ago
  },
  {
    id: '4',
    type: 'profile_updated',
    description: 'updated their profile',
    user: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    timestamp: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
  },
];

export default function ActivityFeed() {
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const time = timestamp * 1000;
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_created':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'task_assigned':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'profile_updated':
        return <User className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_created':
        return 'bg-green-100';
      case 'task_assigned':
        return 'bg-blue-100';
      case 'task_completed':
        return 'bg-purple-100';
      case 'profile_updated':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Community Activity
        </h3>
        <button className="text-sm text-stacks-purple hover:text-purple-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900">
                <span className="font-medium">
                  {truncateAddress(activity.user)}
                </span>{' '}
                <span>{activity.description}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatRelativeTime(activity.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockActivities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No recent activity</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Activity updates every 30 seconds
        </p>
      </div>
    </div>
  );
}