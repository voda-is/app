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
  const [selectedGrant, setSelectedGrant] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (props.showTypingIndicator) {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [props.messages.length]);

  const isGitcoinEnabled = props.gitcoinGrants && props.gitcoinGrants.length > 0;  
  const canSendMessage = useMemo(() => {
    return props.hasEnoughPoints() && (!isGitcoinEnabled || selectedGrant || props.messages.length > 0);
  }, [props.hasEnoughPoints, isGitcoinEnabled, selectedGrant, props.messages.length, props.functionCalls]);


  const isConcluded = useMemo(() => {
    return props.functionCalls.length > 0;
  }, [props.functionCalls]);

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
            {isGitcoinEnabled && props.messages.length <= 1 && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="text-gray-300 text-lg">
                  Please select a Gitcoin project to discuss
                </div>
                <select
                  value={selectedGrant}
                  onChange={(e) => handleGrantSelection(e.target.value)}
                  className="w-full max-w-xl p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select a project...</option>
                  {props.gitcoinGrants?.map((grant) => (
                    <option key={grant._id} value={grant._id}>
                      {grant.name}
                    </option>
                  ))}
                </select>
                {selectedGrant && showConfirmation && (
                  <div className="w-full max-w-xl space-y-4">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-gray-300">
                      {props.gitcoinGrants?.find(g => g._id === selectedGrant)?.description}
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setShowConfirmation(false)}
                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmGrant}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      >
                        Confirm Selection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
              {isConcluded ? (
                <div className="flex flex-col space-y-3 bg-emerald-500/10 text-emerald-400 p-4 rounded-xl backdrop-blur-md">
                  <div className="flex items-center justify-center gap-2 pb-2 border-b border-emerald-400/20">
                    <FiAward className="w-5 h-5" />
                    <span className="font-medium">Grant Allocation Complete</span>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const lastCall = props.functionCalls[props.functionCalls.length - 1];
                      const args = JSON.parse(lastCall?.arguments || '{}');
                      return (
                        <>
                          <div className="flex gap-2">
                            <span className="text-emerald-300 min-w-[100px]">Name:</span>
                            <span className="text-emerald-100">{args.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-emerald-300 min-w-[100px]">Recipient:</span>
                            <span className="text-emerald-100">{args.recepientId}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-emerald-300 min-w-[100px]">Reasoning:</span>
                            <span className="text-emerald-100">{args.reasoning}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <InputBar
                  message={props.inputMessage}
                  onChange={props.setInputMessage}
                  onSend={props.handleSendMessage}
                  placeholder={
                    !canSendMessage
                      ? isGitcoinEnabled && !selectedGrant
                        ? "Please select a project first"
                        : "Claim points to Chat"
                      : `Message ${props.character?.name}`
                  }
                  disabled={props.disableActions || !canSendMessage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 