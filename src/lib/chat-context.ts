import { replacePlaceholders } from "./formatText";
import { UserProfilesCache } from "./userProfilesCache";
import { Character, HistoryMessagePair, User } from "./types";

export interface Message {
  message: string;
  createdAt: number;

  user: User;
  character: Character;

  role: 'assistant' | 'user';
  status: 'success' | 'error' | 'pending';
  enableVoice: boolean;

  isLatestReply: boolean;
  response?: string;
}

export class ChatContext {
  private character: Character;
  private user: User;

  constructor(character: Character, user: User) {
    this.character = character;
    this.user = user;
  }

  private injectFirstMessage(createdAt: number): Message {
    return {
      message: replacePlaceholders(this.character.prompts.first_message, this.character.name, this.user.profile.first_name),
      createdAt,

      user: this.user,
      character: this.character,
      role: "assistant",
      status: "success",
      enableVoice: this.character.metadata.enable_voice,
      isLatestReply: false,
    };
  }

  public injectHistoryMessages(messages: HistoryMessagePair[], createdAt: number) {
    let m = [this.injectFirstMessage(createdAt)];
    messages.forEach((pair) => {
      m.push({
        message: pair[0].content,
        createdAt: pair[0].created_at,

        user: this.user,
        character: this.character,
        role: "user",

        status: "success",
        enableVoice: this.character.metadata.enable_voice,
        isLatestReply: false,
      });

      m.push({
        message: pair[1].content,
        createdAt: pair[1].created_at,

        user: this.user,
        character: this.character,
        role: "assistant",

        status: "success",
        enableVoice: this.character.metadata.enable_voice,
        isLatestReply: false,
      });
    });

    m[m.length - 1].isLatestReply = true;
    return m;
  }

  public newUserMessage(pastMessage: Message[], message: string) {
    const m = [...pastMessage];
    m.push({
      message,
      createdAt: Date.now() / 1000, // unix timestamp in seconds

      user: this.user,
      character: this.character,
      
      role: "user",
      status: "pending",
      enableVoice: this.character.metadata.enable_voice,
      isLatestReply: false,
    });

    return m;
  }

  public popLastMessage(messages: Message[]) {
    const m = [...messages];
    m.pop();
    return m;
  }

  public markLastMessageAsError(messages: Message[]) {
    messages[messages.length - 1].status = "error";
    return messages;
  }
}
