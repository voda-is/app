import axios, { AxiosError } from 'axios';
import { 
  GenericResponseSchema,
  UserSchema,
  UserPayloadSchema,
  validateResponse,
  CharacterSchema,
  ConversationHistory,
  HistoryMessage,
  ChatroomMessages,
} from './validations';
import { z } from 'zod';
import { getTelegramUser } from '@/lib/telegram';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const apiProxy = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add telegram user data to every request
apiProxy.interceptors.request.use((config) => {  
  const originalUrl = config.url;
  config.url = '';
  config.data = {
    path: originalUrl,
    method: config.method?.toUpperCase(),
    data: config.data,
  };

  return config;
});

// Response validation and error handling
apiProxy.interceptors.response.use(
  (response) => {
    if (!response.data) {
      throw new Error('No response data');
    }

    // if response is an array buffer or SSE, return it as is
    if (
      response.headers['content-type']?.includes('audio/') ||
      response.headers['content-type']?.includes('text/event-stream')
    ) {
      return response;
    }

    try {
      const genericResponse = GenericResponseSchema.parse(response.data);
      if (response.config.url?.includes('/user') && response.config.method === 'GET') {
        response.data = validateResponse(genericResponse, UserSchema);
      }

      if (response.config.url?.includes('/characters') && response.config.method === 'GET') {
        response.data = validateResponse(genericResponse, z.array(CharacterSchema));
      }

      // if status is not 2xx, throw an error
      if (genericResponse.status < 200 || genericResponse.status >= 300) {
        throw new APIError(genericResponse.message, genericResponse.status, 'API_ERROR');
      }

      return response;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError(
          'Invalid response data',
          500,
          'VALIDATION_ERROR'
        );
      }
      throw error;
    }
  },
  (error: AxiosError<any>) => {
    if (error.response?.data) {
      try {
        const errorResponse = GenericResponseSchema.parse(error.response.data);
        throw new APIError(
          errorResponse.message,
          errorResponse.status,
          'API_ERROR'
        );
      } catch {
        throw new APIError(
          error.response.data.message || 'An error occurred',
          error.response.status || 500,
          'UNKNOWN_ERROR'
        );
      }
    }
    throw error;
  }
);

// API interface
export const api = {
  user: {
    register: async () => {
      const telegramUser = getTelegramUser();
      // Create and validate the payload
      const payload = UserPayloadSchema.parse({
        user_id: telegramUser.id.toString(),
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        profile_photo: telegramUser.photo_url,
      });

      const response = await apiProxy.post('', {
        path: '/user',
        method: 'POST',
        data: payload,
      });

      // const responseClaimFreePoints = await apiProxy.post('', {
      //   path: '/user/points/free',
      //   method: 'POST',
      //   data: {
      //     user_id: telegramUser.id.toString(),
      //     stripUserId: true,
      //   },
      // });

      // throw if response is not ok
      if (response.status !== 200) {
        throw new Error('Failed to register user');
      }

      const userResponse = await apiProxy.post('', {
        path: '/user',
        method: 'GET',
        data: { user_id: telegramUser.id.toString() },
      });

      return userResponse.data.data;
    },
  },

  characters: {
    list: async (limit: number, offset: number) => {
      const response = await apiProxy.post('', { 
        path: '/characters',
        method: 'GET',
        data: {
          limit,
          offset,
          ignoreToken: true,
        }
      });
      return response.data.data;
    },

    get: async (id: string) => {
      const response = await apiProxy.post('', { 
        path: `/character/${id}`,
        method: 'GET',
        data: {
          ignoreToken: true,
        }
      });
      return response.data.data;
    },
  },

  chat: {
    createConversation: async (characterId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/conversations/${characterId}`,
        method: 'POST',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
          is_public: false,
        }
      });
      return null;
    },
    getConversationHistoryIdOnly: async (characterId: string): Promise<string[]> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/conversations/id_only/${characterId}`,
        method: 'GET',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      return response.data.data["conversations"];
    },
    getConversation: async (conversationId: string): Promise<ConversationHistory> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/conversation/${conversationId}`,
        method: 'GET',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      return response.data.data;
    },

    sendMessage: async (conversationId: string, text: string): Promise<HistoryMessage> => {
      console.log('sending message', text);
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/chat/${conversationId}`,
        method: 'POST',
        data: { 
          message: text, 
          user_id: telegramUser.id.toString(), 
          stripUserId: true,
        }
      });
      return response.data.data;
    },

    regenerateLastMessage: async (conversationId: string): Promise<HistoryMessage> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/regenerate_last_message/${conversationId}`,
        method: 'POST',
        data: { 
          user_id: telegramUser.id.toString(), 
          stripUserId: true,
        }
      });
      return response.data.data;
    },
  },

  tts: {
    generateSpeech: async (message: string, characterId: string): Promise<Blob> => {
      const telegramUser = getTelegramUser();
      
      // Use fetch directly instead of axios for better binary handling
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            path: `/tts/${characterId}`,
            method: 'POST',
            data: {
              user_id: telegramUser.id.toString(), 
              stripUserId: true,
              message,
              isStream: true,
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }

      // Get the binary data
      const arrayBuffer = await response.arrayBuffer();
      // Create blob from ArrayBuffer
      const audioBlob = new Blob([arrayBuffer], { 
        type: response.headers.get('content-type') || 'audio/mp3'
      });

      return audioBlob;     
    },
  },

  chatroom: {
    getOrCreateChatroom: async (characterId: string): Promise<ChatroomMessages> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/get_or_create_chatroom/${characterId}`,
        method: 'POST',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      console.log('response', response.data.data);
      return response.data.data;
    },
    joinChatroom: async (chatroomId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/join_chatroom/${chatroomId}`,
        method: 'POST',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      return response.data.data;
    },
    leaveChatroom: async (chatroomId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/leave_chatroom/${chatroomId}`,
        method: 'POST',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      return response.data.data;
    },
    getHijackCost: async (characterId: string): Promise<number> => {
      const response = await apiProxy.post('', {
        path: `/hijack_cost/${characterId}`,
        method: 'GET',
      });
      return response.data.data;
    },
    registerHijack: async (characterId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/register_hijack/${characterId}`,
        method: 'POST',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      return response.data.data;
    },
    hijackChatroom: async (characterId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/hijack/${characterId}`,
        method: 'POST',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      return response.data.data;
    },
    chat: async (chatroomId: string, message: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/chatroom/chat/${chatroomId}`,
        method: 'POST',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
          message,
        }
      });
      return response.data.data;
    },
  }
};
