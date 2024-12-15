'use client';

import { LoadingScreen } from "@/components/LoadingScreen";
import { CharacterDetails } from "@/components/CharacterDetails";
import { useCharacter, useCharacterChatHistory, useChatroomWithCharacter, useGetMessageBrief, useUserProfilesRaw } from "@/hooks/api";
import { useParams } from "next/navigation";

export default function CharacterPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: chatHistoryIds, isLoading: historyLoading } = useCharacterChatHistory(id);
  const { data: chatroom, isLoading: chatroomLoading } = useChatroomWithCharacter(id);
  const { data: character, isLoading: characterLoading } = useCharacter(id);
  const { data: messageBriefs, isLoading: messageBriefsLoading } = useGetMessageBrief(chatroom?._id || "");
  const { data: _, isLoading: userProfilesLoading } = useUserProfilesRaw(messageBriefs || []);

  console.log(chatHistoryIds, chatroom, character, messageBriefs)
  if (characterLoading || historyLoading || chatroomLoading || messageBriefsLoading || !id || userProfilesLoading) {
    return <LoadingScreen />;
  }

  if (!character || !chatHistoryIds) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <CharacterDetails 
        character={character} 
        chatHistoryIds={chatHistoryIds}
        chatroom={chatroom!}
        messageBriefs={messageBriefs || []}
      />
    </div>
  );
} 