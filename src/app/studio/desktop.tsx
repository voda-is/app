'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoPersonCircle, IoSettingsOutline, IoGridOutline } from 'react-icons/io5';
import { StudioLayoutProps } from './page';
import { CharactersTab } from './characters-tab';
import { ConfigTab } from './config-tab';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';

type TabType = 'characters' | 'config';

export default function DesktopStudio(props: StudioLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const searchParams = useSearchParams();

  useEffect(() => { 
    const tab = searchParams.get('tab');
    if (tab === 'characters' || tab === 'config') {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  if (!props.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to access the Studio. This area is restricted to administrators only.</p>
          <Link href="/" className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-white/10 bg-black/20 backdrop-blur-md">
        <div className="p-6">
          <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
            <IoGridOutline className="w-5 h-5" />
            Voda Studio
          </h1>
          <nav className="space-y-2">
            <Link 
              href="/studio?tab=characters"
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                activeTab === 'characters' 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <IoPersonCircle className="w-5 h-5" />
              <span>Characters</span>
            </Link>
            <Link 
              href="/studio?tab=config"
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                activeTab === 'config' 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <IoSettingsOutline className="w-5 h-5" />
              <span>System Config</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'characters' ? (
            <CharactersTab user={props.user} />
          ) : (
            <ConfigTab user={props.user} />
          )}
        </div>
      </div>
    </div>
  );
} 