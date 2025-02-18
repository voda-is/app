'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  IoPersonCircle, 
  IoChatbubbleEllipsesOutline, 
  IoWalletOutline,
  IoStarOutline,
} from 'react-icons/io5';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

import { BottomNav } from '@/components/Navigation/BottomNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CharacterCard } from '@/components/profiles/CharacterCard';
import { WalletCard } from '@/components/profiles/WalletCard';
import { useUser, useGetAddress, useGetTokenInfo, useCharacterListBrief, useUserPoints, useTelegramInterface } from '@/hooks/api';
import { isOnTelegram, notificationOccurred } from '@/lib/telegram';
import { PointsCard } from '@/components/profiles/PointsCard';
import { PointsSystemGuide } from '@/components/profiles/PointsSystemGuide';
import { ReferralCampaignCard } from '@/components/profiles/ReferralCampaignCard';

type TabType = 'conversations' | 'wallet' | 'points';

function ProfileContent() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: addresses, isLoading: isLoadingAddresses } = useGetAddress();
  const { data: tokenInfo, isLoading: isLoadingTokenInfo } = useGetTokenInfo();
  const { data: characterListBrief, isLoading: isLoadingCharacterListBrief } = useCharacterListBrief();
  const { data: userPoints, isLoading: isLoadingUserPoints } = useUserPoints();

  const [activeTab, setActiveTab] = useState<TabType>('conversations');
  const [imageError, setImageError] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<'sol' | 'eth' | null>(null);
  const [expandedCard, setExpandedCard] = useState<'sol' | 'eth' | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    notificationOccurred('success');
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'points' || tab === 'wallet' || tab === 'conversations') {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  if (isLoadingUser || isLoadingAddresses || isLoadingTokenInfo || isLoadingCharacterListBrief || isLoadingUserPoints) {
    return <LoadingScreen />;
  }

  const copyToClipboard = async (text: string, type: 'sol' | 'eth') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-400 via-rose-300 to-emerald-200 text-gray-900">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative min-h-screen pt-8"
      >
        {isOnTelegram() && <div className="h-24" />}

        {/* Profile Section */}
        <div className="px-4 mb-6">
          <div className="relative w-24 h-24 mb-4 mx-auto">
            {user?.profile_photo && !imageError ? (
              <Image
                src={user.profile_photo}
                alt="Profile"
                fill
                className="rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              user?.first_name ? (
                <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-semibold text-gray-900">
                  {getInitials(user.first_name)}
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <IoPersonCircle className="w-12 h-12 text-gray-900" />
                </div>
              )
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {user?.first_name || 'Anonymous'}
          </h1>
          <p className="text-gray-700 text-sm text-center mb-4">
            @{user?.username || 'anonymous'}
          </p>
          
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mx-auto block px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-sm font-medium text-gray-900"
          >
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 flex gap-2">
            <Link 
              href="/profile?tab=conversations"
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'conversations' 
                  ? 'bg-white/30 text-gray-900' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('conversations')}
            >
              <IoChatbubbleEllipsesOutline className="w-4 h-4" />
              <span>Chats</span>
            </Link>
            <Link 
              href="/profile?tab=wallet"
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'wallet' 
                  ? 'bg-white/30 text-gray-900' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('wallet')}
            >
              <IoWalletOutline className="w-4 h-4" />
              <span>Wallet</span>
            </Link>
            <Link 
              href="/profile?tab=points"
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'points' 
                  ? 'bg-white/30 text-gray-900' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('points')}
            >
              <IoStarOutline className="w-4 h-4" />
              <span>Points</span>
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 px-4 pb-24">
          <div className="space-y-3">
            {activeTab === 'conversations' ? (
              <>
                {characterListBrief && characterListBrief.length > 0 ? (
                  <div className="space-y-3">
                    {characterListBrief.map((character) => (
                      <CharacterCard 
                        key={character.character_id} 
                        character={character} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center space-y-4">
                    <div className="text-gray-700">No conversations yet</div>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors rounded-lg px-6 py-3 text-sm font-medium text-emerald-600 flex items-center justify-center gap-2 mx-auto"
                    >
                      <IoChatbubbleEllipsesOutline className="w-4 h-4" />
                      Start Your First Chat
                    </button>
                  </div>
                )}
              </>
            ) : activeTab === 'wallet' ? (
              <div className="space-y-3">
                <WalletCard 
                  type="sol" 
                  address={addresses?.sol_address || ''} 
                  tokenInfo={tokenInfo}
                  expandedCard={expandedCard}
                  setExpandedCard={setExpandedCard}
                  copiedAddress={copiedAddress}
                  onCopy={copyToClipboard}
                />
                <WalletCard 
                  type="eth" 
                  address={addresses?.eth_address || ''} 
                  tokenInfo={tokenInfo}
                  expandedCard={expandedCard}
                  setExpandedCard={setExpandedCard}
                  copiedAddress={copiedAddress}
                  onCopy={copyToClipboard}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {userPoints ? (
                  <PointsCard 
                    userPoints={userPoints}
                  />
                ) : (
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center text-gray-700">
                    Loading points...
                  </div>
                )}
                <ReferralCampaignCard />
                <PointsSystemGuide />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: _tgInterface, isLoading: telegramInterfaceLoading } = useTelegramInterface(router);

  if (telegramInterfaceLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProfileContent />
    </Suspense>
  );
} 