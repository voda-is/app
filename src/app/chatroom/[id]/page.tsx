"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";

import {
  useCharacter,
  useChatroom,
  useChatroomMessages,
  useHijackCost,
  useJoinChatroom,
  useLeaveChatroom,
  useSendMessageToChatroom,
  useTelegramUser,
  useUserProfiles,
  useUserPoints,
  useStartNewConversation,
  useRegenerateLastMessageToChatroom,
  useTelegramInterface,
  useHijackChatroom,
  useRegisterHijack,
} from "@/hooks/api";

import { User } from "@/lib/validations";
import { isOnTelegram, notificationOccurred } from "@/lib/telegram";
import { InputBar } from "@/components/InputBar";
import { api } from "@/lib/api-client";
import { useChatroomEvents } from "@/lib/sse";
import { UserProfilesCache } from "@/lib/userProfilesCache";
import { ChatContextWithUnknownUser, Message } from "@/lib/chat-context";
import { getAvailableBalance, getNextClaimTime } from "@/lib/utils";

import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ChatroomFooter } from "@/components/ChatroomFooter";
import { UsersExpandedView } from "@/components/UsersExpandedView";
import { ProgressBarButton } from "@/components/ProgressBarButton";
import { Toast } from "@/components/Toast";
import { PointsExpandedView } from "@/components/PointsExpandedView";
import { Launched } from '@/components/Launched';

const HIJACK_DURATION = 20; // 20 seconds wait time

export default function ChatroomPage() {
  const params = useParams();
  const chatroomId = params?.id as string;

  // Luanch Sequence:
  // 1. get chatroom info
  // 2. get character info
  // 3. get chatroom messages
  // 4. get chatroom hijack cost
  // 5. collect all user profiles need to be fetched
  // 6. fetch user profiles from server or cache
  // 7. register SSE, and refetch when needed

  // After Launch Sequence:
  // 1. scroll to bottom
  // 2. call API to join chatroom

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: telegramUser, isLoading: telegramUserLoading } = useTelegramUser();
  const { data: _tgInterface, isLoading: telegramInterfaceLoading } = useTelegramInterface(router);

  const { data: chatroom, isLoading: chatroomLoading } = useChatroom(chatroomId);
  const { data: character, isLoading: characterLoading } = useCharacter(chatroom?.character_id);
  const { data: chatroomMessages, isLoading: chatroomMessagesLoading } = useChatroomMessages(chatroomId);
  const { data: hijackCost, isLoading: hijackCostLoading } = useHijackCost(chatroomId);
  const { data: userProfiles, isLoading: userProfilesLoading } = useUserProfiles(chatroom!, chatroomMessages!);
  const { data: userPoints } = useUserPoints();
  const claimStatus = userPoints 
    ? getNextClaimTime(userPoints.free_claimed_balance_updated_at)
    : { canClaim: false, timeLeft: "Loading..." };

  const { mutate: joinChatroom, isPending: joinChatroomPending } = useJoinChatroom(chatroomId);
  const { mutate: leaveChatroom, isPending: leaveChatroomPending } = useLeaveChatroom(chatroomId);
  const { mutate: hijackChatroom, isPending: hijackChatroomPending } = useHijackChatroom(chatroomId);
  const { mutate: registerHijack, isPending: registerHijackPending } = useRegisterHijack(chatroomId);

  const { mutate: sendMessage, isPending: sendMessagePending, isSuccess: sendMessageSuccess } = useSendMessageToChatroom(chatroomId, (error) => {
    console.error("Failed to send message:", error);
    setMessages(chatContext.markLastMessageAsError(messages));
  });
  const { mutate: regenerateLastMessage, isPending: regenerateLastMessagePending, isSuccess: regenerateLastMessageSuccess } = useRegenerateLastMessageToChatroom(chatroomId, (error) => {
    console.error("Failed to regenerate last message:", error);
    setMessages(chatContext.markLastMessageAsError(messages));
  });
  const { mutate: startNewConversation, isPending: startNewConversationPending } = useStartNewConversation(chatroomId);

  const cache = new UserProfilesCache();
  const chatContext = new ChatContextWithUnknownUser(character!, telegramUser?._id as string);
  const queryClient = useQueryClient();

  const [isReady, setIsReady] = useState(false); // all data to be fetched from remote is ready

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [isCurrentSpeaker, setIsCurrentSpeaker] = useState(false);
  const [hijackProgress, setHijackProgress] = useState(0);
  const [inputMessage, setInputMessage] = useState("");
  const [disableActions, setDisableActions] = useState(false);
  
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);

  // NOTE: are we gonna display the hijack progress
  const hijackOngoing = useMemo(() => {
    return !chatroomMessages?.is_wrapped && chatroom?.user_hijacking;
  }, [chatroomMessages, chatroom]);

  const hijackBack = useMemo(() => {
    return hijackOngoing && isCurrentSpeaker;
  }, [hijackOngoing, isCurrentSpeaker]);

  // Add state for countdown
  const [timeLeft, setTimeLeft] = useState<number>(HIJACK_DURATION);

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

  useEffect(() => {
    if (sendMessagePending) {
      setShowTypingIndicator(true);
      setDisableActions(true);
    } else {
      setShowTypingIndicator(false);
      setDisableActions(false);
    }
  }, [sendMessagePending]);

  // Data Ready
  useEffect(() => {
    if (
      !chatroomLoading &&
      !chatroomMessagesLoading &&
      !userProfilesLoading &&
      !telegramUserLoading &&
      !hijackCostLoading &&
      !characterLoading &&
      !startNewConversationPending &&
      !telegramInterfaceLoading
    ) {
      setIsReady(true);
    }
  }, [
    chatroomLoading,
    chatroomMessagesLoading,
    userProfilesLoading,
    telegramUserLoading,
    hijackCostLoading,
    startNewConversationPending,
    telegramInterfaceLoading,
  ]);

  // Populate items
  useEffect(() => {
    if (!isReady || !chatroom || !chatroomMessages || !userProfiles || !userPoints || !hijackCost) return;
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
    setIsCurrentSpeaker(chatroom.user_on_stage === telegramUser?._id);
    if (chatroom.user_on_stage === telegramUser?._id) {
      if (getAvailableBalance(userPoints) < 1) {
        setDisableActions(true);
      }
    } else {
      if (getAvailableBalance(userPoints) < hijackCost?.cost) {
        setDisableActions(true);
      }
    }
  }, [isReady, chatroom, chatroomMessages, userProfiles, userPoints, hijackCost]);

  // Show toast for new user
  const showNewUserToast = useCallback((username: string) => {
    setToastMessage(`${username} joined the chat`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  useChatroomEvents(chatroomId, isReady, {
    onMessageReceived: async (message) => {
      if (message.user_id) {
        await cache.ensureUserProfiles([message.user_id]);
      }
      setShowTypingIndicator(true);
      setMessages(
        chatContext.newUserMessage(messages, message.text, message.user_id)
      );
    },
    onResponseReceived: () => {
      setShowTypingIndicator(false);
      queryClient.invalidateQueries({
        queryKey: ["chatroomMessages", chatroomId],
      });
    },
    onHijackRegistered: async ({user}: {user: User}) => {
      if (user) {
        await cache.ensureUserProfiles([user._id]);
      }
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
      queryClient.invalidateQueries({ queryKey: ["hijackCost", chatroomId] });
    },
    onHijackSucceeded: () => {
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
      queryClient.invalidateQueries({ queryKey: ["hijackCost", chatroomId] });
    },
    onJoinChatroom: (joinedData: { user: User }) => {
      showNewUserToast(joinedData.user.first_name);
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
    },
    onLeaveChatroom: () => {
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
    },
  });

  useEffect(() => {
    if (!chatroomId || !telegramUser?._id) {
      return;
    }
    joinChatroom();

    // Leave the room when the component unmounts
    return leaveChatroom;
  }, [chatroomId, telegramUser?._id]);

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage(""); // Clear input immediately
    // NOTE: this will be fetched from server
    // setMessages(chatContext.newUserMessage(messages, trimmedMessage, telegramUser?._id as string));
    sendMessage(trimmedMessage);
  };

  const handleRegenerate = async () => {
    setInputMessage(""); // Clear input immediately
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

  const handleReaction = async (type: string) => {
    if (disableActions) return;
    console.log(`Reaction: ${type}`);
    // await api.chatroom.reactToMessage(chatroomId, type);
  };

  // Replace the progress bar effect with countdown timer
  useEffect(() => {
    if (!chatroom?.user_hijacking || !chatroom?.hijacking_time) return;

    const now = Math.floor(Date.now() / 1000);
    const elapsedTime = now - chatroom.hijacking_time;
    const remainingTime = Math.max(HIJACK_DURATION - elapsedTime, 0);
    
    // Set initial time
    setTimeLeft(remainingTime);

    // Update countdown every second
    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(prev - 1, 0);
        if (newTime === 0) {
          hijackChatroom();
          clearInterval(intervalId);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [chatroom?.user_hijacking, chatroom?.hijacking_time]);

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

  const handleStartNewConversation = () => {
    startNewConversation();
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

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
        {/* Header */}
        <div className={`fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-black/20 ${
          isOnTelegram() ? 'h-42' : 'h-32'
        }`}>
          <Header
            variant="chatroom"
            name={`[TESTNET] ${character?.name}`}
            image={character?.avatar_image_url || "/bg2.png"}
            userCount={currentUsers.length}
            recentUsers={currentUsers}
            onUsersClick={() => setIsUsersExpanded(true)}
            onPointsClick={() => setIsPointsExpanded(true)}
            points={userPoints ? getAvailableBalance(userPoints) : 0}
            canClaim={claimStatus.canClaim}
            characterId={character?._id}
            className="flex-shrink-0 h-16 pt-[var(--tg-content-safe-area-inset-top)]"
          />
        </div>

        {/* Messages Container */}
        <div className={`flex-1 ${isOnTelegram() ? 'pt-40' : 'pt-32'} pb-24`}>
          <div className="flex flex-col space-y-4 p-4">
            {/* Description */}
            <div className="flex justify-center">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
                <div className="text-lg font-semibold mb-2 text-center text-pink-300">
                  Welcome to the Launch Party! 🚀
                </div>
                <div className="text-left mb-4 text-gray-200">
                  Join the most exciting memecoin launch ever! Chat with others, take control of the conversation, 
                  and become part of history. Here's how it works:
                </div>
                <div className="text-sm leading-relaxed text-gray-100">
                  <ul className="list-disc pl-4 space-y-2">
                    <li className="leading-relaxed">Each message costs <span className="text-pink-300 font-medium">2 points</span>, 
                      and you'll need the same amount to regenerate a message</li>
                    <li className="leading-relaxed">Want to take the stage? You can hijack conversations starting at 
                      <span className="text-pink-300 font-medium"> 10 points</span> - price goes up as more people join the fun!</li>
                    <li className="leading-relaxed">When you initiate a hijack, there's a <span className="text-pink-300 font-medium">20-second window</span> where 
                      others can outbid you or the current speaker can defend their position</li>
                    <li className="leading-relaxed">Be quick and strategic - your hijack attempt might fail if someone 
                      outbids you during this period</li>
                    <li className="leading-relaxed">Current speakers can defend their position by matching the 
                      hijack bid</li>
                    <li className="leading-relaxed">Remember: hijack points aren't refundable if your attempt fails, 
                      so bid wisely!</li>
                  </ul>
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
                isChatroom={true}
              />
            ))}
            {/* Launched component */}
            {chatroomMessages && (
              <Launched 
                messages={chatroomMessages} 
                characterName={character?.name || "Us!"} 
                onStartNewConversation={handleStartNewConversation}
                chatroomId={chatroomId}
              />
            )}

            {/* Typing Indicator */}
            {showTypingIndicator && (
              <div ref={typingIndicatorRef} className="mb-4">
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} className={`${hijackOngoing ? 'h-10' : 'h-1'}`} />
          </div>
        </div>

        {/* Only show hijack progress if not wrapped */}
        {/* !chatroomMessages?.is_wrapped && chatroom?.user_hijacking */}
        {hijackOngoing && (
          <div className="fixed bottom-20 pb-2 left-0 right-0 z-10">
            <div className="w-full py-4 px-6 bg-white/5 backdrop-blur-md border-t border-white/10 text-white font-medium text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={cache.getUser(chatroom?.user_hijacking || "")?.profile_photo || "/bg2.png"}
                  alt="User avatar"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-gray-200">
                  {timeLeft === 0 
                    ? "Finalizing hijack!" 
                    : `${cache.getUser(chatroom?.user_hijacking || "")?.first_name || "User"} is hijacking (${timeLeft}s)`}
                </span>
              </div>

              {
                hijackBack && (
                  <button 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-8 py-1.5 rounded-lg transition-all duration-200 shadow-lg shadow-pink-500/20 min-w-[160px]"
                    onClick={() => registerHijack({ cost: hijackCost?.cost || 0 })}>
                    Hijack Back!
                  </button>
                )
              }
            </div>
          </div>
        )}

        {/* Input Container - Only show if not wrapped */}
        {!chatroomMessages?.is_wrapped && (
          <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto pt-2">
            {telegramUser && chatroom && telegramUser?._id === chatroom?.user_on_stage ? (
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
                hijackCost={hijackCost as unknown as { cost: number }}
                onHijack={registerHijack}
                onReaction={handleReaction}
                disabled={disableActions}
              />
            )}
          </div>
        )}

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

        <Toast 
          message={toastMessage}
          isVisible={showToast}
        />
      </div>
    </main>
  );
}
