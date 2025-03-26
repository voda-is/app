import { z } from 'zod';

// Basic type definitions
export type CryptoHash = string;
export type Timestamp = number;

// Basic validations
export const CryptoHashSchema = z.string();
export const TimestampSchema = z.number().int().positive();

// Character related schemas
export const CharacterMetadataSchema = z.object({
  creator: z.string(),
  version: z.string(),
  enable_voice: z.boolean(),
  enable_roleplay: z.boolean().default(false),
});

export const CharacterPromptsSchema = z.object({
  scenario_prompt: z.string(),
  personality_prompt: z.string(),
  example_dialogue: z.string(),
  first_message: z.string(),
});

export const CharacterSchema = z.object({
  _id: CryptoHashSchema,
  name: z.string(),
  description: z.string(),
  metadata: CharacterMetadataSchema,
  prompts: CharacterPromptsSchema,
  tags: z.array(z.string()),
  background_image_url: z.string().optional(),
  avatar_image_url: z.string().optional(),
  voice_model_id: z.string().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  published_at: TimestampSchema,
});

// User related schemas
export enum UserRole {
  Admin = 'admin',
  User = 'user'
}

export enum UserProvider {
  Telegram = 'telegram',
  Google = 'google',
  X = 'x',
  CryptoWallet = 'crypto_wallet'
}

export const UserProfileSchema = z.object({
  id: CryptoHashSchema,
  user_personality: z.array(z.string()),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

// User points schema
export const UserPointsSchema = z.object({
  id: CryptoHashSchema,
  running_claimed_balance: z.number().int().nonnegative(),
  running_purchased_balance: z.number().int().nonnegative(),
  running_misc_balance: z.number().int().nonnegative(),
  balance_usage: z.number().int().nonnegative(),
  free_balance_claimed_at: TimestampSchema,
  last_balance_deduction_at: TimestampSchema,
});

export const UserUsageSchema = z.object({
  created_at: TimestampSchema,
  model_name: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number()
  })
});

export const UserSchema = z.object({
  _id: CryptoHashSchema,
  user_id: z.string(),
  role: z.nativeEnum(UserRole).default(UserRole.User),
  provider: z.nativeEnum(UserProvider),
  network_name: z.string().optional(),
  profile: UserProfileSchema,
  points: UserPointsSchema,
  usage: z.array(UserUsageSchema),
  last_active: TimestampSchema,
  created_at: TimestampSchema,
});

// Conversation history schemas
export enum MessageRole {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
  ToolCall = 'tool_call'
}

export enum MessageType {
  Text = 'text',
  Image = 'image',
  Audio = 'audio'
}

export const HistoryMessageSchema = z.object({
  owner: CryptoHashSchema,
  character_id: CryptoHashSchema,
  role: z.nativeEnum(MessageRole),
  content_type: z.nativeEnum(MessageType),
  content: z.string(),
  function_call_request: z.array(z.object({
    name: z.string(),
    arguments: z.string()
  })),
  function_call_response: z.array(z.string()),
  created_at: TimestampSchema,
});

export const HistoryMessagePairSchema = z.tuple([HistoryMessageSchema, HistoryMessageSchema]);
export const ConversationMemorySchema = z.object({
  _id: CryptoHashSchema,
  public: z.boolean(),
  is_concluded: z.boolean(),
  owner_id: CryptoHashSchema,
  character_id: CryptoHashSchema,
  history: z.array(HistoryMessagePairSchema),
  updated_at: TimestampSchema,
  created_at: TimestampSchema,
});

// Generic API Response schema
export const GenericResponseSchema = z.object({
  status: z.number().int().positive(),
  message: z.string(),
  data: z.unknown(), // We'll validate this based on the endpoint
});

// Helper function to validate the data field based on the expected schema
export function validateResponse<T>(
  response: z.infer<typeof GenericResponseSchema>,
  schema: z.ZodType<T>
): T {
  return schema.parse(response.data);
}

// User payload schema for registration/update
export const UserPayloadSchema = z.object({
  user_id: z.string(),
  network_name: z.string().optional(),
  username: z.string().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  profile_photo: z.string().optional(),
});

export type TTSStatus = 'generating' | 'complete' | 'error';
export interface TTSEntry {
  text: string;
  audioBlob: Blob;
  status: TTSStatus;
}

// Character list brief schema
export const CharacterListBriefSchema = z.object({
  character_id: CryptoHashSchema,
  character_name: z.string(),
  character_image: z.string().optional(),
  count: z.number().int().nonnegative(),
});

// URL Schema
export const UrlSchema = z.object({
  _id: CryptoHashSchema,
  created_at: TimestampSchema,
  url_type: z.string(),
  created_by: CryptoHashSchema,
  used_by: z.array(CryptoHashSchema),
  path: z.string(),
});


// Gitcoin Grant schema
export const GitcoinGrantSchema = z.object({
  _id: CryptoHashSchema,
  name: z.string(),
  description: z.string(),
  url: z.string(),
  twitter: z.string(),
  recipient_id: z.string(),
});

export type CharacterMetadata = z.infer<typeof CharacterMetadataSchema>;
export type CharacterPrompts = z.infer<typeof CharacterPromptsSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserPoints = z.infer<typeof UserPointsSchema>;
export type UserUsage = z.infer<typeof UserUsageSchema>;
export type User = z.infer<typeof UserSchema>;
export type HistoryMessage = z.infer<typeof HistoryMessageSchema>;
export type HistoryMessagePair = z.infer<typeof HistoryMessagePairSchema>;
export type ConversationMemory = z.infer<typeof ConversationMemorySchema>;

export type UserPayload = z.infer<typeof UserPayloadSchema>;
export type CharacterListBrief = z.infer<typeof CharacterListBriefSchema>;
export type Url = z.infer<typeof UrlSchema>;
export type GitcoinGrant = z.infer<typeof GitcoinGrantSchema>;


///// Misc types /////

// OAuth User schema
export const OAuthUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  image: z.string().nullable(),
  provider: z.string().nullable()
});

export type OAuthUser = z.infer<typeof OAuthUserSchema>;

// Define schema for Telegram WebApp user data
export const TelegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  photo_url: z.string().optional(),
});

export type TelegramUser = z.infer<typeof TelegramUserSchema>;
