"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { GraphThemeColors } from "@/types/graph";

export const useGraphTheme = (isOpen: boolean) => {
  const { theme } = useTheme();
  const [themeColors, setThemeColors] = useState<GraphThemeColors>({
    background: "#0d0d0d",
    foreground: "#ebdbb2",
    primary: "#fabd2f",
    accent: "#b8bb26",
    border: "#262626",
    muted: "#928374",
    card: "#141414",
    destructive: "#fb4934",
    secondary: "#222222"
  });

  const updateTheme = useCallback(() => {
    const style = getComputedStyle(document.documentElement);
    setThemeColors({
      background: style.getPropertyValue("--background").trim() || "#0d0d0d",
      foreground: style.getPropertyValue("--foreground").trim() || "#ebdbb2",
      primary: style.getPropertyValue("--primary").trim() || "#fabd2f",
      accent: style.getPropertyValue("--accent").trim() || "#b8bb26",
      border: style.getPropertyValue("--border").trim() || "#262626",
      muted: style.getPropertyValue("--muted-foreground").trim() || "#928374",
      card: style.getPropertyValue("--card").trim() || "#141414",
      destructive: style.getPropertyValue("--destructive").trim() || "#fb4934",
      secondary: style.getPropertyValue("--secondary").trim() || "#222222",
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer1 = setTimeout(updateTheme, 0);
      const timer2 = setTimeout(updateTheme, 50);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [theme, isOpen, updateTheme]);

  return themeColors;
};
