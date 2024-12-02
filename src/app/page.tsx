'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CharacterCard } from '@/components/CharacterCard';
import { TopNav } from '@/components/Navigation/TopNav';
// import { BottomNav } from '@/components/Navigation/BottomNav';
import Link from 'next/link';
import { useCharacters, useTelegramUser } from '@/hooks/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Character } from '@/lib/validations';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'featured' | 'popular'>('featured');

  const { data: _, isLoading: userLoading } = useTelegramUser();
  const { data: characters, isLoading: charactersLoading } = useCharacters(10, 0);

  if (charactersLoading || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 text-white px-2 pt-4 pb-20"
    >
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Character Grid */}
      <div className="grid grid-cols-2 gap-2">
        {(characters as Character[])?.map((character, index) => (
          <Link key={character._id} href={`/character/${character._id}`}>
            <CharacterCard 
              character={character} 
              index={index} 
            />
          </Link>
        ))}
      </div>

      {/* <BottomNav activeTab={activeNavTab} onTabChange={setActiveNavTab} /> */}
    </motion.div>
  );
}
