/**
 * Configuration for character display text based on tags
 * This file centralizes UI text customizations for different character types
 */

type DisplayConfig = {
  publicConversationsLabel: string;
  chatButtonLabel: string;
  emptyConversationsMessage: string;
  // Add more configurable text elements as needed
};

// Default configuration
const defaultConfig: DisplayConfig = {
  publicConversationsLabel: "Public Conversations",
  chatButtonLabel: "Start Chatting",
  emptyConversationsMessage: "No conversations yet",
};

// Tag-specific configurations
const tagConfigs: Record<string, Partial<DisplayConfig>> = {
  // Donation/Gitcoin related
  "gitcoin": {
    publicConversationsLabel: "Donated Conversations",
  },
  "donation": {
    publicConversationsLabel: "Donated Conversations",
  },
  "charity": {
    publicConversationsLabel: "Donated Conversations",
  },
  
  // Storytelling related
  "storyteller": {
    publicConversationsLabel: "Shared Stories",
    chatButtonLabel: "Start a Story",
    emptyConversationsMessage: "No stories yet",
  },
  "story": {
    publicConversationsLabel: "Shared Stories",
  },
  
  // Education related
  "teacher": {
    publicConversationsLabel: "Shared Lessons",
    chatButtonLabel: "Start Learning",
  },
  "tutor": {
    publicConversationsLabel: "Shared Lessons",
  },
  "education": {
    publicConversationsLabel: "Shared Lessons",
  },
  
  // Game related
  "game": {
    publicConversationsLabel: "Shared Adventures",
    chatButtonLabel: "Start Adventure",
  },
  "rpg": {
    publicConversationsLabel: "Shared Adventures",
    chatButtonLabel: "Start Adventure",
  },
  
  // Add more tag-specific configurations as needed
};

/**
 * Get display configuration based on character tags
 * @param tags Array of character tags
 * @returns Display configuration object
 */
export function getCharacterDisplayConfig(tags: string[]): DisplayConfig {
  // Start with default config
  const config = { ...defaultConfig };
  
  // Apply tag-specific overrides if the character has matching tags
  tags.forEach(tag => {
    const tagConfig = tagConfigs[tag.toLowerCase()];
    if (tagConfig) {
      Object.assign(config, tagConfig);
    }
  });
  
  return config;
} 