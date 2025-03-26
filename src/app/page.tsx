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

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredCharacters.map((character, index) => (
              <Link 
                key={character._id} 
                href={`/character/${character._id}`}
                className="transform transition-transform hover:scale-105 rounded-lg"
              >
                <CharacterCard 
                  character={character} 
                  index={index} 
                />
              </Link>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </motion.div>
  );
}
