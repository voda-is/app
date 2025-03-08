'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { 
  IoPersonCircle, 
  IoChatbubbleEllipsesOutline, 
  IoStarOutline,
} from 'react-icons/io5';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
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
        <div className="grid gap-4">
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

export default function DesktopLayout(props: ProfileLayoutProps) {
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
    <div className="flex min-h-screen bg-[radial-gradient(#4B5563_1px,transparent_1px)] [background-size:16px_16px] text-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-white/10 p-8">
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {props.isWalletConnected && props.user?.profile_photo && !imageError ? (
                <Image
                  src={props.user.profile_photo}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : props.isWalletConnected && props.user?.first_name ? (
                <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl font-semibold">
                  {getInitials(props.user.first_name)}
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <IoPersonCircle className="w-16 h-16" />
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {props.isWalletConnected ? props.user?.first_name || 'Anonymous' : 'Anonymous'}
            </h1>
            {props.isWalletConnected && <UserIdentity user={props.user} className="mb-6" />}
            
            {/* Styled ConnectButton */}
            <div className="mt-4">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const connected = mounted && account && chain;
                  return (
                    <div className="w-full">
                      {!connected ? (
                        <button
                          onClick={openConnectModal}
                          className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors text-sm font-medium text-gray-100"
                        >
                          Connect Wallet
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={openChainModal}
                            className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors text-sm font-medium text-gray-100 flex items-center justify-center gap-2"
                          >
                            {chain.hasIcon && (
                              <div className="w-4 h-4">
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    className="w-full h-full"
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </button>
                          <button
                            onClick={openAccountModal}
                            className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors text-sm font-medium text-gray-100 flex items-center justify-center"
                          >
                            {account.displayName}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>

          {/* Navigation */}
          <Suspense fallback={<div>Loading...</div>}>
            <TabManager>
              {(activeTab) => (
                <nav className="space-y-2">
                  <Link 
                    href="/profile?tab=conversations"
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors backdrop-blur-sm ${
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
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors backdrop-blur-sm ${
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {!props.isWalletConnected ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center space-y-4">
            <div className="text-gray-300">Connect your wallet to view your profile data</div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <Suspense fallback={<div>Loading...</div>}>
              <TabManager>
                {(activeTab) => (
                  <TabContent activeTab={activeTab} props={props} router={router} />
                )}
              </TabManager>
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
} 