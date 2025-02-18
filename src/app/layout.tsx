'use client'
import "./globals.css";

import { Inter } from "next/font/google";
import { Providers } from "./providers";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react"

import { setupTelegramInterface } from "@/lib/telegram";
import { useUser } from "@/hooks/api";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    setupTelegramInterface(router);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body className={`${inter.className} bg-gray-800 text-white`}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://analytics.fine.wtf/script.js" 
          data-website-id="921b7b12-1961-4bc8-8eb1-bb0cfe1d26a7" 
          strategy="afterInteractive"
        />
        <SessionProvider>
          <Providers>
            <main>{children}</main>
            {/* <TelegramDebug /> */}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
