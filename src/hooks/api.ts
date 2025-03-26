import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, LocalUserProfile } from "@/lib/api-client";
import type {
  Character,
  ConversationMemory,
  User,
  TTSEntry,
  CharacterListBrief,
  Url,
  GitcoinGrant,
} from "@/lib/types";
import { hashText } from "@/lib/utils";
import { TTSContext } from "./context";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";

export const useLocalUserProfile = (): LocalUserProfile | null => {
  const { data: session, status } = useSession();
  const { address, chain } = useAccount();
  const chainSymbol = chain?.nativeCurrency.symbol;

  const walletUserId = address ? `crypto_wallet:${chainSymbol}:${address}` : null;
  const sessionUserId = session?.user?.id && session?.user?.provider 
    ? `${session.user.provider}:${session.user.id}`
    : null;

  if (status === 'unauthenticated') {
    return {
      id: walletUserId!,
      provider: 'crypto_wallet',
      username: `0x${address!.split("0x")[1].slice(0, 4)}`,
      firstName: '',
      lastName: '',
      image: '',
    };
  } else {
    return {
      id: sessionUserId!,
      provider: session?.user?.provider!,
      username: session?.user?.username!,
      firstName: session?.user?.firstName!,
      lastName: session?.user?.lastName!,
      image: session?.user?.image!,
    };
  }
};

// User related hooks
export function useUser() {
  const localUserProfile = useLocalUserProfile();
  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: () => api.user.register(localUserProfile!),
    enabled: !!localUserProfile,
  });
}

// Character related hooks
export function useCharacters(limit: number, offset: number) {
  return useQuery<Character[], Error>({
    queryKey: ["characters"],
    queryFn: () => api.characters.list(limit, offset),
    enabled: true,
  });
}

export function useCharacter(id: string | undefined) {
  return useQuery<Character, Error>({
    queryKey: ["characters", id],
    queryFn: () => api.characters.get(id!),
    enabled: !!id,
  });
}

export function useCharacterChatHistory(characterId: string) {
  const localUserProfile = useLocalUserProfile();
  const { data: character } = useCharacter(characterId);

  return useQuery<ConversationMemory[], Error>({
    queryKey: ["characterChatHistory", characterId],
    queryFn: async () => {
      if (character) {
        const history = await api.chat.getConversations(characterId, localUserProfile!.id);
        if (history.length === 0) {
          await api.chat.createConversation(characterId, localUserProfile!.id);
          return await api.chat.getConversations(characterId, localUserProfile!.id);
        } else {
          return history;
        }
      } else {
        throw new Error("Unable to fetch chat history");
      }
    },
    enabled: !!characterId && !!localUserProfile,
  });
}

export function usePublicConversations(characterId: string) {
  return useQuery<ConversationMemory[], Error>({
    queryKey: ["publicConversations", characterId],
    queryFn: async() => {
      const conversations = await api.chat.getPublicConversations(characterId)
      console.log(conversations)
      return conversations
    },
    enabled: !!characterId,
  });
}

export function useConversation(conversationId: string) {
  const localUserProfile = useLocalUserProfile();
  return useQuery<ConversationMemory, Error>({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.chat.getConversation(conversationId, localUserProfile!.id),
    enabled: !!conversationId && !!localUserProfile,
  });
}

export function useCharacterListBrief() {
  const localUserProfile = useLocalUserProfile();
  return useQuery<CharacterListBrief[]>({
    queryKey: ["characterListBrief"],
    queryFn: () => api.chat.getCharacterListBrief(localUserProfile!.id),
    enabled: !!localUserProfile,
  });
}

export function useCreateConversation(characterId: string) {
  const queryClient = useQueryClient();
  const localUserProfile = useLocalUserProfile();

  return useMutation<null, Error, void>({
    mutationFn: () => api.chat.createConversation(characterId, localUserProfile!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["characterChatHistory", characterId],
      });
    },
  });
}

export function useDeleteConversation(characterId: string) {
  const queryClient = useQueryClient();
  const localUserProfile = useLocalUserProfile();

  return useMutation<null, Error, string>({
    mutationFn: (conversationId: string) => api.chat.deleteConversation(conversationId, localUserProfile!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["characterChatHistory", characterId],
      });
    },
  });
}

export function useSendMessage(
  conversationId: string,
  isError: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const localUserProfile = useLocalUserProfile();

  return useMutation<void, Error, string>({
    mutationFn: (text: string) => api.runtime.sendMessage(conversationId, text, localUserProfile!.id),
    onMutate: () => {
      queryClient.invalidateQueries({
        queryKey: ["userPoints"],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userPoints"],
      });
    },
    onError: isError,
  });
}

export function useRegenerateLastMessage(
  conversationId: string,
  isError: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const localUserProfile = useLocalUserProfile();

  return useMutation<void, Error, void>({
    mutationFn: () => api.runtime.regenerateLastMessage(conversationId, localUserProfile!.id),
    onMutate: () => {
      queryClient.invalidateQueries({
        queryKey: ["userPoints"],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userPoints"],
      });
    },
    onError: isError,
  });
}

// TTS related hooks
export function useTTS() {
  const queryClient = useQueryClient();
  const localUserProfile = useLocalUserProfile();

  return useMutation<
    TTSEntry,
    Error,
    { text: string; characterId: string },
    TTSContext
  >({
    mutationFn: async ({ text, characterId }) => {
      const hash = await hashText(text);
      const cached = queryClient.getQueryData<TTSEntry>(["tts", hash]);
      if (cached) return cached;

      const audioBlob = await api.tts.generateSpeech(text, characterId, localUserProfile!.id);
      const result = { text, audioBlob, status: "complete" as const };
      queryClient.setQueryData(["tts", hash], result);
      return result;
    },
    onMutate: async ({ text }) => {
      const hash = await hashText(text);
      const previousTTS = queryClient.getQueryData<TTSEntry[]>(["ttsHistory"]);

      // Check if we already have this in cache
      const cached = queryClient.getQueryData<TTSEntry>(["tts", hash]);
      if (!cached) {
        const newEntry: TTSEntry = {
          text,
          audioBlob: new Blob(),
          status: "generating",
        };
        queryClient.setQueryData(
          ["ttsHistory"],
          [...(previousTTS || []), newEntry]
        );
      }

      return { previousTTS };
    },
    onError: (err, _, context) => {
      if (context?.previousTTS) {
        queryClient.setQueryData(["ttsHistory"], context.previousTTS);
      }
    },
    onSuccess: (newEntry) => {
      queryClient.setQueryData<TTSEntry[]>(["ttsHistory"], (old) => {
        if (!old) return [newEntry];
        return old.map((entry) =>
          entry.text === newEntry.text && entry.status === "generating"
            ? newEntry
            : entry
        );
      });
    },
  });
}

export function useClaimFreePoints() {
  const queryClient = useQueryClient();
  const localUserProfile = useLocalUserProfile();
  return useMutation<null, Error, void>({
    mutationFn: () => api.user.claimFreePoints(localUserProfile!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
    },
  });
}

export function useGenerateReferralUrl() {
  const localUserProfile = useLocalUserProfile();
  return useMutation<string, Error, { path: string, type: string }>({
    mutationFn: async ({ path, type }: { path: string, type: string }) => {
      const urlId = await api.url.create(path, type, localUserProfile!.id);
      return `${window.location.origin}/url/${urlId}`;
    },
  });
}

export function useUrl(urlId: string) {
  const localUserProfile = useLocalUserProfile();
  return useQuery<{ url: Url, referral_success: boolean }, Error>({
    queryKey: ["url", urlId],
    queryFn: () => api.url.get(urlId, localUserProfile!.id),
    enabled: !!urlId && !!localUserProfile,
  });
}

export function useGitcoinGrants() {
  return useQuery<GitcoinGrant[], Error>({
    queryKey: ["gitcoinGrants"],
    queryFn: () => api.gitcoin.getGrants(),
  });
}

export function useGitcoinGrant(grantId: string) {
  return useQuery<GitcoinGrant, Error>({
    queryKey: ["gitcoinGrant", grantId],
    queryFn: () => api.gitcoin.getGrant(grantId),
    enabled: !!grantId, 
  });
}

export function usePublicConversation(conversationId: string) {
  return useQuery<ConversationMemory, Error>({
    queryKey: ["publicConversation", conversationId],
    queryFn: () => api.chat.getPublicConversation(conversationId),
    enabled: !!conversationId,
  });
}
