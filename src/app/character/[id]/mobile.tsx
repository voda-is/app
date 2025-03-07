'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoChatbubble, IoTime, IoPricetag, IoTrash, IoShare } from "react-icons/io5";
import { RiMedalLine } from "react-icons/ri";
import { HiOutlineExternalLink } from "react-icons/hi";
import { formatDistance } from 'date-fns';
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { LayoutProps, TimelineItem } from './page';

export default function MobileLayout(props: LayoutProps) {
  const router = useRouter();
  const isWalletConnected = props.isWalletConnected || false;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`relative min-h-screen bg-gray-900`}
      >
        {/* Background Image with Gradient Overlay */}
        <div className="fixed inset-0 z-0">
          <Image
            src={props.character?.background_image_url || '/bg2.png'}
            alt={props.character.name}
            fill
            className="object-cover blur-sm"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Wallet Connection Banner - Show if wallet not connected */}
          {!isWalletConnected && (
            <div className="mx-4 mt-4 mb-2 p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-amber-300 font-medium">Wallet Connection Required</h3>
                  <p className="text-amber-200/80 text-sm mt-1">
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
                            className="w-full py-3 px-4 bg-orange-500/60 hover:bg-orange-500/70 backdrop-blur-sm text-white font-medium rounded-xl transition-all"
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
            {/* Add Share Button */}
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
                {props.character.metadata.enable_chatroom ? 'Tokens' : 'Chats'}
              </button>
              <button
                onClick={() => props.setActiveTab('public')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  props.activeTab === 'public'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <IoShare className="w-4 h-4" />
                Shared
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
                {!isWalletConnected ? (
                  // Wallet not connected view
                  <div className="text-center py-10 bg-black/40 backdrop-blur-md rounded-xl border border-amber-500/10">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-white text-base font-medium">Wallet Connection Required</p>
                    <p className="text-gray-300 mt-2 mx-auto text-sm px-4">
                      Connect your wallet to start chatting with this character and access all features
                    </p>
                    <div className="mt-6 px-8">
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
                                  className="w-full py-2.5 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
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
                  props.messageBriefs?.length && props.messageBriefs.length > 0 ? (
                    props.messageBriefs.map((brief) => (
                      <button
                        key={brief.id}
                        className="flex flex-col p-6 space-y-4 text-left bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl w-full"
                      >
                        {brief.is_wrapped && brief.function_call ? (
                          <div className="space-y-4 text-white w-full" onClick={() => router.push(`/messages/${props.chatroom?._id}/${brief.id}`)}  >
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
                                    href={`https://t.me/${props.cache.getUser(brief.wrapped_by)?.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline flex items-center gap-1"
                                  >
                                    @{props.cache.getUser(brief.wrapped_by)?.username || "Anonymous"}
                                    <HiOutlineExternalLink className="w-4 h-4" />
                                  </a>
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3" onClick={() => router.push(`/chatroom/${props.chatroom?._id}`)}  >
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
                  props.chatHistoryIds ? (
                    <div className="flex flex-col gap-4">
                      {/* Start New Conversation Card */}
                      <button
                        onClick={() => props.createConversation()}
                        className="flex items-center gap-3 p-6 bg-emerald-600/30 backdrop-blur-md rounded-2xl w-full"
                      >
                        <IoChatbubble className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                        <div className="text-left">
                          <h3 className="text-emerald-200 font-medium text-base">Start New Conversation</h3>
                          <p className="text-emerald-300 mt-0.5 text-sm">Begin a fresh chat</p>
                        </div>
                      </button>

                      {/* Existing Conversations */}
                      {props.chatHistoryIds.map((chatId, index) => (
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
                              <h3 className="text-white font-medium text-base">Continue Conversation #{props.chatHistoryIds.length - index}</h3>
                              <p className="text-sm text-gray-400 mt-0.5">Resume where you left off</p>
                            </div>
                          </div>
                          <div className="w-[1px] h-[60%] bg-white/10" />
                          <button
                            onClick={(e) => {
                              if (window.confirm('Are you sure you want to delete this conversation?')) {
                                props.deleteConversation(chatId);
                              }
                            }}
                            className="p-6 text-red-400 transition-colors"
                            disabled={props.deleteConversationLoading}
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
            ) : (
              // Public Conversations Tab
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <IoShare className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Shared Conversations</h2>
                </div>
                
                {props.publicConversations && props.publicConversations.length > 0 ? (
                  props.publicConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => router.push(`/shared/${conversation.id}`)}
                      className="flex flex-col p-5 space-y-3 text-left bg-blue-950/30 backdrop-blur-md border border-blue-500/20 rounded-xl w-full"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <IoShare className="w-4 h-4 text-blue-400" />
                          </div>
                          <h3 className="text-white font-medium text-base">
                            {conversation.title || "Shared Conversation"}
                          </h3>
                        </div>
                        <div className="bg-blue-500/10 p-2 rounded-full">
                          <HiOutlineExternalLink className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs pl-12">
                        <span className="font-medium text-blue-300">
                          {conversation.sharedBy || "Anonymous"}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{formatDistance(new Date(conversation.sharedAt || Date.now()), new Date(), { addSuffix: true })}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10 bg-blue-950/20 backdrop-blur-md rounded-xl border border-blue-500/10">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <IoShare className="w-8 h-8 text-blue-400/60" />
                      </div>
                    </div>
                    <p className="text-white text-base font-medium">No shared conversations yet</p>
                    <p className="text-gray-300 mt-2 max-w-xs mx-auto text-sm">
                      When users share their conversations with this character, they will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed Chat Button */}
          {props.activeTab === 'about' && <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-8">
            <div className="flex gap-4">
              {props.character.metadata.enable_roleplay && (
                <button
                  onClick={() => isWalletConnected ? router.push(`/chat/${props.chatHistoryIds?.[0]}`) : null}
                  className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 ${
                    isWalletConnected 
                      ? "bg-[#FDB777] text-black font-semibold hover:bg-[#fca555] transition-colors" 
                      : "bg-[#FDB777]/40 text-black/60 font-semibold cursor-not-allowed"
                  }`}
                  disabled={!isWalletConnected}
                >
                  <IoChatbubble className="w-5 h-5" />
                  {isWalletConnected ? "Chat!" : "Connect Wallet to Chat"}
                </button>
              )}
              {props.character.metadata.enable_chatroom && (
                <button
                  onClick={() => isWalletConnected ? router.push(`/chatroom/${props.chatroom?._id}`) : null}
                  className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 ${
                    isWalletConnected 
                      ? "bg-emerald-300 text-black font-semibold hover:bg-emerald-400 transition-colors" 
                      : "bg-emerald-300/40 text-black/60 font-semibold cursor-not-allowed"
                  }`}
                  disabled={!isWalletConnected}
                >
                  <RiMedalLine className="w-5 h-5" />
                  {isWalletConnected ? "Launch Token!" : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>}
        </div>
      </motion.div>
    </div>
  );
} 