"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCharacter, useChatroom, useChatroomMessages, useTelegramUser } from '@/hooks/api';
import { HistoryMessage } from "@/lib/validations";
import { isOnTelegram, notificationOccurred, setupTelegramInterface } from "@/lib/telegram";
import { InputBar } from "@/components/InputBar";
import { api } from "@/lib/api-client";
import { ChatroomHeader } from "@/components/ChatroomHeader";
import { ChatroomFooter } from "@/components/ChatroomFooter";
import { replacePlaceholders } from "@/lib/formatText";

export default function ChatroomPage() {
  const params = useParams();
  const chatroomId = params?.id as string;
  const router = useRouter();
  
  const [messages, setMessages] = useState<HistoryMessage[][]>([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [isCurrentSpeaker, setIsCurrentSpeaker] = useState(false);
  const [hijackCost, setHijackCost] = useState(0);
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);

  const { data: chatroom, isLoading: chatroomLoading } = useChatroom(chatroomId);
  const { data: character, isLoading: characterLoading } = useCharacter(chatroom?.character_id);
  const { data: chatroomMessages, isLoading: chatroomMessagesLoading } = useChatroomMessages(chatroomId);
  const { data: telegramUser } = useTelegramUser();
  useEffect(() => {
    if (chatroomMessages?.history) {
      setMessages(chatroomMessages.history);
    }
  }, [chatroomMessages]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [disableActions, setDisableActions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    if (isOnTelegram()) {
      setupTelegramInterface(router);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    setDisableActions(false);
  }, [messages, showTypingIndicator]);

  useEffect(() => {
    const fetchHijackCost = async () => {
      try {
        const cost = await api.chatroom.getHijackCost(chatroomId);
        setHijackCost(cost['cost']);
      } catch (error) {
        console.error('Failed to fetch hijack cost:', error);
      }
    };
    fetchHijackCost();
  }, [chatroomId]);


  const handleSendMessage = async () => {
    if (disableActions) return;
    setDisableActions(true);
    setShowTypingIndicator(true);
    
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage(""); // Clear input immediately
    
    try {
      // We'll implement this later
      await api.chatroom.chat(chatroomId, trimmedMessage);
      setShowTypingIndicator(false);
      setDisableActions(false);
      notificationOccurred('success');
    } catch (error) {
      console.error('Failed to send message:', error);
      setShowTypingIndicator(false);
      setDisableActions(false);
    }
  };

  const handleHijack = async () => {
    if (disableActions) return;
    setDisableActions(true);
    
    try {
      await api.chatroom.registerHijack(chatroomId);
      await api.chatroom.hijackChatroom(chatroomId);
      setIsCurrentSpeaker(true);
      notificationOccurred('success');
    } catch (error) {
      console.error('Failed to hijack conversation:', error);
    } finally {
      setDisableActions(false);
    }
  };

  const handleReaction = async (type: string) => {
    if (disableActions) return;
    console.log(`Reaction: ${type}`); // Implement reaction logic
  };

  // Placeholder data for testing
  const mockRecentUsers = [
    {
      id: "1",
      avatar_url: "https://t.me/i/userpic/320/HrprSXgyPFDFixBuMmj1QnF2p5-0mduYc-SKXGTmyTc.svg",
      name: "Felix"
    },
    {
      id: "2",
      avatar_url: "https://t.me/i/userpic/320/HrprSXgyPFDFixBuMmj1QnF2p5-0mduYc-SKXGTmyTc.svg",
      name: "Alice"
    },
    {
      id: "3",
      avatar_url: "https://t.me/i/userpic/320/HrprSXgyPFDFixBuMmj1QnF2p5-0mduYc-SKXGTmyTc.svg",
      name: "Bob"
    }
  ];
  const mockUserCount = 42;

  const mockAllUsers = [
    {
      id: "1",
      avatar_url: "https://t.me/i/userpic/320/HrprSXgyPFDFixBuMmj1QnF2p5-0mduYc-SKXGTmyTc.svg",
      name: "Felix"
    },
    {
      id: "2",
      avatar_url: "https://t.me/i/userpic/320/HrprSXgyPFDFixBuMmj1QnF2p5-0mduYc-SKXGTmyTc.svg",
      name: "Alice"
    },
    {
      id: "3",
      avatar_url: "https://t.me/i/userpic/320/HrprSXgyPFDFixBuMmj1QnF2p5-0mduYc-SKXGTmyTc.svg",
      name: "Bob"
    }
  ];

  if (characterLoading || !character) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex flex-col w-full bg-black min-h-screen">
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

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-black/20 h-32">
          <ChatroomHeader
            name={character?.name as string}
            image={character?.avatar_image_url || '/bg2.png'}
            userCount={mockUserCount}
            recentUsers={mockRecentUsers}
            latestJoinedUser="Alice"
            onUsersClick={() => setIsUsersExpanded(true)}
            className="flex-shrink-0 h-full pt-[var(--tg-content-safe-area-inset-top)]"
          />
        </div>

        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 pt-32 pb-10"
        >
          <div className="flex flex-col space-y-4 p-4">
            {/* Description */}
            <div className="flex justify-center">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
                <div className="text-lg font-semibold mb-2 text-center text-pink-300">
                  Public Chatroom
                </div>
                <div className="text-sm leading-relaxed text-gray-100">
                  {character?.description}
                </div>
              </div>
            </div>

            <ChatBubble 
                message={replacePlaceholders(character?.prompts.first_message as string, character?.name as string, telegramUser?.first_name as string)}
                role="assistant"
                created_at={chatroom?.created_at || 0}
                assistantAvatar={character?.avatar_image_url}
                userAvatar={character?.avatar_image_url || "/default-avatar.png"}
                characterId={character._id}
                enableVoice={character?.metadata.enable_voice}
                isLatestReply={false}
                onRegenerate={() => {}}
                onRetry={() => {}}
                onRate={() => {}}
                status={"sent"} 
              />

            {/* Messages */}
            {messages.flatMap((pair, index) => [
              <div key={`${pair[0].created_at}-${index}`}>
                <ChatBubble 
                  message={pair[0].text}
                  role={"user"}
                  created_at={pair[0].created_at}
                  status={pair[0].status}
                  assistantAvatar={character?.avatar_image_url}
                  userAvatar={telegramUser?.profile_photo || "/bg2.png"}
                  characterId={character._id}
                  enableVoice={character?.metadata.enable_voice}
                  isLatestReply={false}
                  onRegenerate={() => {}}
                  onRetry={() => {}}
                  onRate={() => {}}
                />
              </div>,
              <div key={`assistant-${index}`}>
                {!pair[1] || !pair[1].text ? null : <ChatBubble 
                  message={pair[1].text}
                  role={"assistant"}
                  created_at={pair[1].created_at}
                  status={pair[1].status}
                  assistantAvatar={character?.avatar_image_url}
                  userAvatar={character?.avatar_image_url || "/default-avatar.png"}
                  characterId={character._id}
                  enableVoice={character?.metadata.enable_voice}
                  isLatestReply={index === messages.length - 1}
                  onRegenerate={() => {}}
                  onRetry={() => {}}
                  onRate={() => {}}
                />}
              </div>
            ])}

            {/* Typing Indicator */}
            {showTypingIndicator && (
              <TypingIndicator />
            )}

            <div ref={messagesEndRef} className="h-10" />
          </div>
        </div>

        {/* Input Container - Conditionally render InputBar or ChatroomFooter */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto">
          {telegramUser?._id === chatroom?.user_on_stage ? (
            <InputBar
              message={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              placeholder={`Message ${character?.name}`}
              disabled={disableActions}
            />
          ) : (
            <ChatroomFooter
              isCurrentSpeaker={isCurrentSpeaker}
              hijackCost={hijackCost}
              onHijack={handleHijack}
              onReaction={handleReaction}
              disabled={disableActions}
            />
          )}
        </div>

        {/* Users Expanded View */}
        <div 
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            isUsersExpanded 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsUsersExpanded(false)}
          />

          {/* Content - Slides up from bottom */}
          <div 
            className={`fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md rounded-t-3xl p-6 transition-transform duration-300 ease-out ${
              isUsersExpanded ? 'translate-y-0' : 'translate-y-full'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              {/* Drag indicator */}
              <div className="w-12 h-1 bg-white/20 rounded-full mb-6" />
              
              <div className="flex justify-between items-center w-full mb-6">
                <h3 className="text-white text-lg font-medium">Online Users</h3>
                <button 
                  onClick={() => setIsUsersExpanded(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-4 gap-6 w-full max-h-[60vh] overflow-y-auto">
                {mockAllUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div className="relative w-16 h-16">
                      <Image
                        src={user.avatar_url}
                        alt={user.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <span className="text-white/90 text-sm text-center">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}