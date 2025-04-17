'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Link from 'next/link';

import { CharacterCard } from '@/components/CharacterCard';
import { TopNav } from '@/components/Navigation/TopNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { BottomNav } from '@/components/Navigation/BottomNav';

import { useCharacters, useUser } from '@/hooks/api';
import { Character } from '@/lib/types';

type FilterType = 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp';
type TabType = 'chat' | 'market';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const { data: characters, isLoading: charactersLoading } = useCharacters(10, 0);
  const { data: user, isLoading: userLoading } = useUser();

  const filteredCharacters = useMemo(() => {
    if (!characters) return [];
    
    return (characters as Character[]).filter(character => {
      if (activeFilter === 'all') return true;
      
      const tags = character.tags || [];
      if (['zh', 'en', 'kr', 'jp', 'male', 'female'].includes(activeFilter)) {
        return tags.some(tag => tag?.toLowerCase() === activeFilter);
      }

      return true;
    });
  }, [characters, activeFilter]);

  if (charactersLoading || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 text-white"
    >
      <TopNav activeTab={activeFilter} onTabChange={setActiveFilter} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-4 pt-8 sm:pt-0">
        <div className="pt-36 pb-32">
          {/* Tab Navigation */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 z-20 h-16 flex items-center">
            <div className="flex gap-2 bg-gray-800/50 backdrop-blur-md rounded-full p-0.5">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-orange-400 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  activeTab === 'market'
                    ? 'bg-orange-400 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Market
              </button>
            </div>
          </div>

          {/* Chat Table */}
          {activeTab === 'chat' && (
            <div className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden min-h-[500px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Character</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Last Message</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharacters.map((character) => (
                    <tr key={character._id} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/character/${character._id}`} className="flex items-center gap-3">
                          <img
                            src={character.avatar_image_url || '/default-avatar.png'}
                            alt={character.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <span className="text-white">{character.name}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-300">No messages yet</td>
                      <td className="px-6 py-4 text-gray-300">-</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                          Available
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/character/${character._id}`}
                          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                          Start Chat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Market Table */}
          {activeTab === 'market' && (
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden min-h-[500px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Item</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Trend</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                    <tr key={item} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400">Item {item}</span>
                          </div>
                          <span className="text-white">Market Item {item}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">${(Math.random() * 100).toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-300">{Math.floor(Math.random() * 100)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          Math.random() > 0.5 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {Math.random() > 0.5 ? '↑' : '↓'} {(Math.random() * 10).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors">
                          Buy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </motion.div>
  );
}
