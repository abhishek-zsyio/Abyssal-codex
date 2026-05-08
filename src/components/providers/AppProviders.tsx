"use client";

import React from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { PluginProvider } from "@/context/PluginContext";
import { ToastProvider } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/Toast";


export function AppProviders({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    window.oncontextmenu = handleContextMenu as any;
    
    return () => {
      window.oncontextmenu = null;
    };
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <PluginProvider>
          {children}
          <ToastContainer />
        </PluginProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
