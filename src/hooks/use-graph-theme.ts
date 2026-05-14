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

  // Convert any CSS color to #rrggbb via an offscreen canvas
  const normalizeColor = useCallback((raw: string, fallback: string): string => {
    if (!raw) return fallback;
    const tmp = document.createElement("canvas");
    tmp.width = 1; tmp.height = 1;
    const ctx = tmp.getContext("2d");
    if (!ctx) return fallback;
    ctx.fillStyle = raw.startsWith("#") || raw.startsWith("rgb") ? raw : `#${raw}`;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
  }, []);


  const updateTheme = useCallback(() => {
    const style = getComputedStyle(document.documentElement);
    const get = (v: string, fb: string) => normalizeColor(style.getPropertyValue(v).trim(), fb);
    setThemeColors({
      background:  get("--background",       "#0d0d0d"),
      foreground:  get("--foreground",       "#ebdbb2"),
      primary:     get("--primary",          "#fabd2f"),
      accent:      get("--accent",           "#b8bb26"),
      border:      get("--border",           "#262626"),
      muted:       get("--muted-foreground", "#928374"),
      card:        get("--card",             "#141414"),
      destructive: get("--destructive",      "#fb4934"),
      secondary:   get("--secondary",        "#222222"),
    });
  }, [normalizeColor]);

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
