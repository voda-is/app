import { HistoryMessage, TTSEntry } from "@/lib/validations";

// Define context types for each mutation
export interface SendMessageContext {
  previousMessages: HistoryMessage[] | undefined;
  userMessage: HistoryMessage;
}
  
export interface RetryMessageContext {
  userMessage: HistoryMessage;
}
  
export interface RegenerateContext {
  previousMessages: HistoryMessage[] | undefined;
}
  
export interface TTSContext {
  previousTTS: TTSEntry[] | undefined;
}