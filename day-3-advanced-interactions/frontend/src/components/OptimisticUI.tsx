'use client';

import { useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface OptimisticUIProps {
  children: React.ReactNode;
  isPending?: boolean;
  isOptimistic?: boolean;
  error?: string | null;
  successMessage?: string;
  className?: string;
}

export function OptimisticUI({ 
  children, 
  isPending = false, 
  isOptimistic = false, 
  error = null,
  successMessage,
  className = '' 
}: OptimisticUIProps) {
  // Auto-clear success message after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        // Success message will be cleared by parent component
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className={`relative ${className}`}>
      {/* Main content with optimistic styling */}
      <div className={`
        transition-all duration-200 
        ${isOptimistic ? 'opacity-75 bg-blue-50 border border-blue-200 rounded-lg p-1' : ''}
        ${isPending ? 'pointer-events-none' : ''}
      `}>
        {children}
      </div>

      {/* Optimistic indicator overlay */}
      {isOptimistic && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
          <Clock className="w-3 h-3" />
          <span>Pending...</span>
        </div>
      )}

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute -bottom-2 left-0 right-0 bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-700">
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Success indicator */}
      {successMessage && (
        <div className="absolute -bottom-2 left-0 right-0 bg-green-50 border border-green-200 rounded-md p-2 text-xs text-green-700">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized component for greeting display with optimistic updates
interface OptimisticGreetingProps {
  greeting: string;
  author?: string;
  isPending?: boolean;
  isOptimistic?: boolean;
  lastUpdated?: number;
  className?: string;
}

export function OptimisticGreeting({ 
  greeting, 
  author, 
  isPending, 
  isOptimistic, 
  lastUpdated,
  className = '' 
}: OptimisticGreetingProps) {
  return (
    <OptimisticUI 
      isPending={isPending} 
      isOptimistic={isOptimistic}
      className={className}
    >
      <div className="text-center">
        <blockquote className="text-2xl font-bold text-gray-900 mb-2">
          "{greeting}"
        </blockquote>
        {author && (
          <p className="text-sm text-gray-600">
            — {author.slice(0, 8)}...{author.slice(-4)}
          </p>
        )}
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-1">
            Updated {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    </OptimisticUI>
  );
}

// Component for like counts with optimistic updates
interface OptimisticLikeButtonProps {
  likes: number;
  isLiked?: boolean;
  isPending?: boolean;
  isOptimistic?: boolean;
  onLike?: () => void;
  disabled?: boolean;
}

export function OptimisticLikeButton({ 
  likes, 
  isLiked = false, 
  isPending = false, 
  isOptimistic = false,
  onLike,
  disabled = false
}: OptimisticLikeButtonProps) {
  return (
    <OptimisticUI 
      isPending={isPending} 
      isOptimistic={isOptimistic}
      className="inline-block"
    >
      <button
        onClick={onLike}
        disabled={disabled || isPending}
        className={`
          flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors
          ${isLiked 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }
          ${disabled || isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className={`transition-transform ${isLiked ? 'scale-110' : ''}`}>
          {isLiked ? '❤️' : '🤍'}
        </span>
        <span className="font-medium">
          {likes}
        </span>
      </button>
    </OptimisticUI>
  );
}

// Generic wrapper for any content that might be optimistically updated
interface OptimisticWrapperProps {
  children: React.ReactNode;
  updateId?: string;
  isUpdating?: boolean;
  updateType?: 'create' | 'update' | 'delete';
  className?: string;
}

export function OptimisticWrapper({ 
  children, 
  updateId, 
  isUpdating = false, 
  updateType = 'update',
  className = '' 
}: OptimisticWrapperProps) {
  const getUpdateStyles = () => {
    switch (updateType) {
      case 'create':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'delete':
        return 'bg-red-50 border-l-4 border-red-400 opacity-60';
      case 'update':
      default:
        return 'bg-blue-50 border-l-4 border-blue-400';
    }
  };

  return (
    <div className={`
      transition-all duration-300 
      ${isUpdating ? `${getUpdateStyles()} pl-4` : ''} 
      ${className}
    `}>
      {children}
      
      {isUpdating && updateId && (
        <div className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Update in progress...</span>
        </div>
      )}
    </div>
  );
}