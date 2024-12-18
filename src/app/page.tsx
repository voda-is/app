'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CharacterCard } from '@/components/CharacterCard';
import { TopNav } from '@/components/Navigation/TopNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { BottomNav } from '@/components/Navigation/BottomNav';

import { useCharacters, useTelegramUser } from '@/hooks/api';
import { Character } from '@/lib/validations';
import { isOnTelegram, setupTelegramInterface } from '@/lib/telegram';

type FilterType = 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const router = useRouter();
  const { data: _, isLoading: userLoading } = useTelegramUser();
  const { data: characters, isLoading: charactersLoading } = useCharacters(10, 0);

  useEffect(() => {
    setupTelegramInterface(router);
  }, []);

  const filteredCharacters = useMemo(() => {
    if (!characters) return [];
    
    return (characters as Character[]).filter(character => {
      if (activeFilter === 'all') return true;
      
      // Safely handle tags array
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
      className="min-h-screen bg-gray-900 text-white px-2 pb-24"
    >
      <TopNav activeTab={activeFilter} onTabChange={setActiveFilter} />
      <div className={`grid grid-cols-2 gap-2 ${isOnTelegram() ? 'pt-52' : 'pt-32'}`}>
        {filteredCharacters.map((character, index) => (
          <Link key={character._id} href={`/character/${character._id}`}>
            <CharacterCard 
              character={character} 
              index={index} 
            />
          </Link>
        ))}
      </div>
      <BottomNav />
    </motion.div>
  );
}
