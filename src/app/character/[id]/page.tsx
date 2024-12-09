'use client';

import { LoadingScreen } from "@/components/LoadingScreen";
import { CharacterDetails } from "@/components/CharacterDetails";
import { useCharacter, useCharacterChatHistory } from "@/hooks/api";
import { useParams, useRouter } from "next/navigation";
import { isOnTelegram } from "@/lib/telegram";
import { setupTelegramInterface } from "@/lib/telegram";
import { useEffect } from "react";

export default function CharacterPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const { data: character, isLoading } = useCharacter(id);
  const { data: chatHistoryIds, isLoading: historyLoading, error: historyError } = useCharacterChatHistory(id);

  useEffect(() => {
    if (isOnTelegram()) {
      setupTelegramInterface(router);
    }
  }, []);
  if (isLoading || historyLoading || !id) {
    return <LoadingScreen />;
  }

  if (!character || !chatHistoryIds) {
    return null;
  }
  return <CharacterDetails character={character} chatHistoryIds={chatHistoryIds} />;
} 