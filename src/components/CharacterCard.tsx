import { Character } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from "next/image";
import { IoBag } from "react-icons/io5";
import { formatDistance } from 'date-fns';
import { GiSoundWaves } from "react-icons/gi";

interface CharacterCardProps {
  character: Character;
  index: number;
}

export function CharacterCard({ character, index }: CharacterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="relative rounded-md overflow-hidden">
        <Image
          src={character?.avatar_image_url || '/bg2.png'}
          alt={character.name}
          width={200}
          height={300}
          className="w-full h-[240px] object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-sm">{character.name}</span>
            {/* if the character has voice enabled, show the checkmark */}
            {character.metadata.enable_voice && <GiSoundWaves className="text-white bg-blue-500 rounded-full p-0.5 h-5 w-5" />}
          </div>
          
          <p className="text-xs text-gray-300 line-clamp-2 mb-1">
            {character.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-1">
            {character.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-white/10 rounded-sm text-xs text-gray-300"
              >
                {tag}
              </span>
            ))}
            {character.tags.length > 2 && (
              <span className="text-xs text-gray-400">
                +{character.tags.length - 2}
              </span>
            )}
          </div>

          {/* Created at */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <IoBag className="text-xs" />
            {formatDistance(character.created_at * 1000, new Date(), { addSuffix: true })}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 