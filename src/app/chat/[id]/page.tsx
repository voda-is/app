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
import { ConversationHistory, HistoryMessage } from "@/lib/validations";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;
  
  const { data: character, isLoading: characterLoading } = useCharacter(id);
  const { data: chatHistory, isLoading: historyLoading, error: historyError } = useChatHistory(id);

  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage(id);
  const { mutate: regenerateMessage, isPending: isRegenerating } = useRegenerateLastMessage(id);

  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // @ts-ignore
  const messages: HistoryMessage[] = chatHistory?.history || [];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  // Scroll when messages change or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Initial scroll when chat loads
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('instant');
    }
  }, []);

  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage(""); // Clear input immediately
    sendMessage(trimmedMessage);
  };

  const handleRegenerate = async () => {
    regenerateMessage(undefined, {
      onSuccess: (newMessage) => {
        // @ts-ignore
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      },
      onError: () => {
        alert('Failed to regenerate message. Please try again.');
      }
    });
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
    <div className="relative min-h-screen bg-black">
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

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header 
          name={character?.name as string}
          image={'/bg2.png'}
        />

        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto pt-[68px] pb-[90px] scroll-smooth"
        >
          <div className="flex flex-col space-y-4 p-4">
            {/* Message History */}
            {messages.map((msg, index) => (
              <ChatBubble 
                index={index}
                key={`${msg.created_at}-${index}`}
                {...msg}
                isLatestReply={index === messages.length - 1 && msg.role !== 'user'}
                onRegenerate={handleRegenerate}
                onRate={handleRate}              />
            ))}

            {/* Typing Indicator */}
            {isSending && (
              <div className="flex items-start gap-2">
                <TypingIndicator />
              </div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="h-20 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-2 left-0 right-0 px-4">
            <InputBar
              message={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              placeholder={`Message ${character?.name}`}
              disabled={isSending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
