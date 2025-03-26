'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ConnectWalletButtonProps {
  variant?: 'default' | 'large';
  label?: string;
}

export function ConnectWalletButton({ 
  variant = 'default', 
  label = 'Connect Wallet' 
}: ConnectWalletButtonProps) {
  const isLarge = variant === 'large';
  
  return (
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
                className={`${
                  isLarge 
                    ? 'px-6 py-3' 
                    : 'px-4 py-2'
                } bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors`}
              >
                {label}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
} 