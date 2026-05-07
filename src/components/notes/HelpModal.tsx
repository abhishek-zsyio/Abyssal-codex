"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, Link, FileText, Zap, Hash, Package } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    icon: Keyboard,
    title: "Shortcuts",
    color: "var(--primary)",
    items: [
      { keys: ["⌘", "K"], desc: "Command Palette" },
      { keys: ["⌘", "B"], desc: "Zen Mode (Plugin)" },
      { keys: ["⌘", "N"], desc: "New note" },
      { keys: ["⌘", "S"], desc: "Save / Commit" },
      { keys: ["`"], desc: "Toggle Terminal" },
      { keys: ["?"], desc: "Toggle this help" },
      { keys: ["Esc"], desc: "Close modal" },
    ],
  },
  {
    icon: Package,
    title: "Plugins",
    color: "var(--primary)",
    items: [
      { keys: ["Package Icon"], desc: "Open Plugin Store" },
      { keys: ["Install"], desc: "Download modules" },
      { keys: ["Power Toggle"], desc: "Enable/Disable" },
      { keys: ["[[note]]"], desc: "Auto-Wiki links" },
      { keys: ["/"], desc: "Vim command mode" },
    ],
  },
  {
    icon: Link,
    title: "Wiki Links",
    color: "var(--accent)",
    items: [
      { keys: ["[[Note]]"], desc: "Link to a note" },
      { keys: ["Backlinks"], desc: "Right sidebar panel" },
      { keys: ["~~Dead~~"], desc: "Note doesn't exist" },
    ],
  },
  {
    icon: FileText,
    title: "Markdown",
    color: "var(--primary)",
    items: [
      { keys: ["# H1"], desc: "Heading 1" },
      { keys: ["## H2"], desc: "Heading 2" },
      { keys: ["**text**"], desc: "Bold" },
      { keys: ["`code`"], desc: "Inline code" },
      { keys: ["```lang"], desc: "Code block" },
      { keys: ["- [ ]"], desc: "Task item" },
    ],
  },
  {
    icon: Hash,
    title: "Tags",
    color: "var(--accent)",
    items: [
      { keys: ["Tag field + Enter"], desc: "Add a tag" },
      { keys: ["Click tag"], desc: "Filter notes" },
      { keys: ["× on badge"], desc: "Remove tag" },
    ],
  },
  {
    icon: Zap,
    title: "Features",
    color: "var(--primary)",
    items: [
      { keys: ["Split Pane"], desc: "Two notes side-by-side" },
      { keys: ["Zen Mode"], desc: "Focus writing (Plugin Required)" },
      { keys: ["Read Mode"], desc: "Rendered preview" },
      { keys: ["Export"], desc: "JSON workspace backup" },
      { keys: ["☀ / 🌙"], desc: "Light / Dark mode" },
    ],
  },
];

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="pointer-events-auto w-full max-w-2xl bg-[var(--background)] border border-[var(--primary)]/40 shadow-[0_0_0_1px_var(--border),0_30px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(250,189,47,0.06)] flex flex-col overflow-hidden relative"
            >
              {/* Animated top border */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent origin-left"
              />

              {/* Corner accents */}
              {[
                "top-0 left-0 border-l-2 border-t-2",
                "top-0 right-0 border-r-2 border-t-2",
                "bottom-0 left-0 border-l-2 border-b-2",
                "bottom-0 right-0 border-r-2 border-b-2",
              ].map((cls, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  transition={{ delay: 0.05 * i + 0.1, type: "spring", stiffness: 400 }}
                  className={`absolute w-4 h-4 border-[var(--primary)] ${cls}`}
                />
              ))}

              {/* Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-dotted border-[var(--border)]">
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <span className="text-[8px] font-mono text-[var(--primary)] uppercase tracking-[0.4em] block mb-1 opacity-70">
                    ABYSSAL_CODEX // SYS_HELP
                  </span>
                  <h2 className="text-xl font-bold font-mono text-[var(--foreground)] uppercase tracking-widest">
                    Help_Manual
                    <span className="text-[var(--primary)] ml-1 opacity-60 text-base">_</span>
                  </h2>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 border border-transparent hover:border-[var(--primary)]/30 transition-all"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Grid body */}
              <div className="overflow-y-auto max-h-[65vh] custom-scrollbar p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {SECTIONS.map(({ icon: Icon, title, color, items }, sectionIdx) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + sectionIdx * 0.06, duration: 0.3 }}
                    >
                      {/* Section header */}
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dotted border-[var(--border)]">
                        <Icon size={11} style={{ color }} />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                          {title}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {items.map(({ keys, desc }, itemIdx) => (
                          <motion.div
                            key={desc}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + sectionIdx * 0.06 + itemIdx * 0.03 }}
                            className="flex items-center justify-between gap-3 group"
                          >
                            <span className="text-[11px] font-mono text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                              {desc}
                            </span>
                            <div className="flex gap-1 flex-shrink-0">
                              {keys.map((k) => (
                                <kbd
                                  key={k}
                                  className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] whitespace-nowrap shadow-[2px_2px_0px_var(--border)]"
                                >
                                  {k}
                                </kbd>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="px-8 py-3 border-t border-dotted border-[var(--border)] bg-[var(--card)]/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[var(--primary)] rounded-full animate-pulse" />
                  <span className="text-[9px] font-mono text-[var(--muted-foreground)] opacity-60">
                    Press <kbd className="px-1 bg-[var(--card)] border border-[var(--border)] text-[8px]">?</kbd> or <kbd className="px-1 bg-[var(--card)] border border-[var(--border)] text-[8px]">Esc</kbd> to close
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[var(--muted-foreground)] opacity-40">
                  v2.0 // CODEX
                </span>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
