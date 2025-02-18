import axios, { AxiosError } from "axios";
import {
  GenericResponseSchema,
  UserSchema,
  UserPayloadSchema,
  validateResponse,
  CharacterSchema,
  ConversationHistory,
  ChatroomMessages,
  Chatroom,
  User,
  UserPoints,
  MessageBrief,
  FunctionCall,
  TokenInfo,
  TokenInfoSchema,
  CharacterListBrief,
  CharacterListBriefSchema,
  Url,
  UserPayload,
  OAuthUserSchema,
} from "./validations";
import { z } from "zod";
import { getTelegramUser } from "@/lib/telegram";
import { UserProfilesCache } from "./userProfilesCache";
import { Session } from "next-auth";

class APIError extends Error {
  constructor(message: string, public status: number, public code: string) {
    super(message);
    this.name = "APIError";
  }
}

export const apiProxy = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add telegram user data to every request
apiProxy.interceptors.request.use((config) => {
  const originalUrl = config.url;
  config.url = "";
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
      throw new Error("No response data");
    }

    // if response is an array buffer or SSE, return it as is
    if (
      response.headers["content-type"]?.includes("audio/") ||
      response.headers["content-type"]?.includes("text/event-stream")
    ) {
      return response;
    }

    try {
      const genericResponse = GenericResponseSchema.parse(response.data);
      if (
        response.config.url?.includes("/user") &&
        response.config.method === "GET"
      ) {
        response.data = validateResponse(genericResponse, UserSchema);
      }

      if (
        response.config.url?.includes("/characters") &&
        response.config.method === "GET"
      ) {
        response.data = validateResponse(
          genericResponse,
          z.array(CharacterSchema)
        );
      }

      // if status is not 2xx, throw an error
      if (genericResponse.status < 200 || genericResponse.status >= 300) {
        throw new APIError(
          genericResponse.message,
          genericResponse.status,
          "API_ERROR"
        );
      }

      return response;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError("Invalid response data", 500, "VALIDATION_ERROR");
      }
      throw error;
    }
  },
  (error: AxiosError<any>) => {
    if (error.response?.data) {
      try {
        const errorResponse = GenericResponseSchema.parse(error.response.data);
        console.log("errorResponse", errorResponse);
        throw new APIError(
          errorResponse.message,
          errorResponse.status,
          "API_ERROR"
        );
      } catch {
        console.log("catch", error);
        throw new APIError(
          error.response.data.message || "An error occurred",
          error.response.status || 500,
          "UNKNOWN_ERROR"
        );
      }
    }
    throw error;
  }
);

export const getUserId = (session: Session | null): string => {
  const maybeTelegramUser = getTelegramUser();
  if (maybeTelegramUser.id !== 111111) {
    return `telegram:${maybeTelegramUser.id}`;
  }

  const oauthUser = OAuthUserSchema.parse(session?.user);
  return `${oauthUser.provider}:${oauthUser.id}`;
}

// API interface
export const api = {
  url: {
    get: async (urlId: string, session: Session | null): Promise<{
      url: Url,
      referral_success: boolean,
    }> => {
      const response = await apiProxy.post("", {
        path: `/url/${urlId}`,
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    create: async (path: string, urlType: string, session: Session | null): Promise<string> => {
      const response = await apiProxy.post("", {
        path: `/url`,
        method: "POST",
        data: {
          path,
          url_type: urlType,
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data["url_id"];
    },
  },

  user: {
    register: async (session: Session | null) => {
      const cache = new UserProfilesCache();
      const telegramUser = getTelegramUser();
      const userId = getUserId(session);
      let payload: UserPayload;
      if (telegramUser.id !== 111111) {
        payload = UserPayloadSchema.parse({
          user_id: userId,
          user_provider: 'telegram',
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          profile_photo: telegramUser.photo_url,
        });
      } else {
        const oauthUser = OAuthUserSchema.parse(session?.user);

        payload = UserPayloadSchema.parse({
          user_id: userId,
          user_provider: oauthUser.provider,
          username: oauthUser.username,
          first_name: oauthUser.firstName,
          last_name: oauthUser.lastName,
          profile_photo: oauthUser.image,
        });
      }

      const response = await apiProxy.post("", {
        path: "/user",
        method: "POST",
        data: payload,
      });

      // throw if response is not ok
      if (response.status !== 200) {
        throw new Error("Failed to register user");
      }

      const userResponse = await apiProxy.post("", {
        path: "/user",
        method: "GET",
        data: { user_id: getUserId(session) },
      });

      cache.addUser(userResponse.data.data);

      return userResponse.data.data;
    },
    getUsers: async (userIds: string[], session: Session | null): Promise<User[]> => {
      const response = await apiProxy.post("", {
        path: "/users",
        method: "POST",
        data: {
          user_ids: userIds,
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getUserPoints: async (session: Session | null): Promise<UserPoints> => {
      const response = await apiProxy.post("", {
        path: "/user/points",
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    claimFreePoints: async (session: Session | null): Promise<null> => {
      const response = await apiProxy.post("", {
        path: "/user/points/free",
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
  },

  characters: {
    list: async (limit: number, offset: number, session: Session | null) => {
      const response = await apiProxy.post("", {
        path: "/characters",
        method: "GET",
        data: {
          limit,
          offset,
          only_roleplay: true,
          only_chatroom: true,
          ignoreToken: true,
        },
      });
      return response.data.data;
    },

    get: async (id: string, session: Session | null) => {
      const response = await apiProxy.post("", {
        path: `/character/${id}`,
        method: "GET",
        data: {
          ignoreToken: true,
        },
      });
      return response.data.data;
    },
  },

  chat: {
    createConversation: async (characterId: string, session: Session | null): Promise<null> => {
      await apiProxy.post("", {
        path: `/conversations/${characterId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
          is_public: false,
        },
      });
      return null;
    },
    getCharacterListBrief: async (session: Session | null): Promise<CharacterListBrief[]> => {
      const response = await apiProxy.post("", {
        path: "/conversations/character_list",
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return z.array(CharacterListBriefSchema).parse(response.data.data);
    },
    deleteConversation: async (conversationId: string, session: Session | null): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/conversation/${conversationId}`,
        method: "DELETE",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getConversationHistoryIdOnly: async (
      characterId: string,
      session: Session | null
    ): Promise<string[]> => {
      const response = await apiProxy.post("", {
        path: `/conversations/id_only/${characterId}`,
        method: "GET",
        data: {
          limit: 10,
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data["conversation_ids"];
    },
    getConversation: async (
      conversationId: string,
      session: Session | null
    ): Promise<ConversationHistory> => {
      const response = await apiProxy.post("", {
        path: `/conversation/${conversationId}`,
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    sendMessage: async (
      conversationId: string,
      text: string,
      session: Session | null
    ): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chat/${conversationId}`,
        method: "POST",
        data: {
          message: text,
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return null;
    },
    regenerateLastMessage: async (conversationId: string, session: Session | null): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/regenerate_last_message/${conversationId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return null;
    },
  },

  tts: {
    generateSpeech: async (
      message: string,
      characterId: string,
      session: Session | null
    ): Promise<Blob> => {
      // Use fetch directly instead of axios for better binary handling
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            path: `/tts/${characterId}`,
            method: "POST",
            data: {
              user_id: getUserId(session),
              stripUserId: true,
              message,
              isStream: true,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      // Get the binary data
      const arrayBuffer = await response.arrayBuffer();
      // Create blob from ArrayBuffer
      const audioBlob = new Blob([arrayBuffer], {
        type: response.headers.get("content-type") || "audio/mp3",
      });

      return audioBlob;
    },
  },

  chatroom: {
    generateFromCharacter: async (characterId: string, session: Session | null): Promise<Chatroom> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/generate_from_character/${characterId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getChatroom: async (chatroomId: string, session: Session | null): Promise<Chatroom> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/${chatroomId}`,
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    maybeCreateChatroomMessages: async (
      chatroomId: string,
      session: Session | null
    ): Promise<boolean> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/create_message/${chatroomId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data["is_created"];
    },
    getChatroomMessages: async (
      chatroomId: string,
      session: Session | null
    ): Promise<ChatroomMessages> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/messages/${chatroomId}`,
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    joinChatroom: async (chatroomId: string, session: Session | null): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/join/${chatroomId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    leaveChatroom: async (chatroomId: string, session: Session | null): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/leave/${chatroomId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getHijackCost: async (chatroomId: string, session: Session | null): Promise<any> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/hijack_cost/${chatroomId}`,
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    registerHijack: async (
      characterId: string,
      hijackCost: { cost: number },
      session: Session | null
    ): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/register_hijack/${characterId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
          amount: hijackCost.cost,
        },
      });
      return response.data;
    },
    hijackChatroom: async (characterId: string, session: Session | null): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/hijack/${characterId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    chat: async (chatroomId: string, message: string, session: Session | null): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/chat/${chatroomId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
          message,
        },
      });
      return response.data.data;
    },
    regenerateLastMessage: async (chatroomId: string, session: Session | null): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/regenerate_last_message/${chatroomId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getMessage: async (messageId: string, session: Session | null): Promise<ChatroomMessages> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/message/${messageId}`,
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getMessageBrief: async (chatroomId: string, session: Session | null): Promise<MessageBrief[]> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/messages_brief/${chatroomId}`,
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
  },

  blockchain: {
    getAddress: async (session: Session | null): Promise<{ sol_address: string, eth_address: string }> => {
      const response = await apiProxy.post("", {
        path: "/address",
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return response.data.data;
    },

    getTokenInfo: async (session: Session | null): Promise<TokenInfo> => {
      const response = await apiProxy.post("", {
        path: "/token_info",
        method: "GET",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
        },
      });
      return TokenInfoSchema.parse(response.data.data);
    },

    createToken: async (
      chatroomMessageId: string,
      deployOnPumpFun: boolean,
      // deployOnBase: boolean,
      session: Session | null
    ): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/blockchain/create_token/${chatroomMessageId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
          deploy_on_pumpfun: deployOnPumpFun,
          // deploy_on_base: deployOnBase,
        },
      });
      return response.data.data;
    },

    buyToken: async (
      chatroomMessageId: string,
      payload: {
        sol_amount?: number;
        eth_amount?: number;
        sol_mint_address?: string;
        eth_mint_address?: string;
      },
      session: Session | null
    ): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/blockchain/buy/${chatroomMessageId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
          ...payload,
        },
      });
      return response.data.data;
    },

    sellToken: async (
      chatroomMessageId: string,
      payload: {
        sol_token_percentage?: number;
        eth_token_percentage?: number;
        sol_mint_address?: string;
        eth_mint_address?: string;
      },
      session: Session | null
    ): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/blockchain/sell/${chatroomMessageId}`,
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
          ...payload,
        },
      });
      return response.data.data;
    },

    withdraw: async (payload: {
      amount_in_sol?: number;
      amount_in_eth?: number;
      withdraw_to_eth_address?: string;
      withdraw_to_sol_address?: string;
      },
      session: Session | null
    ): Promise<null> => {
      const response = await apiProxy.post("", {
        path: "/blockchain/withdraw",
        method: "POST",
        data: {
          user_id: getUserId(session),
          stripUserId: true,
          ...payload,
        },
      });
      return response.data.data;
    },
  }
};
