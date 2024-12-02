import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Character, ConversationHistory, User, HistoryMessage } from '@/lib/validations';
import { replacePlaceholders } from '@/lib/formatText';

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

      if (hasPastConversation) {
        const history = (await api.chat.getConversationHistory(characterId)).history;
        return history;
      } else if (character) {
        return [{
            role: 'assistant',
            created_at: Date.now(),
            type: 'text' as const,
            text: replacePlaceholders(character.prompts.first_message, character.name, user?.first_name)
          }]
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

  return useMutation<HistoryMessage, Error, string>({
    mutationFn: (text: string) => api.chat.sendMessage(characterId, text),
    onMutate: async (text) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['chatHistory', characterId] });

      const userMessage: HistoryMessage = {
        role: 'user',
        type: 'text',
        text,
        created_at: Date.now(),
        status: 'sending'
      };

      // Get the previous messages
      const previousMessages = queryClient.getQueryData<HistoryMessage[]>(['chatHistory', characterId]) || [];

      // Update with the new message
      queryClient.setQueryData<HistoryMessage[]>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) return [userMessage];
          // Check if this message already exists
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
      // Revert to previous messages on error
      queryClient.setQueryData(['chatHistory', characterId], context?.previousMessages);
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
          // Check if response already exists
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
      // Update the user message status to 'sent'
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
      // Mark the message as error instead of removing it
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

  return useMutation<HistoryMessage, Error>({
    mutationFn: () => api.chat.regenerateLastMessage(characterId),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chatHistory', characterId] });

      // Get the previous messages
      const previousMessages = queryClient.getQueryData<HistoryMessage[]>(['chatHistory', characterId]);

      if (previousMessages) {
        // Remove only the last assistant message
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
      // Revert to previous messages on error
      queryClient.setQueryData(['chatHistory', characterId], context?.previousMessages);
    },
    onSuccess: (responseMessage, _, context) => {
      queryClient.setQueryData<HistoryMessage[]>(
        ['chatHistory', characterId],
        (old) => {
          if (!old) return [responseMessage];
          // Check if this regenerated message already exists
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