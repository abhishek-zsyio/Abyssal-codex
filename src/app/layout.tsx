import "./globals.css";
import TitleBar from "@/components/ui/TitleBar";
import { AppProviders } from "@/components/providers/AppProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
