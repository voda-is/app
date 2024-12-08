import { TTSEntry } from "@/lib/validations";
  
export interface TTSContext {
  previousTTS: TTSEntry[] | undefined;
}