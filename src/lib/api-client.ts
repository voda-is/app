import axios, { AxiosError } from 'axios';
import { 
  GenericResponseSchema,
  UserSchema,
  UserPayloadSchema,
  validateResponse,
  type User,
  type UserPayload,
  TelegramUserSchema,
  TelegramUser,
  CharacterSchema,
  ConversationHistory,
  HistoryMessage,
} from './validations';
import { z } from 'zod';

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

// telegram user data
export function getTelegramUser(): TelegramUser {
  // @ts-ignore
  const telegramData = window.Telegram.WebApp.initDataUnsafe.user;
  if (!telegramData) {
    throw new Error('Telegram user data not found');
  }
  const validatedTelegramData = TelegramUserSchema.parse(telegramData);
  return validatedTelegramData;
}

// export function getTelegramUser(): TelegramUser {
//   return {
//     id: 7699268464,
//     first_name: 'Sam',
//   };
// }


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
    try {
      const genericResponse = GenericResponseSchema.parse(response.data);
      if (response.config.url?.includes('/user') && response.config.method === 'GET') {
        response.data = validateResponse(genericResponse, UserSchema);
      }

      if (response.config.url?.includes('/characters') && response.config.method === 'GET') {
        response.data = validateResponse(genericResponse, z.array(CharacterSchema));
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
    checkPastConversation: async (characterId: string) => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/has_past_conversation/${characterId}`,
        method: 'GET',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      return response.data.data;
    },

    getConversationHistory: async (characterId: string): Promise<ConversationHistory> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/chat_history/${characterId}`,
        method: 'GET',
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        }
      });
      return response.data.data;
    },

    sendMessage: async (characterId: string, text: string): Promise<HistoryMessage> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/chat/${characterId}`,
        method: 'POST',
        data: { 
          message: text, 
          user_id: telegramUser.id.toString(), 
          stripUserId: true,
        }
      });
      return response.data.data;
    },

    regenerateLastMessage: async (characterId: string): Promise<HistoryMessage> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post('', {
        path: `/regenerate_last_message/${characterId}`,
        method: 'POST',
        data: { 
          user_id: telegramUser.id.toString(), 
          stripUserId: true,
        }
      });
      return response.data.data;
    },
  }
}; 