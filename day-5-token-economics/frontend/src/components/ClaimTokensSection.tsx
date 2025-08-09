// Community token distribution claim interface
'use client';

import { distributionUtils } from '@/lib/token-utils';
import type { DistributionInfo } from '@/types/token';
import { Clock, Gift, Users, Zap, AlertTriangle } from 'lucide-react';

interface ClaimTokensSectionProps {
  distributionInfo: DistributionInfo;
  onClaim: () => Promise<void>;
  isClaiiming: boolean;
  transferState: 'idle' | 'signing' | 'pending' | 'completed' | 'failed';
}

export default function ClaimTokensSection({ 
  distributionInfo, 
  onClaim, 
  isClaiiming, 
  transferState 
}: ClaimTokensSectionProps) {
  const urgency = distributionUtils.getClaimUrgency(distributionInfo);
  const progress = distributionUtils.getDistributionProgress(distributionInfo);

  const urgencyStyles = {
    low: 'bg-green-50 border-green-200',
    medium: 'bg-yellow-50 border-yellow-200', 
    high: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200'
  };

  const urgencyColors = {
    low: 'text-green-800',
    medium: 'text-yellow-800',
    high: 'text-orange-800', 
    critical: 'text-red-800'
  };

  const buttonStyles = {
    low: 'bg-green-600 hover:bg-green-700',
    medium: 'bg-yellow-600 hover:bg-yellow-700',
    high: 'bg-orange-600 hover:bg-orange-700',
    critical: 'bg-red-600 hover:bg-red-700 animate-pulse-glow'
  };

  return (
    <div className={`rounded-lg border-2 p-8 ${urgencyStyles[urgency]} animate-fade-in`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 animate-bounce-gentle">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${urgencyColors[urgency]} mb-1`}>
              🎉 Free Token Distribution Active!
            </h2>
            <p className={`${urgencyColors[urgency]}`}>
              Be one of the first {distributionInfo.maxClaims} community members to claim {distributionInfo.distributionAmount / 1000000} free AOD tokens.
            </p>
          </div>
        </div>
        
        {urgency === 'critical' && (
          <div className="flex items-center text-red-600 animate-pulse">
            <AlertTriangle className="h-5 w-5 mr-1" />
            <span className="text-sm font-semibold">Almost Full!</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${urgencyColors[urgency]}`}>
            Distribution Progress
          </span>
          <span className={`text-sm ${urgencyColors[urgency]}`}>
            {distributionInfo.totalClaims} / {distributionInfo.maxClaims} claimed
          </span>
        </div>
        <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          >
            {progress > 10 && (
              <div className="h-full bg-white/20 animate-pulse"></div>
            )}
          </div>
        </div>
        <div className="mt-1 text-xs text-gray-600">
          {distributionInfo.claimsRemaining} spots remaining
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/70 rounded-lg p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <div className="font-semibold text-gray-900">Founding Member</div>
          <div className="text-sm text-gray-600">Join the first 30 holders</div>
        </div>
        
        <div className="bg-white/70 rounded-lg p-4 text-center">
          <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <div className="font-semibold text-gray-900">Governance Rights</div>
          <div className="text-sm text-gray-600">Vote on community decisions</div>
        </div>
        
        <div className="bg-white/70 rounded-lg p-4 text-center">
          <Gift className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <div className="font-semibold text-gray-900">Premium Access</div>
          <div className="text-sm text-gray-600">Exclusive features & content</div>
        </div>
      </div>

      {/* Claim Button */}
      <div className="text-center">
        <button
          onClick={onClaim}
          disabled={isClaiiming || !distributionInfo.distributionActive}
          className={`w-full md:w-auto px-8 py-4 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles[urgency]} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          {transferState === 'idle' && (
            <>
              <Gift className="inline h-5 w-5 mr-2" />
              Claim Your 1,000 AOD Tokens FREE
            </>
          )}
          {transferState === 'signing' && (
            <>
              <Clock className="inline h-5 w-5 mr-2 animate-spin" />
              Check Your Wallet...
            </>
          )}
          {transferState === 'pending' && (
            <>
              <Clock className="inline h-5 w-5 mr-2 animate-spin" />
              Confirming on Blockchain...
            </>
          )}
          {transferState === 'completed' && (
            <>
              ✅ Tokens Claimed Successfully!
            </>
          )}
          {transferState === 'failed' && (
            <>
              ❌ Try Again
            </>
          )}
        </button>
        
        <p className="mt-3 text-sm text-gray-600">
          <strong>How it works:</strong> Your tokens will be minted instantly and sent to your wallet. 
          Once claimed, you become a founding member with full community privileges.
        </p>
      </div>

      {/* Urgency Message */}
      {urgency !== 'low' && (
        <div className="mt-6 p-4 bg-white/80 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-orange-600 mr-2" />
            <div className="text-sm">
              <span className="font-semibold text-gray-900">Time sensitive:</span>
              <span className="text-gray-700 ml-1">
                {distributionUtils.estimateTimeToEnd(distributionInfo)} at current claim rate.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}