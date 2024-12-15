'use client';

import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { useCharacter, useConversation, useRegenerateLastMessage, useSendMessage, useTelegramUser, useUserPoints } from '@/hooks/api';

import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";
import { InputBar } from "@/components/InputBar";
import { PointsExpandedView } from "@/components/PointsExpandedView";

import { ChatContext, Message } from "@/lib/chat-context";
import { getAvailableBalance, getNextClaimTime } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { isOnTelegram, notificationOccurred } from "@/lib/telegram";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch initial data
  const { data: telegramUser, isLoading: telegramUserLoading } = useTelegramUser();
  const { data: conversation, isLoading: historyLoading } = useConversation(id);
  const characterId = conversation?.character_id;
  const { data: character, isLoading: characterLoading } = useCharacter(characterId);

  const chatContext = new ChatContext(character!, telegramUser!);
  const { mutate: sendMessage, isPending: sendMessagePending, isSuccess: sendMessageSuccess } = useSendMessage(id, (error) => {
    console.error('Failed to send message:', error);
    notificationOccurred('error');
    setMessages(chatContext.markLastMessageAsError(messages));
  });

  const { mutate: regenerateLastMessage, isPending: regenerateLastMessagePending, isSuccess: regenerateLastMessageSuccess } = useRegenerateLastMessage(id, (error) => {
    console.error('Failed to regenerate message:', error);
    notificationOccurred('error');
    setMessages(chatContext.markLastMessageAsError(messages));
  });

  const [isReady, setIsReady] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [disableActions, setDisableActions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Points related state and data
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const { data: userPoints } = useUserPoints();
  const claimStatus = userPoints 
    ? getNextClaimTime(userPoints.free_claimed_balance_updated_at)
    : { canClaim: false, timeLeft: "Loading..." };

  // Basic Setups
  useEffect(() => {
    notificationOccurred('success');
  }, []);

  useEffect(() => {
    if (showTypingIndicator && typingIndicatorRef.current) {
      typingIndicatorRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [showTypingIndicator]);

  // Initial scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length === 0]); // Will only run when messages first load (changes from 0 to non-0)

  // Scroll on successful message send or regenerate
  useEffect(() => {
    if ((sendMessageSuccess || regenerateLastMessageSuccess || sendMessagePending || regenerateLastMessagePending) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [sendMessageSuccess, regenerateLastMessageSuccess]);

  // Data Ready
  useEffect(() => {
    if (!telegramUserLoading && !characterLoading && !historyLoading) {
      setIsReady(true);
    }
  }, [telegramUserLoading, characterLoading, historyLoading]);


  // Set initial messages when conversation loads
  useEffect(() => {
    if (isReady && conversation) {
      setMessages(chatContext.injectHistoryMessages(conversation.history, conversation.created_at));
    }
  }, [conversation, isReady]);

  useEffect(() => {
    if (sendMessagePending || regenerateLastMessagePending) {
      setShowTypingIndicator(true);
      setDisableActions(true);
    } else {
      setShowTypingIndicator(false);
      setDisableActions(false);
    }
  }, [sendMessagePending, regenerateLastMessagePending]);

  // Handle Send Message
  const handleSendMessage = async () => {    
    if (!hasEnoughPoints()) {
      notificationOccurred('error');
      return;
    }
    
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage("");
    setMessages(chatContext.newUserMessage(messages, trimmedMessage));
    sendMessage(trimmedMessage);
  };

  const handleRegenerate = async () => {
    if (!hasEnoughPoints()) {
      notificationOccurred('error');
      return;
    }

    setInputMessage("");    
    setMessages(chatContext.popLastMessage(messages));
    regenerateLastMessage();
  };

  const handleRetry = () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    sendMessage(lastMessage.message);
  };

  const handleRate = (rating: number) => {
    console.log(`Rated: ${rating} stars`);
    // Handle rating logic
  };

  const handleClaimPoints = async () => {
    try {
      await api.user.claimFreePoints();
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
    } catch (error) {
      console.error("Failed to claim points:", error);

    }
  };

  const hasEnoughPoints = () => {
    return userPoints && getAvailableBalance(userPoints) >= 1;
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex flex-col w-full bg-black">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src={character?.background_image_url || '/bg2.png'}
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
        <div className={`fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-black/20 ${
          isOnTelegram() ? 'h-42' : 'h-32'
        }`}>
          <Header
            variant="chat"
            name={character?.name as string}
            image={character?.avatar_image_url || '/bg2.png'}
            points={userPoints ? getAvailableBalance(userPoints) : 0}
            canClaim={claimStatus.canClaim}
            onPointsClick={() => setIsPointsExpanded(true)}
            characterId={character?._id}
            className={`flex-shrink-0 ${
              isOnTelegram() 
                ? 'h-16 pt-[var(--tg-content-safe-area-inset-top)]' 
                : 'h-16'
            }`}
          />
        </div>

        {/* Messages Container */}
        <div className={`flex-1 ${isOnTelegram() ? 'pt-40' : 'pt-32'} pb-24`}>
          <div className="flex flex-col space-y-4 p-4">
            {/* Description */}
            <div className="flex justify-center">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
                <div className="text-lg font-semibold mb-2 text-center text-pink-300">
                  Description
                </div>
                <div className="text-sm leading-relaxed text-gray-100">
                  {character?.description}
                </div>
              </div>
            </div>
            {messages.map((message) => (  
              <ChatBubble
                key={message.createdAt}
                message={message}
                onRegenerate={handleRegenerate}
                onRetry={handleRetry}
                onRate={handleRate}
              />
            ))}

            {/* Typing Indicator */}
            {showTypingIndicator && (
              <div ref={typingIndicatorRef} className="mb-4">
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Input Container */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto bg-gradient-to-t from-black to-transparent">
          <InputBar
            message={inputMessage}
            onChange={setInputMessage}
            onSend={handleSendMessage}
            placeholder={hasEnoughPoints() ? `Message ${character?.name}` : "Claim points to Chat"}
            disabled={disableActions || !hasEnoughPoints()}
          />
        </div>

        <PointsExpandedView
          isExpanded={isPointsExpanded}
          onClose={() => setIsPointsExpanded(false)}
          user={telegramUser}
          points={userPoints ? getAvailableBalance(userPoints) : 0}
          nextClaimTime={claimStatus.timeLeft}
          canClaim={claimStatus.canClaim}
          onClaim={handleClaimPoints}
        />

      </div>
    </main>
  );
}