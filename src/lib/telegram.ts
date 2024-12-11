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
  console.log("telegramData", telegramData);
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
