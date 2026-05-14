"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Network, FileText, Command, Keyboard } from "lucide-react";

interface EmptyStateProps {
  onAddNote: () => void;
}

const shortcuts = [
  { keys: ["⌘", "K"], label: "Command palette" },
  { keys: ["⌘", "N"], label: "New note" },
  { keys: ["`"], label: "Open terminal" },
  { keys: ["?"], label: "Help" },
];

const EmptyState = ({ onAddNote }: EmptyStateProps) => {
  const [tick, setTick] = useState(0);

  // blinking cursor effect
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-[var(--background)] border-l border-[var(--border)] relative overflow-hidden select-none">
      {/* subtle dot-grid background */}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,var(--foreground)_1px,transparent_1px)] bg-[length:28px_28px] pointer-events-none" />

      {/* content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xs px-6">

        {/* icon block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <div className="w-20 h-20 border border-[var(--border)] bg-[var(--card)]/40 flex items-center justify-center relative">
            <FileText className="w-8 h-8 text-[var(--primary)]/60" />
            {/* corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--primary)]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--primary)]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--primary)]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--primary)]" />
          </div>
        </motion.div>

        {/* headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-2"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <span className="text-[9px] font-mono font-bold text-[var(--primary)] uppercase tracking-[0.4em]">
              SYSTEM_IDLE
            </span>
          </div>
          <h2 className="text-2xl font-black font-mono uppercase tracking-tighter text-[var(--foreground)] mb-2">
            No file open
          </h2>
          <p className="text-[10px] font-mono text-[var(--muted-foreground)]/60 leading-relaxed">
            Create a new note or select one from<br />the explorer to get started.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          onClick={onAddNote}
          className="mt-6 mb-8 flex items-center gap-2 px-6 py-2.5 border border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-[var(--primary)]/10 transition-colors"
        >
          <Plus size={12} />
          New Note
        </motion.button>

        {/* shortcuts grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full border border-dashed border-[var(--border)]/50 p-4"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Keyboard size={10} className="text-[var(--muted-foreground)]/40" />
            <span className="text-[8px] font-mono text-[var(--muted-foreground)]/40 uppercase tracking-widest">Global_Shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {shortcuts.map(({ keys, label }) => (
              <div key={label} className="flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-1">
                  {keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-1.5 py-0.5 text-[8px] font-mono bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] leading-none rounded-none group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/40 transition-colors"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span className="text-[7px] font-mono text-[var(--muted-foreground)]/40 uppercase tracking-tighter truncate group-hover:text-[var(--muted-foreground)] transition-colors">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmptyState;
