'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoChatbubble, IoTime, IoPricetag, IoTrash, IoShare, IoChevronBack } from "react-icons/io5";
import { RiMedalLine } from "react-icons/ri";
import { HiOutlineExternalLink } from "react-icons/hi";
import { formatDistance } from 'date-fns';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LayoutProps, TimelineItem } from './page';

export default function DesktopLayout(props: LayoutProps) {
  const router = useRouter();
  const isWalletConnected = props.isWalletConnected || false;

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
          {!isWalletConnected && (
            <div className="mb-8 p-6 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">Wallet Connection Required</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Please connect your wallet to interact with this character.
                  </p>
                </div>
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {!connected && (
                          <button 
                            onClick={openConnectModal} 
                            type="button"
                            className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
                          >
                            Connect Wallet
                          </button>
                        )}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="flex items-start gap-8 mb-12">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40">
                <Image
                  src={props.character?.avatar_image_url || '/bg2.png'}
                  alt={props.character.name}
                  fill
                  className="rounded-2xl object-cover shadow-2xl"
                />
              </div>
            </div>
            
            {/* Character Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-white">
                  {props.character.name}
                </h1>
                <button
                  onClick={props.handleShare}
                  disabled={props.isSharing || props.isGeneratingUrl}
                  className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                    props.shareSuccess
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white'
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
              <div className="flex flex-wrap gap-2 mb-6">
                {props.character.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                {props.character.metadata.enable_roleplay && (
                  <button
                    onClick={() => router.push(`/chat/${props.chatHistoryIds?.[0]}`)}
                    className="bg-[#FDB777] text-black font-semibold px-6 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#fca555] transition-colors"
                    disabled={!isWalletConnected}
                  >
                    <IoChatbubble className="w-5 h-5" />
                    Start Chatting
                  </button>
                )}
                {props.character.metadata.enable_chatroom && (
                  <button
                    onClick={() => router.push(`/chatroom/${props.chatroom?._id}`)}
                    className="bg-emerald-400 text-black font-semibold px-6 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors"
                    disabled={!isWalletConnected}
                  >
                    <RiMedalLine className="w-5 h-5" />
                    Launch Token
                  </button>
                )}
              </div>
            </div>
          </div>

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

              {/* SEI Balance Section */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-white">Funding Wallet Balance</h2>
                </div>
                <div className="text-2xl font-medium text-emerald-400">
                  {props.seiBalance ? `${props.seiBalance} SEI` : 'Loading...'}
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

            {/* Right Column - Conversations/Token Launches */}
            <div className="col-span-7">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  {props.character.metadata.enable_chatroom ? 'Token Launches' : 'Conversations'}
                </h2>
                
                <div className="space-y-4">
                  {!isWalletConnected ? (
                    // Wallet not connected view
                    <div className="text-center py-12 backdrop-blur-sm rounded-xl">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-gray-100 text-lg">Wallet Connection Required</p>
                      <p className="text-gray-300 mt-2 max-w-md mx-auto">
                        Connect your wallet to start chatting with this character and access all features.
                      </p>
                      <div className="mt-6">
                        <ConnectButton.Custom>
                          {({
                            account,
                            chain,
                            openAccountModal,
                            openChainModal,
                            openConnectModal,
                            authenticationStatus,
                            mounted,
                          }) => {
                            const ready = mounted && authenticationStatus !== 'loading';
                            const connected =
                              ready &&
                              account &&
                              chain &&
                              (!authenticationStatus ||
                                authenticationStatus === 'authenticated');

                            return (
                              <div
                                {...(!ready && {
                                  'aria-hidden': true,
                                  'style': {
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                  },
                                })}
                              >
                                {!connected && (
                                  <button 
                                    onClick={openConnectModal} 
                                    type="button"
                                    className="px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
                                  >
                                    Connect Wallet
                                  </button>
                                )}
                              </div>
                            );
                          }}
                        </ConnectButton.Custom>
                      </div>
                    </div>
                  ) : props.character.metadata.enable_chatroom ? (
                    // Token Launches View
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-6 bg-black/20 backdrop-blur-md rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                           onClick={() => router.push(`/chatroom/${props.chatroom?._id}`)}>
                        <IoChatbubble className="w-8 h-8 text-emerald-300 flex-shrink-0" />
                        <div>
                          <h3 className="text-white font-medium text-lg">
                            Active Conversation
                          </h3>
                          <p className="text-gray-400 mt-1">
                            Join the ongoing conversation
                          </p>
                        </div>
                      </div>
                      
                      {props.messageBriefs?.length && props.messageBriefs.length > 0 ? (
                        props.messageBriefs
                          .filter(brief => brief.is_wrapped && brief.function_call)
                          .map((brief) => (
                            <div
                              key={brief.id}
                              onClick={() => router.push(`/messages/${props.chatroom?._id}/${brief.id}`)}
                              className="flex flex-col p-6 space-y-4 text-left bg-black/20 backdrop-blur-md border border-white/10 rounded-xl w-full hover:bg-white/5 transition-colors cursor-pointer"
                            >
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

                              {/* Token Details Grid */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-xl border border-emerald-500/10">
                                <div>
                                  <p className="text-xs text-gray-400">Token Name</p>
                                  <p className="font-semibold text-white mt-1">
                                    {brief.function_call?.name}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Token Symbol</p>
                                  <p className="font-semibold text-white mt-1">
                                    {brief.function_call?.symbol}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Launched</p>
                                  <p className="font-semibold text-white mt-1">
                                    {formatDistance(brief.timestamp * 1000, new Date(), { addSuffix: true })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Created By</p>
                                  <a 
                                    href={`https://t.me/${props.cache.getUser(brief.wrapped_by)?.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-white mt-1 hover:underline flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    @{props.cache.getUser(brief.wrapped_by)?.username || "Anonymous"}
                                    <HiOutlineExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center text-gray-400 py-12">
                          No token launches yet
                        </div>
                      )}
                    </div>
                  ) : (
                    // Conversations View
                    <>
                      <button
                        onClick={() => props.createConversation()}
                        className="flex items-center gap-4 p-6 bg-emerald-600/20 backdrop-blur-md rounded-xl w-full hover:bg-emerald-600/30 transition-colors"
                      >
                        <IoChatbubble className="w-8 h-8 text-emerald-300 flex-shrink-0" />
                        <div className="text-left">
                          <h3 className="text-emerald-200 font-medium text-lg">Start New Conversation</h3>
                          <p className="text-emerald-300/80 mt-1 text-sm">Begin a fresh chat with {props.character.name}</p>
                        </div>
                      </button>

                      {props.chatHistoryIds.map((chatId, index) => (
                        <div
                          key={chatId}
                          className="flex items-center w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden group"
                        >
                          <div 
                            onClick={() => router.push(`/chat/${chatId}`)}
                            className="flex-1 flex items-center gap-4 p-6 cursor-pointer hover:bg-white/5 transition-colors"
                          >
                            <IoChatbubble className="w-8 h-8 text-emerald-300 flex-shrink-0" />
                            <div className="text-left">
                              <h3 className="text-white font-medium text-lg">
                                Conversation #{props.chatHistoryIds.length - index}
                              </h3>
                              <p className="text-gray-400 mt-1 text-sm">Resume your conversation with {props.character.name}</p>
                            </div>
                          </div>
                          <div className="w-[1px] h-[60%] bg-white/10" />
                          <div className="px-6">
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this conversation?')) {
                                  props.deleteConversation(chatId);
                                }
                              }}
                              className="p-3 w-16 h-16 flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-full"
                              disabled={props.deleteConversationLoading}
                            >
                              <IoTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              
              {/* Public Conversations Section - Completely separate box */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mt-8">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                  <IoShare className="w-6 h-6 text-blue-400" />
                  Public Conversations
                </h2>
                <div className="space-y-4">
                  {props.publicConversations && props.publicConversations.length > 0 ? (
                    props.publicConversations.map((conversation) => (
                      <div
                        key={conversation._id}
                        className="flex items-center w-full bg-blue-950/30 backdrop-blur-md border border-blue-500/20 rounded-xl overflow-hidden group"
                      >
                        <div 
                          onClick={() => router.push(`/chat/${conversation._id}`)}
                          className="flex-1 flex items-center gap-4 p-6 cursor-pointer hover:bg-blue-900/10 transition-colors"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <IoShare className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-white font-medium text-lg">
                              {JSON.parse(conversation.function_calls[0].arguments).name  || `Shared Conversation`}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-400 mt-1">
                              <span>Shared by {conversation.owner_id.slice(0, 6) + '...' + conversation.owner_id.slice(-4) || "Anonymous"}</span>
                              <span className="text-gray-500">•</span>
                              <span>{formatDistance(new Date(conversation.updated_at * 1000 || Date.now()), new Date(), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-6">
                          <button
                            onClick={() => router.push(`/chat/${conversation._id}`)}
                            className="p-3 w-16 h-16 flex items-center justify-center text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 transition-all rounded-full"
                          >
                            <HiOutlineExternalLink className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-blue-950/20 backdrop-blur-md rounded-xl border border-blue-500/10">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <IoShare className="w-8 h-8 text-blue-400/60" />
                        </div>
                      </div>
                      <p className="text-gray-400 text-lg">No public conversations yet</p>
                      <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        When users share their conversations with this character, they will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 