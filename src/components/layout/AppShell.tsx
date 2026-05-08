"use client";

import React from "react";
import TitleBar from "@/components/ui/TitleBar";
import { AppProviders } from "@/components/providers/AppProviders";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <TitleBar />
      {children}
    </AppProviders>
  );
}
