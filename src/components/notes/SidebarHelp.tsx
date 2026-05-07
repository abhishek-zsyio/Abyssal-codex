"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Book, 
  Command, 
  Zap, 
  Keyboard, 
  Info, 
  X, 
  ExternalLink, 
  Cpu, 
  Share2, 
  Shield, 
  Terminal,
  Hash,
  Package,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHelpProps {
  onClose?: () => void;
}

const HELP_SECTIONS = [
  {
    id: "getting-started",
    icon: Book,
    title: "SYST_OVERVIEW",
    content: "Abyssal Codex is a local-first, markdown-based knowledge vault designed for high-performance cognitive architecture."
  },
  {
    id: "wiki-links",
    icon: Share2,
    title: "WIKI_NETWORKING",
    content: "Connect nodes using `[[Note Title]]`. Dead links appear dimmed until the node is initialized. Use the Nexus Graph to visualize your neural network."
  },
  {
    id: "command-palette",
    icon: Command,
    title: "COMMAND_CORE",
    content: "Press `Cmd+K` to access the central processing unit. Search nodes, switch themes, or trigger system actions from one interface."
  },
  {
    id: "plugins",
    icon: Package,
    title: "MODULE_EXTENSIONS",
    content: "Expand system capabilities via the Marketplace. Install plugins for Zen Mode, Daily Notes, or Advanced Formatting."
  }
];

const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Command Palette" },
  { keys: ["⌘", "N"], desc: "Initialize Node" },
  { keys: ["⌘", "S"], desc: "Commit Changes" },
  { keys: ["`"], desc: "Toggle Kernel" },
  { keys: ["?"], desc: "Toggle Manual" },
];

export default function SidebarHelp({ onClose }: SidebarHelpProps) {
  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="p-6 border-b border-dotted border-[var(--border)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-1">Documentation</span>
            <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight text-glow">MANUAL_v2.0</h1>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative p-4 bg-[var(--card)]/40 border border-[var(--border)] overflow-hidden group">
          <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
            <Info size={10} className="text-[var(--primary)]" />
          </div>
          <p className="text-[10px] font-mono leading-relaxed text-[var(--muted-foreground)]">
            Welcome to the <span className="text-[var(--primary)]">ABYSSAL_CODEX</span>. This interface serves as your primary documentation for system navigation and knowledge architecture.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Core Concepts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layers size={12} className="text-[var(--primary)]" />
            <h2 className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--foreground)]">Core_Protocols</h2>
          </div>
          <div className="space-y-4">
            {HELP_SECTIONS.map((section, i) => (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="flex items-start gap-3 mb-1">
                  <section.icon size={14} className="mt-0.5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                  <h3 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider">{section.title}</h3>
                </div>
                <p className="text-[10px] font-mono leading-relaxed text-[var(--muted-foreground)] ml-7">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Shortcuts Reference */}
        <section>
          <div className="flex items-center gap-2 mb-4 pt-4 border-t border-dotted border-[var(--border)]">
            <Keyboard size={12} className="text-[var(--primary)]" />
            <h2 className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--foreground)]">Direct_Access</h2>
          </div>
          <div className="space-y-2">
            {SHORTCUTS.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-[var(--card)]/30 transition-colors border border-transparent hover:border-[var(--border)]/30">
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{s.desc}</span>
                <div className="flex gap-1">
                  {s.keys.map(k => (
                    <kbd key={k} className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] text-[8px] font-mono font-bold text-[var(--foreground)] shadow-[2px_2px_0px_var(--border)]">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Specs */}
        <section className="pt-4 border-t border-dotted border-[var(--border)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[var(--card)]/20 border border-dashed border-[var(--border)]">
              <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase block mb-1">Sync_Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] font-mono text-[var(--foreground)]">LOCAL_ONLY</span>
              </div>
            </div>
            <div className="p-3 bg-[var(--card)]/20 border border-dashed border-[var(--border)]">
              <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase block mb-1">Enc_Module</span>
              <div className="flex items-center gap-2">
                <Shield size={10} className="text-[var(--accent)]" />
                <span className="text-[10px] font-mono text-[var(--foreground)]">AES_256</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dotted border-[var(--border)] bg-[var(--card)]/20">
        <div className="flex items-center justify-between opacity-50">
          <span className="text-[8px] font-mono tracking-tighter">OS_TYPE: WEB_BENTHIC</span>
          <span className="text-[8px] font-mono tracking-tighter">SEC_LVL: 4</span>
        </div>
      </div>
    </div>
  );
}
