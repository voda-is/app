import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  Character,
  ConversationHistory,
  User,
  TTSEntry,
  ChatroomMessages,
  Chatroom,
  UserPoints,
  MessageBrief,
} from "@/lib/validations";
import { hashText } from "@/lib/utils";
import { TTSContext } from "./context";
import { UserProfilesCache } from "@/lib/userProfilesCache";

// User related hooks
export function useTelegramUser() {
  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: api.user.register,
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
  return useQuery<UserPoints, Error>({
    queryKey: ["userPoints"],
    queryFn: () => api.user.getUserPoints(),
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
  const { data: character } = useCharacter(characterId);
  const { data: user } = useTelegramUser();

  return useQuery<string[], Error>({
    queryKey: ["characterChatHistory", characterId],
    queryFn: async () => {
      if (character) {
        const history = await api.chat.getConversationHistoryIdOnly(
          characterId
        );
        console.log(history)
        if (history.length === 0) {
          await api.chat.createConversation(characterId);
          return await api.chat.getConversationHistoryIdOnly(characterId);
        } else {
          return history;
        }
      } else {
        throw new Error("Unable to fetch chat history");
      }
    },
    enabled: !!characterId && !!user,
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
  return useQuery<ConversationHistory, Error>({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.chat.getConversation(conversationId),
    enabled: !!conversationId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useSendMessage(
  conversationId: string,
  isError: (error: Error) => void
) {
  const queryClient = useQueryClient();

  return useMutation<null, Error, string>({
    mutationFn: (text: string) => api.chat.sendMessage(conversationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
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

  return useMutation<null, Error, void>({
    mutationFn: () => api.chat.regenerateLastMessage(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
    onError: isError,
  });
}

// TTS related hooks
export function useTTS() {
  const queryClient = useQueryClient();

  return useMutation<
    TTSEntry,
    Error,
    { text: string; characterId: string },
    TTSContext
  >({
    mutationFn: async ({ text, characterId }) => {
      const hash = await hashText(text);

      // Check cache first
      const cached = queryClient.getQueryData<TTSEntry>(["tts", hash]);
      if (cached) {
        return cached;
      }

      // Generate new audio if not cached
      const audioBlob = await api.tts.generateSpeech(text, characterId);
      const result = { text, audioBlob, status: "complete" as const };

      // Cache the result
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
  return useQuery<Chatroom>({
    queryKey: ["chatroomCharacter", characterId],
    queryFn: async () => {
      const result = await api.chatroom.getOrCreateChatroom(characterId);
      if (!result) throw new Error("Failed to get/create chatroom");
      return result;
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

export function useChatroom(chatroomId: string) {
  return useQuery<Chatroom>({
    queryKey: ["chatroom", chatroomId],
    queryFn: async () => {
      const result = await api.chatroom.getChatroom(chatroomId);
      console.log("result", result);
      if (!result) throw new Error("Failed to get/create chatroom");
      return result;
    },
    enabled: !!chatroomId,
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
  return useQuery<ChatroomMessages | null>({
    queryKey: ["chatroomMessages", chatroomId],
    queryFn: () => api.chatroom.getChatroomMessages(chatroomId),
    enabled: !!chatroomId,
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
  return useQuery<{ cost: number }>({
    queryKey: ["hijackCost", chatroomId],
    queryFn: () => api.chatroom.getHijackCost(chatroomId),
    enabled: !!chatroomId,
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
      return cache.ensureUserProfiles(uniqueUserIds);
    },
    enabled: !!chatroom && !!chatroomMessages,
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
  return useQuery<null>({
    queryKey: ["userProfilesRaw", messageBriefs],
    queryFn: async () => {
      const userIds = messageBriefs.map(brief => brief.wrapped_by);
      const cache = new UserProfilesCache();
      await cache.ensureUserProfiles(userIds);
      return null;
    },
    enabled: !!messageBriefs && messageBriefs.length > 0,
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

  return useMutation<null, Error, void>({
    mutationFn: () => {
      if (!chatroomId) throw new Error("Invalid chatroom ID");
      return api.chatroom.joinChatroom(chatroomId);
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

  return useMutation<null, Error, void>({
    mutationFn: () => {
      if (!chatroomId) throw new Error("Invalid chatroom ID");
      return api.chatroom.leaveChatroom(chatroomId);
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

  return useMutation<boolean, Error, void>({
    mutationFn: () => {
      if (!chatroomId) throw new Error("Invalid chatroom ID");
      return api.chatroom.maybeCreateChatroomMessages(chatroomId);
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

  return useMutation<null, Error, string>({
    mutationFn: (text: string) => api.chatroom.chat(chatroomId, text),
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

  return useMutation<null, Error, void>({
    mutationFn: () => {
      return api.chatroom.regenerateLastMessage(chatroomId);
    },
    onSuccess: () => {
      if (chatroomId) {
        queryClient.invalidateQueries({ queryKey: ['chatroomMessages', chatroomId] });
      }
    },
    onError: isError,
  });
}

export function useGetMessage(messageId: string) {
  return useQuery<ChatroomMessages>({
    queryKey: ["chatroomMessage", messageId],
    queryFn: () => api.chatroom.getMessage(messageId),
    enabled: !!messageId,
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
  return useQuery<MessageBrief[]>({
    queryKey: ["messageBrief", chatroomId],
    queryFn: () => api.chatroom.getMessageBrief(chatroomId),
    enabled: !!chatroomId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}