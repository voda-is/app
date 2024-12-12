import type { TelegramUser } from "./validations";
import { TelegramUserSchema } from "./validations";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { backButton, expandViewport, hapticFeedback, init, initDataStartParam, initDataUser, miniApp, settingsButton, viewport } from '@telegram-apps/sdk';

// telegram user data
export function getTelegramUser(mock: boolean = false): TelegramUser {
  if (mock) {
    return {
      id: 7699268464,
      first_name: "Sam",
    };
  }
  const initData = initDataUser();
  if (!initData) {
    throw new Error("Telegram user data not found");
  }
  const validatedTelegramData = TelegramUserSchema.parse(initData);
  return validatedTelegramData;
}

export function notificationOccurred(type: "error" | "success" | "warning") {
  if (hapticFeedback.isSupported()) {
    hapticFeedback.notificationOccurred(type);
  }
}

export function setupTelegramInterface(router: AppRouterInstance) {
  init();
  expandViewport();
  if (backButton.isSupported()) {
    backButton.show();
    backButton.onClick(() => {
      router.back();
    });
  }
  settingsButton.hide();
 
  const startParam = initDataStartParam();
  if (startParam) {
    // Decode the path and navigate to it
    const path = decodeURIComponent(startParam);
    router.push(path);
  }

  if (viewport.bindCssVars.isAvailable()) {
    viewport.bindCssVars();
  }
  miniApp.ready();
  notificationOccurred("success");
}

export function generateTelegramAppLink(botUsername: string, path: string): string {
  // Encode the path to make it URL-safe
  const encodedPath = encodeURIComponent(path);
  return `https://t.me/${botUsername}/app?startapp=${encodedPath}`;
}
