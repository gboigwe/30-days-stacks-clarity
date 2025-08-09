// Token balance display component
'use client';

import { tokenFormatting } from '@/lib/token-utils';
import type { UserTokenStats } from '@/types/token';
import { Coins, TrendingUp, Award, Clock } from 'lucide-react';

interface TokenBalanceCardProps {
  balance: number;
  userStats: UserTokenStats | null;
  isLoading: boolean;
}

export default function TokenBalanceCard({ balance, userStats, isLoading }: TokenBalanceCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const reputation = userStats ? tokenFormatting.getReputationDisplay(userStats.reputationLevel) : null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Coins className="h-5 w-5 mr-2 text-ageofdevs-primary" />
          Token Balance
        </h3>
        {reputation && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${reputation.color} bg-gray-100`}>
            {reputation.label}
          </span>
        )}
      </div>

      {/* Main Balance */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {tokenFormatting.formatAmount(balance, 'display')}
        </div>
        <div className="text-sm text-gray-600">
          {balance > 0 ? `${(balance / 1000000).toFixed(6)} AOD` : 'No tokens yet'}
        </div>
      </div>

      {/* Stats Grid */}
      {userStats && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span>Earned</span>
            </div>
            <span className="text-sm font-semibold">
              {tokenFormatting.formatAmount(userStats.totalEarned, 'display')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Award className="h-4 w-4 mr-2" />
              <span>Governance Power</span>
            </div>
            <span className="text-sm font-semibold">
              {userStats.governancePower.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Member Since</span>
            </div>
            <span className="text-sm font-semibold">
              {tokenFormatting.formatTimeAgo(userStats.firstReceivedBlock)}
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {balance === 0 && !userStats && (
        <div className="text-center py-4">
          <Coins className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">
            You don't have any AOD tokens yet. Claim your free tokens or complete tasks to get started!
          </p>
        </div>
      )}

      {/* Balance Breakdown */}
      {userStats && balance > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Received from others:</span>
              <span>{tokenFormatting.formatAmount(userStats.totalTransferredIn, 'compact')}</span>
            </div>
            <div className="flex justify-between">
              <span>Sent to others:</span>
              <span>{tokenFormatting.formatAmount(userStats.totalTransferredOut, 'compact')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}