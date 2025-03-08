'use client';

import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { 
  useCharacter, 
  useConversation, 
  useRegenerateLastMessage, 
  useSendMessage, 
  useUser, 
  useUserPoints,
  useGitcoinGrants
} from '@/hooks/api';

import { LoadingScreen } from "@/components/LoadingScreen";

import { ChatContext, Message } from "@/lib/chat-context";
import { getAvailableBalance, getNextClaimTime } from "@/lib/utils";
import { api, useUserId } from "@/lib/api-client";

import MobileLayout from "./mobile";
import DesktopLayout from "./desktop";
import { Character, GitcoinGrant } from "@/lib/validations";

export interface ChatLayoutProps {
  id: string;
  user: any;
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
  gitcoinGrants?: GitcoinGrant[];
}

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const userId = useUserId();
  const queryClient = useQueryClient();

  // Fetch initial data
  const { data: user, isLoading: userLoading } = useUser();
  const { data: conversation, isLoading: historyLoading } = useConversation(id);
  const characterId = conversation?.character_id;
  const { data: character, isLoading: characterLoading } = useCharacter(characterId);

  const chatContext = new ChatContext(character!, user!);
  const { mutate: sendMessage, isPending: sendMessagePending, isSuccess: sendMessageSuccess } = useSendMessage(id, (error) => {
    console.error('Failed to send message:', error);
    setMessages(chatContext.markLastMessageAsError(messages));
  });

  const { mutate: regenerateLastMessage, isPending: regenerateLastMessagePending, isSuccess: regenerateLastMessageSuccess } = useRegenerateLastMessage(id, (error) => {
    console.error('Failed to regenerate message:', error);
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
    ? getNextClaimTime(userPoints.free_balance_claimed_at)
    : { canClaim: false, timeLeft: "Loading..." };

  // Add Gitcoin grants query
  const { data: gitcoinGrants } = useGitcoinGrants();
  const hasGitcoinTag = character?.tags?.includes("gitcoin") ?? false;

  // Data Ready
  useEffect(() => {
    if (!userLoading && !characterLoading && !historyLoading) {
      setIsReady(true);
    }
  }, [userLoading, characterLoading, historyLoading]);


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
      await api.user.claimFreePoints(userId as string);
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
    user,
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
    gitcoinGrants: hasGitcoinTag ? gitcoinGrants : undefined,
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