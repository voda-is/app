'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoChevronBack } from "react-icons/io5";
import { FiAward, FiInfo, FiClock } from "react-icons/fi";
import { ChatLayoutProps } from "./page";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { InputBar } from "@/components/InputBar";
import { getAvailableBalance } from "@/lib/utils";
import { useRef, useEffect, useState, useMemo } from "react";
  
export default function DesktopLayout(props: ChatLayoutProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (props.showTypingIndicator) {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [props.messages.length]);

  const canSendMessage = useMemo(() => {
    return props.hasEnoughPoints;
  }, [props.hasEnoughPoints]);

  return (
    <main className="flex h-screen overflow-hidden bg-[radial-gradient(#4B5563_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Left Section with Back Button and Points Display */}
      <div className="flex flex-col w-[40%] max-w-[520px] m-8 ml-16 space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push(`/character/${props.character?._id}`)}
            className="flex items-center gap-2 h-[44px] px-6 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl text-white transition-all duration-200 shadow-lg"
          >
            <IoChevronBack className="w-6 h-6" />
            <span className="text-lg">Back</span>
          </button>

          {/* Points Display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center h-[64px] bg-emerald-500/10 backdrop-blur-md rounded-xl px-4">
              <div className="flex items-center gap-2">
                <FiAward className="text-emerald-400 w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Available Points</span>
                  <span className="text-gray-200 font-medium">
                    {props.user?.points ? getAvailableBalance(props.user.points) : 0}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={props.claimFreePoints}
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
        </div>

        {/* Character Card */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col bg-gradient-to-b from-gray-700 to-gray-800 shadow-2xl h-[80%]">
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
                    <span className="text-sm font-semibold tracking-wide uppercase">About Character</span>
                  </div>
                  <div className="space-y-8">
                    <div className="prose prose-invert">
                      <p className="text-base leading-relaxed text-gray-300 font-light">
                        {props.character?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                />
              ))}

              {props.showTypingIndicator && (
                <div className="mb-4">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>

          {/* Floating input area */}
          <div className="absolute bottom-0 left-0 right-0 px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <InputBar
                message={props.inputMessage}
                onChange={props.setInputMessage}
                onSend={props.handleSendMessage}
                placeholder={
                  !canSendMessage
                    ? "Claim points to Chat"
                    : `Message ${props.character?.name}`
                }
                disabled={props.disableActions || !canSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 