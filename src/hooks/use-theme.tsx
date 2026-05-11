"use client";

import { useState, useEffect, createContext, useContext } from "react";

export type Theme = "dark" | "light" | "nord" | "monokai" | "cyberpunk" | "catppuccin" | "rose-pine" | "everforest" | "tokyo-night" | "pale-light" | string;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    
    if (newTheme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("abyssal-theme") as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("dark");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("abyssal-theme", newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'dark', setTheme: () => {}, toggleTheme: () => {} };
  }
  return context;
}
