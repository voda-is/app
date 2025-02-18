"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getUserId } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  const router = useRouter();
  const {data: session, status: sessionStatus} = useSession();

  if (sessionStatus === "loading") {
    return <LoadingScreen />;
  }

  try {
    const id = getUserId(session);
    console.log("Logged In");

  } catch (error) {
    router.push('/login');
    console.error("Error getting user ID", error);
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}