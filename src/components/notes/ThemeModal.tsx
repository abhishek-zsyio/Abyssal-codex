"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Check, Sparkles, Trash2 } from "lucide-react";
import { useTheme, Theme } from "@/hooks/use-theme";
import { usePlugins } from "@/hooks/use-plugins";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES: { id: Theme; name: string; desc: string; color: string; accent: string }[] = [
  { 
    id: 'dark', 
    name: 'Abyssal Dark', 
    desc: 'The original technical brutalist experience. High contrast, industrial tones.',
    color: '#111111',
    accent: '#fabd2f'
  },
  { 
    id: 'light', 
    name: 'Abyssal Light', 
    desc: 'A professional, paper-like interface for high-glare environments.',
    color: '#fbf1c7',
    accent: '#b57614'
  },
  { 
    id: 'nord', 
    name: 'Nordic Frost', 
    desc: 'Clean, north-bluish palette for focused long-form technical writing.',
    color: '#2e3440',
    accent: '#88c0d0'
  },
  { 
    id: 'monokai', 
    name: 'Monokai Pro', 
    desc: 'The classic developer aesthetic, optimized for the Codex kernel.',
    color: '#272822',
    accent: '#a6e22e'
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyber Neon', 
    desc: 'High-contrast dystopian terminal vibe. Recommended for night operations.',
    color: '#0d0221',
    accent: '#f00699'
  },
  { 
    id: 'solarized', 
    name: 'Solarized Nebula', 
    desc: 'The legendary precision-engineered palette for technical focus.',
    color: '#002b36',
    accent: '#b58900'
  },
  { 
    id: 'dracula', 
    name: 'Dracula Blood', 
    desc: 'A dark theme for vampires and those who stay up until 4 AM.',
    color: '#282a36',
    accent: '#bd93f9'
  },
  { 
    id: 'onedark', 
    name: 'One Dark Pro', 
    desc: 'The most balanced dark theme for the modern terminal era.',
    color: '#282c34',
    accent: '#61afef'
  },
  { 
    id: 'github', 
    name: 'GitHub Midnight', 
    desc: 'The official midnight-dark look from the home of all code.',
    color: '#0d1117',
    accent: '#58a6ff'
  },
  { 
    id: 'catppuccin', 
    name: 'Catppuccin Mocha', 
    desc: 'Soothing pastel theme for high-fidelity technical documentation.',
    color: '#1e1e2e',
    accent: '#cba6f7'
  },
  { 
    id: 'rose-pine', 
    name: 'Rosé Pine', 
    desc: 'All natural pine, ethereal shapes and colors. Very aesthetic.',
    color: '#191724',
    accent: '#ebbcba'
  },
  { 
    id: 'everforest', 
    name: 'Everforest Dark', 
    desc: 'Organic and warm palette designed for long writing sessions.',
    color: '#2d353b',
    accent: '#a7c080'
  },
  { 
    id: 'tokyo-night', 
    name: 'Tokyo Night', 
    desc: 'A clean dark theme that celebrates the lights of Tokyo at night.',
    color: '#1a1b26',
    accent: '#bb9af7'
  },
];

export default function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { theme: currentTheme, setTheme } = useTheme();
  const { isInstalled, uninstallPlugin } = usePlugins();
  const { toast } = useToast();

  const availableThemes = THEMES.filter(t => {
    if (['dark', 'light', 'catppuccin', 'rose-pine', 'everforest', 'tokyo-night', 'nord'].includes(t.id)) return true;
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-4xl bg-[var(--background)] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Technical Header */}
              <div className="px-8 py-6 border-b border-dotted border-[var(--border)] flex items-center justify-between bg-[var(--card)]/30">
                <div>
                  <span className="text-[8px] font-mono text-[var(--primary)] uppercase tracking-[0.4em] block mb-1">
                    VISUAL_KERNEL // INTERFACE_STYLING
                  </span>
                  <h2 className="text-xl font-bold font-mono text-[var(--foreground)] uppercase tracking-widest flex items-center gap-3">
                    <Palette size={20} className="text-[var(--primary)]" />
                    Theme_Library
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors border border-transparent hover:border-[var(--primary)]/20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Theme Grid */}
              <div className="p-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableThemes.map((theme) => (
                    <motion.div
                      key={theme.id}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTheme(theme.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setTheme(theme.id);
                        }
                      }}
                      className={cn(
                        "group relative flex flex-col text-left p-5 border transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary)]",
                        currentTheme === theme.id 
                          ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-[0_0_20px_rgba(250,189,47,0.1)]" 
                          : "border-[var(--border)] bg-[var(--card)]/20 hover:border-[var(--muted-foreground)]"
                      )}
                    >
                      {/* Selection Badge */}
                      <AnimatePresence>
                        {currentTheme === theme.id && (
                          <motion.div 
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute top-0 right-0 p-2 bg-[var(--primary)] text-[var(--background)]"
                          >
                            <Check size={12} strokeWidth={4} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Theme Preview Swatch */}
                      <div 
                        className="w-full h-24 mb-4 border border-[var(--border)] relative overflow-hidden"
                        style={{ backgroundColor: theme.color }}
                      >
                        <div 
                          className="absolute bottom-0 right-0 w-1/2 h-1/2" 
                          style={{ backgroundColor: theme.accent, opacity: 0.2 }} 
                        />
                        <div className="absolute inset-0 tech-grid opacity-10" />
                        
                        {/* Fake UI elements in preview */}
                        <div className="absolute top-2 left-2 flex gap-1">
                           <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.accent }} />
                           <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.accent, opacity: 0.5 }} />
                        </div>
                        <div className="absolute bottom-2 left-2 w-12 h-1" style={{ backgroundColor: theme.accent, opacity: 0.3 }} />
                      </div>

                      <h3 className={cn(
                        "text-[11px] font-bold uppercase tracking-wider mb-2 transition-colors",
                        currentTheme === theme.id ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                      )}>
                        {theme.name}
                      </h3>
                      
                      <p className="text-[9px] font-mono text-[var(--muted-foreground)] leading-relaxed uppercase opacity-70">
                        {theme.desc}
                      </p>

                      {/* Active Label */}
                      {currentTheme === theme.id && (
                        <div className="mt-4 flex items-center gap-2">
                           <Sparkles size={10} className="text-[var(--primary)] animate-pulse" />
                           <span className="text-[8px] font-mono font-bold text-[var(--primary)] uppercase tracking-widest">Active_State</span>
                        </div>
                      )}

                      {/* Remove Button (Only for installed themes) */}
                      {!['dark', 'light', 'catppuccin', 'rose-pine', 'everforest', 'tokyo-night', 'nord'].includes(theme.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentTheme === theme.id) {
                              setTheme("dark");
                            }
                            uninstallPlugin(`theme-${theme.id}`);
                            toast(`Removed ${theme.name} module`, "system");
                          }}
                          className="absolute bottom-4 right-4 p-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors opacity-0 group-hover:opacity-100"
                          title="Uninstall Theme Module"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </motion.div>
                  ))}

                  {/* Marketplace Teaser */}
                  <div className="flex flex-col items-center justify-center p-5 border border-dashed border-[var(--border)] bg-[var(--card)]/10 text-center">
                     <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase mb-2 opacity-50">Custom Modules</span>
                     <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-tighter leading-tight mb-4">
                       Additional interface patterns available in the marketplace.
                     </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-[var(--card)]/50 border-t border-dotted border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[var(--primary)] rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">
                    Kernel_Ver: 0xAF...09
                  </span>
                </div>
                <p className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase opacity-40">
                  Select a module to re-calibrate interface visual sensors.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
