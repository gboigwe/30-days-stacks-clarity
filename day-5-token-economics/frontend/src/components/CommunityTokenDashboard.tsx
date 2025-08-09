// Community Token Dashboard - Main interface from the blog
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useAgeOfDevsToken } from '@/hooks/useAgeOfDevsToken';
import { useTokenTransfers } from '@/hooks/useTokenTransfers';
import { tokenFormatting, distributionUtils } from '@/lib/token-utils';
import TokenBalanceCard from './TokenBalanceCard';
import ClaimTokensSection from './ClaimTokensSection';
import TokenStatsGrid from './TokenStatsGrid';
import TokenUtilityCards from './TokenUtilityCards';
import TokenTransferForm from './TokenTransferForm';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  Award,
  Wallet,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function CommunityTokenDashboard() {
  const { wallet, connectWallet } = useWallet();
  const { tokenData, loadTokenData } = useAgeOfDevsToken(wallet.address || undefined);
  const { claimCommunityTokens, transferState } = useTokenTransfers();
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);

  // Handle token claim
  const handleClaimTokens = async () => {
    try {
      const result = await claimCommunityTokens();
      if (result.success) {
        setShowClaimSuccess(true);
        await loadTokenData(); // Refresh token data
        setTimeout(() => setShowClaimSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Failed to claim tokens:', error);
    }
  };

  const canClaim = tokenData.distributionInfo?.distributionActive && 
                   !tokenData.distributionClaim?.claimed &&
                   wallet.isConnected;

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 ageofdevs-gradient rounded-full flex items-center justify-center animate-pulse-glow">
            <Coins className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to AgeOfDevs
          </h1>
          
          <p className="text-gray-600 mb-8">
            Join the cryptocurrency-powered developer community. Get free tokens, earn rewards, and help shape the future of development education.
          </p>
          
          <button
            onClick={connectWallet}
            className="w-full ageofdevs-gradient text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ageofdevs-primary focus:ring-offset-2"
          >
            <Wallet className="w-5 h-5 inline mr-2" />
            Connect Wallet to Get Started
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Powered by Stacks blockchain</p>
            <p>SIP-010 compliant cryptocurrency</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 ageofdevs-gradient rounded-lg flex items-center justify-center mr-3">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AgeOfDevs Token</h1>
                <p className="text-xs text-gray-600">Community-Powered Cryptocurrency</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {wallet.address && (
                  <span className="font-mono">
                    {tokenFormatting.formatAddress(wallet.address)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowTransferForm(!showTransferForm)}
                className="bg-ageofdevs-primary hover:bg-ageofdevs-secondary text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 inline mr-1" />
                Transfer
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        {showClaimSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 animate-slide-up">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  🎉 Welcome to the AgeOfDevs Community!
                </h3>
                <p className="text-green-700">
                  You've successfully claimed 1,000 AOD tokens and joined our founding members!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Token Overview Section */}
        <div className="mb-8">
          <div className="ageofdevs-gradient rounded-xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">AgeOfDevs Token (AOD)</h2>
                  <p className="text-purple-100 text-lg">
                    The cryptocurrency powering the developer community
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-purple-200">Your Balance</div>
                  <div className="text-3xl font-bold">
                    {tokenFormatting.formatAmount(tokenData.balance, 'display')}
                  </div>
                </div>
              </div>

              <TokenStatsGrid 
                tokenData={tokenData}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              />
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Claim Section */}
            {canClaim && (
              <ClaimTokensSection
                distributionInfo={tokenData.distributionInfo!}
                onClaim={handleClaimTokens}
                isClaiiming={transferState === 'signing' || transferState === 'pending'}
                transferState={transferState}
              />
            )}

            {/* Transfer Form */}
            {showTransferForm && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Send AOD Tokens
                </h3>
                <TokenTransferForm
                  userBalance={tokenData.balance}
                  onTransferComplete={() => {
                    setShowTransferForm(false);
                    loadTokenData();
                  }}
                />
              </div>
            )}

            {/* Token Features */}
            <TokenUtilityCards tokenBalance={tokenData.balance} />
          </div>

          {/* Right Column - Stats and Info */}
          <div className="space-y-6">
            {/* Balance Card */}
            <TokenBalanceCard
              balance={tokenData.balance}
              userStats={tokenData.userStats}
              isLoading={tokenData.isLoading}
            />

            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Community Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Supply</span>
                  <span className="font-semibold">
                    {tokenFormatting.formatAmount(tokenData.totalSupply, 'compact')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Distribution Progress</span>
                  <div className="text-right">
                    <div className="font-semibold">
                      {tokenData.distributionInfo?.totalClaims || 0} / {tokenData.distributionInfo?.maxClaims || 30}
                    </div>
                    {tokenData.distributionInfo && (
                      <div className="w-24 bg-gray-200 rounded-full h-2 ml-auto">
                        <div 
                          className="bg-ageofdevs-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${distributionUtils.getDistributionProgress(tokenData.distributionInfo)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Founding Members</span>
                  <span className="font-semibold">
                    {tokenData.distributionInfo?.totalClaims || 0}
                  </span>
                </div>

                {tokenData.distributionInfo?.distributionActive && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Claims Remaining</span>
                    <span className="font-semibold text-ageofdevs-primary">
                      {tokenData.distributionInfo.claimsRemaining}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* User Reputation */}
            {tokenData.userStats && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Your Reputation
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Reputation Level</span>
                      <span className="font-semibold">
                        {tokenFormatting.getReputationDisplay(tokenData.userStats.reputationLevel).label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-ageofdevs-primary to-ageofdevs-secondary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${tokenData.userStats.reputationLevel}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tokens Earned</span>
                    <span className="font-semibold">
                      {tokenFormatting.formatAmount(tokenData.userStats.totalEarned, 'display')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Governance Power</span>
                    <span className="font-semibold">
                      {tokenData.userStats.governancePower.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}