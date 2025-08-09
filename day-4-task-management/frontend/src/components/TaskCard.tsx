// Individual task display with advanced interactions
'use client';

import { useState } from 'react';
import { Task } from '@/types/tasks';
import { useWallet } from '@/hooks/useWallet';
import { Calendar, Clock, DollarSign, User, Users, MessageSquare, Star } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onAction?: (taskId: string, action: string) => void;
}

export default function TaskCard({ task, onAction }: TaskCardProps) {
  const { wallet } = useWallet();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  const isTaskCreator = wallet.address === task.creator;
  const isTaskAssignee = wallet.address === task.assignee;
  const canApply = wallet.isConnected && !isTaskCreator && !isTaskAssignee && task.status === 'open';
  const canComplete = isTaskAssignee && task.status === 'assigned';

  const formatSTX = (microStx: number): string => {
    const stx = microStx / 1_000_000;
    return `${stx.toFixed(2)} STX`;
  };

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

  const getDifficultyInfo = (difficulty: number) => {
    const levels = {
      1: { label: 'Beginner', class: 'difficulty-1' },
      2: { label: 'Easy', class: 'difficulty-2' },
      3: { label: 'Medium', class: 'difficulty-3' },
      4: { label: 'Hard', class: 'difficulty-4' },
      5: { label: 'Expert', class: 'difficulty-5' }
    };
    return levels[difficulty as keyof typeof levels] || { label: 'Unknown', class: 'difficulty-1' };
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      open: { label: 'Open', class: 'status-open' },
      assigned: { label: 'Assigned', class: 'status-assigned' },
      completed: { label: 'Completed', class: 'status-completed' },
      disputed: { label: 'Disputed', class: 'status-disputed' }
    };
    return statuses[status as keyof typeof statuses] || { label: 'Unknown', class: 'status-open' };
  };

  const handleApply = () => {
    if (!applicationMessage.trim()) return;
    onAction?.(task.id, 'apply');
    setApplicationMessage('');
    setShowApplicationForm(false);
  };

  const handleComplete = () => {
    onAction?.(task.id, 'complete');
  };

  const difficultyInfo = getDifficultyInfo(task.difficulty);
  const statusInfo = getStatusInfo(task.status);

  return (
    <div className={`task-card bg-white rounded-lg shadow-md border border-gray-200 p-6 ${task.isOptimistic ? 'opacity-75 border-dashed' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4 line-clamp-2">
          {task.title}
          {task.isOptimistic && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Confirming...
            </span>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`status-indicator ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
          <span className={`difficulty-indicator ${difficultyInfo.class}`}>
            {difficultyInfo.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 text-sm line-clamp-3">
        {task.description}
      </p>

      {/* Task details */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="font-medium">{formatSTX(task.stxReward)}</span>
            {task.tokenReward > 0 && (
              <span className="ml-1 text-stacks-purple">+ {task.tokenReward} tokens</span>
            )}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatRelativeTime(task.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>by {task.creator.slice(0, 8)}...{task.creator.slice(-4)}</span>
          </div>
          {task.assignee && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>assigned to {task.assignee.slice(0, 8)}...{task.assignee.slice(-4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
          {task.category}
        </span>
        {task.requiresApproval && (
          <span className="text-xs text-orange-600 flex items-center">
            <Star className="h-3 w-3 mr-1" />
            Requires approval
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="border-t pt-4">
        {canApply && (
          <div className="space-y-3">
            {!showApplicationForm ? (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full bg-stacks-purple hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium focus-ring transition-colors"
              >
                Apply for Task
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the creator why you're perfect for this task..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-stacks-purple focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleApply}
                    disabled={!applicationMessage.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium focus-ring disabled:opacity-50 transition-colors"
                  >
                    Submit Application
                  </button>
                  <button
                    onClick={() => {
                      setShowApplicationForm(false);
                      setApplicationMessage('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus-ring transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {canComplete && (
          <button
            onClick={handleComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium focus-ring transition-colors"
          >
            Mark as Complete
          </button>
        )}

        {!wallet.isConnected && (
          <div className="text-center text-sm text-gray-500">
            Connect wallet to interact with tasks
          </div>
        )}
      </div>
    </div>
  );
}