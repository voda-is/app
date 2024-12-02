'use client';

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { InputBar } from "@/components/InputBar";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCharacter, useChatHistory, useSendChatMessage, useRegenerateLastMessage } from '@/hooks/api';
import { HistoryMessage } from "@/lib/validations";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const { data: character, isLoading: characterLoading } = useCharacter(id);
  const { data: chatHistory, isLoading: historyLoading, error: historyError } = useChatHistory(id);

  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage(id);
  const { mutate: regenerateMessage, isPending: isRegenerating } = useRegenerateLastMessage(id);

  const [inputMessage, setInputMessage] = useState("");
  const [disableActions, setDisableActions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // @ts-ignore
  const messages: HistoryMessage[] = chatHistory || [];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  // Scroll when messages change or typing state changes
  useEffect(() => {
    scrollToBottom();
    setDisableActions(false);
  }, [messages, isSending, isRegenerating]);

  // Initial scroll when chat loads
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, []);

  const handleSendMessage = () => {
    if (disableActions) return;
    setDisableActions(true);
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage(""); // Clear input immediately
    sendMessage(trimmedMessage);
  };

  const handleRegenerate = async () => {
    if (disableActions) return;
    setDisableActions(true);
    regenerateMessage();
  };

  const handleRetry = (text: string) => {
    if (disableActions) return;
    setDisableActions(true);

    const trimmedMessage = text.trim();
    if (!trimmedMessage) return;

    setInputMessage(""); // Clear input immediately
    sendMessage(trimmedMessage);
  };

  const handleRate = (rating: number) => {
    console.log(`Rated: ${rating} stars`);
    // Handle rating logic
  };

  if (characterLoading || historyLoading) {
    return <LoadingScreen />;
  }

  if (historyError) {
    return <div>Error loading chat history</div>;
  }

  return (
    <main className="flex flex-col h-screen w-full bg-black">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/bg2.png"
          alt="background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-dvh">
        {/* Header */}
        <Header 
          name={character?.name as string}
          image={'/bg2.png'}
          className="flex-shrink-0 h-16"
        />

        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto pt-20"
        >
          <div className="flex flex-col space-y-4 p-4">
            {/* Description */}
            <div className="flex justify-center mb-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
                <div className="text-lg font-semibold mb-2 text-center text-pink-300">
                  Description
                </div>
                <div className="text-sm leading-relaxed text-gray-100">
                  {character?.description}
                </div>
              </div>
            </div>

            {/* Messages */}
            {messages.map((msg, index) => (
              <ChatBubble 
                index={index}
                key={`${msg.created_at}-${index}`}
                {...msg}
                isLatestReply={index === messages.length - 1 && msg.role !== 'user' && messages.length > 1}
                onRegenerate={handleRegenerate}
                onRetry={handleRetry}
                onRate={handleRate} 
              />
            ))}

            {/* Typing Indicator */}
            {(isSending || isRegenerating) && (
              <div className="flex items-start gap-2">
                <TypingIndicator />
              </div>
            )}

            {/* Responsive bottom spacing using Tailwind breakpoints and Safari-specific CSS */}
            <div ref={messagesEndRef} className="h-16" />
          </div>
        </div>

        {/* Input Container */}
        <div className="relative mt-auto bg-gradient-to-t from-black to-transparent">
          <div className="px-4 pb-4 md:pb-6">
            <InputBar
              message={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              placeholder={`Message ${character?.name}`}
              disabled={disableActions}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
