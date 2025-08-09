// Token statistics display grid
'use client';

import { tokenFormatting } from '@/lib/token-utils';
import type { TokenData } from '@/hooks/useAgeOfDevsToken';
import { Coins, Users, TrendingUp, Gift } from 'lucide-react';

interface TokenStatsGridProps {
  tokenData: TokenData;
  className?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}

function StatCard({ icon, label, value, subValue }: StatCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
      <div className="flex justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-purple-100">
        {label}
      </div>
      {subValue && (
        <div className="text-xs text-purple-200 mt-1">
          {subValue}
        </div>
      )}
    </div>
  );
}

export default function TokenStatsGrid({ tokenData, className = '' }: TokenStatsGridProps) {
  const { totalSupply, distributionInfo } = tokenData;

  return (
    <div className={className}>
      <StatCard
        icon={<Coins className="h-6 w-6 text-white" />}
        label="Total Supply"
        value={tokenFormatting.formatAmount(totalSupply, 'compact')}
        subValue="10M max supply"
      />

      <StatCard
        icon={<Users className="h-6 w-6 text-white" />}
        label="Community Members"
        value={distributionInfo?.totalClaims?.toString() || '0'}
        subValue={`of ${distributionInfo?.maxClaims || 30} founders`}
      />

      <StatCard
        icon={<Gift className="h-6 w-6 text-white" />}
        label="Free Tokens Left"
        value={distributionInfo?.claimsRemaining?.toString() || '0'}
        subValue="1,000 AOD each"
      />

      <StatCard
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        label="Distribution Status"
        value={distributionInfo?.distributionActive ? "Active" : "Ended"}
        subValue={
          distributionInfo?.distributionActive 
            ? "Claim now!" 
            : "Distribution complete"
        }
      />
    </div>
  );
}