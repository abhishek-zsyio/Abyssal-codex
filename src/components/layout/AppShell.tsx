"use client";

import React from "react";
import { AppProviders } from "@/components/providers/AppProviders";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      {children}
    </AppProviders>
  );
}
