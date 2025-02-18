'use client';

import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { 
  useCharacter, 
  useConversation, 
  useRegenerateLastMessage, 
  useSendMessage, 
  useTelegramInterface, 
  useTelegramUser, 
  useUserPoints 
} from '@/hooks/api';

import { LoadingScreen } from "@/components/LoadingScreen";

import { ChatContext, Message } from "@/lib/chat-context";
import { getAvailableBalance, getNextClaimTime } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { notificationOccurred } from "@/lib/telegram";

import MobileLayout from "./mobile";
import DesktopLayout from "./desktop";
import { Character } from "@/lib/validations";

export interface ChatLayoutProps {
  id: string;
  telegramUser: any;
  character: Character;
  conversation: any;
  messages: any[];
  setMessages: (messages: any[]) => void;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  showTypingIndicator: boolean;
  disableActions: boolean;
  handleSendMessage: () => void;
  handleRegenerate: () => void;
  handleRetry: () => void;
  handleRate: (rating: number) => void;
  userPoints: any;
  claimStatus: { canClaim: boolean; timeLeft: string };
  isPointsExpanded: boolean;
  setIsPointsExpanded: (expanded: boolean) => void;
  handleClaimPoints: () => void;
  hasEnoughPoints: () => boolean;
}

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const queryClient = useQueryClient();

  // Fetch initial data
  const { data: telegramUser, isLoading: telegramUserLoading } = useTelegramUser();
  const { data: _tgInterface, isLoading: telegramInterfaceLoading } = useTelegramInterface(router);
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

  // Data Ready
  useEffect(() => {
    if (!telegramUserLoading && !characterLoading && !historyLoading && !telegramInterfaceLoading) {
      setIsReady(true);
    }
  }, [telegramUserLoading, characterLoading, historyLoading, telegramInterfaceLoading]);


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
    return userPoints!! && getAvailableBalance(userPoints) >= 1;
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  const layoutProps: ChatLayoutProps = {
    id,
    telegramUser,
    character: character as Character,
    conversation,
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    showTypingIndicator,
    disableActions,
    handleSendMessage,
    handleRegenerate,
    handleRetry,
    handleRate,
    userPoints,
    claimStatus,
    isPointsExpanded,
    setIsPointsExpanded,
    handleClaimPoints,
    hasEnoughPoints,
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