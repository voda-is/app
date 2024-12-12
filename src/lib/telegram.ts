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
export function getTelegramUser(mock: boolean = false): TelegramUser {
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
  if (isOnTelegram()) {
    window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
  }
}

export function setupTelegramInterface(router: AppRouterInstance) {
  const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
  if (startParam) {
    // Decode the path and navigate to it
    const path = decodeURIComponent(startParam);
    router.push(path);
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
  return (
    window.Telegram &&
    window.Telegram.WebApp &&
    window.Telegram.WebApp.initDataUnsafe
  );
}

export function generateTelegramAppLink(botUsername: string, path: string): string {
  // Encode the path to make it URL-safe
  const encodedPath = encodeURIComponent(path);
  return `https://t.me/${botUsername}/app?startapp=${encodedPath}`;
}
