'use client';

import { ConnectWalletButton } from './ConnectWalletButton';

interface WalletConnectionBannerProps {
  variant?: 'banner' | 'card';
  message?: string;
}

export function WalletConnectionBanner({ 
  variant = 'banner',
  message = 'Please connect your wallet to interact with this character.'
}: WalletConnectionBannerProps) {
  if (variant === 'banner') {
    return (
      <div className="mb-8 p-6 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white">Wallet Connection Required</h3>
            <p className="text-sm text-gray-300 mt-1">
              {message}
            </p>
          </div>
          <ConnectWalletButton />
        </div>
      </div>
    );
  }
  
  // Card variant
  return (
    <div className="text-center py-12 backdrop-blur-sm rounded-xl">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
      </div>
      <p className="text-gray-100 text-lg">Wallet Connection Required</p>
      <p className="text-gray-300 mt-2 max-w-md mx-auto">
        {message}
      </p>
      <div className="mt-6">
        <ConnectWalletButton variant="large" />
      </div>
    </div>
  );
} 