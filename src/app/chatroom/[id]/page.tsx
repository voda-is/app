"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  useCharacter,
  useChatroom,
  useChatroomMessages,
  useHijackCost,
  useJoinChatroom,
  useLeaveChatroom,
  useSendMessageToChatroom,
  useUser,
  useUserProfiles,
  useUserPoints,
  useStartNewConversation,
  useRegenerateLastMessageToChatroom,
  useHijackChatroom,
  useRegisterHijack,
} from "@/hooks/api";

import { User } from "@/lib/validations";
import { api, useUserId } from "@/lib/api-client";
import { useChatroomEvents } from "@/lib/sse";
import { UserProfilesCache } from "@/lib/userProfilesCache";
import { ChatContextWithUnknownUser, Message } from "@/lib/chat-context";
import { getAvailableBalance, getNextClaimTime } from "@/lib/utils";

import { LoadingScreen } from "@/components/LoadingScreen";
import MobileLayout from "./mobile";
import DesktopLayout from "./desktop";

const HIJACK_DURATION = 20; // 20 seconds wait time

export interface ChatroomLayoutProps {
  chatroomId: string;
  user: any;
  character: any;
  chatroom: any;
  chatroomMessages: any;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  currentUsers: User[];
  showTypingIndicator: boolean;
  isCurrentSpeaker: boolean;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  disableActions: boolean;
  toastMessage: string;
  showToast: boolean;
  setShowToast: (show: boolean) => void;
  isUsersExpanded: boolean;
  setIsUsersExpanded: (expanded: boolean) => void;
  isPointsExpanded: boolean;
  setIsPointsExpanded: (expanded: boolean) => void;
  hijackOngoing: boolean;
  hijackBack: boolean;
  timeLeft: number;
  userPoints: any;
  claimStatus: { canClaim: boolean; timeLeft: string };
  hijackCost: any;
  handleSendMessage: () => void;
  handleRegenerate: () => void;
  handleRetry: () => void;
  handleRate: (rating: number) => void;
  handleReaction: (type: string) => void;
  handleStartNewConversation: () => void;
  handleClaimPoints: () => void;
  hasEnoughPoints: () => boolean;
  registerHijack: (data: { cost: number }) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  cache: UserProfilesCache;
}

export default function ChatroomPage() {
  const params = useParams();
  const chatroomId = params?.id as string;
  const userId = useUserId();

  // Launch Sequence:
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
  const { data: user, isLoading: userLoading } = useUser();

  const { data: chatroom, isLoading: chatroomLoading } = useChatroom(chatroomId);
  const { data: character, isLoading: characterLoading } = useCharacter(chatroom?.character_id);
  const { data: chatroomMessages, isLoading: chatroomMessagesLoading } = useChatroomMessages(chatroomId);
  const { data: hijackCost, isLoading: hijackCostLoading } = useHijackCost(chatroomId);
  const { data: userProfiles, isLoading: userProfilesLoading } = useUserProfiles(chatroom!, chatroomMessages!);
  const { data: userPoints } = useUserPoints();
  const claimStatus = userPoints 
    ? getNextClaimTime(userPoints.running_claimed_balance)
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
  const chatContext = new ChatContextWithUnknownUser(character!, user?._id as string);
  const queryClient = useQueryClient();

  const [isReady, setIsReady] = useState(false); // all data to be fetched from remote is ready

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [isCurrentSpeaker, setIsCurrentSpeaker] = useState(false);
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

  // Data Ready
  useEffect(() => {
    if (
      !chatroomLoading &&
      !chatroomMessagesLoading &&
      !userProfilesLoading &&
      !userLoading &&
      !characterLoading &&
      !hijackCostLoading
    ) {
      setIsReady(true);
    }
  }, [
    chatroomLoading,
    chatroomMessagesLoading,
    userProfilesLoading,
    userLoading,
    characterLoading,
    hijackCostLoading,
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

    // Check if current user is the speaker
    setIsCurrentSpeaker(chatroom.user_on_stage === user?._id);
  }, [isReady, chatroom, chatroomMessages, userProfiles, user]);

  // Join chatroom
  useEffect(() => {
    if (isReady && !chatroomMessages?.is_wrapped) {
      joinChatroom();
    }
  }, [isReady, chatroomMessages, joinChatroom]);

  // Leave chatroom when unmount
  useEffect(() => {
    return () => {
      if (!chatroomMessages?.is_wrapped) {
        leaveChatroom();
      }
    };
  }, [chatroomMessages, leaveChatroom]);

  // Typing indicator
  useEffect(() => {
    if (sendMessagePending || regenerateLastMessagePending) {
      setShowTypingIndicator(true);
      setDisableActions(true);
    } else {
      setShowTypingIndicator(false);
      setDisableActions(false);
    }
  }, [sendMessagePending, regenerateLastMessagePending]);

  // Hijack countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hijackOngoing) {
      setTimeLeft(HIJACK_DURATION);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [hijackOngoing]);

  // SSE
  useChatroomEvents(chatroomId, isReady, {
    onMessageReceived: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatroomMessages", chatroomId] });
    },
    onResponseReceived: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatroomMessages", chatroomId] });
    },
    onJoinChatroom: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
    },
    onLeaveChatroom: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
    },
    onHijackRegistered: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
      queryClient.invalidateQueries({ queryKey: ["hijackCost", chatroomId] });
    },
    onHijackSucceeded: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
      queryClient.invalidateQueries({ queryKey: ["hijackCost", chatroomId] });
    },
  });

  // Handle Send Message
  const handleSendMessage = async () => {
    if (!hasEnoughPoints()) {
      setToastMessage("Not enough points!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage("");
    setMessages(chatContext.newUserMessage(messages, trimmedMessage, user?._id as string));
    sendMessage(trimmedMessage);
  };

  const handleRegenerate = async () => {
    if (!hasEnoughPoints()) {
      setToastMessage("Not enough points!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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

  const handleReaction = (type: string) => {
    console.log(`Reaction: ${type}`);
    // Handle reaction logic
  };

  const handleStartNewConversation = () => {
    startNewConversation();
  };

  const handleClaimPoints = async () => {
    try {
      await api.user.claimFreePoints(userId as string);
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

  const hasEnoughPoints = () => {
    return userPoints && getAvailableBalance(userPoints) >= 2;
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  const layoutProps: ChatroomLayoutProps = {
    chatroomId,
    user,
    character,
    chatroom,
    chatroomMessages,
    messages,
    setMessages,
    currentUsers,
    showTypingIndicator,
    isCurrentSpeaker,
    inputMessage,
    setInputMessage,
    disableActions,
    toastMessage,
    showToast,
    setShowToast,
    isUsersExpanded,
    setIsUsersExpanded,
    isPointsExpanded,
    setIsPointsExpanded,
    hijackOngoing,
    hijackBack,
    timeLeft,
    userPoints,
    claimStatus,
    hijackCost,
    handleSendMessage,
    handleRegenerate,
    handleRetry,
    handleRate,
    handleReaction,
    handleStartNewConversation,
    handleClaimPoints,
    hasEnoughPoints,
    registerHijack,
    messagesEndRef,
    cache,
  };

  return (
    <>
      <div className="md:hidden">
        <MobileLayout {...layoutProps} />
      </div>
      <div className="hidden md:block">
        <DesktopLayout {...layoutProps} />
      </div>
    </>
  );
}
