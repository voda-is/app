'use client';

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCharacter, useConversation, useTelegramUser } from '@/hooks/api';
import { HistoryMessage } from "@/lib/validations";
import { isOnTelegram, notificationOccurred, setupTelegramInterface } from "@/lib/telegram";
import { InputBar } from "@/components/InputBar";
import { replacePlaceholders } from "@/lib/formatText";
import { api } from "@/lib/api-client";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [messages, setMessages] = useState<HistoryMessage[][]>([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  // Fetch initial data
  const { data: telegramUser } = useTelegramUser();
  const { data: conversation, isLoading: historyLoading, error: historyError } = useConversation(id);
  const characterId = conversation?.character_id;
  const { data: character, isLoading: characterLoading } = useCharacter(characterId);

  // Set initial messages when conversation loads
  useEffect(() => {
    if (conversation?.history) {
      setMessages(conversation.history);
    }
  }, [conversation]);

  const [inputMessage, setInputMessage] = useState("");
  const [disableActions, setDisableActions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // @ts-ignore
  const characterFirstMessage = character?.prompts.first_message;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    if (isOnTelegram()) {
      setupTelegramInterface(router);
    }
  }, []);
  // Scroll when messages change or typing state changes
  useEffect(() => {
    scrollToBottom();
    setDisableActions(false);
  }, [messages, showTypingIndicator]);

  // Modify this effect to run after messages and character are loaded
  useEffect(() => {
    if (messages.length > 0 && character) {
      scrollToBottom('auto');
    }
  }, [messages, character]);

  const handleSendMessage = async () => {
    if (disableActions) return;
    setDisableActions(true);
    setShowTypingIndicator(true);
    
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage(""); // Clear input immediately    
    // Add the user message to the flat array
    setMessages([...messages, [{
      user_id: conversation?.owner_id || '', // Provide empty string as fallback
      text: trimmedMessage,
      content_type: "text" as const, // Type assertion to narrow the type
      status: "sent" as const, // Type assertion to narrow the type
      created_at: Date.now() / 1000,
    }]]);
    
    try {
      const response = await api.chat.sendMessage(id, trimmedMessage);
      // Add the assistant's response to the last array
      setMessages(prev => {
        const lastArray = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          [...lastArray, response]
        ];
      });
      setShowTypingIndicator(false);
      setDisableActions(false);
      notificationOccurred('success');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the failed message
      setMessages(prev => prev.slice(0, -1));
      setShowTypingIndicator(false);
      setDisableActions(false);
    }
  };

  const handleRegenerate = async () => {
    if (disableActions) return;
    setDisableActions(true);
    setShowTypingIndicator(true);
    
    setMessages(prev => {
      const lastArray = prev[prev.length - 1];
      return [...prev.slice(0, -1), [lastArray[0]]];
    });
    try {
      const response = await api.chat.regenerateLastMessage(id);
      // Add the assistant's response to the last array
      setMessages(prev => {
        const lastArray = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          [lastArray[0], response]
        ];
      });
      setShowTypingIndicator(false);
      setDisableActions(false);
      notificationOccurred('success');
    } catch (error) {
      console.error('Failed to regenerate message:', error);
      setShowTypingIndicator(false);
      setDisableActions(false);
    }
  };

  const handleRetry = () => {
    handleSendMessage();
  };

  const handleRate = (rating: number) => {
    console.log(`Rated: ${rating} stars`);
    // Handle rating logic
  };

  if (characterLoading || historyLoading || !character) {
    return <LoadingScreen />;
  }

  if (historyError) {
    return <div>Error loading chat history</div>;
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
        {/* Header - adjusted padding */}
        <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-black/20 h-28">
          <Header
            name={character?.name as string}
            image={character?.avatar_image_url || '/bg2.png'}
            className="flex-shrink-0 h-16 pt-[var(--tg-content-safe-area-inset-top)]"
          />
        </div>

        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 pt-28 pb-10"
        >
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

            <div className="">
              <ChatBubble 
                message={replacePlaceholders(characterFirstMessage as string, character?.name as string, telegramUser?.first_name as string)}
                role="assistant"
                created_at={conversation?.created_at || 0}

                characterId={character._id}
                enableVoice={character?.metadata.enable_voice}
                isLatestReply={false}
                onRegenerate={handleRegenerate}
                onRetry={handleRetry}
                onRate={handleRate}
                status={"sent"} 
              />
            </div>

            {/* Messages */}
            {messages.flatMap((pair, index) => [
              <div key={`${pair[0].created_at}-${index}`}>
                <ChatBubble 
                  message={pair[0].text}
                  role={"user"}
                  created_at={pair[0].created_at}
                  status={pair[0].status}

                  characterId={character._id}
                  enableVoice={character?.metadata.enable_voice}
                  isLatestReply={false}
                  onRegenerate={handleRegenerate}
                  onRetry={handleRetry}
                  onRate={handleRate}
                />
              </div>,
              <div key={`assistant-${index}`}>
                {!pair[1] || !pair[1].text ? null : <ChatBubble 
                  message={pair[1].text}
                  role={"assistant"}
                  created_at={pair[1].created_at}
                  status={pair[1].status}

                  characterId={character._id}
                  enableVoice={character?.metadata.enable_voice}
                  isLatestReply={index === messages.length - 1}
                  onRegenerate={handleRegenerate}
                  onRetry={handleRetry}
                  onRate={handleRate}
                />}
              </div>
            ])}

            {/* Typing Indicator */}
            {showTypingIndicator && (
              <TypingIndicator />
            )}

            {/* Responsive bottom spacing using Tailwind breakpoints and Safari-specific CSS */}
            <div ref={messagesEndRef} className="h-10" />
          </div>
        </div>

        {/* Input Container */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto bg-gradient-to-t from-black to-transparent">
          <InputBar
            message={inputMessage}
            onChange={setInputMessage}
            onSend={handleSendMessage}
            placeholder={`Message ${character?.name}`}
            disabled={disableActions}
          />
        </div>
      </div>
    </main>
  );
}