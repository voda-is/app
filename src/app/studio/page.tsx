'use client';

import { useMemo, Suspense } from 'react';
import { useUser } from '@/hooks/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { User, UserRole } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

import DesktopStudio from './desktop';

export interface StudioLayoutProps {
  user: User | null | undefined;
  isAdmin: boolean;
  searchParams: URLSearchParams;
}

function StudioContent() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const searchParams = useSearchParams();

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
    isAdmin,
    searchParams
  };

  return <DesktopStudio {...layoutProps} />;
}

export default function StudioPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StudioContent />
    </Suspense>
  );
} 