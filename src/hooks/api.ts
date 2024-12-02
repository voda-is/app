import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Character, ConversationHistory, User, HistoryMessage } from '@/lib/validations';

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
  const { data: hasPastConversation } = useCheckPastConversation(characterId);

  return useQuery<ConversationHistory, Error>({
    queryKey: ['chatHistory', characterId],
    queryFn: async () => {
      if (!characterId) throw new Error('Character ID is required');
      
      if (hasPastConversation) {
        const history = await api.chat.getConversationHistory(characterId);
        return history;
      } else if (character) {
        return {
          history: [{
            role: 'assistant',
            created_at: Date.now(),
            type: 'text' as const,
            text: character.prompts.first_message
          }]
        };
      }
      throw new Error('Unable to fetch chat history');
    },
    enabled: !!characterId && (hasPastConversation !== undefined),
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

  return useMutation<HistoryMessage, Error, string>({
    mutationFn: (text: string) => api.chat.sendMessage(characterId, text),
    onMutate: async (text) => {
      // Create message with 'sending' status
      const userMessage: HistoryMessage = {
        role: 'user',
        type: 'text',
        text,
        created_at: Date.now(),
        status: 'sending'
      };

      queryClient.setQueryData<ConversationHistory>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) {
            throw new Error('No chat history found');
          }
          return {
            ...old,
            history: [...old.history, userMessage]
          };
        }
      );

      return { userMessage };
    },
    onSuccess: (responseMessage, text, context) => {

      console.log('onSuccess', responseMessage, text, context);
      // Update the user message status to 'sent'
      queryClient.setQueryData<ConversationHistory>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) throw new Error('No chat history found');
          const history = old.history.map(msg => 
            msg === context?.userMessage 
              ? { ...msg, status: 'sent' as const }
              : msg
          );

          return {
            ...old,
            history: [...history, responseMessage],
          };
        }
      );
    },
    onError: (error, text, context) => {
      // Mark the message as error instead of removing it
      console.log('onError', error, text, context);
      queryClient.setQueryData<ConversationHistory>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) return { history: [] };
          
          const history = old.history.map(msg => 
            msg === context?.userMessage 
              ? { ...msg, status: 'error' as const }
              : msg
          );

          return {
            ...old,
            history,
          };
        }
      );
    },
  });
}

export function useRegenerateLastMessage(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation<HistoryMessage, Error>({
    mutationFn: () => api.chat.regenerateLastMessage(characterId),
    onSuccess: (newMessage) => {
      // Replace the last assistant message with the regenerated one
      queryClient.setQueryData<ConversationHistory>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) return { history: [newMessage] };
          const history = [...old.history];
          for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].role === 'assistant') {
              history[i] = newMessage;
              break;
            }
          }
          return {
            ...old,
            history,
          };
        }
      );
    },
    onError: () => {
      alert('Failed to regenerate message. Please try again.');
    },
  });
}