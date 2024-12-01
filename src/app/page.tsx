'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CharacterCard } from '@/components/CharacterCard';
import { TopNav } from '@/components/Navigation/TopNav';
import { BottomNav } from '@/components/Navigation/BottomNav';

interface Character {
  name: string;
  age: number;
  traits: string;
  verified?: boolean;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'featured' | 'popular'>('featured');
  const [activeNavTab, setActiveNavTab] = useState('home');

  // Sample character data
  const characters: Character[] = [
    { name: "Kai", age: 21, traits: "Mysterious / Dominant", verified: true },
    { name: "Xavier", age: 26, traits: "Vengeful / Goal-oriented", verified: true },
    { name: "Rex", age: 21, traits: "Curious / Adventurous", verified: true },
    { name: "Alex", age: 18, traits: "Curious / Cute", verified: true },
  ];

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
        {characters.map((character, index) => (
          <CharacterCard 
            key={character.name} 
            character={character} 
            index={index} 
          />
        ))}
      </div>

      <BottomNav activeTab={activeNavTab} onTabChange={setActiveNavTab} />
    </motion.div>
  );
}
