'use client';

import Image from "next/image";
import { ChatLayoutProps } from "./page";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { InputBar } from "@/components/InputBar";
import { PointsExpandedView } from "@/components/PointsExpandedView";
import { getAvailableBalance } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function MobileLayout(props: ChatLayoutProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedGrant, setSelectedGrant] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  if (props.showTypingIndicator) {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [props.messages.length]);

  const isGitcoinEnabled = props.gitcoinGrants && props.gitcoinGrants.length > 0;
  const canSendMessage = props.hasEnoughPoints() && (!isGitcoinEnabled || (selectedGrant && props.messages.length > 0));

  const handleGrantSelection = (grantId: string) => {
    setSelectedGrant(grantId);
    setShowConfirmation(true);
  };

  const handleConfirmGrant = () => {
    const grant = props.gitcoinGrants?.find(g => g._id === selectedGrant);
    if (!grant) return;

    // Compose the initial message with grant details
    const initialMessage = `I'd like to discuss the Gitcoin grant: ${grant.name}

Project Details:
- Name: ${grant.name}
- Description: ${grant.description}
- URL: ${grant.url}
- Twitter: ${grant.twitter}
- Recipient ID: ${grant.recipient_id}

Please help me evaluate this project.`;

    props.setInputMessage(initialMessage);
    props.handleSendMessage();
    setShowConfirmation(false);
  };

  return (
    <main className="flex flex-col w-full bg-black">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src={props.character?.background_image_url || '/bg2.png'}
          alt="background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      </div>

      {/* Content Container */}
      <div className="relative top-0 left-0 z-10 flex flex-col">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-black/20 h-32">
          <Header
            variant="chat"
            name={props.character?.name as string}
            image={props.character?.avatar_image_url || '/bg2.png'}
            points={props.userPoints ? getAvailableBalance(props.userPoints) : 0}
            canClaim={props.claimStatus.canClaim}
            onPointsClick={() => props.setIsPointsExpanded(true)}
            characterId={props.character?._id}
            className="flex-shrink-0 h-16"
          />
        </div>

        {/* Messages Container */}
        <div className="flex-1 pt-32 pb-24">
          <div className="flex flex-col space-y-4 p-4">
            {/* Description */}
            {(!isGitcoinEnabled || props.messages.length > 0) && (
              <div className="flex justify-center">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
                  <div className="text-lg font-semibold mb-2 text-center text-pink-300">
                    Description
                  </div>
                  <div className="text-sm leading-relaxed text-gray-100">
                    {props.character?.description}
                  </div>
                </div>
              </div>
            )}

            {/* Gitcoin Project Selection */}
            {isGitcoinEnabled && props.messages.length <= 1 && (
              <div className="flex flex-col space-y-4 p-4 bg-black/40 backdrop-blur-sm rounded-2xl">
                <div className="text-center text-white text-lg font-medium">
                  Select a Gitcoin Project
                </div>
                <select
                  value={selectedGrant}
                  onChange={(e) => handleGrantSelection(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Choose a project...</option>
                  {props.gitcoinGrants?.map((grant) => (
                    <option key={grant._id} value={grant._id}>
                      {grant.name}
                    </option>
                  ))}
                </select>

                {selectedGrant && showConfirmation && (
                    <div className="space-y-4">
                      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-gray-300 text-sm">
                        {props.gitcoinGrants?.find(g => g._id === selectedGrant)?.description}
                      </div>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setShowConfirmation(false)}
                          className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmGrant}
                          className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {props.messages.map((message) => (  
              <ChatBubble
                key={message.createdAt}
                message={message}
                onRegenerate={props.handleRegenerate}
                onRetry={props.handleRetry}
                onRate={props.handleRate}
              />
            ))}

            {/* Typing Indicator */}
            {props.showTypingIndicator && (
              <div className="mb-4">
                <TypingIndicator />
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Input Container */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto bg-gradient-to-t from-black to-transparent">
          <InputBar
            message={props.inputMessage}
            onChange={props.setInputMessage}
            onSend={props.handleSendMessage}
            placeholder={
              !canSendMessage
                ? isGitcoinEnabled && !selectedGrant
                  ? "Select a project first"
                  : "Claim points to Chat"
                : `Message ${props.character?.name}`
            }
            disabled={props.disableActions || !canSendMessage}
          />
        </div>

        <PointsExpandedView
          isExpanded={props.isPointsExpanded}
          onClose={() => props.setIsPointsExpanded(false)}
          user={props.user}
          points={props.userPoints ? getAvailableBalance(props.userPoints) : 0}
          nextClaimTime={props.claimStatus.timeLeft}
          canClaim={props.claimStatus.canClaim}
          onClaim={props.handleClaimPoints}
        />
      </div>
    </main>
  );
} 