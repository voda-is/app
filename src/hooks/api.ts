import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Character, ConversationHistory, User, TTSEntry, ChatroomMessages } from '@/lib/validations';
import { hashText } from '@/lib/utils';
import { TTSContext } from './context';

// User related hooks
export function useTelegramUser() {
  return useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: api.user.register,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity, 
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}

// Character related hooks
export function useCharacters(limit: number, offset: number) {
  return useQuery<Character[], Error>({
    queryKey: ['characters'],
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
    queryKey: ['characters', id],
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

export function useCharacterChatHistory(characterId: string | undefined) {
  const { data: character } = useCharacter(characterId);
  const { data: user } = useTelegramUser();

  return useQuery<string[], Error>({
    queryKey: ['characterChatHistory', characterId],
    queryFn: async () => {
      if (!characterId) throw new Error('Character ID is required');
      if (!user) throw new Error('User is required');

      if (character) {
        const history = await api.chat.getConversationHistoryIdOnly(characterId);
        if (history.length === 0) {
          await api.chat.createConversation(characterId);
          return await api.chat.getConversationHistoryIdOnly(characterId);
        } else {
          return history;
        }
      } else {
        throw new Error('Unable to fetch chat history');
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
    queryKey: ['conversation', conversationId],
    queryFn: () => api.chat.getConversation(conversationId),
    enabled: !!conversationId,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity, 
    gcTime: Infinity,
  });
}

export function useTTS() {
  const queryClient = useQueryClient();

  return useMutation<TTSEntry, Error, { text: string; characterId: string }, TTSContext>({
    mutationFn: async ({ text, characterId }) => {
      const hash = await hashText(text);
      
      // Check cache first
      const cached = queryClient.getQueryData<TTSEntry>(['tts', hash]);
      if (cached) {
        return cached;
      }

      // Generate new audio if not cached
      const audioBlob = await api.tts.generateSpeech(text, characterId);
      const result = { text, audioBlob, status: 'complete' as const };
      
      // Cache the result
      queryClient.setQueryData(['tts', hash], result);
      
      return result;
    },
    onMutate: async ({ text }) => {
      const hash = await hashText(text);
      const previousTTS = queryClient.getQueryData<TTSEntry[]>(['ttsHistory']);
      
      // Check if we already have this in cache
      const cached = queryClient.getQueryData<TTSEntry>(['tts', hash]);
      if (!cached) {
        const newEntry: TTSEntry = { text, audioBlob: new Blob(), status: 'generating' };
        queryClient.setQueryData(['ttsHistory'], [...(previousTTS || []), newEntry]);
      }
      
      return { previousTTS };
    },
    onError: (err, _, context) => {
      if (context?.previousTTS) {
        queryClient.setQueryData(['ttsHistory'], context.previousTTS);
      }
    },
    onSuccess: (newEntry) => {
      queryClient.setQueryData<TTSEntry[]>(['ttsHistory'], (old) => {
        if (!old) return [newEntry];
        return old.map(entry =>
          entry.text === newEntry.text && entry.status === 'generating'
            ? newEntry
            : entry
        );
      });
    },
  });
}

export function useChatroom(characterId: string) {
  return useQuery<ChatroomMessages>({
    queryKey: ['chatroom', characterId],
    queryFn: async () => {
      const result = await api.chatroom.getOrCreateChatroom(characterId);
      console.log('result', result);
      if (!result) throw new Error('Failed to get/create chatroom');
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