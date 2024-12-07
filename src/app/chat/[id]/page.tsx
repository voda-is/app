"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatFooter } from "@/components/ChatFooter";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  useCharacter,
  useChatHistory,
  useSendChatMessage,
  useRegenerateLastMessage,
} from "@/hooks/api";
import { HistoryMessage } from "@/lib/validations";
import { isOnTelegram, setupTelegramInterface } from "@/lib/telegram";
import PayModal from "../components/payModal";
import PaySuccessModal from "../components/paySuccess";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: character, isLoading: characterLoading } = useCharacter(id);
  const {
    data: chatHistory,
    isLoading: historyLoading,
    error: historyError,
  } = useChatHistory(id);

  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage(id);
  const { mutate: regenerateMessage, isPending: isRegenerating } =
    useRegenerateLastMessage(id);

  const [inputMessage, setInputMessage] = useState("");
  const [disableActions, setDisableActions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // 是否为当前正在聊天的用户
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isPaySuccessModalOpen, setIsPaySuccessModalOpen] = useState(false);

  // @ts-ignore
  const messages: HistoryMessage[] = chatHistory || [];

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
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

  const handlePay = () => {
    // TODO:
    setShowPayModal(false);
    setIsPaySuccessModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-black">
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
      <div ref={scrollRef} className="flex-1 pt-28 pb-10 overflow-y-auto">
        <div className="flex flex-col space-y-4 p-4">
          {/* Description */}
          <div className="flex justify-center">
            <div className="bg-[#rgba(255, 255, 255, 0.3)] backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
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
            <div key={`${msg.created_at}-${index}`} className="relative">
              <ChatBubble
                index={index}
                {...msg}
                characterId={id}
                enableVoice={character?.metadata.enable_voice}
                isLatestReply={
                  index === messages.length - 1 &&
                  msg.role !== "user" &&
                  messages.length > 1
                }
                onRegenerate={handleRegenerate}
                onRetry={handleRetry}
                onRate={handleRate}
              />
            </div>
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

      {/* Chat Footer */}
      <ChatFooter
        message={inputMessage}
        onChange={setInputMessage}
        onSend={handleSendMessage}
        placeholder={`Message ${character?.name}`}
        disabled={isSpeaking ? disableActions : true}
        seconds={30} // 这里可以传递剩余时间
      />

      <PayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSuccess={handlePay}
      />
      <PaySuccessModal
        isOpen={isPaySuccessModalOpen}
        onClose={() => setIsPaySuccessModalOpen(false)}
      />
    </div>
  );
}
