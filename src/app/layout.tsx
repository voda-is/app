import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TelegramDebug } from "@/components/TelegramDebug";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fine",
  description: "Fine AI Characters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <Providers>
          <main className="min-h-screen">
            {children}
          </main>
          <TelegramDebug />
        </Providers>
      </body>
    </html>
  );
}
