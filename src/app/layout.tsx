'use client'
import "./globals.css";

import { Inter } from "next/font/google";
import { Providers } from "./providers";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { setupTelegramInterface } from "@/lib/telegram";

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
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Providers>
          <main>{children}</main>
          {/* <TelegramDebug /> */}
        </Providers>
      </body>
    </html>
  );
}
