'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoChatbubble, IoTime, IoPricetag, IoTrash, IoShare } from "react-icons/io5";
import { RiMedalLine } from "react-icons/ri";
import { HiOutlineExternalLink } from "react-icons/hi";

import { LayoutProps, TimelineItem } from './page';
import { getCharacterDisplayConfig } from '@/lib/characterDisplayConfig';
import { WalletConnectionBanner } from "@/components/WalletConnectionBanner";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ConversationCard } from "@/components/ConversationCard";

export default function MobileLayout(props: LayoutProps) {
  const router = useRouter();
  const displayConfig = getCharacterDisplayConfig(props.character?.tags || []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`relative min-h-screen bg-gray-900`}
      >
        <div className="fixed inset-0 z-0">
          <Image
            src={props.character?.background_image_url || '/bg2.png'}
            alt={props.character.name}
            fill
            className="object-cover blur-sm opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Wallet Connection Banner - Show if wallet not connected */}
          {!props.user && (
            <div className="mx-4 mt-4 mb-2">
              <WalletConnectionBanner 
                variant="banner" 
                message="Please connect your wallet to interact with this character."
              />
            </div>
          )}
          
          {/* Profile Section */}
          <div className="px-4 mb-6">
            <div className="relative w-24 h-24 mb-4 mx-auto" onClick={() => router.push('/')}>
              <Image
                src={props.character?.avatar_image_url || '/bg2.png'}
                alt={props.character.name}
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
              {props.character.name}
            </h1>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-4">
              {/* Start Chatting Button */}
              <button
                onClick={() => props.createConversation()}
                disabled={!props.user}
                className="mx-auto flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-medium bg-[#FDB777] text-black hover:bg-[#fca555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoChatbubble className="w-4 h-4" />
                Start Chatting
              </button>
              
              {/* Share Button */}
              <button
                onClick={props.handleShare}
                disabled={props.isSharing || props.isGeneratingUrl}
                className={`mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                  props.shareSuccess
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {props.isSharing || props.isGeneratingUrl ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                ) : props.shareSuccess ? (
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
          </div>

          {/* Tabs */}
          <div className="px-4 mb-4">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-2 flex gap-2">
              <button
                onClick={() => props.setActiveTab('about')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  props.activeTab === 'about'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About
              </button>
              <button
                onClick={() => props.setActiveTab('history')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  props.activeTab === 'history'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <IoChatbubble className="w-4 h-4" />
                Chats
              </button>
              <button
                onClick={() => props.setActiveTab('public')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  props.activeTab === 'public'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <RiMedalLine className="w-4 h-4" />
                Public
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-[20px]">
            {props.activeTab === 'about' ? (
              <div className="p-4 flex flex-col gap-6">
                {/* Tags */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IoPricetag className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">Tags</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {props.character.tags.map((tag) => (
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
                      {props.character.description}
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
                      timestamp={props.character.created_at}
                    />
                    <TimelineItem 
                      label="Updated"
                      timestamp={props.character.updated_at}
                    />
                    <TimelineItem 
                      label="Published"
                      timestamp={props.character.published_at}
                    />
                  </div>
                </div>
              </div>
            ) : props.activeTab === 'history' ? (
              <div className="p-4 flex flex-col gap-4">
                {!props.user ? (
                  // Wallet not connected view
                  <WalletConnectionBanner 
                    variant="card" 
                    message="Connect your wallet to start chatting with this character and access all features"
                  />
                ) : (
                  // Conversations View
                  <div className="flex flex-col gap-4">
                    {/* Existing Conversations */}
                    {props.chatHistory && props.chatHistory.length > 0 ? (
                      props.chatHistory.map((chat, index) => (
                        <ConversationCard
                          key={chat._id}
                          conversation={chat}
                          onClick={() => router.push(`/chat/${chat._id}`)}
                          variant="default"
                          actionButton={
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this conversation?')) {
                                  props.deleteConversation(chat._id);
                                }
                              }}
                              className="p-3 text-red-400 transition-colors hover:bg-red-500/10 rounded-full"
                              disabled={props.deleteConversationLoading}
                            >
                              <IoTrash className="w-5 h-5" />
                            </button>
                          }
                        />
                      ))
                    ) : (
                      <EmptyStateCard
                        variant="conversations"
                        title={displayConfig.emptyConversationsMessage}
                        description={`Start chatting with ${props.character.name} to begin your first conversation`}
                        actionButton={
                          <button
                            onClick={() => props.createConversation()}
                            className="px-6 py-3 bg-[#FDB777] text-black font-medium rounded-lg hover:bg-[#fca555] transition-colors"
                          >
                            {displayConfig.chatButtonLabel}
                          </button>
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Public Conversations Tab
              <div className="p-4 flex flex-col gap-4">
                {props.publicConversations && props.publicConversations.length > 0 ? (
                  props.publicConversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      className="flex items-center w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
                    >
                      <div 
                        onClick={() => router.push(`/chat/${conversation._id}`)}
                        className="flex-1 flex items-center gap-3 p-6"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FDB777]/20 flex items-center justify-center">
                          <IoShare className="w-5 h-5 text-[#FDB777]" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-medium text-base">
                            {conversation.history.length > 0 
                              ? conversation.history[0][0].content.substring(0, 30) + (conversation.history[0][0].content.length > 30 ? '...' : '')
                              : 'Shared Conversation'}
                          </h3>
                          <p className="text-sm text-gray-400 mt-0.5">
                            Shared by {conversation.owner_id.slice(0, 6) + '...' + conversation.owner_id.slice(-4) || "Anonymous"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/chat/${conversation._id}`)}
                        className="p-6 text-[#FDB777] transition-colors"
                        disabled={!props.user}
                      >
                        <HiOutlineExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <EmptyStateCard
                    variant="conversations"
                    title="No public conversations yet"
                    description="When users share their conversations with this character, they will appear here"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 