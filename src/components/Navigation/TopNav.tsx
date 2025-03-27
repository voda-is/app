import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface TopNavProps {
  activeTab: 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp';
  onTabChange: (tab: 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp') => void;
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const genderTabs = [
    { id: 'all', label: 'All' },
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
  ];

  const languageTabs = [
    { id: 'en', label: 'English' },
    { id: 'zh', label: '中文' },
    { id: 'kr', label: '한국어' },
    { id: 'jp', label: '日本語' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-gray-600/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navbar with logo and wallet connection */}
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-orange-400 font-bold text-xl">Voda AI</span>
            </Link>
          </div>
          
          {/* Custom styled wallet connection with RainbowKit */}
          <div className="flex items-center">
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
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
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
                    {(() => {
                      if (!connected) {
                        return (
                          <button 
                            onClick={openConnectModal} 
                            type="button"
                            className="bg-orange-500/60 hover:bg-orange-500/70 backdrop-blur-sm text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button 
                            onClick={openChainModal} 
                            type="button"
                            className="bg-red-500/60 hover:bg-red-500/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="flex items-center bg-gray-800/30 backdrop-blur-sm hover:bg-gray-700/40 text-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          >
                            {chain.hasIcon && (
                              <div className="mr-1.5 h-4 w-4 overflow-hidden rounded-full">
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    className="h-full w-full"
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </button>

                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="bg-orange-500/60 hover:bg-orange-500/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          >
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
        
        {/* Filter tabs section */}
        <div className="py-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
            {/* Gender filters */}
            <div className="flex items-center">
              <span className="text-orange-400 text-sm mr-2 hidden sm:inline">Gender:</span>
              <div className="flex gap-1">
                {genderTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all
                      ${activeTab === tab.id 
                        ? 'bg-orange-500/60 backdrop-blur-sm text-white font-medium'
                        : 'bg-gray-800/20 backdrop-blur-sm text-gray-300 hover:bg-gray-700/30'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Language filters */}
            <div className="flex items-center sm:ml-4">
              <span className="text-orange-400 text-sm mr-2 hidden sm:inline">Language:</span>
              <div className="flex gap-1">
                {languageTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all
                      ${activeTab === tab.id 
                        ? 'bg-orange-500/60 backdrop-blur-sm text-white font-medium'
                        : 'bg-gray-800/20 backdrop-blur-sm text-gray-300 hover:bg-gray-700/30'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 