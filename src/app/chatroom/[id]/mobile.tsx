"use client";

import Image from "next/image";
import { ChatroomLayoutProps } from "./page";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { InputBar } from "@/components/InputBar";
import { ChatroomFooter } from "@/components/ChatroomFooter";
import { UsersExpandedView } from "@/components/UsersExpandedView";
import { Toast } from "@/components/Toast";
import { PointsExpandedView } from "@/components/PointsExpandedView";
import { Launched } from '@/components/Launched';
import { useEffect } from "react";

export default function MobileLayout(props: ChatroomLayoutProps) {
  // Scroll to bottom when typing or new messages
  useEffect(() => {
    if (props.showTypingIndicator || props.messages.length > 0) {
      props.messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [props.showTypingIndicator, props.messages.length, props.messagesEndRef]);

  return (
    <main className="flex flex-col w-full bg-black min-h-screen">
      <div className="fixed inset-0 z-0">
        <Image
          src={props.character?.background_image_url || "/bg2.png"}
          alt="background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      </div>

      <div className="relative flex flex-col h-full">
        <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-black/20 h-32">
          <Header
            variant="chatroom"
            name={props.character?.name as string}
            image={props.character?.avatar_image_url || "/bg2.png"}
            onUsersClick={() => props.setIsUsersExpanded(true)}
            userCount={props.chatroom?.current_audience?.length || 0}
            onPointsClick={() => props.setIsPointsExpanded(true)}
            points={props.userPoints ? props.hasEnoughPoints() ? props.userPoints.running_balance : 0 : 0}
            canClaim={props.claimStatus.canClaim}
            characterId={props.character?._id}
            className="flex-shrink-0 h-16"
          />
        </div>

        {/* Messages Container */}
        <div className="flex-1 pt-32 pb-24">
          <div className="flex flex-col space-y-4 p-4">
            {/* Description */}
            <div className="flex justify-center">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
                <div className="text-lg font-semibold mb-2 text-center text-pink-300">
                  Chatroom Rules
                </div>
                <div className="text-sm leading-relaxed text-gray-100">
                  Join the most exciting memecoin launch ever! Chat with others, take control of the conversation, 
                  and become part of history. Here's how it works:
                </div>
                <div className="text-sm leading-relaxed text-gray-100">
                  <ul className="list-disc pl-4 space-y-2">
                    <li className="leading-relaxed">Each message costs <span className="text-pink-300 font-medium">2 points</span>, 
                      and you'll need the same amount to regenerate a message</li>
                    <li className="leading-relaxed">Want to take the stage? You can hijack conversations starting at 
                      <span className="text-pink-300 font-medium"> 10 points</span> - price goes up as more people join the fun!</li>
                    <li className="leading-relaxed">When you initiate a hijack, there's a <span className="text-pink-300 font-medium">20-second window</span> where 
                      others can outbid you or the current speaker can defend their position</li>
                    <li className="leading-relaxed">Be quick and strategic - your hijack attempt might fail if someone 
                      outbids you during this period</li>
                    <li className="leading-relaxed">Current speakers can defend their position by matching the 
                      hijack bid</li>
                    <li className="leading-relaxed">Remember: hijack points aren't refundable if your attempt fails, 
                      so bid wisely!</li>
                  </ul>
                </div>
              </div>
            </div>

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

            {/* Typing Indicator */}
            {props.showTypingIndicator && (
              <div className="mb-4">
                <TypingIndicator />
              </div>
            )}

            <div ref={props.messagesEndRef} className={`${props.hijackOngoing ? 'h-10' : 'h-1'}`} />
          </div>
        </div>

        {/* Only show hijack progress if not wrapped */}
        {props.hijackOngoing && (
          <div className="fixed bottom-20 pb-2 left-0 right-0 z-10">
            <div className="w-full py-4 px-6 bg-white/5 backdrop-blur-md border-t border-white/10 text-white font-medium text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={props.cache.getUser(props.chatroom?.user_hijacking || "")?.profile_photo || "/bg2.png"}
                  alt="User avatar"
                  className="w-6 h-6 rounded-full"
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
                      props.disableActions 
                        ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/20'
                    }`}
                    onClick={() => props.registerHijack({ cost: props.hijackCost?.cost || 0 })}
                    disabled={props.disableActions}>
                    {props.disableActions ? 'Not Enough Points' : 'Hijack Back!'}
                  </button>
                )
              }
            </div>
          </div>
        )}

        {/* Input Container - Only show if not wrapped */}
        {!props.chatroomMessages?.is_wrapped && (
          <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto pt-2">
            {props.user && props.chatroom && props.user?._id === props.chatroom?.user_on_stage ? (
              <InputBar
                message={props.inputMessage}
                onChange={props.setInputMessage}
                onSend={props.handleSendMessage}
                placeholder={`Message ${props.character?.name}`}
                disabled={props.disableActions}
              />
            ) : (
              <ChatroomFooter
                isCurrentSpeaker={props.isCurrentSpeaker}
                hijackCost={props.hijackCost as unknown as { cost: number }}
                onHijack={props.registerHijack}
                onReaction={props.handleReaction}
                disabled={props.disableActions}
              />
            )}
          </div>
        )}

        <UsersExpandedView
          isExpanded={props.isUsersExpanded}
          onClose={() => props.setIsUsersExpanded(false)}
          currentUser={props.currentUsers}
          userOnStageId={props.chatroom?.user_on_stage}
        />

        <PointsExpandedView
          isExpanded={props.isPointsExpanded}
          onClose={() => props.setIsPointsExpanded(false)}
          user={props.user}
          points={props.userPoints ? props.hasEnoughPoints() ? props.userPoints.running_balance : 0 : 0}
          nextClaimTime={props.claimStatus.timeLeft}
          canClaim={props.claimStatus.canClaim}
          onClaim={props.handleClaimPoints}
        />

        <Toast 
          message={props.toastMessage}
          isVisible={props.showToast}
        />
      </div>
    </main>
  );
}
