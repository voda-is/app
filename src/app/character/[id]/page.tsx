'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MobileLayout from "./mobile";
import DesktopLayout from "./desktop";
import { LoadingScreen } from "@/components/LoadingScreen";
import { 
  useCharacter, 
  useCharacterChatHistory, 
  useCreateConversation, 
  useDeleteConversation, 
  useGenerateReferralUrl, 
  usePublicConversations,
  useUser
} from "@/hooks/api";
import { formatDistance } from "date-fns";
import { Character, ConversationMemory, User } from "@/lib/types";

export interface LayoutProps {
  character: Character;
  chatHistory: ConversationMemory[];
  user: User | null | undefined;

  activeTab: 'about' | 'history' | 'public';
  setActiveTab: (tab: 'about' | 'history' | 'public') => void;

  isSharing: boolean;
  shareSuccess: boolean;
  isGeneratingUrl: boolean;
  handleShare: () => void;

  createConversation: () => void;
  deleteConversation: (id: string) => void;
  deleteConversationLoading: boolean;
  publicConversations?: ConversationMemory[];
}

export default function CharacterPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'about' | 'history' | 'public'>('about');
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const { data: user, isLoading: userLoading } = useUser();
  const { data: chatHistory, isLoading: historyLoading } = useCharacterChatHistory(id);
  const { data: character, isLoading: characterLoading } = useCharacter(id);
  const { data: publicConversations, isLoading: publicConversationsLoading } = usePublicConversations(id);

  const { mutate: generateUrl,  data: referralUrl,  isPending: isGeneratingUrl } = useGenerateReferralUrl();
  const { mutate: createConversation, isPending: createConversationLoading, isSuccess: createConversationSuccess } = useCreateConversation(id);
  const { mutate: deleteConversation, isPending: deleteConversationLoading } = useDeleteConversation(id);

  useEffect(() => {
    if (createConversationSuccess && !historyLoading) {
      setIsLoading(true);
      setTimeout(() => {
        router.push(`/chat/${chatHistory?.[0]._id}`);
      }, 3000);
    }
  }, [createConversationSuccess, historyLoading, chatHistory]);

  useEffect(() => {
    if (referralUrl) {
      setIsSharing(false);
      navigator.clipboard.writeText(referralUrl);
      setShareSuccess(true);
      
      setTimeout(() => {
        setShareSuccess(false);
      }, 1000);
    }
  }, [referralUrl]);

  const handleShare = async () => {
    setIsSharing(true);
    generateUrl({ path: `character/${id}`, type: "share_character" });
  };

  const isReady = useMemo(() => {
    return !userLoading && !characterLoading && !historyLoading && !publicConversationsLoading && id !== undefined;
  }, [userLoading, characterLoading, historyLoading, publicConversationsLoading, id]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (!character) {
    return null;
  }

  console.log(publicConversations)

  const layoutProps = {
    character,
    chatHistory: chatHistory || [],
    user,

    activeTab,
    setActiveTab,
    isSharing,
    shareSuccess,
    isGeneratingUrl,
    handleShare,

    createConversation,
    deleteConversation,
    deleteConversationLoading,
    publicConversations: publicConversations || [],
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


export function TimelineItem({ label, timestamp }: { label: string; timestamp: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">
        {formatDistance(timestamp * 1000, new Date(), { addSuffix: true })}
      </span>
    </div>
  );
}
