import { z } from 'zod';

// Basic validations
export const CryptoHashSchema = z.string();
export const TimestampSchema = z.number().int().positive();


export const OAuthUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstName: z.string(),

  lastName: z.string().nullable(),
  image: z.string().nullable(),
  provider: z.string().nullable()
});

export type OAuthUser = z.infer<typeof OAuthUserSchema>;

// User schema
export const UserSchema = z.object({
  _id: CryptoHashSchema,
  user_id: z.string(),
  provider: z.enum(['google', 'x', 'telegram']),
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
  enable_voice: z.boolean(),
  enable_roleplay: z.boolean().default(false),
  enable_chatroom: z.boolean().default(false),
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

export const FunctionCallSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  image: z.string(),
  reasoning: z.string(),
});

export const ChatroomMessagesSchema = z.object({
  _id: CryptoHashSchema,
  is_wrapped: z.boolean(),
  wrapped_by: CryptoHashSchema.optional(),
  function_call: FunctionCallSchema.optional(),
  
  sol_mint_address: z.string().optional(),
  eth_mint_address: z.string().optional(),
  
  sol_create_tx_hash: z.string().optional(),
  eth_create_tx_hash: z.string().optional(),
  
  history: z.array(ChatHistoryPairSchema),
  
  updated_at: TimestampSchema,
  created_at: TimestampSchema,
});

// Add type inference for FunctionCall
export type FunctionCall = z.infer<typeof FunctionCallSchema>;
// Update ChatroomMessages type inference
export type ChatroomMessages = z.infer<typeof ChatroomMessagesSchema>;

// Schema for UserPoints
export const UserPointsSchema = z.object({
  _id: CryptoHashSchema,
  
  paid_avaliable_balance: z.number().int().nonnegative(),
  paid_pending_balance: z.number().int().nonnegative(),
  
  free_claimed_balance: z.number().int().nonnegative(),
  redeemed_balance: z.record(CryptoHashSchema, z.number().int().nonnegative()),
  total_burnt_balance: z.number().int().nonnegative(),

  paid_balance_updated_at: TimestampSchema,
  free_claimed_balance_updated_at: TimestampSchema,
  redeemed_balance_updated_at: TimestampSchema,
});

// Type inference
export type UserPoints = z.infer<typeof UserPointsSchema>;

export const MessageBriefSchema = z.object({
  id: CryptoHashSchema,
  wrapped_by: CryptoHashSchema,
  is_wrapped: z.boolean(),
  function_call: FunctionCallSchema.optional(),
  sol_mint_address: z.string().optional(),
  eth_mint_address: z.string().optional(),
  sol_create_tx_hash: z.string().optional(),
  eth_create_tx_hash: z.string().optional(),
  timestamp: z.number().int().positive(),
});

// Add type inference
export type MessageBrief = z.infer<typeof MessageBriefSchema>;

// Token Creation Record Schema
export const TokenCreationRecordSchema = z.object({
  function_call: FunctionCallSchema,
  user_id: CryptoHashSchema,
  is_success: z.boolean(),
  sol_tx_hash: z.string().optional(),
  sol_mint_address: z.string().optional(),
  eth_tx_hash: z.string().optional(),
  eth_mint_address: z.string().optional(),
});

// Buy Token Record Schema
export const BuyTokenRecordSchema = z.object({
  sol_amount: z.number().int().nonnegative().optional(),
  eth_amount: z.number().int().nonnegative().optional(),
  sol_mint_address: z.string().optional(),
  eth_mint_address: z.string().optional(),
  is_success: z.boolean(),
  sol_tx_hash: z.string().optional(),
  eth_tx_hash: z.string().optional(),
});

// Sell Token Record Schema
export const SellTokenRecordSchema = z.object({
  sol_token_percentage: z.number().int().nonnegative().optional(),
  eth_token_percentage: z.number().int().nonnegative().optional(),
  sol_mint_address: z.string().optional(),
  eth_mint_address: z.string().optional(),
  is_success: z.boolean(),
  sol_token_amount: z.number().int().nonnegative().optional(),
  sol_tx_hash: z.string().optional(),
  eth_token_amount: z.string().optional(), // hex string
  eth_tx_hashes: z.array(CryptoHashSchema).optional(),
});

// Withdraw Record Schema
export const WithdrawRecordSchema = z.object({
  amount_in_sol: z.number().int().nonnegative().optional(),
  amount_in_eth: z.number().int().nonnegative().optional(),
  withdraw_to_eth_address: z.string().optional(),
  withdraw_to_sol_address: z.string().optional(),
  is_success: z.boolean(),
  sol_tx_hash: z.string().optional(),
  eth_tx_hash: z.string().optional(),
});

// Transaction Record Types Schema
export const TransactionRecordTypesSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('TokenCreation'), data: TokenCreationRecordSchema }),
  z.object({ type: z.literal('BuyToken'), data: BuyTokenRecordSchema }),
  z.object({ type: z.literal('SellToken'), data: SellTokenRecordSchema }),
  z.object({ type: z.literal('Withdraw'), data: WithdrawRecordSchema }),
]);

// Transaction Record Schema
export const TransactionRecordSchema = z.object({
  _id: CryptoHashSchema,
  created_at: TimestampSchema,
  user_id: CryptoHashSchema,
  chatroom_message_id: CryptoHashSchema.optional(),
  transaction: TransactionRecordTypesSchema,
});

// Type exports
export type TokenCreationRecord = z.infer<typeof TokenCreationRecordSchema>;
export type BuyTokenRecord = z.infer<typeof BuyTokenRecordSchema>;
export type SellTokenRecord = z.infer<typeof SellTokenRecordSchema>;
export type WithdrawRecord = z.infer<typeof WithdrawRecordSchema>;
export type TransactionRecordTypes = z.infer<typeof TransactionRecordTypesSchema>;
export type TransactionRecord = z.infer<typeof TransactionRecordSchema>;

// Add TokenInfo schema
export const TokenInfoSchema = z.object({
  sol_balance: z.number().int().nonnegative(),
  eth_balance: z.number().int().nonnegative(),
  sol_price: z.number().positive(),
  eth_price: z.number().positive(),
});

// Add type inference
export type TokenInfo = z.infer<typeof TokenInfoSchema>;

// Add CharacterListBrief schema
export const CharacterListBriefSchema = z.object({
  character_id: CryptoHashSchema,
  character_name: z.string(),
  character_image: z.string().optional(),
  count: z.number().int().nonnegative(),
});

// Add type inference
export type CharacterListBrief = z.infer<typeof CharacterListBriefSchema>;

// URL Schema
export const UrlSchema = z.object({
  _id: CryptoHashSchema,
  created_at: TimestampSchema,
  
  url_type: z.string(),
  created_by: CryptoHashSchema,
  used_by: z.array(CryptoHashSchema),
  
  path: z.string(),
});

// Add type inference
export type Url = z.infer<typeof UrlSchema>;
