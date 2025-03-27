'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoTime, IoChevronBack } from "react-icons/io5";
import { RiMedalLine } from "react-icons/ri";
import { LayoutProps, TimelineItem } from './page';
import { getCharacterDisplayConfig } from '@/lib/characterDisplayConfig';
import { CharacterHeader } from "@/components/CharacterHeader";
import { WalletConnectionBanner } from "@/components/WalletConnectionBanner";
import { ConversationList } from "@/components/ConversationList";

export default function DesktopLayout(props: LayoutProps) {
  const router = useRouter();
  
  // Get display configuration based on character tags
  const displayConfig = getCharacterDisplayConfig(props.character?.tags || []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative min-h-screen"
      >
        {/* Background Image with Gradient Overlay */}
        <div className="fixed inset-0 z-0">
          <Image
            src={props.character?.background_image_url || '/bg2.png'}
            alt={props.character.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-800/90 to-black/90 backdrop-blur-sm" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            className="mb-8 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-colors"
          >
            <IoChevronBack className="w-5 h-5" />
            <span className="font-medium">Back to Characters</span>
          </button>

          {/* Wallet Connection Banner - Show if wallet not connected */}
          {!props.user && (
            <WalletConnectionBanner 
              variant="banner" 
              message="Please connect your wallet to interact with this character."
            />
          )}

          {/* Character Header */}
          <CharacterHeader 
            character={props.character}
            user={props.user ?? null}
            isSharing={props.isSharing}
            isGeneratingUrl={props.isGeneratingUrl}
            shareSuccess={props.shareSuccess}
            handleShare={props.handleShare}
            createConversation={props.createConversation}
          />

          {/* Two Column Layout */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - About and Timeline */}
            <div className="col-span-5 space-y-6">
              {/* About Section */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {props.character.description}
                  </p>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <IoTime className="w-5 h-5 text-gray-400" />
                  <h2 className="text-xl font-semibold text-white">Timeline</h2>
                </div>
                <div className="space-y-4">
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

            {/* Right Column - Conversations */}
            <div className="col-span-7">
              {/* User Conversations */}
              <ConversationList
                title="Your Conversations"
                conversations={props.chatHistory}
                user={props.user ?? null}
                variant="default"
                emptyStateTitle={displayConfig.emptyConversationsMessage}
                emptyStateDescription={`Start chatting with ${props.character.name} to begin your first conversation`}
                actionButton={
                  <button
                    onClick={() => props.createConversation()}
                    className="px-6 py-3 bg-[#FDB777] text-black font-medium rounded-lg hover:bg-[#fca555] transition-colors"
                  >
                    {displayConfig.chatButtonLabel}
                  </button>
                }
                onConversationClick={(id) => router.push(`/chat/${id}`)}
              />
              
              {/* Public Conversations */}
              <div className="mt-8">
                <ConversationList
                  title={
                    <div className="flex items-center gap-2">
                      <RiMedalLine className="w-6 h-6 text-blue-400" />
                      <span>{displayConfig.publicConversationsLabel}</span>
                    </div>
                  }
                  conversations={props.publicConversations || []}
                  user={props.user ?? null}
                  variant="public"
                  emptyStateTitle="No public conversations yet"
                  emptyStateDescription="When users share their conversations with this character, they will appear here"
                  onConversationClick={(id) => router.push(`/chat/${id}`)}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 