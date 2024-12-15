'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { IoChatbubble, IoTime, IoPricetag, IoChatbubbleSharp } from "react-icons/io5";
import { formatDistance } from 'date-fns';
import { Character, Chatroom, MessageBrief } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RiMedalLine } from "react-icons/ri";
import { HiOutlineExternalLink } from "react-icons/hi";
import { UserProfilesCache } from "@/lib/userProfilesCache";

interface CharacterDetailsProps {
  character: Character;
  chatHistoryIds: string[];
  chatroom: Chatroom;
  messageBriefs: MessageBrief[];
}

export function CharacterDetails({ character, chatHistoryIds, chatroom, messageBriefs }: CharacterDetailsProps) {
  const router = useRouter();
  const cache = new UserProfilesCache();

  console.log( character, chatHistoryIds, chatroom, messageBriefs)
  
  const [activeTab, setActiveTab] = useState<'about' | 'history'>('about');
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-gray-900 pt-32"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src={character?.background_image_url || '/bg2.png'}
          alt={character.name}
          fill
          className="object-cover blur-sm"
          priority
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
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'about'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Token Launches
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[20px]">
          {activeTab === 'about' ? (
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
          ) : (
            <div className="p-4 flex flex-col gap-4">
              {messageBriefs?.length > 0 ? (
                messageBriefs.map((brief) => (
                  <button
                    key={brief.id}
                    className="flex flex-col p-6 space-y-4 text-left bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl w-full"
                  >
                    {brief.is_wrapped && brief.function_call ? (
                      <div className="space-y-4 text-white w-full" onClick={() => router.push(`/chatroomMessage/${chatroom._id}/${brief.id}`)}  >
                        {/* Token Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RiMedalLine className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-emerald-400">
                              LAUNCHED!
                            </h3>
                          </div>
                        </div>

                        {/* Token Details */}
                        <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-emerald-500/10">
                          <div className="text-left">
                            <p className="text-xs text-gray-400">Token Name</p>
                            <p className="font-semibold text-white">
                              {brief.function_call.name}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-400">Token Symbol</p>
                            <p className="font-semibold text-white">
                              {brief.function_call.symbol}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-400">Launched</p>
                            <p className="font-semibold text-white">
                              {formatDistance(brief.timestamp * 1000, new Date(), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-400">Created By</p>
                            <p className="font-semibold text-white">
                              <a 
                                href={`https://t.me/${cache.getUser(brief.wrapped_by)?.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-1"
                              >
                                {`@${cache.getUser(brief.wrapped_by)?.username}` || 'Anonymous'}
                                <HiOutlineExternalLink className="w-4 h-4" />
                              </a>
                            </p>
                          </div>
                        </div>

                        {/* View Details Link */}
                        <div className="flex items-center justify-between text-sm text-gray-300 pt-2">
                          <span>View Launch Details</span>
                          <HiOutlineExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3" onClick={() => router.push(`/chatroom/${chatroom._id}`)}  >
                        <IoChatbubble className="w-5 h-5 text-white" />
                        <div>
                          <h3 className="text-white font-medium">
                            Active Conversation
                          </h3>
                          <p className="text-sm text-gray-400">
                            {formatDistance(brief.timestamp * 1000, new Date(), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 text-center">
                  <p className="text-gray-400">No chat history yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Chat Button */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-8">
          {character.metadata.enable_roleplay && <button
            onClick={() => router.push(`/chat/${chatHistoryIds?.[0]}`)}
            className="w-full bg-[#FDB777] text-black font-semibold py-4 m-2 rounded-2xl flex items-center justify-center gap-2"
          >
            <IoChatbubble className="w-5 h-5" />
            Start Chatting
          </button>
          }
          {
            character.metadata.enable_chatroom && activeTab === 'about' && <button
            onClick={() => router.push(`/chatroom/${chatroom._id}`)}
            className="w-full bg-emerald-300 text-black font-semibold py-4 m-2 rounded-2xl flex items-center justify-center gap-2"
          >
            <IoChatbubbleSharp className="w-5 h-5" />
            Join Chatroom ⚡️
          </button>
          }
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