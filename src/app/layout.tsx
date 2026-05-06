import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

import TitleBar from "@/components/ui/TitleBar";
import { ThemeProvider } from "@/hooks/use-theme";

export const metadata: Metadata = {
  title: "Abyssal Codex | Technical Knowledge Base",
  description: "A professional, technical note-taking environment with a brutalist aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased selection:bg-[var(--primary)]/30 bg-[var(--background)] text-[var(--foreground)] h-screen overflow-hidden flex flex-col`}
      >
        <ThemeProvider>
          <TitleBar />
          <main className="flex-1 min-h-0 relative">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
