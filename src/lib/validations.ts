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
});

// Conversation history schemas
export const ContentTypeSchema = z.enum(['text', 'image']);

export const HistoryMessageSchema = z.object({
  role: z.string(),
  created_at: TimestampSchema,
  type: ContentTypeSchema,
  text: z.string(),
  status: z.enum(['error', 'sending', 'sent']),
});

export const ConversationHistorySchema = z.object({
  _id: CryptoHashSchema,
  char_id: CryptoHashSchema,
  user_id: z.string(),
  nonce: z.number().int().nonnegative(),
  history: z.array(HistoryMessageSchema),
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
