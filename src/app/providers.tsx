"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
// import { initUserProfilesCache } from '@/lib/userProfilesCache';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  // Initialize the cache
  // useEffect(() => {
  //   initUserProfilesCache(queryClient);
  // }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
