import { replacePlaceholders } from "./formatText";
import { UserProfilesCache } from "./userProfilesCache";
import { Character, ChatHistoryPair, User } from "./validations";

export interface Message {
  message: string;
  createdAt: number;

  user: User;
  character: Character;

  role: 'assistant' | 'user';
  status: 'success' | 'error' | 'pending';
  enableVoice: boolean;

  isLatestReply: boolean;
}
// TODO: maybe we can merge these two classes
export class ChatContext {
  private character: Character;
  private user: User;

  constructor(character: Character, user: User) {
    this.character = character;
    this.user = user;
  }

  private injectFirstMessage(createdAt: number): Message {
    return {
      message: replacePlaceholders(this.character.prompts.first_message, this.character.name, this.user.first_name),
      createdAt,

      user: this.user,
      character: this.character,
      role: "assistant",
      status: "success",
      enableVoice: this.character.metadata.enable_voice,
      isLatestReply: false,
    };
  }

  public injectHistoryMessages(messages: ChatHistoryPair[], createdAt: number) {
    let m = [this.injectFirstMessage(createdAt)];
    messages.forEach((pair) => {
      m.push({
        message: pair[0].text,
        createdAt: pair[0].created_at,

        user: this.user,
        character: this.character,
        role: "user",

        status: "success",
        enableVoice: this.character.metadata.enable_voice,
        isLatestReply: false,
      });

      m.push({
        message: pair[1].text,
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
      createdAt: Date.now() * 1000, // unix timestamp in seconds

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

export class ChatContextWithUnknownUser {
  private character: Character;
  private userCache: UserProfilesCache;
  private defaultUserId: string;

  constructor(character: Character, defaultUserId: string) {
    this.character = character;
    this.defaultUserId = defaultUserId;

    // ASSUME usercahce is ensured
    this.userCache = new UserProfilesCache();
  }

  public injectFirstMessage(userId: string, createdAt: number): Message {
    const user = this.userCache.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      message: replacePlaceholders(this.character.prompts.first_message, this.character.name, user.first_name),
      createdAt,

      user: user,
      character: this.character,
      role: "assistant",
      status: "success",
      enableVoice: this.character.metadata.enable_voice,
      isLatestReply: false,
    };
  }

  public injectHistoryMessages(messages: ChatHistoryPair[], createdAt: number): Message[] {
    let m: Message[] = [];
    if (messages.length) {
      m = [this.injectFirstMessage(messages[0][0].user_id, createdAt)];
    } else {
      m = [this.injectFirstMessage(this.defaultUserId, createdAt)];
    }

    messages.forEach((pair) => {
      const userId = pair[0].user_id;
      const user = this.userCache.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      m.push({
        message: pair[0].text,
        createdAt: pair[0].created_at,

        user: user,
        character: this.character,
        role: "user",
        status: "success",
        enableVoice: this.character.metadata.enable_voice,
        isLatestReply: false,
      });

      m.push({
        message: pair[1].text,
        createdAt: pair[1].created_at,

        user: user,
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

  public newUserMessage(pastMessage: Message[], message: string, userId: string): Message[] {
    const m = [...pastMessage];
    const user = this.userCache.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    m.push({
      message,
      createdAt: Date.now() * 1000, // unix timestamp in seconds

      user: user,
      character: this.character,
      role: "user",
      status: "pending",
      enableVoice: this.character.metadata.enable_voice,
      isLatestReply: false,
    });

    return m;
  }

  public popLastMessage(messages: Message[]): Message[] {
    const m = [...messages];
    m.pop();
    return m;
  }

  public markLastMessageAsError(messages: Message[]): Message[] {
    messages[messages.length - 1].status = "error";
    return messages;
  }
}
