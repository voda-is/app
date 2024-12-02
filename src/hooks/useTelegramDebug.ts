import { useEffect, useState } from 'react';

interface TelegramWebAppData {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
}

export function useTelegramDebug() {
  const [debug, setDebug] = useState<{
    webAppData: Partial<TelegramWebAppData>;
    error: string | null;
    isReady: boolean;
  }>({
    webAppData: {},
    error: null,
    isReady: false,
  });

  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      
      if (!tg) {
        setDebug(prev => ({
          ...prev,
          error: 'Telegram WebApp is not available',
        }));
        return;
      }

      // Mark as ready when Telegram.WebApp is available
      tg.ready();

      const webAppData = {
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
      };

      setDebug({
        webAppData,
        error: null,
        isReady: true,
      });
    } catch (error) {
      setDebug(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, []);

  return debug;
} 