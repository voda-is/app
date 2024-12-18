'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IoWallet, IoPersonCircle, IoCopy, IoCheckmark } from 'react-icons/io5';

import { BottomNav } from '@/components/Navigation/BottomNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useTelegramUser, useGetAddress } from '@/hooks/api';
import { isOnTelegram } from '@/lib/telegram';

export default function ProfilePage() {
  const { data: user, isLoading } = useTelegramUser();
  const { data: addresses, isLoading: isLoadingAddresses } = useGetAddress();
  const [activeTab, setActiveTab] = useState<'conversations' | 'tokens'>('conversations');
  const [imageError, setImageError] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<'sol' | 'eth' | null>(null);

  if (isLoading || isLoadingAddresses) {
    return <LoadingScreen />;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string, type: 'sol' | 'eth') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
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
                Tokens
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 px-4 pb-24">
            <div className="space-y-3">
              {activeTab === 'conversations' ? (
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center text-gray-700">
                  No conversations yet
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Solana Address */}
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="font-medium text-gray-900">Solana</h3>
                        <p className="text-sm text-gray-700 font-mono">
                          {formatAddress(addresses?.sol_address || '')}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(addresses?.sol_address || '', 'sol')}
                        className="p-2 rounded-lg bg-white/30 hover:bg-white/40 transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress === 'sol' ? (
                          <IoCheckmark className="w-5 h-5 text-green-600" />
                        ) : (
                          <IoCopy className="w-5 h-5 text-gray-900" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Ethereum Address */}
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="font-medium text-gray-900">Ethereum</h3>
                        <p className="text-sm text-gray-700 font-mono">
                          {formatAddress(addresses?.eth_address || '')}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(addresses?.eth_address || '', 'eth')}
                        className="p-2 rounded-lg bg-white/30 hover:bg-white/40 transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress === 'eth' ? (
                          <IoCheckmark className="w-5 h-5 text-green-600" />
                        ) : (
                          <IoCopy className="w-5 h-5 text-gray-900" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <BottomNav />
    </div>
  );
} 