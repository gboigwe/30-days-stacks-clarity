// Token utility showcase cards
'use client';

import { tokenFormatting } from '@/lib/token-utils';
import { Vote, Star, Zap, Users, BookOpen, Shield } from 'lucide-react';

interface TokenUtilityCardsProps {
  tokenBalance: number;
}

interface UtilityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  requiredBalance?: number;
  comingSoon?: boolean;
}

function UtilityCard({ icon, title, description, isActive, requiredBalance, comingSoon }: UtilityCardProps) {
  return (
    <div className={`
      rounded-lg border-2 p-6 transition-all duration-200 
      ${isActive 
        ? 'bg-white border-ageofdevs-primary shadow-md hover:shadow-lg' 
        : 'bg-gray-50 border-gray-200 opacity-75'
      }
    `}>
      <div className="flex items-start space-x-4">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
          ${isActive 
            ? 'bg-ageofdevs-primary text-white' 
            : 'bg-gray-300 text-gray-500'
          }
        `}>
          {icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
              {title}
            </h3>
            {comingSoon && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Coming Soon
              </span>
            )}
            {requiredBalance && !isActive && (
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                Need {requiredBalance} AOD
              </span>
            )}
            {isActive && !comingSoon && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          
          <p className={`text-sm ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TokenUtilityCards({ tokenBalance }: TokenUtilityCardsProps) {
  const aodBalance = tokenBalance / 1000000; // Convert to AOD

  const utilities = [
    {
      icon: <Vote className="h-6 w-6" />,
      title: "Governance Rights",
      description: "Vote on community proposals, tutorial topics, and platform improvements. Your voting power scales with your token holdings.",
      isActive: aodBalance >= 100,
      requiredBalance: aodBalance < 100 ? 100 : undefined,
      comingSoon: true
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Premium Features",
      description: "Access exclusive tools, advanced tutorials, and premium content reserved for token holders.",
      isActive: aodBalance >= 50,
      requiredBalance: aodBalance < 50 ? 50 : undefined,
      comingSoon: true
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Task Rewards",
      description: "Earn additional AOD tokens by completing community tasks, tutorials, and helping other developers.",
      isActive: aodBalance > 0,
      requiredBalance: aodBalance === 0 ? 1 : undefined
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Access",
      description: "Join exclusive Discord channels, participate in live sessions, and connect with other serious developers.",
      isActive: aodBalance >= 1,
      requiredBalance: aodBalance < 1 ? 1 : undefined
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Early Access",
      description: "Get early access to new tutorials, courses, and educational content before public release.",
      isActive: aodBalance >= 500,
      requiredBalance: aodBalance < 500 ? 500 : undefined,
      comingSoon: true
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Founder Benefits",
      description: "Special recognition, founder-only events, and lifetime benefits for early community members.",
      isActive: aodBalance >= 1000, // Founding members who claimed
      requiredBalance: aodBalance < 1000 ? 1000 : undefined
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What You Can Do With AOD Tokens
        </h2>
        <p className="text-gray-600">
          Your tokens unlock exclusive features and community benefits
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {utilities.map((utility, index) => (
          <UtilityCard
            key={index}
            icon={utility.icon}
            title={utility.title}
            description={utility.description}
            isActive={utility.isActive}
            requiredBalance={utility.requiredBalance}
            comingSoon={utility.comingSoon}
          />
        ))}
      </div>

      {/* Current Balance Summary */}
      <div className="bg-ageofdevs-primary/10 border border-ageofdevs-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Your Current Status
            </h3>
            <p className="text-gray-700">
              With {tokenFormatting.formatAmount(tokenBalance, 'display')}, you have access to{' '}
              {utilities.filter(u => u.isActive && !u.comingSoon).length} features
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-ageofdevs-primary">
              {tokenFormatting.formatAmount(tokenBalance, 'display')}
            </div>
            <div className="text-sm text-gray-600">
              Your balance
            </div>
          </div>
        </div>
      </div>

      {/* Get More Tokens CTA */}
      {aodBalance < 1000 && (
        <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-2">
            Want to unlock more features?
          </h3>
          <p className="text-green-700 text-sm mb-4">
            Complete tasks, participate in the community, or claim your free distribution tokens!
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              Claim 1,000 free tokens
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              Complete community tasks
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              Help other developers
            </span>
          </div>
        </div>
      )}
    </div>
  );
}