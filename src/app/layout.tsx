import "./globals.css";
import TitleBar from "@/components/ui/TitleBar";
import { AppProviders } from "@/components/providers/AppProviders";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Abyssal Codex",
    template: "%s | Abyssal Codex"
  },
  description: "Advanced Technical Brutalist Knowledge Nexus & Neural Network for developers and researchers.",
  keywords: ["knowledge base", "note-taking", "technical brutalist", "neural network", "markdown editor"],
  authors: [{ name: "Abyssal Team" }],
  creator: "Abyssal Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://abyssal-codex.vercel.app",
    siteName: "Abyssal Codex",
    title: "Abyssal Codex",
    description: "Technical Brutalist Knowledge Nexus",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Abyssal Codex" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abyssal Codex",
    description: "Technical Brutalist Knowledge Nexus",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
