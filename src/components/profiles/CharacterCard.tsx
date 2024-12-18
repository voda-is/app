'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IoPersonCircle, IoChatbubble } from 'react-icons/io5';
import type { CharacterListBrief } from '@/lib/validations';

interface CharacterCardProps {
  character: CharacterListBrief;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const router = useRouter();

  return (
    <motion.div 
      className="bg-white/20 backdrop-blur-md rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="relative w-12 h-12 flex-shrink-0">
          {character.character_image ? (
            <Image
              src={character.character_image}
              alt={character.character_name}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
              <IoPersonCircle className="w-8 h-8 text-gray-900" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {character.character_name}
          </h3>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <IoChatbubble className="w-4 h-4" />
            {character.count} conversation{character.count !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => router.push(`/character/${character.character_id}`)}
          className="p-2 rounded-lg bg-white/30 hover:bg-white/40 transition-colors text-gray-900 text-sm font-medium"
        >
          View
        </button>
      </div>
    </motion.div>
  );
} 