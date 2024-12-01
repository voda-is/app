import { motion } from 'framer-motion';
import Image from "next/image";
import Link from "next/link";
import { IoCheckmarkCircle } from "react-icons/io5";

interface Character {
  name: string;
  age: number;
  traits: string;
  verified?: boolean;
}

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
      <Link href={`/chat/${character.name}`}>
        <div className="relative rounded-md overflow-hidden">
          <Image
            src="/bg2.png"
            alt={character.name}
            width={200}
            height={300}
            className="w-full h-[240px] object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-1">
              <span className="font-medium text-sm">{character.name}</span>
              {character.verified && (
                <IoCheckmarkCircle className="text-blue-400 text-base" />
              )}
            </div>
            <div className="text-xs text-gray-300">
              {character.age} / {character.traits}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 