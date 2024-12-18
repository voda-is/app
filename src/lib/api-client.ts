import axios, { AxiosError } from "axios";
import {
  GenericResponseSchema,
  UserSchema,
  UserPayloadSchema,
  validateResponse,
  CharacterSchema,
  ConversationHistory,
  HistoryMessage,
  ChatroomMessages,
  Chatroom,
  User,
  UserPoints,
  MessageBrief,
  FunctionCall,
  TokenCreationRecord,
  BuyTokenRecord,
  SellTokenRecord,
  TokenInfo,
  TokenInfoSchema,
  CharacterListBrief,
  CharacterListBriefSchema,
} from "./validations";
import { z } from "zod";
import { getTelegramUser } from "@/lib/telegram";

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

      const response = await apiProxy.post("", {
        path: "/user",
        method: "POST",
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
        throw new Error("Failed to register user");
      }

      const userResponse = await apiProxy.post("", {
        path: "/user",
        method: "GET",
        data: { user_id: telegramUser.id.toString() },
      });

      return userResponse.data.data;
    },
    getUsers: async (userIds: string[]): Promise<User[]> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: "/users",
        method: "POST",
        data: {
          user_ids: userIds,
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getUserPoints: async (): Promise<UserPoints> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: "/user/points",
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    claimFreePoints: async (): Promise<number> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: "/user/points/free",
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
  },

  characters: {
    list: async (limit: number, offset: number) => {
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

    get: async (id: string) => {
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
    createConversation: async (characterId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      await apiProxy.post("", {
        path: `/conversations/${characterId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
          is_public: false,
        },
      });
      return null;
    },
    getCharacterListBrief: async (): Promise<CharacterListBrief[]> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: "/conversations/character_list",
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return z.array(CharacterListBriefSchema).parse(response.data.data);
    },
    deleteConversation: async (conversationId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/conversation/${conversationId}`,
        method: "DELETE",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getConversationHistoryIdOnly: async (
      characterId: string
    ): Promise<string[]> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/conversations/id_only/${characterId}`,
        method: "GET",
        data: {
          limit: 10,
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data["conversation_ids"];
    },
    getConversation: async (
      conversationId: string
    ): Promise<ConversationHistory> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/conversation/${conversationId}`,
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    sendMessage: async (
      conversationId: string,
      text: string
    ): Promise<null> => {
      console.log("sending message", text);
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chat/${conversationId}`,
        method: "POST",
        data: {
          message: text,
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return null;
    },
    regenerateLastMessage: async (conversationId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/regenerate_last_message/${conversationId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return null;
    },
  },

  tts: {
    generateSpeech: async (
      message: string,
      characterId: string
    ): Promise<Blob> => {
      const telegramUser = getTelegramUser();

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
              user_id: telegramUser.id.toString(),
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
    generateFromCharacter: async (characterId: string): Promise<Chatroom> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/generate_from_character/${characterId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      console.log("response", response.data.data);
      return response.data.data;
    },
    getChatroom: async (chatroomId: string): Promise<Chatroom> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/${chatroomId}`,
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    maybeCreateChatroomMessages: async (
      chatroomId: string
    ): Promise<boolean> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/create_message/${chatroomId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data["is_created"];
    },
    getChatroomMessages: async (
      chatroomId: string
    ): Promise<ChatroomMessages> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/messages/${chatroomId}`,
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    joinChatroom: async (chatroomId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/join/${chatroomId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    leaveChatroom: async (chatroomId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/leave/${chatroomId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getHijackCost: async (chatroomId: string): Promise<any> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/hijack_cost/${chatroomId}`,
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    registerHijack: async (
      characterId: string,
      hijackCost: { cost: number }
    ): Promise<null> => {
      const telegramUser = getTelegramUser();
      console.log("registering hijack", characterId, telegramUser);

      const response = await apiProxy.post("", {
        path: `/chatroom/register_hijack/${characterId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
          amount: hijackCost.cost,
        },
      });
      return response.data;
    },
    hijackChatroom: async (characterId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      console.log("hijacking chatroom", characterId, telegramUser);
      const response = await apiProxy.post("", {
        path: `/chatroom/hijack/${characterId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      console.log("response", response.data.data);
      return response.data.data;
    },
    chat: async (chatroomId: string, message: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/chat/${chatroomId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
          message,
        },
      });
      return response.data.data;
    },
    regenerateLastMessage: async (chatroomId: string): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/regenerate_last_message/${chatroomId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getMessage: async (messageId: string): Promise<ChatroomMessages> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/message/${messageId}`,
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getMessageBrief: async (chatroomId: string): Promise<MessageBrief[]> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/chatroom/messages_brief/${chatroomId}`,
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },
  },

  blockchain: {
    getAddress: async (): Promise<{ sol_address: string, eth_address: string }> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: "/address",
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return response.data.data;
    },

    getTokenInfo: async (): Promise<TokenInfo> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: "/token_info",
        method: "GET",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
        },
      });
      return TokenInfoSchema.parse(response.data.data);
    },

    createToken: async (
      chatroomMessageId: string,
      functionCall: FunctionCall
    ): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/blockchain/create_token/${chatroomMessageId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
          function_call: functionCall,
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
      }
    ): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/blockchain/buy/${chatroomMessageId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
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
      }
    ): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: `/blockchain/sell/${chatroomMessageId}`,
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
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
    }): Promise<null> => {
      const telegramUser = getTelegramUser();
      const response = await apiProxy.post("", {
        path: "/blockchain/withdraw",
        method: "POST",
        data: {
          user_id: telegramUser.id.toString(),
          stripUserId: true,
          ...payload,
        },
      });
      return response.data.data;
    },
  }
};
