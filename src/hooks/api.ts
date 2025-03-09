import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, useUserId } from "@/lib/api-client";
import type {
  Character,
  ConversationHistory,
  User,
  TTSEntry,
  ChatroomMessages,
  Chatroom,
  UserPoints,
  MessageBrief,
  TokenInfo,
  CharacterListBrief,
  Url,
  GitcoinGrant,
} from "@/lib/validations";
import { hashText } from "@/lib/utils";
import { TTSContext } from "./context";
import { UserProfilesCache } from "@/lib/userProfilesCache";

// User related hooks
export function useUser() {
  const userId = useUserId();
  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: () => api.user.register(userId!),
    enabled: !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// User points related hooks
export function useUserPoints() {
  const userId = useUserId();
  return useQuery<UserPoints, Error>({
    queryKey: ["userPoints"],
    queryFn: () => api.user.getUserPoints(userId!),
    enabled: !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Character related hooks
export function useCharacters(limit: number, offset: number) {
  return useQuery<Character[], Error>({
    queryKey: ["characters"],
    queryFn: () => api.characters.list(limit, offset),
    enabled: true,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useCharacter(id: string | undefined) {
  return useQuery<Character, Error>({
    queryKey: ["characters", id],
    queryFn: () => api.characters.get(id!),
    enabled: !!id,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useCharacterChatHistory(characterId: string) {
  const userId = useUserId();
  const { data: character } = useCharacter(characterId);
  const { data: user } = useUser();

  return useQuery<string[], Error>({
    queryKey: ["characterChatHistory", characterId],
    queryFn: async () => {
      if (character) {
        const history = await api.chat.getConversationHistoryIdOnly(characterId, userId!);
        if (history.length === 0) {
          await api.chat.createConversation(characterId, userId!);
          return await api.chat.getConversationHistoryIdOnly(characterId, userId!);
        } else {
          return history;
        }
      } else {
        throw new Error("Unable to fetch chat history");
      }
    },
    enabled: !!characterId && !!user && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function usePublicConversations(characterId: string) {
  return useQuery<ConversationHistory[], Error>({
    queryKey: ["publicConversations", characterId],
    queryFn: async() => {
      const conversations = await api.chat.getPublicConversations(characterId)
      console.log(conversations)
      return conversations
    },
    enabled: !!characterId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useConversation(conversationId: string) {
  const userId = useUserId();
  return useQuery<ConversationHistory, Error>({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.chat.getConversation(conversationId, userId!),
    enabled: !!conversationId && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useCharacterListBrief() {
  const userId = useUserId();
  return useQuery<CharacterListBrief[]>({
    queryKey: ["characterListBrief"],
    queryFn: () => api.chat.getCharacterListBrief(userId!),
    enabled: !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useCreateConversation(characterId: string) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation<null, Error, void>({
      mutationFn: () => api.chat.createConversation(characterId, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["characterChatHistory", characterId],
      });
    },
  });
}

export function useDeleteConversation(characterId: string) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation<null, Error, string>({
    mutationFn: (conversationId: string) => api.chat.deleteConversation(conversationId, userId!),
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
  const userId = useUserId();

  return useMutation<null, Error, string>({
    mutationFn: (text: string) => api.chat.sendMessage(conversationId, text, userId!),
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
  const userId = useUserId();

  return useMutation<null, Error, void>({
    mutationFn: () => api.chat.regenerateLastMessage(conversationId, userId!),
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
  const userId = useUserId();

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

      const audioBlob = await api.tts.generateSpeech(text, characterId, userId!);
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

// Chatroom related hooks
export function useChatroomWithCharacter(characterId: string) {
  const userId = useUserId();
  return useQuery<Chatroom>({
    queryKey: ["chatroomCharacter", characterId],
    queryFn: async () => {
      if (!characterId) throw new Error("Invalid character ID");
      const result = await api.chatroom.generateFromCharacter(characterId, userId!);
      if (!result) throw new Error("Failed to get/create chatroom");
      return result;
    },
    enabled: !!characterId && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useChatroom(chatroomId: string) {
  const userId = useUserId();
  return useQuery<Chatroom>({
    queryKey: ["chatroom", chatroomId],
    queryFn: async () => {
      const result = await api.chatroom.getChatroom(chatroomId);
      if (!result) throw new Error("Failed to get/create chatroom");
      return result;
    },
    enabled: !!chatroomId && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useChatroomMessages(chatroomId: string) {
  const userId = useUserId();
  return useQuery<ChatroomMessages | null>({
    queryKey: ["chatroomMessages", chatroomId],
    queryFn: () => api.chatroom.getChatroomMessages(chatroomId, userId!),
    enabled: !!chatroomId && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useHijackCost(chatroomId: string) {
  const userId = useUserId();
  return useQuery<{ cost: number }>({
    queryKey: ["hijackCost", chatroomId],
    queryFn: () => api.chatroom.getHijackCost(chatroomId, userId!),
    enabled: !!chatroomId && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useUserProfiles(
  chatroom: Chatroom,
  chatroomMessages: ChatroomMessages
) {
  const userId = useUserId();
  return useQuery<User[]>({
    queryKey: ["userProfiles"],
    queryFn: () => {
      const cache = new UserProfilesCache();
      const userIds = new Set<string>();
      chatroom.current_audience.forEach((id) => userIds.add(id));

      chatroomMessages.history.forEach((pair) => {
        pair.forEach((msg) => {
          if (msg.user_id) {
            userIds.add(msg.user_id);
          }
        });
      });

      userIds.add(chatroom.user_on_stage);
      const uniqueUserIds = Array.from(userIds);
      return cache.ensureUserProfiles(uniqueUserIds, userId!);
    },
    enabled: !!chatroom && !!chatroomMessages && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useUserProfilesRaw(messageBriefs: MessageBrief[]) {
  const userId = useUserId();
  return useQuery<null>({
    queryKey: ["userProfilesRaw", messageBriefs],
    queryFn: async () => {
      const userIds = messageBriefs.map(brief => brief.wrapped_by);
      const cache = new UserProfilesCache();
      await cache.ensureUserProfiles(userIds, userId!);
      return null;
    },
    enabled: !!messageBriefs && messageBriefs.length > 0 && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useJoinChatroom(chatroomId: string | undefined) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation<null, Error, void>({
    mutationFn: () => {
      if (!chatroomId) throw new Error("Invalid chatroom ID");
      return api.chatroom.joinChatroom(chatroomId, userId!);
    },
    onSuccess: () => {
      if (chatroomId) {
        queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
      }
    },
  });
}

export function useLeaveChatroom(chatroomId: string | undefined) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation<null, Error, void>({
    mutationFn: () => {
      if (!chatroomId) throw new Error("Invalid chatroom ID");
      return api.chatroom.leaveChatroom(chatroomId, userId!);
    },
    onSuccess: () => {
      if (chatroomId) {
        queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
      }
    },
  });
}

export function useStartNewConversation(chatroomId: string) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation<boolean, Error, void>({
    mutationFn: () => {
      if (!chatroomId) throw new Error("Invalid chatroom ID");
      return api.chatroom.maybeCreateChatroomMessages(chatroomId, userId!);
    },
    onSuccess: () => {
      if (chatroomId) {
        queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
        queryClient.invalidateQueries({
          queryKey: ["chatroomMessages", chatroomId],
        });
      }
    },
  });
}

export function useSendMessageToChatroom(
  chatroomId: string,
  isError: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation<null, Error, string>({
    mutationFn: (text: string) => api.chatroom.chat(chatroomId, text, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chatroomMessages", chatroomId],
      });
    },
    onError: isError,
  });
}

export function useRegenerateLastMessageToChatroom(chatroomId: string, isError: (error: Error) => void) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation<null, Error, void>({
    mutationFn: () => {
      return api.chatroom.regenerateLastMessage(chatroomId, userId!);
    },
    onSuccess: () => {
      if (chatroomId) {
        queryClient.invalidateQueries({ queryKey: ['chatroomMessages', chatroomId] });
      }
    },
    onError: isError,
  });
}

export function useRegisterHijack(chatroomId: string) {
  const queryClient = useQueryClient();
  const userId = useUserId();
  return useMutation<null, Error, { cost: number }>({
    mutationFn: (hijackCost: { cost: number }) => api.chatroom.registerHijack(chatroomId, hijackCost, userId!),
    onMutate: () => {
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
      queryClient.invalidateQueries({ queryKey: ['hijackCost'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatroom', chatroomId] });
    },
  });
}

export function useHijackChatroom(chatroomId: string) {
  const queryClient = useQueryClient();
  const userId = useUserId();
  return useMutation<null, Error, void>({
    mutationFn: () => {
      return api.chatroom.hijackChatroom(chatroomId, userId!);
    },
    onMutate: () => {
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
      queryClient.invalidateQueries({ queryKey: ['hijackCost'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatroom', chatroomId] });
    },
  });
}

export function useGetMessage(messageId: string) {
  const userId = useUserId();
  return useQuery<ChatroomMessages>({
    queryKey: ["chatroomMessage", messageId],
    queryFn: () => api.chatroom.getMessage(messageId, userId!),
    enabled: !!messageId && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useGetMessageBrief(chatroomId: string) {
  const userId = useUserId();
  return useQuery<MessageBrief[]>({
    queryKey: ["messageBrief", chatroomId],
    queryFn: () => api.chatroom.getMessageBrief(chatroomId, userId!),
    enabled: !!chatroomId && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useClaimFreePoints() {
  const queryClient = useQueryClient();
  const userId = useUserId();
  return useMutation<null, Error, void>({
    mutationFn: () => api.user.claimFreePoints(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
    },
  });
}

export function useGenerateReferralUrl() {
  const userId = useUserId();
  return useMutation<string, Error, { path: string, type: string }>({
    mutationFn: async ({ path, type }: { path: string, type: string }) => {
      const urlId = await api.url.create(path, type, userId!);
      return `${window.location.origin}/url/${urlId}`;
    },
  });
}

export function useUrl(urlId: string) {
  const userId = useUserId();
  return useQuery<{ url: Url, referral_success: boolean }, Error>({
    queryKey: ["url", urlId],
    queryFn: () => api.url.get(urlId, userId!),
    enabled: !!urlId && !!userId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useGitcoinGrants() {
  return useQuery<GitcoinGrant[], Error>({
    queryKey: ["gitcoinGrants"],
    queryFn: () => api.gitcoin.getGrants(),
    enabled: true,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
  });
}

export function useGitcoinGrant(grantId: string) {
  return useQuery<GitcoinGrant, Error>({
    queryKey: ["gitcoinGrant", grantId],
    queryFn: () => api.gitcoin.getGrant(grantId),
    enabled: !!grantId, 
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function usePublicConversation(conversationId: string) {
  return useQuery<ConversationHistory, Error>({
    queryKey: ["publicConversation", conversationId],
    queryFn: () => api.chat.getPublicConversation(conversationId),
    enabled: !!conversationId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
  });
}
