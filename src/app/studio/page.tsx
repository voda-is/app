'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useUser } from '@/hooks/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { User, UserRole } from '@/lib/types';

import DesktopStudio from './desktop';

export interface StudioLayoutProps {
  user: User | null | undefined;
  isAdmin: boolean;
}

export default function StudioPage() {
  const { data: user, isLoading: isLoadingUser } = useUser();

  const isAdmin = useMemo(() => {
    return user?.role === UserRole.Admin;
  }, [user]);

  const isReady = useMemo(() => {
    return user !== null && !isLoadingUser;
  }, [user, isLoadingUser]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  const layoutProps: StudioLayoutProps = {
    user,
    isAdmin
  };

  return <DesktopStudio {...layoutProps} />;
} 