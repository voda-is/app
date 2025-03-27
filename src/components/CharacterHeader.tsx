'use client';

import Image from "next/image";
import { IoShare, IoChatbubble } from "react-icons/io5";
import { Character, User } from "@/lib/types";

interface CharacterHeaderProps {
  character: Character;
  user: User | null;
  isSharing: boolean;
  isGeneratingUrl: boolean;
  shareSuccess: boolean;
  handleShare: () => void;
  createConversation: () => void;
}

export function CharacterHeader({
  character,
  user,
  isSharing,
  isGeneratingUrl,
  shareSuccess,
  handleShare,
  createConversation
}: CharacterHeaderProps) {
  return (
    <div className="flex items-start gap-8 mb-12">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="relative w-40 h-40">
          <Image
            src={character?.avatar_image_url || '/bg2.png'}
            alt={character.name}
            fill
            className="rounded-2xl object-cover shadow-2xl"
          />
        </div>
      </div>
      
      {/* Character Info */}
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold text-white">
            {character.name}
          </h1>
          <button
            onClick={handleShare}
            disabled={isSharing || isGeneratingUrl}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
              shareSuccess
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white'
            }`}
          >
            {isSharing || isGeneratingUrl ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
            ) : shareSuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <IoShare className="w-4 h-4" />
                Share Character
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {character.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => createConversation()}
            className="bg-[#FDB777] text-black font-semibold px-6 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#fca555] transition-colors"
            disabled={!user}
          >
            <IoChatbubble className="w-5 h-5" />
            Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
} 