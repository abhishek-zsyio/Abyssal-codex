"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Check, Sparkles, Trash2, LayoutGrid } from "lucide-react";
import { useTheme, Theme } from "@/hooks/use-theme";
import { usePlugins } from "@/hooks/use-plugins";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES: { id: Theme; name: string; desc: string; color: string; accent: string }[] = [
  { id: 'dark', name: 'Abyssal Dark', desc: 'Technical brutalist experience. High contrast.', color: '#111111', accent: '#fabd2f' },
  { id: 'light', name: 'Abyssal Light', desc: 'Paper-like interface for high-glare environments.', color: '#fbf1c7', accent: '#b57614' },
  { id: 'nord', name: 'Nordic Frost', desc: 'Clean, north-bluish palette for focus.', color: '#2e3440', accent: '#88c0d0' },
  { id: 'monokai', name: 'Monokai Pro', desc: 'Classic developer aesthetic, kernel optimized.', color: '#272822', accent: '#a6e22e' },
  { id: 'cyberpunk', name: 'Cyber Neon', desc: 'High-contrast neon terminal vibe.', color: '#0d0221', accent: '#f00699' },
  { id: 'solarized', name: 'Solarized Nebula', desc: 'Precision-engineered for technical focus.', color: '#002b36', accent: '#b58900' },
  { id: 'dracula', name: 'Dracula Blood', desc: 'Dark theme for late-night sessions.', color: '#282a36', accent: '#bd93f9' },
  { id: 'onedark', name: 'One Dark Pro', desc: 'Modern balanced dark theme.', color: '#282c34', accent: '#61afef' },
  { id: 'github', name: 'GitHub Midnight', desc: 'Official midnight-dark look.', color: '#0d1117', accent: '#58a6ff' },
  { id: 'catppuccin', name: 'Catppuccin Mocha', desc: 'Soothing pastel theme for documentation.', color: '#1e1e2e', accent: '#cba6f7' },
  { id: 'rose-pine', name: 'Rosé Pine', desc: 'Ethereal shapes and colors. Natural vibe.', color: '#191724', accent: '#ebbcba' },
  { id: 'everforest', name: 'Everforest Dark', desc: 'Warm organic palette for writing.', color: '#2d353b', accent: '#a7c080' },
  { id: 'tokyo-night', name: 'Tokyo Night', desc: 'Celebrates the lights of Tokyo.', color: '#1a1b26', accent: '#bb9af7' },
  { id: 'tokyo-night-light', name: 'Tokyo Light', desc: 'Professional light variant of Tokyo Night.', color: '#d5d6db', accent: '#343b58' },
  { id: 'ayu', name: 'Ayu Mirage', desc: 'Refined dark theme with minimalist palette.', color: '#1f2430', accent: '#ffcc66' },
  { id: 'synthwave', name: 'Synthwave \'84', desc: 'Neon dreams and retro-futuristic vibes.', color: '#262335', accent: '#ff7edb' },
  { id: 'night-owl', name: 'Night Owl', desc: 'Deep blues for the late-night sessions.', color: '#011627', accent: '#c792ea' },
  { id: 'cobalt2', name: 'Cobalt2 Official', desc: 'High-contrast blue for power users.', color: '#193549', accent: '#ffc600' },
  { id: 'gruvbox-material', name: 'Gruvbox Material', desc: 'Natural version of the classic Gruvbox.', color: '#282828', accent: '#a89984' },
];

export default function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { theme: currentTheme, setTheme } = useTheme();
  const { isInstalled, uninstallPlugin } = usePlugins();
  const { toast } = useToast();

  const availableThemes = THEMES.filter(t => {
    if (['dark', 'light', 'catppuccin', 'rose-pine', 'everforest', 'tokyo-night', 'nord', 'tokyo-night-light'].includes(t.id)) return true;
    return isInstalled(`theme-${t.id}`);
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-4xl bg-[var(--background)] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/40">
              <div className="flex items-center gap-3">
                <Palette size={18} className="text-[var(--primary)]" />
                <div>
                  <h2 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">Interface_Styling</h2>
                  <span className="text-[7px] text-[var(--muted-foreground)] uppercase tracking-[0.2em] block">Visual_Core_Modules</span>
                </div>
              </div>
              <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Grid */}
            <div className="p-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {availableThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={cn(
                      "group relative flex flex-col text-left p-3 border transition-all duration-200 overflow-hidden",
                      currentTheme === theme.id 
                        ? "border-[var(--primary)] bg-[var(--primary)]/10" 
                        : "border-[var(--border)] bg-[var(--card)]/10 hover:border-[var(--muted-foreground)]/50"
                    )}
                  >
                    {/* Color Preview */}
                    <div className="w-full h-16 mb-3 border border-[var(--border)] relative overflow-hidden" style={{ backgroundColor: theme.color }}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--foreground)_0.5px,transparent_0)] bg-[length:8px_8px] opacity-[0.05]" />
                      <div className="absolute bottom-0 right-0 w-1/3 h-1/3" style={{ backgroundColor: theme.accent, opacity: 0.3 }} />
                      {currentTheme === theme.id && (
                        <div className="absolute top-1.5 right-1.5 bg-[var(--primary)] p-0.5">
                          <Check size={8} strokeWidth={4} className="text-[var(--background)]" />
                        </div>
                      )}
                    </div>

                    <h3 className={cn(
                      "text-[9px] font-bold uppercase tracking-wider mb-1",
                      currentTheme === theme.id ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                    )}>
                      {theme.name}
                    </h3>
                    
                    <p className="text-[8px] text-[var(--muted-foreground)] leading-tight opacity-60 h-6 line-clamp-2">
                      {theme.desc}
                    </p>

                    {/* Meta */}
                    <div className="mt-2 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between">
                       <span className="text-[7px] opacity-30">{theme.id}</span>
                       {currentTheme === theme.id && <Sparkles size={8} className="text-[var(--primary)]" />}
                    </div>

                    {/* Uninstall for custom themes */}
                    {!['dark', 'light', 'catppuccin', 'rose-pine', 'everforest', 'tokyo-night', 'nord', 'tokyo-night-light'].includes(theme.id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentTheme === theme.id) setTheme("dark");
                          uninstallPlugin(`theme-${theme.id}`);
                          toast(`Uninstalled ${theme.name}`, "info");
                        }}
                        className="absolute top-1 right-1 p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </button>
                ))}

                {/* More in Marketplace */}
                <button 
                  onClick={() => { /* maybe switch tab */ }}
                  className="flex flex-col items-center justify-center p-3 border border-dashed border-[var(--border)] bg-[var(--card)]/5 text-center opacity-40 hover:opacity-100 transition-opacity"
                >
                  <LayoutGrid size={14} className="mb-2" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">More Modules</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 h-9 bg-[var(--card)]/10 border-t border-[var(--border)] flex items-center justify-between opacity-50">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-[var(--primary)] rounded-full animate-pulse" />
                <span className="text-[7px] uppercase tracking-widest">Visual_Sensors: Stable</span>
              </div>
              <span className="text-[7px] uppercase tracking-widest">Codex_v4.0.1</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
