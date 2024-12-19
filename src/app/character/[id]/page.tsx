'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IoChatbubble, IoTime, IoPricetag, IoTrash, IoShare } from "react-icons/io5";
import { RiMedalLine } from "react-icons/ri";
import { HiOutlineExternalLink } from "react-icons/hi";
import { formatDistance } from 'date-fns';
import { useParams, useRouter } from "next/navigation";

import { useCharacter,
  useCharacterChatHistory,
  useChatroomWithCharacter,
  useCreateConversation,
  useDeleteConversation,
  useGetMessageBrief,
  useTelegramInterface,
  useUserProfilesRaw
} from "@/hooks/api";

import { LoadingScreen } from "@/components/LoadingScreen";
import { UserProfilesCache } from "@/lib/userProfilesCache";
import { generateTelegramAppLink, isOnTelegram, notificationOccurred } from "@/lib/telegram";

export default function CharacterPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const cache = new UserProfilesCache();

  const [activeTab, setActiveTab] = useState<'about' | 'history'>('about');
  const [isLoading, setIsLoading] = useState(false);
  const { data: _tgInterface, isLoading: telegramInterfaceLoading } = useTelegramInterface(router);
  const { data: chatHistoryIds, isLoading: historyLoading } = useCharacterChatHistory(id);
  const { data: character, isLoading: characterLoading } = useCharacter(id);
  const { data: chatroom, isLoading: chatroomLoading } = useChatroomWithCharacter(
    // @ts-ignore
    character?.metadata.enable_chatroom ? id : null
  );
  const { data: messageBriefs, isLoading: messageBriefsLoading } = useGetMessageBrief(
    // @ts-ignore
    character?.metadata.enable_chatroom ? chatroom?._id || "" : null
  );
  const { data: _, isLoading: userProfilesLoading } = useUserProfilesRaw(
    character?.metadata.enable_chatroom ? messageBriefs || [] : []
  );

  const { mutate: createConversation, isPending: createConversationLoading, isSuccess: createConversationSuccess } = useCreateConversation(id);
  const { mutate: deleteConversation, isPending: deleteConversationLoading, isSuccess: deleteConversationSuccess } = useDeleteConversation(id);
  useEffect(() => {
    if (createConversationSuccess && !historyLoading) {
      setIsLoading(true);
      setTimeout(() => {
        router.push(`/chat/${chatHistoryIds?.[0]}`);
      }, 3000);
    }
  }, [createConversationSuccess, historyLoading, chatHistoryIds]);
  useEffect(() => {
    notificationOccurred('success');
  }, []);

  const handleShare = async () => {
    const link = await generateTelegramAppLink("finewtf_bot", `character/${id}`, "share_character");
    // copy to clipboard
    await navigator.clipboard.writeText(link);
    notificationOccurred('success');
  };

  if (characterLoading || historyLoading || createConversationLoading || deleteConversationLoading || isLoading ||
      (character?.metadata.enable_chatroom && (chatroomLoading || messageBriefsLoading || userProfilesLoading)) || 
      !id || telegramInterfaceLoading) {
    return <LoadingScreen />;
  }

  if (!character || !chatHistoryIds) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`relative min-h-screen bg-gray-900 ${isOnTelegram() ? 'pt-32' : 'pt-8'}`}
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
          <div className="relative w-24 h-24 mb-4 mx-auto" onClick={() => router.push('/')}>
            <Image
              src={character?.avatar_image_url || '/bg2.png'}
              alt={character.name}
              fill
              className="rounded-2xl object-cover"
            />
            <button 
              className="absolute -bottom-2 -left-2 w-8 h-8 bg-gray-600/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
            >
              <svg 
                className="w-5 h-5 text-emerald-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {character.name}
          </h1>
          {/* Add Share Button */}
          <button
            onClick={handleShare}
            className="mx-auto flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white transition-colors"
          >
            <IoShare className="w-4 h-4" />
            Share Character
          </button>
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
              {character.metadata.enable_chatroom ? 'Token Launches' : 'Conversations'}
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
              {character.metadata.enable_chatroom ? (
                // Token Launches View
                messageBriefs?.length && messageBriefs.length > 0 ? (
                  messageBriefs.map((brief) => (
                    <button
                      key={brief.id}
                      className="flex flex-col p-6 space-y-4 text-left bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl w-full"
                    >
                      {brief.is_wrapped && brief.function_call ? (
                        <div className="space-y-4 text-white w-full" onClick={() => router.push(`/messages/${chatroom?._id}/${brief.id}`)}  >
                          {/* Token Header with View Details */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <RiMedalLine className="w-5 h-5 text-emerald-400" />
                              <h3 className="text-lg font-semibold text-emerald-400">
                                LAUNCHED!
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-emerald-400">
                              <span>View Details</span>
                              <HiOutlineExternalLink className="w-4 h-4" />
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
                                  @{cache.getUser(brief.wrapped_by)?.username || "Anonymous"}
                                  <HiOutlineExternalLink className="w-4 h-4" />
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3" onClick={() => router.push(`/chatroom/${chatroom?._id}`)}  >
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
                    <p className="text-gray-400">No token launches yet</p>
                  </div>
                )
              ) : (
                // Conversations View
                chatHistoryIds ? (
                  <div className="flex flex-col gap-4">
                    {/* Start New Conversation Card */}
                    <button
                      onClick={() => createConversation()}
                      className="flex items-center gap-3 p-6 bg-emerald-600/30 backdrop-blur-md rounded-2xl w-full"
                    >
                      <IoChatbubble className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                      <div className="text-left">
                        <h3 className="text-emerald-200 font-medium text-base">Start New Conversation</h3>
                        <p className="text-emerald-300 mt-0.5 text-sm">Begin a fresh chat</p>
                      </div>
                    </button>

                    {/* Existing Conversations */}
                    {chatHistoryIds.map((chatId, index) => (
                      <button
                        key={chatId}
                        className="flex items-center w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
                      >
                        <div 
                          onClick={() => router.push(`/chat/${chatId}`)}
                          className="flex-1 flex items-center gap-3 p-6"
                        >
                          <IoChatbubble className="w-5 h-5 text-white flex-shrink-0" />
                          <div className="text-left">
                            <h3 className="text-white font-medium text-base">Continue Conversation #{chatHistoryIds.length - index}</h3>
                            <p className="text-sm text-gray-400 mt-0.5">Resume where you left off</p>
                          </div>
                        </div>
                        <div className="w-[1px] h-[60%] bg-white/10" />
                        <button
                          onClick={(e) => {
                            if (window.confirm('Are you sure you want to delete this conversation?')) {
                              deleteConversation(chatId);
                            }
                          }}
                          className="p-6 text-red-400 transition-colors"
                          disabled={deleteConversationLoading}
                        >
                          <IoTrash className="w-5 h-5" />
                        </button>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 text-center">
                    <p className="text-gray-400">No conversations yet</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Fixed Chat Button */}
        {activeTab === 'about' && <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-8">
          <div className="flex gap-4">
            {character.metadata.enable_roleplay && (
              <button
                onClick={() => router.push(`/chat/${chatHistoryIds?.[0]}`)}
                className="flex-1 bg-[#FDB777] text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                <IoChatbubble className="w-5 h-5" />
                Chat!
              </button>
            )}
            {character.metadata.enable_chatroom && (
              <button
                onClick={() => router.push(`/chatroom/${chatroom?._id}`)}
                className="flex-1 bg-emerald-300 text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                <RiMedalLine className="w-5 h-5" />
                Launch Token!
              </button>
            )}
          </div>
        </div>}
      </div>
    </motion.div>
    </div>
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