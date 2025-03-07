"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoChevronBack } from "react-icons/io5";
import { FiAward, FiInfo, FiClock, FiUsers } from "react-icons/fi";
import { ChatroomLayoutProps } from "./page";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { InputBar } from "@/components/InputBar";
import { ChatroomFooter } from "@/components/ChatroomFooter";
import { Toast } from "@/components/Toast";
import { Launched } from '@/components/Launched';
import { getAvailableBalance } from "@/lib/utils";
import { useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function DesktopLayout(props: ChatroomLayoutProps) {
  const router = useRouter();
  
  // Scroll to bottom when typing or new messages
  useEffect(() => {
    if (props.showTypingIndicator || props.messages.length > 0) {
      props.messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [props.showTypingIndicator, props.messages.length, props.messagesEndRef]);

  return (
    <main className="flex h-screen overflow-hidden bg-[radial-gradient(#4B5563_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Left Section with Character Info and Users */}
      <div className="flex flex-col w-[40%] max-w-[520px] m-8 ml-16 space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push(`/character/${props.character?._id}`)}
            className="flex items-center gap-2 h-[44px] px-6 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl text-white transition-all duration-200 shadow-lg"
          >
            <IoChevronBack className="w-6 h-6" />
            <span className="text-lg">Back</span>
          </button>

          {/* Points Display or Connect Wallet */}
          {props.user?.wallet_address ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center h-[64px] bg-emerald-500/10 backdrop-blur-md rounded-xl px-4">
                <div className="flex items-center gap-2">
                  <FiAward className="text-emerald-400 w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm">Available Points</span>
                    <span className="text-gray-200 font-medium">
                      {props.userPoints ? getAvailableBalance(props.userPoints) : 0}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={props.handleClaimPoints}
                disabled={!props.claimStatus.canClaim}
                className={`h-[64px] px-4 rounded-xl ${
                  props.claimStatus.canClaim 
                    ? 'bg-emerald-500/80 hover:bg-emerald-600 text-white' 
                    : 'bg-gray-600/80 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center gap-2">
                  {props.claimStatus.canClaim ? (
                    <>
                      <FiAward className="w-5 h-5" />
                      <div className="flex flex-col items-start">
                        <span className="text-white/80 text-sm">Free Points !!!</span>
                        <span className="text-white font-medium">Claim Now</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <FiClock className="w-5 h-5 text-emerald-400" />
                      <div className="flex flex-col items-start">
                        <span className="text-white/80 text-sm">Next Free Claim In</span>
                        <span className="text-white font-medium">{props.claimStatus.timeLeft}</span>
                      </div>
                    </>
                  )}
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                <ConnectButton showBalance={false} />
              </div>
            </div>
          )}
        </div>

        {/* Character Card */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col bg-gradient-to-b from-gray-700 to-gray-800 shadow-2xl h-[50%]">
          {/* Background Image */}
          <Image
            src={props.character?.background_image_url || '/bg2.png'}
            alt="background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/40 via-gray-700/30 to-gray-800/50" />

          {/* Character Content */}
          <div className="relative flex flex-col">
            <div className="flex flex-col items-center justify-center px-8 py-20 space-y-8">
              <div className="relative w-32 h-32">
                <Image
                  src={props.character?.avatar_image_url || '/bg2.png'}
                  alt={props.character?.name}
                  fill
                  className="rounded-2xl object-cover border-2 border-gray-800 shadow-xl"
                />
              </div>
              
              <div className="text-center space-y-6 max-w-md">
                <h1 className="text-3xl font-bold text-gray-100">
                  {props.character?.name}
                </h1>
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-8 shadow-lg">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 mb-8">
                    <FiInfo className="w-5 h-5" />
                    <span className="text-sm font-semibold tracking-wide uppercase">Chatroom Rules</span>
                  </div>
                  <div className="space-y-4">
                    <div className="prose prose-invert">
                      <p className="text-base leading-relaxed text-gray-300 font-light">
                        Each message costs <span className="text-pink-300 font-medium">2 points</span>. 
                        Hijack starting at <span className="text-pink-300 font-medium">10 points</span>. 
                        Hijack window is <span className="text-pink-300 font-medium">20 seconds</span>. 
                        Current speakers can defend by matching the bid.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col bg-gray-800/30 backdrop-blur-md shadow-2xl flex-1">
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <FiUsers className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide uppercase">Users in Chatroom</span>
              </div>
              <span className="text-gray-300 text-sm font-medium">
                {props.chatroom?.current_audience?.length || 0} online
              </span>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {props.currentUsers.map((user) => (
                <div 
                  key={user._id} 
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    props.chatroom?.user_on_stage === user._id 
                      ? 'bg-pink-500/20 border border-pink-500/30' 
                      : 'bg-white/5 hover:bg-white/10'
                  } transition-colors duration-200`}
                >
                  <img 
                    src={user.profile_photo || "/bg2.png"} 
                    alt={user.first_name} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-600"
                  />
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{user.first_name} {user.last_name}</span>
                    {props.chatroom?.user_on_stage === user._id && (
                      <span className="text-pink-300 text-xs">Current Speaker</span>
                    )}
                    {props.chatroom?.user_hijacking === user._id && (
                      <span className="text-yellow-300 text-xs">Hijacking ({props.timeLeft}s)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Chat Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col h-screen">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-8 pb-24">
            <div className="flex flex-col space-y-6 py-8 max-w-4xl mx-auto w-full">
              {props.messages.map((message) => (
                <ChatBubble
                  key={message.createdAt}
                  message={message}
                  onRegenerate={props.handleRegenerate}
                  onRetry={props.handleRetry}
                  onRate={props.handleRate}
                  isChatroom={true}
                />
              ))}

              {/* Launched component */}
              {props.chatroomMessages && (
                <Launched 
                  messages={props.chatroomMessages} 
                  characterName={props.character?.name || "Us!"} 
                  onStartNewConversation={props.handleStartNewConversation}
                  chatroomId={props.chatroomId}
                />
              )}

              {props.showTypingIndicator && (
                <div className="mb-4">
                  <TypingIndicator />
                </div>
              )}
              <div ref={props.messagesEndRef} className={`${props.hijackOngoing ? 'h-10' : 'h-1'}`} />
            </div>
          </div>

          {/* Hijack progress bar */}
          {props.hijackOngoing && (
            <div className="absolute bottom-20 left-[40%] right-0 z-10">
              <div className="mx-8 py-4 px-6 bg-gray-800/80 backdrop-blur-md border border-white/10 rounded-lg text-white font-medium text-base flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <img
                    src={props.cache.getUser(props.chatroom?.user_hijacking || "")?.profile_photo || "/bg2.png"}
                    alt="User avatar"
                    className="w-6 h-6 rounded-full border border-gray-600"
                  />
                  <span className="text-gray-200">
                    {props.timeLeft === 0 
                      ? "Finalizing hijack!" 
                      : `${props.cache.getUser(props.chatroom?.user_hijacking || "")?.first_name || "User"} is hijacking (${props.timeLeft}s)`}
                  </span>
                </div>

                {
                  props.hijackBack && (
                    <button 
                      className={`px-8 py-1.5 rounded-lg transition-all duration-200 min-w-[160px] ${
                        !props.hasEnoughPoints() || props.disableActions 
                          ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/20'
                      }`}
                      onClick={() => props.registerHijack({ cost: props.hijackCost?.cost || 0 })}
                      disabled={!props.hasEnoughPoints() || props.disableActions}>
                      {!props.hasEnoughPoints() ? 'Not Enough Points' : 'Hijack Back!'}
                    </button>
                  )
                }
              </div>
            </div>
          )}

          {/* Floating input area */}
          {!props.chatroomMessages?.is_wrapped && (
            <div className="absolute bottom-0 left-[40%] right-0 px-8 py-6">
              {!props.user?.wallet_address ? (
                <div className="bg-gray-800/80 backdrop-blur-md rounded-xl p-4 text-center">
                  <p className="text-white mb-4">Connect your wallet to participate in the chatroom</p>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              ) : props.user && props.chatroom && props.user?._id === props.chatroom?.user_on_stage ? (
                <InputBar
                  message={props.inputMessage}
                  onChange={props.setInputMessage}
                  onSend={props.handleSendMessage}
                  placeholder={props.hasEnoughPoints() ? `Message ${props.character?.name}` : "Not enough points"}
                  disabled={!props.hasEnoughPoints() || props.disableActions}
                />
              ) : (
                <ChatroomFooter
                  isCurrentSpeaker={props.isCurrentSpeaker}
                  hijackCost={props.hijackCost as unknown as { cost: number }}
                  onHijack={props.registerHijack}
                  onReaction={props.handleReaction}
                  disabled={!props.hasEnoughPoints() || props.disableActions}
                />
              )}
            </div>
          )}

          <Toast 
            message={props.toastMessage}
            isVisible={props.showToast}
          />
        </div>
      </div>
    </main>
  );
}
