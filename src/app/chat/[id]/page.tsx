'use client';

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

import { 
  useCharacter, 
  useClaimFreePoints, 
  useConversation, 
  useRegenerateLastMessage, 
  useSendMessage, 
  useUser,
} from '@/hooks/api';

import { LoadingScreen } from "@/components/LoadingScreen";

import { ChatContext, Message } from "@/lib/chat-context";
import { Character, ConversationMemory } from "@/lib/types";
import { getAvailableBalance, getNextClaimTime } from "@/lib/utils";

import MobileLayout from "./mobile";
import DesktopLayout from "./desktop";

export interface ChatLayoutProps {

  // basic proprs
  id: string;
  user: any;
  character: Character;
  conversation: ConversationMemory;

  // states
  messages: Message[];
  setMessages: (messages: Message[]) => void;

  inputMessage: string;
  setInputMessage: (message: string) => void;

  isPointsExpanded: boolean;
  setIsPointsExpanded: (expanded: boolean) => void;

  // react query actions
  handleSendMessage: () => void;
  handleRegenerate: () => void;
  handleRetry: () => void;
  handleRate: (rating: number) => void;
  claimFreePoints: () => void;

  // memo
  claimStatus: { canClaim: boolean; timeLeft: string };
  hasEnoughPoints: boolean;
  showTypingIndicator: boolean;
  disableActions: boolean;
}

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;

  // Fetch initial data
  const { data: user, isLoading: userLoading } = useUser();
  const { data: conversation, isLoading: historyLoading } = useConversation(id);
  const characterId = conversation?.character_id;
  const { data: character, isLoading: characterLoading } = useCharacter(characterId);

  const chatContext = new ChatContext(character!, user!);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Points related state and data
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);

  const isReady = useMemo(() => {
    return !userLoading && !characterLoading && !historyLoading;
  }, [userLoading, characterLoading, historyLoading]);

  const hasEnoughPoints = useMemo(() => {
    return isReady && user!.points && getAvailableBalance(user!.points) >= 1;
  }, [user, isReady]);

  const claimStatus = useMemo(() => {
    return isReady && user!.points 
      ? getNextClaimTime(user!.points.free_balance_claimed_at)
      : { canClaim: false, timeLeft: "Loading..." };
  }, [user, isReady]);

  /* Set set messages related */
  const { mutate: sendMessage, isPending: sendMessagePending, isSuccess: sendMessageSuccess } = useSendMessage(id, (error) => {
    console.error('Failed to send message:', error);
    setMessages(chatContext.markLastMessageAsError(messages));
  });

  const { mutate: regenerateLastMessage, isPending: regenerateLastMessagePending, isSuccess: regenerateLastMessageSuccess } = useRegenerateLastMessage(id, (error) => {
    console.error('Failed to regenerate message:', error);
    setMessages(chatContext.markLastMessageAsError(messages));
  });
  useEffect(() => {
    if (isReady && conversation) {
      setMessages(chatContext.injectHistoryMessages(conversation.history, conversation.created_at));
    }
  }, [conversation, isReady]);
  const handleSendMessage = async () => {    
    if (!hasEnoughPoints) { return; }

    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage("");
    setMessages(chatContext.newUserMessage(messages, trimmedMessage));
    sendMessage(trimmedMessage);
  };

  const handleRegenerate = async () => {
    if (!hasEnoughPoints) { return; }

    setInputMessage("");    
    setMessages(chatContext.popLastMessage(messages));
    regenerateLastMessage();
  };

  const handleRetry = () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    sendMessage(lastMessage.message);
  };

  /* Set show typing indicator related */
  const showTypingIndicator = useMemo(() => {
    return sendMessagePending || regenerateLastMessagePending;
  }, [sendMessagePending, regenerateLastMessagePending]);

  const disableActions = useMemo(() => {
    return sendMessagePending || regenerateLastMessagePending;
  }, [sendMessagePending, regenerateLastMessagePending]);

  
  const handleRate = (rating: number) => {
    console.log(`Rated: ${rating} stars`);
    // Handle rating logic
  };
  
  const { mutate: claimFreePoints } = useClaimFreePoints();

  if (!isReady) {
    return <LoadingScreen />;
  }

  /* !DATA ALL LOADED! */
  const layoutProps: ChatLayoutProps = {
    id,
    user,
    character: character as Character,
    conversation: conversation as ConversationMemory,

    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isPointsExpanded,
    setIsPointsExpanded,

    handleSendMessage,
    handleRegenerate,
    handleRetry,
    handleRate,
    claimFreePoints,

    claimStatus,
    hasEnoughPoints,
    showTypingIndicator,
    disableActions,
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