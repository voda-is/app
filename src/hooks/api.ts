import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Character, ConversationHistory, User, HistoryMessage, TTSEntry } from '@/lib/validations';
import { replacePlaceholders } from '@/lib/formatText';
import { RegenerateContext, RetryMessageContext, SendMessageContext, TTSContext } from './context';
import { hashText } from '@/lib/utils';

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

// Chat related hooks
export function useCheckPastConversation(characterId: string | undefined) {
  return useQuery({
    queryKey: ['pastConversation', characterId],
    queryFn: () => api.chat.checkPastConversation(characterId!),
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

export function useChatHistory(characterId: string | undefined) {
  const { data: character } = useCharacter(characterId);
  const { data: user } = useTelegramUser();
  const { data: hasPastConversation, isLoading: hasPastConversationLoading } = useCheckPastConversation(characterId);

  return useQuery<HistoryMessage[], Error>({
    queryKey: ['chatHistory', characterId],
    queryFn: async () => {
      if (!characterId) throw new Error('Character ID is required');
      if (!user) throw new Error('User is required');

      if (character) {
        const firstMessage: HistoryMessage = {
          role: 'assistant',
          created_at: Date.now(),
          type: 'text',
          text: replacePlaceholders(character.prompts.first_message, character.name, user?.first_name),
          status: 'sent'
        };

        if (hasPastConversation) {
          const history = (await api.chat.getConversationHistory(characterId)).history;
          return [firstMessage, ...history];
        }

        return [firstMessage];
      } else {
        throw new Error('Unable to fetch chat history');
      }
    },
    enabled: !!characterId && (hasPastConversation !== undefined || hasPastConversationLoading) && !!user,
    retry: 1,
    refetchInterval: false,
    staleTime: Infinity, 
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}


export function useSendChatMessage(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation<HistoryMessage, Error, string, SendMessageContext>({
    mutationFn: (text: string) => api.chat.sendMessage(characterId, text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ['chatHistory', characterId] });

      const userMessage: HistoryMessage = {
        role: 'user',
        type: 'text',
        text,
        created_at: Date.now(),
        status: 'sending'
      };

      const previousMessages = queryClient.getQueryData<HistoryMessage[]>(['chatHistory', characterId]);

      queryClient.setQueryData<HistoryMessage[]>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) return [userMessage];
          const messageExists = old.some(msg => 
            msg.text === text && 
            msg.role === 'user' && 
            Date.now() - msg.created_at < 5000
          );
          if (messageExists) return old;
          return [...old, userMessage];
        }
      );

      return { previousMessages, userMessage };
    },
    onError: (err, text, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chatHistory', characterId], context.previousMessages);
      }
    },
    onSuccess: (responseMessage, text, context) => {
      queryClient.setQueryData<HistoryMessage[]>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) return [responseMessage];
          const updatedMessages = old.map(msg => 
            msg === context?.userMessage 
              ? { ...msg, status: 'sent' as const }
              : msg
          );
          const responseExists = updatedMessages.some(msg => 
            msg.text === responseMessage.text && 
            msg.role === 'assistant' &&
            Date.now() - msg.created_at < 5000
          );
          if (responseExists) return updatedMessages;
          return [...updatedMessages, responseMessage];
        }
      );
    },
  });
}

export function useRetryChatMessage(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation<HistoryMessage, Error, string, RetryMessageContext>({
    mutationFn: (text: string) => api.chat.sendMessage(characterId, text),
    onMutate: async (text) => {
      const userMessage: HistoryMessage = {
        role: 'user',
        type: 'text',
        text,
        created_at: Date.now(),
        status: 'sending'
      };

      queryClient.setQueryData<HistoryMessage[]>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) throw new Error('No chat history found');
          old.pop();
          return [...old, userMessage];
        }
      );

      return { userMessage };
    },
    onSuccess: (responseMessage, text, context) => {
      queryClient.setQueryData<HistoryMessage[]>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) throw new Error('No chat history found');
          const history = old.map(msg => 
            msg === context?.userMessage 
              ? { ...msg, status: 'sent' as const }
              : msg
          );

          return [...history, responseMessage];
        }
      );
    },
    onError: (error, text, context) => {
      queryClient.setQueryData<HistoryMessage[]>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) throw new Error('No chat history found');
          
          const history = old.map(msg => 
            msg === context?.userMessage 
              ? { ...msg, status: 'error' as const }
              : msg
          );

          return history;
        }
      );
    },
  });
}

export function useRegenerateLastMessage(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation<HistoryMessage, Error, void, RegenerateContext>({
    mutationFn: () => api.chat.regenerateLastMessage(characterId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['chatHistory', characterId] });

      const previousMessages = queryClient.getQueryData<HistoryMessage[]>(['chatHistory', characterId]);

      if (previousMessages) {
        const newMessages = [...previousMessages];
        for (let i = newMessages.length - 1; i >= 0; i--) {
          if (newMessages[i].role === 'assistant') {
            newMessages.splice(i, 1);
            break;
          }
        }
        queryClient.setQueryData(['chatHistory', characterId], newMessages);
      }

      return { previousMessages };
    },
    onError: (err, _, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chatHistory', characterId], context.previousMessages);
      }
    },
    onSuccess: (responseMessage) => {
      queryClient.setQueryData<HistoryMessage[]>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) return [responseMessage];
          const messageExists = old.some(msg => 
            msg.text === responseMessage.text && 
            msg.role === 'assistant' &&
            Date.now() - msg.created_at < 5000
          );
          if (messageExists) return old;
          return [...old, responseMessage];
        }
      );
    },
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