'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { IoChatbubble, IoTime, IoPricetag } from "react-icons/io5";
import { formatDistance } from 'date-fns';
import { Character, ConversationHistory } from "@/lib/validations";
import { useRouter } from "next/navigation";

interface CharacterDetailsProps {
  character: Character;
  chatHistoryIds: string[];
}

export function CharacterDetails({ character, chatHistoryIds }: CharacterDetailsProps) {
  const router = useRouter();

  console.log('chatHistoryIds', chatHistoryIds);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-gray-900 pt-32"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={character?.background_image_url || '/bg2.png'}
          alt={character.name}
          fill
          className="object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Profile Section */}
        <div className="px-4 mb-6">
          <div className="relative w-24 h-24 mb-4 mx-auto">
            <Image
              src={character?.avatar_image_url || '/bg2.png'}
              alt={character.name}
              fill
              className="rounded-2xl object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {character.name}
          </h1>
          <p className="text-gray-400 text-center text-sm">
            @{character.telegram_handle}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-[20px]">
          <div className="p-4 flex flex-col gap-6">
            {/* Tags */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoPricetag className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {character.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-white mb-3">About</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {character.description}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoTime className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Timeline</h2>
              </div>
              <div className="space-y-2">
                <TimelineItem 
                  label="Created"
                  timestamp={character.created_at}
                />
                <TimelineItem 
                  label="Updated"
                  timestamp={character.updated_at}
                />
                <TimelineItem 
                  label="Published"
                  timestamp={character.published_at}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Chat Button */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-8">
          <button
            onClick={() => router.push(`/chat/${chatHistoryIds?.[0]}`)}
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

function TimelineItem({ label, timestamp }: { label: string; timestamp: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">
        {formatDistance(timestamp * 1000, new Date(), { addSuffix: true })}
      </span>
    </div>
  );
} 