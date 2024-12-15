import type { TelegramUser } from "./validations";
import { TelegramUserSchema } from "./validations";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

declare global {
  interface Window {
    Telegram: {
      WebApp: WebApp;
    };
  }
}

// telegram user data
export function getTelegramUser(mock: boolean = true): TelegramUser {
  if (mock) {
    return {
      id: 7699268464,
      first_name: "Sam",
    };
  }

  const telegramData = window.Telegram.WebApp.initDataUnsafe.user;
  if (!telegramData) {
    throw new Error("Telegram user data not found");
  }
  const validatedTelegramData = TelegramUserSchema.parse(telegramData);
  return validatedTelegramData;
}

export function notificationOccurred(type: "error" | "success" | "warning") {
  window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
}

export function setupTelegramInterface(router: AppRouterInstance) {
  const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
  if (startParam) {
    if (startParam.length === 128) {
      const path = "/chatroomMessage/" + startParam.slice(0, 64) + "/" + startParam.slice(64, 128);
      router.push(path);
    } else {
      router.push("/");
    }
  }
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.BackButton.show();
  window.Telegram.WebApp.SettingsButton.hide();
  window.Telegram.WebApp.BackButton.onClick(() => {
    router.back();
  });
  notificationOccurred("success");
}

export function isOnTelegram() {
  return typeof window !== 'undefined' && window.Telegram.WebApp.initDataUnsafe.user != null;
}

// Example function to generate a Telegram Mini App link
export function generateTelegramAppLink(botUsername: string, path: string): string {
  const p = path.replace("chatroomMessage", "").split("/").join("");
  return `https://t.me/${botUsername}?startapp=${p}`;
}
