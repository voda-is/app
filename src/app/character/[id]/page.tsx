'use client';

import { LoadingScreen } from "@/components/LoadingScreen";
import { CharacterDetails } from "@/components/CharacterDetails";
import { useCharacter } from "@/hooks/api";
import { useParams } from "next/navigation";

export default function CharacterPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: character, isLoading } = useCharacter(id);

  if (isLoading || !id) {
    return <LoadingScreen />;
  }

  if (!character) {
    return null;
  }
  return <CharacterDetails character={character} />;
} 