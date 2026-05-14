"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Book, 
  Command, 
  Keyboard, 
  Info, 
  X, 
  Share2, 
  Shield, 
  Package,
  Layers,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHelpProps {
  onClose?: () => void;
}

const HELP_SECTIONS = [
  {
    id: "getting-started",
    icon: Book,
    title: "System_Overview",
    content: "Abyssal Codex is a local-first, markdown-based knowledge vault designed for high-performance cognitive architecture."
  },
  {
    id: "wiki-links",
    icon: Share2,
    title: "Wiki_Networking",
    content: "Connect nodes using `[[Note Title]]`. Dead links appear dimmed until the node is initialized."
  },
  {
    id: "command-palette",
    icon: Command,
    title: "Command_Core",
    content: "Press `Cmd+K` to access the central processing unit. Search nodes or trigger system actions."
  }
];

const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Command Palette" },
  { keys: ["⌘", "N"], desc: "New Node" },
  { keys: ["⌘", "S"], desc: "Commit Changes" },
  { keys: ["`"], desc: "Toggle Console" },
];

export default function SidebarHelp({ onClose }: SidebarHelpProps) {
  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-mono font-bold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Manual / Documentation</span>
          {onClose && (
            <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] lg:hidden">
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20">
          <p className="text-[10px] font-mono leading-relaxed text-[var(--muted-foreground)]">
            Welcome to the <span className="text-[var(--primary)]">ABYSSAL_CODEX</span>. This interface serves as your primary documentation for system navigation.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Core Concepts */}
        <section className="space-y-4">
          <div className="flex items-center gap-1.5 opacity-40">
            <Layers size={11} className="text-[var(--primary)]" />
            <h2 className="text-[8px] font-mono font-bold uppercase tracking-widest text-[var(--foreground)]">Core_Protocols</h2>
          </div>
          <div className="space-y-3">
            {HELP_SECTIONS.map((section) => (
              <div key={section.id} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <section.icon size={12} className="text-[var(--primary)]/60" />
                  <h3 className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-tight">{section.title}</h3>
                </div>
                <p className="text-[10px] font-mono leading-relaxed text-[var(--muted-foreground)] ml-5 opacity-70">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Shortcuts Reference */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-1.5 opacity-40">
            <Keyboard size={11} className="text-[var(--primary)]" />
            <h2 className="text-[8px] font-mono font-bold uppercase tracking-widest text-[var(--foreground)]">Direct_Access</h2>
          </div>
          <div className="space-y-1">
            {SHORTCUTS.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)]/30 last:border-0">
                <span className="text-[9px] font-mono text-[var(--muted-foreground)]">{s.desc}</span>
                <div className="flex gap-0.5">
                  {s.keys.map(k => (
                    <kbd key={k} className="px-1 py-0.5 bg-[var(--card)] border border-[var(--border)] text-[8px] font-mono text-[var(--foreground)] min-w-[18px] text-center">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Specs */}
        <section className="pt-2">
           <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-[var(--border)] bg-[var(--card)]/10">
              <span className="block text-[7px] font-mono text-[var(--muted-foreground)] uppercase mb-1">Sync</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-[var(--foreground)]">LOCAL</span>
              </div>
            </div>
            <div className="p-2 border border-[var(--border)] bg-[var(--card)]/10">
              <span className="block text-[7px] font-mono text-[var(--muted-foreground)] uppercase mb-1">Encryption</span>
              <div className="flex items-center gap-1.5">
                <Shield size={9} className="text-[var(--accent)]" />
                <span className="text-[9px] font-mono text-[var(--foreground)]">AES_256</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--card)]/5 flex items-center justify-between">
        <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Build_Stable // v2.0</span>
        <button className="text-[7px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1 uppercase">
          Source <ExternalLink size={8} />
        </button>
      </div>
    </div>
  );
}
