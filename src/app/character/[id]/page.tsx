'use client';

import { LoadingScreen } from "@/components/LoadingScreen";
import { CharacterDetails } from "@/components/CharacterDetails";
import { useCharacter, useCharacterChatHistory, useChatroomWithCharacter } from "@/hooks/api";
import { useParams } from "next/navigation";

export default function CharacterPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const { data: chatHistoryIds, isLoading: historyLoading } = useCharacterChatHistory(id);
  const { data: chatroom, isLoading: chatroomLoading } = useChatroomWithCharacter(id);
  const { data: character, isLoading: characterLoading } = useCharacter(id);

  if (characterLoading || historyLoading || chatroomLoading || !id) {
    return <LoadingScreen />;
  }

  if (!character || !chatHistoryIds) {
    return null;
  }

  console.log('chatroom', chatroom);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <CharacterDetails 
        character={character} 
        chatHistoryIds={chatHistoryIds}
        chatroom={chatroom!}
      />
    </div>
  );
} 