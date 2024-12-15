'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CharacterCard } from '@/components/CharacterCard';
import { TopNav } from '@/components/Navigation/TopNav';
import { LoadingScreen } from '@/components/LoadingScreen';

import { useCharacters, useTelegramUser } from '@/hooks/api';
import { Character } from '@/lib/validations';
import { isOnTelegram, setupTelegramInterface } from '@/lib/telegram';

type FilterType = 'all' | 'male' | 'female' | 'roleplay' | 'chatroom';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const router = useRouter();
  const { data: _, isLoading: userLoading } = useTelegramUser();
  const { data: characters, isLoading: charactersLoading } = useCharacters(10, 0);

  useEffect(() => {
    setupTelegramInterface(router);
  }, []);

  const filteredCharacters = (characters as Character[])?.filter(character => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'male' || activeFilter === 'female') {
      return character.tags[0]?.toLowerCase() === activeFilter;
    }
    if (activeFilter === 'roleplay') {
      return character.metadata.enable_roleplay;
    }
    if (activeFilter === 'chatroom') {
      return character.metadata.enable_chatroom;
    }
    return true;
  });

  if (charactersLoading || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 text-white px-2 pb-20"
    >
      <TopNav activeTab={activeFilter} onTabChange={setActiveFilter} />
      <div className={`grid grid-cols-2 gap-2 ${isOnTelegram() ? 'pt-44' : 'pt-24'}`}>
        {filteredCharacters?.map((character, index) => (
          <Link key={character._id} href={`/character/${character._id}`}>
            <CharacterCard 
              character={character} 
              index={index} 
            />
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
