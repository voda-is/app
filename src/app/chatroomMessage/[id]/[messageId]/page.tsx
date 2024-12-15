"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  useCharacter,
  useChatroom,
  useTelegramUser,
  useUserProfiles,
  useUserPoints,
  useGetMessage,
} from "@/hooks/api";

import { UserProfilesCache } from "@/lib/userProfilesCache";
import { ChatContextWithUnknownUser, Message } from "@/lib/chat-context";
import { getAvailableBalance, getNextClaimTime } from "@/lib/utils";

import { User } from "@/lib/validations";
import { api } from "@/lib/api-client";
import { isOnTelegram, notificationOccurred } from "@/lib/telegram";

import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { LoadingScreen } from "@/components/LoadingScreen";
import { UsersExpandedView } from "@/components/UsersExpandedView";
import { Toast } from "@/components/Toast";
import { PointsExpandedView } from "@/components/PointsExpandedView";
import { Launched } from '@/components/Launched';

export default function ChatroomPage() {
  const params = useParams();
  const chatroomId = params?.id as string;
  const messageId = params?.messageId as string;
  const router = useRouter();
  // Luanch Sequence:
  // 1. get chatroom info
  // 2. get character info
  // 3. get chatroom messages
  // 4. collect all user profiles need to be fetched
  // 5. fetch user profiles from server or cache

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatroom, isLoading: chatroomLoading } = useChatroom(chatroomId);
  const { data: character, isLoading: characterLoading } = useCharacter(chatroom?.character_id);
  const { data: chatroomMessages, isLoading: chatroomMessagesLoading } = useGetMessage(messageId);
  const { data: userProfiles, isLoading: userProfilesLoading } = useUserProfiles(chatroom!, chatroomMessages!);
  const { data: telegramUser, isLoading: telegramUserLoading } = useTelegramUser();
  const { data: userPoints } = useUserPoints();
  const claimStatus = userPoints 
    ? getNextClaimTime(userPoints.free_claimed_balance_updated_at)
    : { canClaim: false, timeLeft: "Loading..." };

  const cache = new UserProfilesCache();
  const chatContext = new ChatContextWithUnknownUser(character!, telegramUser?._id as string);
  const queryClient = useQueryClient();

  const [isReady, setIsReady] = useState(false); // all data to be fetched from remote is ready

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);
  
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);

  
  // Basic Setups
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "instant",
      block: "end",
    });
  }, [messages]);

  // Data Ready
  useEffect(() => {
    if (
      !chatroomLoading &&
      !chatroomMessagesLoading &&
      !userProfilesLoading &&
      !userProfilesLoading &&
      !telegramUserLoading &&
      !characterLoading
    ) {
      setIsReady(true);
    }
  }, [
    chatroomLoading,
    chatroomMessagesLoading,
    userProfilesLoading,
    telegramUserLoading,
    characterLoading,
  ]);

  // Populate items
  useEffect(() => {
    if (!isReady || !chatroom || !chatroomMessages || !userProfiles) return;
    setMessages(
      chatContext.injectHistoryMessages(
        chatroomMessages.history,
        chatroom.created_at
      )
    );

    let currentUsers: User[] = [];
    chatroom.current_audience?.forEach((id) => {
      currentUsers.push(cache.getUser(id) as User); // always exists
    });
    setCurrentUsers(currentUsers);
  }, [isReady, chatroom, chatroomMessages, userProfiles]);

  const handleClaimPoints = async () => {
    try {
      await api.user.claimFreePoints();
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
      // Optionally show a success toast
      setToastMessage("Points claimed successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Failed to claim points:", error);
      // Optionally show an error toast
      setToastMessage("Failed to claim points");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  notificationOccurred('success');

  return (
    <main className="flex flex-col w-full bg-black min-h-screen">
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

      <div className="relative flex flex-col h-full">
        <div className={`fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-black/20 ${
          isOnTelegram() ? 'h-42' : 'h-32'
        }`}>
          <Header
            variant="message"
            name={character?.name as string}
            image={character?.avatar_image_url || "/bg2.png"}
            messageId={messageId}
            chatroomId={chatroomId}
            characterId={character?._id}
            onPointsClick={() => setIsPointsExpanded(true)}
            points={userPoints ? getAvailableBalance(userPoints) : 0}
            canClaim={claimStatus.canClaim}
            className="flex-shrink-0 h-16 pt-[var(--tg-content-safe-area-inset-top)]"
            showToast={(message) => {
              setToastMessage(message);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }}
          />
        </div>

        {/* Messages Container */}
        <div className={`flex-1 ${isOnTelegram() ? 'pt-42' : 'pt-32'} pb-24`}>
          <div className="flex flex-col space-y-4 p-4">
            {/* Description */}
            <div className="flex justify-center">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
                <div className="text-lg font-semibold mb-2 text-center text-pink-300">
                  Message Archive
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
                onRegenerate={() => {}}
                onRetry={() => {}}
                onRate={() => {}}
                useMarkdown={true}
              />
            ))}
            {/* Launched component */}
            {chatroomMessages && (
              <Launched 
                messages={chatroomMessages} 
                characterName={character?.name || "Us!"} 
                onStartNewConversation={() => {
                  router.push(`/chatroom/${chatroomId}`);
                }}
                chatroomId={chatroomId}
              />
            )}

            <Toast 
              message={toastMessage}
              isVisible={showToast}
              className="fixed bottom-20 left-1/2 z-30 bg-black/20 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md"
            />
            <div ref={messagesEndRef} className="h-10" />
          </div>
        </div>

        <UsersExpandedView
          isExpanded={isUsersExpanded}
          onClose={() => setIsUsersExpanded(false)}
          currentUser={currentUsers}
          userOnStageId={chatroom?.user_on_stage}
        />

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
