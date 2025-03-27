import { z } from "zod";
import { UserProfilesCache } from "./userProfilesCache";
import { useAccount } from 'wagmi';
import { apiProxy } from "./api-proxy";
import { blake3Hash } from "./blake3";
import { uint8ArrayToHex } from "./utils";
import { 
  CharacterListBrief, CharacterListBriefSchema, 
  ConversationMemory, GitcoinGrant, GitcoinGrantSchema, 
  Url, User, SystemConfig, SystemConfigSchema, CharacterSchema, 
  Character
} from "./types";

export interface LocalUserProfile {
  id: string;
  provider: string;
  username: string;
  firstName: string;
  lastName: string;
  image: string;
}

// API interface
export const api = {
  url: {
    get: async (urlId: string, userId: string): Promise<{
      url: Url,
      referral_success: boolean,
    }> => {
      const response = await apiProxy.post("", {
        path: `/url/${urlId}`,
        method: "GET",
        data: {
          user_id: userId,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    create: async (path: string, urlType: string, userId: string): Promise<string> => {
      const response = await apiProxy.post("", {
        path: `/url`,
        method: "POST",
        data: {
          path,
          url_type: urlType,
          user_id: userId,
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
    register: async (localUserProfile: LocalUserProfile) => {
      const cache = new UserProfilesCache();
      
      const response = await apiProxy.post("", {
        path: "/user",
        method: "POST",
        data: {
          user_id: localUserProfile.id,
          network_name: 'sei',
          username: localUserProfile.username,
          first_name: localUserProfile.firstName,
          last_name: localUserProfile.lastName,
          profile_photo: localUserProfile.image,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to register user");
      }

      const userIdHash = blake3Hash(new TextEncoder().encode(localUserProfile.id));
      const userIdHashHex = uint8ArrayToHex(userIdHash);

      const userResponse = await apiProxy.post("", {
        path: `/user/${userIdHashHex}`,
        method: "GET",
        data: { ignoreToken: true },
      });

      cache.addUser(userResponse.data.data);

      return userResponse.data.data;
    },
    getUsers: async (userIds: string[], userId: string): Promise<User[]> => {
      const response = await apiProxy.post("", {
        path: "/users",
        method: "POST",
        data: {
          user_ids: userIds,
          user_id: userId,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    claimFreePoints: async (userId: string): Promise<null> => {
      const userIdHash = blake3Hash(new TextEncoder().encode(userId));
      const userIdHashHex = uint8ArrayToHex(userIdHash);
      const response = await apiProxy.post("", {
        path: `/user/claim_points/${userIdHashHex}`,
        method: "POST",
        data: { ignoreToken: true, },
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
          limit, offset,
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
    getPublicConversations: async (characterId: string): Promise<ConversationMemory[]> => {
      const response = await apiProxy.post("", {
        path: `/memories/public/${characterId}`,
        method: "GET",
        data: { ignoreToken: true },
      });
      return response.data.data as ConversationMemory[];
    },
    getPublicConversation: async (conversationId: string): Promise<ConversationMemory> => {
      const response = await apiProxy.post("", {
        path: `/memory/public/${conversationId}`,
        method: "GET",
        data: { ignoreToken: true },
      });
      return response.data.data as ConversationMemory;
    },
    createConversation: async (characterId: string, address: string): Promise<null> => {
      await apiProxy.post("", {
        path: `/memories/${characterId}`,
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
        path: "/memories/character_list",
        method: "GET",
        data: {
          user_id: address,
          stripUserId: true,
        },
      });
      return z.array(CharacterListBriefSchema).parse(response.data.data);
    },
    deleteConversation: async (conversationId: string, userId: string): Promise<null> => {
      const response = await apiProxy.post("", {
        path: `/memory/${conversationId}`,
        method: "DELETE",
        data: {
          user_id: userId,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getConversation: async (conversationId: string, userId: string): Promise<ConversationMemory> => {
      const response = await apiProxy.post("", {
        path: `/memory/${conversationId}`,
        method: "GET",
        data: {
          user_id: userId,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
    getConversations: async (characterId: string, userId: string): Promise<ConversationMemory[]> => {
      const response = await apiProxy.post("", {
        path: `/memories/${characterId}`,
        method: "GET",
        data: {
          user_id: userId,
          stripUserId: true,
        },
      });
      return response.data.data;
    },
  },

  tts: {
    generateSpeech: async (text: string, characterId: string, userId: string): Promise<Blob> => {
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
              user_id: userId,
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

  runtime: {
    sendMessage: async (conversationId: string, text: string, userId: string) => {
      await apiProxy.post("", {
        path: `/runtime/chat/${conversationId}`,
        method: "POST",
        data: {
          message: text,
          user_id: userId,
          stripUserId: true,
        },
      });
    },
    regenerateLastMessage: async (conversationId: string, userId: string) => {
      await apiProxy.post("", {
        path: `/runtime/regenerate_last_message/${conversationId}`,
        method: "POST",
        data: {
          user_id: userId,
          stripUserId: true,
        },
      });
    },
  }
};

export const studioApi = {
  character: {
    listWithFilters: async (
      userId: string,
      hasImage?: boolean,
      hasRoleplayEnabled?: boolean,
      limit?: number,
      offset?: number
    ): Promise<Character[]> => {
      const queryParams = new URLSearchParams();
      
      if (hasImage !== undefined) {
        queryParams.append('has_image', hasImage.toString());
      }
      
      if (hasRoleplayEnabled !== undefined) {
        queryParams.append('has_roleplay_enabled', hasRoleplayEnabled.toString());
      }
      
      if (limit !== undefined) {
        queryParams.append('limit', limit.toString());
      }
      
      if (offset !== undefined) {
        queryParams.append('offset', offset.toString());
      }
      
      const response = await apiProxy.post("", {
        path: `/characters/with_filters`,
        method: "GET",
        data: {
          user_id: userId,
          stripUserId: true,
          has_image: hasImage,
          has_roleplay_enabled: hasRoleplayEnabled,
          limit: limit,
          offset: offset,
        },
      });

      try {
        const parsedData = z.array(CharacterSchema).parse(response.data.data);
        console.log("parsedData", parsedData);
        return parsedData;
      } catch (error) {
        console.error("Error parsing characters:", error);
        throw error;
      }
    },
    
    countWithFilters: async (
      userId: string,
      hasImage?: boolean,
      hasRoleplayEnabled?: boolean
    ): Promise<number> => {
      const queryParams = new URLSearchParams();
      
      if (hasImage !== undefined) {
        queryParams.append('has_image', hasImage.toString());
      }
      
      if (hasRoleplayEnabled !== undefined) {
        queryParams.append('has_roleplay_enabled', hasRoleplayEnabled.toString());
      }
      
      const response = await apiProxy.post("", {
        path: `/characters/with_filters/count`,
        method: "GET",
        data: {
          user_id: userId,
          stripUserId: true,
          has_image: hasImage,
          has_roleplay_enabled: hasRoleplayEnabled,
        },
      });
      
      return z.number().parse(response.data.data["count"]);
    },

    create: async (character: Character, userId: string) => {
      await apiProxy.post("", {
        path: "/character",
        method: "POST",
        data: {
          user_id: userId,
          stripUserId: true,
          ...character,
        },
      });
    },

    update: async (character: Character, userId: string) => {
      await apiProxy.post("", {
        path: `/character/${character._id}`,
        method: "PUT",
        data: {
          user_id: userId,
          stripUserId: true,
          ...character,
        },
      });
    },

    delete: async (characterId: string, userId: string) => {
      await apiProxy.post("", { 
        path: `/character/${characterId}`,
        method: "DELETE",
        data: {
          user_id: userId,
          stripUserId: true,
        },
      });
    },
  },
  
  systemConfig: {
    getAll: async (userId: string): Promise<SystemConfig[]> => {
      const response = await apiProxy.post("", {
        path: "/system_config",
        method: "GET",
        data: {
          user_id: userId,
          stripUserId: true,
        },
      });
      return z.array(SystemConfigSchema).parse(response.data.data);
    },
    
    create: async (config: Omit<SystemConfig, '_id' | 'updated_at'>, userId: string): Promise<SystemConfig> => {
      const response = await apiProxy.post("", {
        path: "/system_config",
        method: "POST",
        data: {
          user_id: userId,
          stripUserId: true,
          ...config,
        },
      });
      return SystemConfigSchema.parse(response.data.data);
    },
    
    update: async (config: SystemConfig, userId: string): Promise<SystemConfig> => {
      const response = await apiProxy.post("", {
        path: "/system_config",
        method: "PUT",
        data: {
          user_id: userId,
          stripUserId: true,
          ...config,
        },
      });
      return SystemConfigSchema.parse(response.data.data);
    },
    
    delete: async (configId: string, userId: string): Promise<void> => {
      await apiProxy.post("", {
        path: `/system_config/${configId}`,
        method: "DELETE",
        data: {
          user_id: userId,
          stripUserId: true,
        },
      });
    },
  }
};