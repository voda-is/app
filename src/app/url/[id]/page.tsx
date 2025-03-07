'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { IoLink, IoWallet, IoInformationCircle, IoArrowBack } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useUrl } from '@/hooks/api';
import type { Url } from '@/lib/validations';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function UrlPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useAccount();
  const urlId = params.id as string;
  
  // Use the existing useUrl hook
  const { data, isLoading, error, refetch } = useUrl(urlId);
  
  const handleVisitUrl = () => {
    if (data?.url?.path) {
      // Open in new tab
      window.open(window.location.origin + "/" + data.url.path, '_blank', 'noopener,noreferrer');
      
      // You could implement click tracking here if needed
    }
  };
  
  return (
    <main className="flex h-screen overflow-hidden bg-[radial-gradient(#4B5563_1px,transparent_1px)] [background-size:16px_16px] bg-gray-900">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center p-4 border-b border-white/10">
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center gap-2 h-[44px] px-6 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl text-white transition-all duration-200 shadow-lg"
          >
            <IoArrowBack className="w-5 h-5" />
            <span>Home</span>
          </button>
          <h1 className="text-xl font-semibold text-white ml-4">URL Information</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {!isConnected ? (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 shadow-2xl">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoWallet className="w-10 h-10 text-orange-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-8">
                  You need to connect your wallet to view the information for this URL
                </p>
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {!connected && (
                          <button 
                            onClick={openConnectModal} 
                            type="button"
                            className="w-full py-3 px-4 bg-orange-500/60 hover:bg-orange-500/70 backdrop-blur-sm text-white font-medium rounded-xl transition-all"
                          >
                            Connect Wallet
                          </button>
                        )}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            ) : isLoading ? (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 shadow-2xl">
                <LoadingScreen />
                <p className="text-gray-300 mt-4">Loading URL information...</p>
              </div>
            ) : error ? (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 shadow-2xl">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoInformationCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Error</h2>
                <p className="text-gray-300 mb-8">{error.message}</p>
                <button
                  onClick={() => refetch()}
                  className="w-full py-3 px-4 bg-orange-500/60 hover:bg-orange-500/70 backdrop-blur-sm text-white font-medium rounded-xl transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : data ? (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoLink className="w-10 h-10 text-orange-400" />
                </div>
                
                <h2 className="text-2xl font-semibold text-white mb-4 text-center">
                  {data.url.url_type === 'referral' ? 'Referral Link' : 'Shared URL'}
                </h2>
                
                {data.referral_success && (
                  <div className="bg-green-500/20 p-4 rounded-xl mb-6 text-center">
                    <p className="text-green-300 font-medium">
                      Referral successfully applied!
                    </p>
                  </div>
                )}
                
                <div className="space-y-4 mb-8">
                  <div className="bg-black/20 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">URL Type</div>
                    <div className="text-white capitalize">{data.url.url_type}</div>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Created By</div>
                    <div className="text-white font-mono text-sm break-all">{data.url.created_by}</div>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Created At</div>
                    <div className="text-white">
                      {new Date(data.url.created_at * 1000).toLocaleString()}
                    </div>
                  </div>
                  
                  {data.url.used_by.length !== undefined && (
                    <div className="bg-black/20 p-4 rounded-xl">
                      <div className="text-sm text-gray-400 mb-1">Clicks</div>
                      <div className="text-white">{data.url.used_by.length}</div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleVisitUrl}
                  className="w-full py-3 px-4 bg-orange-500/60 hover:bg-orange-500/70 backdrop-blur-sm text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <IoLink className="w-5 h-5" />
                  Visit Destination
                </button>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 shadow-2xl">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoInformationCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">No Data Found</h2>
                <p className="text-gray-300 mb-8">
                  We couldn't find any information for this URL ID.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 px-4 bg-orange-500/60 hover:bg-orange-500/70 backdrop-blur-sm text-white font-medium rounded-xl transition-all"
                >
                  Go Home
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
} 