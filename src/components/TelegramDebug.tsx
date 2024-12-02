'use client';

import { useTelegramDebug } from '@/hooks/useTelegramDebug';

export function TelegramDebug() {
  const { webAppData, error, isReady } = useTelegramDebug();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-4 font-mono text-xs overflow-auto max-h-[50vh]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Telegram WebApp Debug</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isReady ? 'Ready' : 'Not Ready'}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 p-2 rounded mb-2">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {/* Init Data */}
        <DebugSection 
          title="Init Data" 
          data={webAppData.initData} 
        />

        {/* User Info */}
        <DebugSection 
          title="User Info" 
          data={webAppData.initDataUnsafe?.user} 
        />

        {/* Auth Info */}
        <DebugSection 
          title="Auth Info" 
          data={{
            auth_date: webAppData.initDataUnsafe?.auth_date,
            hash: webAppData.initDataUnsafe?.hash,
          }} 
        />

        {/* Platform Info */}
        <DebugSection 
          title="Platform Info" 
          data={{
            version: webAppData.version,
            platform: webAppData.platform,
            colorScheme: webAppData.colorScheme,
          }} 
        />

        {/* Viewport Info */}
        <DebugSection 
          title="Viewport Info" 
          data={{
            viewportHeight: webAppData.viewportHeight,
            viewportStableHeight: webAppData.viewportStableHeight,
            isExpanded: webAppData.isExpanded,
          }} 
        />

        {/* Theme Info */}
        <DebugSection 
          title="Theme Params" 
          data={webAppData.themeParams} 
        />
      </div>
    </div>
  );
}

function DebugSection({ title, data }: { title: string; data: any }) {
  if (!data) return null;
  
  return (
    <div className="border border-white/10 rounded p-2">
      <h4 className="font-bold mb-1">{title}</h4>
      <pre className="whitespace-pre-wrap break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
} 