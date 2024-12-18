'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { IoPersonCircle } from 'react-icons/io5';

import { BottomNav } from '@/components/Navigation/BottomNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CharacterCard } from '@/components/profiles/CharacterCard';
import { TokenCard } from '@/components/profiles/TokenCard';
import { useTelegramUser, useGetAddress, useGetTokenInfo, useCharacterListBrief } from '@/hooks/api';
import { isOnTelegram } from '@/lib/telegram';

export default function ProfilePage() {
  const { data: user, isLoading } = useTelegramUser();
  const { data: addresses, isLoading: isLoadingAddresses } = useGetAddress();
  const { data: tokenInfo, isLoading: isLoadingTokenInfo } = useGetTokenInfo();
  const { data: characterListBrief, isLoading: isLoadingCharacterListBrief } = useCharacterListBrief();
  
  const [activeTab, setActiveTab] = useState<'conversations' | 'tokens'>('conversations');
  const [imageError, setImageError] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<'sol' | 'eth' | null>(null);
  const [expandedCard, setExpandedCard] = useState<'sol' | 'eth' | null>(null);
  const [safeAreaTop, setSafeAreaTop] = useState(0);

  useEffect(() => {
    if (isOnTelegram() && window.Telegram?.WebApp) {
      setSafeAreaTop(window.Telegram.WebApp.safeAreaInsets.top);
    }
  }, []);

  if (isLoading || isLoadingAddresses || isLoadingTokenInfo || isLoadingCharacterListBrief) {
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
        className="relative z-10 flex flex-col min-h-screen pt-8"
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
          <p className="text-gray-700 text-sm text-center mb-6">
            @{user?.username || 'anonymous'}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'conversations'
                  ? 'bg-white/30 text-gray-900'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'tokens'
                  ? 'bg-white/30 text-gray-900'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              Wallets
            </button>
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
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center text-gray-700">
                    No conversations yet
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <TokenCard 
                  type="sol" 
                  address={addresses?.sol_address || ''} 
                  tokenInfo={tokenInfo}
                  expandedCard={expandedCard}
                  setExpandedCard={setExpandedCard}
                  copiedAddress={copiedAddress}
                  onCopy={copyToClipboard}
                />
                <TokenCard 
                  type="eth" 
                  address={addresses?.eth_address || ''} 
                  tokenInfo={tokenInfo}
                  expandedCard={expandedCard}
                  setExpandedCard={setExpandedCard}
                  copiedAddress={copiedAddress}
                  onCopy={copyToClipboard}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
} 