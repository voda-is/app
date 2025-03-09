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
  ConversationHistorySchema,
  GitcoinGrant,
  GitcoinGrantSchema,
} from "./validations";
import { z } from "zod";
import { UserProfilesCache } from "./userProfilesCache";
import { useAccount } from 'wagmi';

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
  url: {
    get: async (urlId: string, address: string): Promise<{
      url: Url,
      referral_success: boolean,
    }> => {
      const response = await apiProxy.post("", {
        path: `/url/${urlId}`,
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    create: async (path: string, urlType: string, address: string): Promise<string> => {
      const response = await apiProxy.post("", {
        path: `/url`,
        method: "POST",
        data: {
          path,
          url_type: urlType,
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data["url_id"];
    },
  },

  gitcoin: {
    getGrants: async (): Promise<GitcoinGrant[]> => {
      const response = await apiProxy.post("", {
        path: "/gitcoin/all",
        method: "GET",
        data: { ignoreToken: true },
      });
      return z.array(GitcoinGrantSchema).parse(response.data.data);
    },
    getGrant: async (grantId: string): Promise<GitcoinGrant> => {
      const response = await apiProxy.post("", {
        path: `/gitcoin/${grantId}`,
        method: "GET",
        data: { ignoreToken: true },
      });
      return GitcoinGrantSchema.parse(response.data.data);
    },
  },
  user: {
    register: async (address: string) => {
      const cache = new UserProfilesCache();
      
      const name = `0x${address.split("0x")[1].slice(0, 4)}`;
      const response = await apiProxy.post("", {
        path: "/user",
        method: "POST",
        data: {
          user_id: address,
          network_name: 'sei',
          username: name,
          first_name: name,
          last_name: '',
          profile_photo: '',
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to register user");
      }

      const userResponse = await apiProxy.post("", {
        path: "/user",
        method: "GET",
        data: { user_id: address },
      });

      cache.addUser(userResponse.data.data);

      return userResponse.data.data;
    },
    getUsers: async (userIds: string[], address: string): Promise<User[]> => {
      const response = await apiProxy.post("", {
        path: "/users",
        method: "POST",
        data: {
          user_ids: userIds,
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getUserPoints: async (address: string): Promise<UserPoints> => {
      const response = await apiProxy.post("", {
        path: "/user/points",
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    claimFreePoints: async (address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: "/user/points/free",
        method: "POST",
        data: {
          user_id: address,
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
    getPublicConversations: async (characterId: string): Promise<ConversationHistory[]> => {
      const response = await apiProxy.post("", {
        path: `/conversations/public/${characterId}`,
        method: "GET",
        data: { ignoreToken: true },
      });
      return response.data.data as ConversationHistory[];
    },
    getPublicConversation: async (conversationId: string): Promise<ConversationHistory> => {
      const response = await apiProxy.post("", {
        path: `/conversation/public/${conversationId}`,
        method: "GET",
        data: { ignoreToken: true },
      });
      return response.data.data as ConversationHistory;
    },
    createConversation: async (characterId: string, address: string): Promise<null> => {
      await apiProxy.post("", {
        path: `/conversations/${characterId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
          is_public: false,
        },
      });
      return null;
    },
    getCharacterListBrief: async (address: string): Promise<CharacterListBrief[]> => {
      const response = await apiProxy.post("", {
        path: "/conversations/character_list",
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return z.array(CharacterListBriefSchema).parse(response.data.data);
    },
    deleteConversation: async (conversationId: string, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/conversation/${conversationId}`,
        method: "DELETE",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getConversationHistoryIdOnly: async (characterId: string, address: string): Promise<string[]> => {
      const response = await apiProxy.post("", {
        path: `/conversations/id_only/${characterId}`,
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
          limit: 10,
        },
      });
      return response.data.data["conversation_ids"];
    },
    getConversation: async (conversationId: string, address: string): Promise<ConversationHistory> => {
      const response = await apiProxy.post("", {
        path: `/conversation/${conversationId}`,
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    sendMessage: async (conversationId: string, text: string, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chat/${conversationId}`,
        method: "POST",
        data: {
          message: text,
          user_id: address,
          stripUserId: true,
        },
      });
      return null;
    },
    regenerateLastMessage: async (conversationId: string, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/regenerate_last_message/${conversationId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return null;
    },
  },

  tts: {
    generateSpeech: async (text: string, characterId: string, address: string): Promise<Blob> => {
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
              user_id: address,
              stripUserId: true,
              message: text,
              isStream: true,
              ignoreToken: false,
            }
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      const arrayBuffer = await response.arrayBuffer();
      return new Blob([arrayBuffer], {
        type: response.headers.get("content-type") || "audio/mp3",
      });
    },
  },

  chatroom: {
    generateFromCharacter: async (characterId: string, address: string): Promise<Chatroom> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/generate_from_character/${characterId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getChatroom: async (chatroomId: string): Promise<Chatroom> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/${chatroomId}`,
        method: "GET",
        data: { ignoreToken: true },
      });
      return response.data.data;
    },
    maybeCreateChatroomMessages: async (chatroomId: string, address: string): Promise<boolean> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/create_message/${chatroomId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data["is_created"];
    },
    getChatroomMessages: async (chatroomId: string, address: string): Promise<ChatroomMessages> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/messages/${chatroomId}`,
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    joinChatroom: async (chatroomId: string, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/join/${chatroomId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    leaveChatroom: async (chatroomId: string, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/leave/${chatroomId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getHijackCost: async (chatroomId: string, address: string): Promise<any> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/hijack_cost/${chatroomId}`,
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    registerHijack: async (characterId: string, hijackCost: { cost: number }, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/register_hijack/${characterId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
          amount: hijackCost.cost,
        },
      });
      return response.data;
    },
    hijackChatroom: async (characterId: string, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/hijack/${characterId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    chat: async (chatroomId: string, message: string, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/chat/${chatroomId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
          message,
        },
      });
      return response.data.data;
    },
    regenerateLastMessage: async (chatroomId: string, address: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/regenerate_last_message/${chatroomId}`,
        method: "POST",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getMessage: async (messageId: string, address: string): Promise<ChatroomMessages> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/message/${messageId}`,
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getMessageBrief: async (chatroomId: string, address: string): Promise<MessageBrief[]> => {
      const response = await apiProxy.post("", {
        path: `/chatroom/messages_brief/${chatroomId}`,
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
  },
};

// Hook to get the current user's address with sei: prefix
export const useUserId = () => {
  const { address } = useAccount();
  return address ? `crypto_wallet:sei:${address}` : null;
};
