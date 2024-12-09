'use client';

import { LoadingScreen } from "@/components/LoadingScreen";
import { CharacterDetails } from "@/components/CharacterDetails";
import { useCharacter, useCharacterChatHistory, useChatroom, useChatroomMessages, useChatroomWithCharacter } from "@/hooks/api";
import { useParams, useRouter } from "next/navigation";
import { isOnTelegram } from "@/lib/telegram";
import { setupTelegramInterface } from "@/lib/telegram";
import { useEffect, useState } from "react";

export default function CharacterPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const { data: chatHistoryIds, isLoading: historyLoading } = useCharacterChatHistory(id);
  const { data: chatroom, isLoading: chatroomLoading } = useChatroomWithCharacter(id);
  const { data: character, isLoading: characterLoading } = useCharacter(id);

  console.log('chatroom', chatroom);
  console.log('character', character);
  console.log('chatHistoryIds', chatHistoryIds);

  // Debug states
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOnTelegram()) {
      setupTelegramInterface(router);
    }
  }, []);

  if (characterLoading || historyLoading || chatroomLoading || !id) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h3 className="text-red-400 font-medium">Error</h3>
          <p className="text-white/70 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
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