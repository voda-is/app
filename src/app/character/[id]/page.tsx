'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import MobileLayout from "./mobile";
import DesktopLayout from "./desktop";
import { LoadingScreen } from "@/components/LoadingScreen";
import { UserProfilesCache } from "@/lib/userProfilesCache";
import { 
  useCharacter, 
  useCharacterChatHistory, 
  useChatroomWithCharacter, 
  useCreateConversation, 
  useDeleteConversation, 
  useGetMessageBrief, 
  useUserProfilesRaw, 
  useGenerateReferralUrl, 
  usePublicConversations
} from "@/hooks/api";
import { Character, Chatroom, MessageBrief } from "@/lib/validations";
import { formatDistance } from "date-fns";
import { sei } from "wagmi/chains";

export interface LayoutProps {
  character: Character;
  chatHistoryIds: string[];
  chatroom?: Chatroom;
  messageBriefs?: MessageBrief[];
  cache: UserProfilesCache;
  activeTab: 'about' | 'history' | 'public';
  setActiveTab: (tab: 'about' | 'history' | 'public') => void;
  isSharing: boolean;
  shareSuccess: boolean;
  isGeneratingUrl: boolean;
  handleShare: () => void;
  createConversation: () => void;
  deleteConversation: (id: string) => void;
  deleteConversationLoading: boolean;
  publicConversations?: any[];
  isWalletConnected: boolean;
  seiBalance?: string;
}

export default function CharacterPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const cache = new UserProfilesCache();
  
  const { isConnected } = useAccount();

  const [activeTab, setActiveTab] = useState<'about' | 'history' | 'public'>('about');
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const { data: chatHistoryIds, isLoading: historyLoading } = useCharacterChatHistory(id);
  const { data: character, isLoading: characterLoading } = useCharacter(id);
  const { data: publicConversations, isLoading: publicConversationsLoading } = usePublicConversations(id);
  const { data: chatroom, isLoading: chatroomLoading } = useChatroomWithCharacter(
    // @ts-ignore
    character?.metadata.enable_chatroom ? id : null
  );
  const { data: messageBriefs, isLoading: messageBriefsLoading } = useGetMessageBrief(
    // @ts-ignore
    character?.metadata.enable_chatroom ? chatroom?._id || "" : null
  );
  const { data: _, isLoading: userProfilesLoading } = useUserProfilesRaw(
    character?.metadata.enable_chatroom ? messageBriefs || [] : []
  );

  const { 
    mutate: generateUrl, 
    data: referralUrl, 
    isPending: isGeneratingUrl 
  } = useGenerateReferralUrl();

  const { mutate: createConversation, isPending: createConversationLoading, isSuccess: createConversationSuccess } = useCreateConversation(id);
  const { mutate: deleteConversation, isPending: deleteConversationLoading } = useDeleteConversation(id);

  const { data: balanceData } = useBalance({
    address: '0x31CFd670e0cfc0950435b02961648D355523f6e3',
    chainId: sei.id,
  });

  useEffect(() => {
    if (createConversationSuccess && !historyLoading) {
      setIsLoading(true);
      setTimeout(() => {
        router.push(`/chat/${chatHistoryIds?.[0]}`);
      }, 3000);
    }
  }, [createConversationSuccess, historyLoading, chatHistoryIds]);

  useEffect(() => {
    if (referralUrl) {
      setIsSharing(false);
      navigator.clipboard.writeText(referralUrl);
      setShareSuccess(true);
      
      setTimeout(() => {
        setShareSuccess(false);
      }, 2000);
    }
  }, [referralUrl]);

  const handleShare = async () => {
    setIsSharing(true);
    generateUrl({ path: `character/${id}`, type: "share_character" });
  };

  if (characterLoading || historyLoading || createConversationLoading || deleteConversationLoading || isLoading ||
      (character?.metadata.enable_chatroom && (chatroomLoading || messageBriefsLoading || userProfilesLoading)) || 
      publicConversationsLoading ||
      !id) {
    return <LoadingScreen />;
  }

  if (!character) {
    return null;
  }

  console.log(publicConversations)

  const layoutProps = {
    character,
    chatHistoryIds: chatHistoryIds || [],
    chatroom,
    messageBriefs,
    cache,
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
    isWalletConnected: isConnected,
    seiBalance: balanceData?.formatted,
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

export function BalanceDisplay({ balance }: { balance?: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <h3 className="text-white text-lg font-semibold mb-2">SEI Balance</h3>
      <div className="text-gray-200">
        {balance ? `${balance} SEI` : 'Loading...'}
      </div>
    </div>
  );
}