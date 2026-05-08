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
      e.stopPropagation();
      return false;
    };
    
    // Most aggressive suppression possible
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.oncontextmenu = handleContextMenu as any;
    
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
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
