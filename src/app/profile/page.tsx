'use client';

import { useMemo } from 'react';
import { useUser, useCharacterListBrief } from '@/hooks/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CharacterListBrief, User } from '@/lib/types';
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
    if (!user?.profile.username) return 'anonymous';
    if (user?.provider === 'google') {
      return user.profile.username;
    }
    return `@${user.profile.username}`;
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {getProviderIcon()}
      <span className="text-gray-300 text-sm">{formatUsername()}</span>
    </div>
  );
}

export interface ProfileLayoutProps {
  user: User | null;
  characterListBrief: CharacterListBrief[] | null;
}

export default function ProfilePage() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: characterListBrief, isLoading: isLoadingCharacterListBrief } = useCharacterListBrief();

  const isReady = useMemo(() => {
    return !isLoadingUser && !isLoadingCharacterListBrief;
  }, [isLoadingUser, isLoadingCharacterListBrief]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  const layoutProps: ProfileLayoutProps = {
    user,
    characterListBrief: characterListBrief || null,
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