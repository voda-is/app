'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  IoPersonCircle, 
  IoChatbubbleEllipsesOutline, 
  IoStarOutline,
} from 'react-icons/io5';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

import { BottomNav } from '@/components/Navigation/BottomNav';
import { CharacterCard } from '@/components/profiles/CharacterCard';
import { PointsCard } from '@/components/profiles/PointsCard';
import { PointsSystemGuide } from '@/components/profiles/PointsSystemGuide';
import { ReferralCampaignCard } from '@/components/profiles/ReferralCampaignCard';
import { ProfileLayoutProps } from './page';
import { UserIdentity } from './page';

type TabType = 'conversations' | 'points';

// Create a separate component for the tab-dependent content
function TabContent({ activeTab, props, router }: { 
  activeTab: TabType; 
  props: ProfileLayoutProps;
  router: ReturnType<typeof useRouter>;
}) {
  return activeTab === 'conversations' ? (
    <>
      {props.characterListBrief && props.characterListBrief.length > 0 ? (
        <div className="space-y-4">
          {props.characterListBrief.map((character) => (
            <CharacterCard 
              key={character.character_id} 
              character={character} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center space-y-4">
          <div className="text-gray-300">No conversations yet</div>
          <button
            onClick={() => router.push('/')}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors rounded-lg px-6 py-3 text-sm font-medium text-emerald-400 flex items-center justify-center gap-2 mx-auto"
          >
            <IoChatbubbleEllipsesOutline className="w-4 h-4" />
            Start Your First Chat
          </button>
        </div>
      )}
    </>
  ) : (
    <div className="space-y-4">
      {props.userPoints && (
        <PointsCard userPoints={props.userPoints} />
      )}
      <ReferralCampaignCard />
      <PointsSystemGuide />
    </div>
  );
}

// Create a wrapper component for the search params logic
function TabManager({ children }: { children: (activeTab: TabType) => React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('conversations');
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'points' || tab === 'conversations') {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  return <>{children(activeTab)}</>;
}

export default function MobileLayout(props: ProfileLayoutProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(#4B5563_1px,transparent_1px)] [background-size:16px_16px] text-gray-100">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative min-h-screen pt-8"
      >
        {/* Profile Section */}
        <div className="px-4 mb-6">
          <div className="relative w-24 h-24 mb-4 mx-auto">
            {props.user?.profile_photo && !imageError ? (
              <Image
                src={props.user.profile_photo}
                alt="Profile"
                fill
                className="rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              props.user?.first_name ? (
                <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl font-semibold text-gray-100">
                  {getInitials(props.user.first_name)}
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <IoPersonCircle className="w-12 h-12 text-gray-100" />
                </div>
              )
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-100 text-center mb-2">
            {props.user?.first_name || 'Anonymous'}
          </h1>
          <UserIdentity user={props.user} className="mb-4" />
          
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mx-auto block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-sm font-medium text-gray-100"
          >
            Sign Out
          </button>
        </div>

        {/* Navigation */}
        <Suspense fallback={<div>Loading...</div>}>
          <TabManager>
            {(activeTab) => (
              <nav className="grid grid-cols-2 gap-2 p-4">
                <Link 
                  href="/profile?tab=conversations"
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'conversations' 
                      ? 'bg-white/40 text-gray-100' 
                      : 'text-gray-300 bg-white/10'
                  }`}
                >
                  <IoChatbubbleEllipsesOutline className="w-5 h-5" />
                  <span>Chats</span>
                </Link>
                <Link 
                  href="/profile?tab=points"
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'points' 
                      ? 'bg-white/40 text-gray-100' 
                      : 'text-gray-300 bg-white/10'
                  }`}
                >
                  <IoStarOutline className="w-5 h-5" />
                  <span>Points</span>
                </Link>
              </nav>
            )}
          </TabManager>
        </Suspense>

        {/* Tab Content */}
        <div className="flex-1 px-4 pb-24">
          <div className="space-y-3">
            {!props.isWalletConnected ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center space-y-4">
                <div className="text-gray-300">Connect your wallet to view your profile data</div>
              </div>
            ) : (
              <Suspense fallback={<div>Loading...</div>}>
                <TabManager>
                  {(activeTab) => (
                    <TabContent activeTab={activeTab} props={props} router={router} />
                  )}
                </TabManager>
              </Suspense>
            )}
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
} 