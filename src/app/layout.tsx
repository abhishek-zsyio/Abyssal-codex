import "./globals.css";
import TitleBar from "@/components/ui/TitleBar";
import { AppProviders } from "@/components/providers/AppProviders";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abyssal Codex",
  description: "Technical Brutalist Knowledge Nexus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="antialiased selection:bg-[var(--primary)]/30 bg-[var(--background)] text-[var(--foreground)] h-screen overflow-hidden flex flex-col font-sans"
      >
        <AppProviders>
          <TitleBar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
