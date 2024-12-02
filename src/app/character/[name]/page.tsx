'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoArrowBack, IoChatbubble } from "react-icons/io5";

interface CharacterStats {
  level: number;
  affection: number;
  messages: number;
  status: string;
}

export default function CharacterPage() {
  const router = useRouter();

  const character = {
    name: "Mia",
    image: "/bg2.png",
    description: "A fierce motorcycle gang leader with a mysterious past. Known for her sharp wit and even sharper attitude.",
    stats: {
      level: 5,
      affection: 75,
      messages: 128,
      status: "Online"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black overflow-hidden"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={character.image}
          alt={character.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">{character.name}</h1>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          <div className="p-4 flex flex-col gap-6">
            {/* Character Image */}
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src={character.image}
                alt={character.name}
                fill
                className="object-cover rounded-2xl"
              />
            </div>

            {/* Description */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-white mb-2">About</h2>
              <p className="text-gray-300">{character.description}</p>
            </div>

            {/* Stats */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Level" value={character.stats.level} />
                <StatItem label="Affection" value={`${character.stats.affection}%`} />
                <StatItem label="Messages" value={character.stats.messages} />
                <StatItem label="Status" value={character.stats.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Chat Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-8">
          <button
            onClick={() => router.push(`/chat/${character.name}`)}
            className="w-full bg-[#FDB777] text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <IoChatbubble className="w-5 h-5" />
            Start Chatting
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
} 