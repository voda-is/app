import { z } from 'zod';

// Basic validations
export const CryptoHashSchema = z.string();
export const TimestampSchema = z.number().int().positive();

// User schema
export const UserSchema = z.object({
  _id: CryptoHashSchema,
  user_id: z.string(),
  username: z.string().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  profile_photo: z.string().optional(),
  last_active: TimestampSchema,
  created_at: TimestampSchema,
});

// Character related schemas
export const CharacterMetadataSchema = z.object({
  creator: z.string(),
  version: z.string(),
  status: z.enum(['initialized', 'active', 'inactive']),
  enable_voice: z.boolean(),
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
  telegram_handle: z.string().optional(),
  telegram_token: z.string().optional(),
  background_image_url: z.string().optional(),
  avatar_image_url: z.string().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  published_at: TimestampSchema,
  voice_model_id: z.string().optional(),
});

// Conversation history schemas
export const ContentTypeSchema = z.enum(['text', 'image']);

export const HistoryMessageSchema = z.object({
  user_id: CryptoHashSchema,
  created_at: TimestampSchema,
  content_type: ContentTypeSchema,
  text: z.string(),
  status: z.enum(['error', 'sent']),
});

// Update to pair messages together
export const ChatHistoryPairSchema = z.tuple([HistoryMessageSchema, HistoryMessageSchema]);

export const ConversationHistorySchema = z.object({
  _id: CryptoHashSchema,
  public: z.boolean(),
  is_concluded: z.boolean(),

  owner_id: CryptoHashSchema,
  character_id: CryptoHashSchema,

  history: z.array(ChatHistoryPairSchema),

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
  username: z.string().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  profile_photo: z.string().optional(),
});

// Define schema for Telegram WebApp user data
export const TelegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  photo_url: z.string().optional(),
});

// Infer types from schemas
export type Character = z.infer<typeof CharacterSchema>;
export type CharacterMetadata = z.infer<typeof CharacterMetadataSchema>;
export type CharacterPrompts = z.infer<typeof CharacterPromptsSchema>;
export type ContentType = z.infer<typeof ContentTypeSchema>;
export type HistoryMessage = z.infer<typeof HistoryMessageSchema>;
export type ConversationHistory = z.infer<typeof ConversationHistorySchema>;
export type User = z.infer<typeof UserSchema>;
export type UserPayload = z.infer<typeof UserPayloadSchema>;
export type TelegramUser = z.infer<typeof TelegramUserSchema>;

export type TTSStatus = 'generating' | 'complete' | 'error';

export interface TTSEntry {
  text: string;
  audioBlob: Blob;
  status: TTSStatus;
}

// Update the type export
export type ChatHistoryPair = z.infer<typeof ChatHistoryPairSchema>;

export const ChatroomSchema = z.object({
  _id: CryptoHashSchema,
  character_id: CryptoHashSchema,
  
  user_on_stage: CryptoHashSchema,
  
  user_hijacking: CryptoHashSchema.optional(),
  hijacking_time: z.number().int().positive().optional(),
  
  current_stage_nonce: z.number().int().nonnegative(),
  
  // Array of tuples containing [nonce, message_id]
  messages: z.array(z.tuple([
    z.number().int().nonnegative(),
    CryptoHashSchema
  ])),
  
  // Sets of user IDs
  historical_audience: z.array(CryptoHashSchema),
  current_audience: z.array(CryptoHashSchema),
  
  updated_at: z.number().int().positive(),
  created_at: z.number().int().positive(),
});

// Type inference
export type Chatroom = z.infer<typeof ChatroomSchema>;

export const ChatroomMessagesSchema = z.object({
  _id: CryptoHashSchema,
  is_conclued: z.boolean(),
  
  history: z.array(ChatHistoryPairSchema),
  
  users: z.array(CryptoHashSchema), // Set of user IDs who sent messages
  
  updated_at: z.number().int().positive(),
  created_at: z.number().int().positive(),
});

// Type inference
export type ChatroomMessages = z.infer<typeof ChatroomMessagesSchema>;
