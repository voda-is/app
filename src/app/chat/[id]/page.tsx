'use client';

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCharacter } from "@/hooks/api";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: character, isLoading: characterLoading } = useCharacter(id);

  const [messages, setMessages] = useState<string[]>(() => {
    // 从 localStorage 中读取消息
    const savedMessages = localStorage.getItem(`chatMessages-${id}`);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [inputMessage, setInputMessage] = useState("");
  const [disableActions, setDisableActions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  useEffect(() => {
    if (characterLoading) return;
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages, characterLoading]);

  const handleSendMessage = () => {
    if (disableActions) return;
    setDisableActions(true);
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage(""); // Clear input immediately
    const updatedMessages = [...messages, trimmedMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`chatMessages-${id}`, JSON.stringify(updatedMessages)); // 存储到 localStorage
  };

  if (characterLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex flex-col w-full bg-black">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src={character?.background_image_url || "/bg2.png"}
          alt="background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      </div>

      <Header
        name={character?.name as string}
        image={character?.avatar_image_url || "/bg2.png"}
        className="flex-shrink-0 h-16 pt-[var(--tg-content-safe-area-inset-top)]"
      />

      {/* Messages Container */}
      <div ref={scrollRef} className="flex-1 pt-28 pb-10">
        <div className="flex flex-col space-y-4 p-4">
          {/* Messages */}
          {messages.map((msg, index) => (
            <div key={index} className="relative">
              <ChatBubble message={msg} />
            </div>
          ))}
          <div ref={messagesEndRef} className="h-16" />
        </div>
      </div>

      {/* Input Container */}
      <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto bg-gradient-to-t from-black to-transparent">
        <div className="px-4 pt-4 pb-8 backdrop-blur-md bg-[#171717] flex justify-between">
          <textarea
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none overflow-y-auto scrollbar-none py-0 h-[24px] leading-[24px]"
          />
          <button onClick={handleSendMessage} className="bg-[#10B981] text-white rounded-full p-2">
            <IoSend size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}