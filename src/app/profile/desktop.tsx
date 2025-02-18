'use client';

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
import { UserIdentity } from './page';

import { CharacterCard } from '@/components/profiles/CharacterCard';
import { WalletCard } from '@/components/profiles/WalletCard';
import { PointsCard } from '@/components/profiles/PointsCard';
import { PointsSystemGuide } from '@/components/profiles/PointsSystemGuide';
import { ReferralCampaignCard } from '@/components/profiles/ReferralCampaignCard';
import { ProfileLayoutProps } from './page';
import { notificationOccurred } from '@/lib/telegram';

type TabType = 'conversations' | 'wallet' | 'points';

export default function DesktopLayout(props: ProfileLayoutProps) {
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
    <div className="flex min-h-screen bg-[radial-gradient(#4B5563_1px,transparent_1px)] [background-size:16px_16px] text-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-white/10 p-8">
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
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
                  <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl font-semibold">
                    {getInitials(props.user.first_name)}
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <IoPersonCircle className="w-16 h-16" />
                  </div>
                )
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {props.user?.first_name || 'Anonymous'}
            </h1>
            <UserIdentity user={props.user} className="mb-6" />
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>

          {/* Navigation */}
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
              href="/profile?tab=wallet"
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors backdrop-blur-sm ${
                activeTab === 'wallet' 
                  ? 'bg-white/40 text-gray-100' 
                  : 'text-gray-300 bg-white/10'
              }`}
            >
              <IoWalletOutline className="w-5 h-5" />
              <span>Wallet</span>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {activeTab === 'conversations' ? (
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
          ) : activeTab === 'wallet' ? (
            <div className="space-y-4">
              <WalletCard 
                type="sol" 
                address={props.addresses?.sol_address || ''} 
                tokenInfo={props.tokenInfo!}
                expandedCard={expandedCard}
                setExpandedCard={setExpandedCard}
                copiedAddress={copiedAddress}
                onCopy={copyToClipboard}
              />
              <WalletCard 
                type="eth" 
                address={props.addresses?.eth_address || ''} 
                tokenInfo={props.tokenInfo!}
                expandedCard={expandedCard}
                setExpandedCard={setExpandedCard}
                copiedAddress={copiedAddress}
                onCopy={copyToClipboard}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {props.userPoints && (
                <PointsCard userPoints={props.userPoints} />
              )}
              <ReferralCampaignCard />
              <PointsSystemGuide />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 