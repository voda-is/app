'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useGetAddress, useGetTokenInfo, useCharacterListBrief, useUserPoints, useTelegramInterface } from '@/hooks/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { UserPoints, TokenInfo, CharacterListBrief, User } from '@/lib/validations';
import { notificationOccurred } from '@/lib/telegram';
import { FaTelegram } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaXTwitter } from 'react-icons/fa6';

import MobileLayout from './mobile';
import DesktopLayout from './desktop';

interface UserIdentityProps {
  user: User;
  className?: string;
}

export function UserIdentity({ user, className = "" }: UserIdentityProps) {
  const getProviderIcon = () => {
    if (user?.provider === 'telegram') {
      return <FaTelegram className="w-4 h-4 text-[#229ED9]" />;
    }
    if (user?.provider === 'google') {
      return <FcGoogle className="w-4 h-4" />;
    }
    if (user?.provider === 'x') {
      return <FaXTwitter className="w-4 h-4" />;
    }
    return null;
  };

  const formatUsername = () => {
    if (!user?.username) return 'anonymous';
    if (user?.provider === 'google') {
      return user.username;
    }
    return `@${user.username}`;
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {getProviderIcon()}
      <span className="text-gray-300 text-sm">{formatUsername()}</span>
    </div>
  );
}

export interface ProfileLayoutProps {
  user: any;
  addresses: {
    sol_address: string;
    eth_address: string;
  } | null;
  tokenInfo: TokenInfo | null;
  characterListBrief: CharacterListBrief[] | null;
  userPoints: UserPoints | null;
  isLoading: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  
  // Data fetching
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: addresses, isLoading: isLoadingAddresses } = useGetAddress();
  const { data: tokenInfo, isLoading: isLoadingTokenInfo } = useGetTokenInfo();
  const { data: characterListBrief, isLoading: isLoadingCharacterListBrief } = useCharacterListBrief();
  const { data: userPoints, isLoading: isLoadingUserPoints } = useUserPoints();
  const { data: _tgInterface, isLoading: telegramInterfaceLoading } = useTelegramInterface(router);

  const isLoading = isLoadingUser || isLoadingAddresses || isLoadingTokenInfo || 
                   isLoadingCharacterListBrief || isLoadingUserPoints || telegramInterfaceLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  const layoutProps: ProfileLayoutProps = {
    user,
    addresses: addresses || null,
    tokenInfo: tokenInfo || null,
    characterListBrief: characterListBrief || null,
    userPoints: userPoints || null,
    isLoading,
  };

  return (
    <>
      <div className="md:hidden">
        <MobileLayout {...layoutProps} />
      </div>
      <div className="hidden md:block">
        <DesktopLayout {...layoutProps} />
      </div>
    </>
  );
} 