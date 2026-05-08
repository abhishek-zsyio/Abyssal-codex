"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Package, Share2, Palette, Terminal as TerminalIcon, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { microSpring } from "@/lib/transitions";

interface SidebarNavigationProps {
  activeView: "explorer" | "plugins" | "help";
  setActiveView: (view: "explorer" | "plugins" | "help") => void;
  onOpenGraph?: () => void;
  onOpenThemes?: () => void;
  onToggleTerminal?: () => void;
  onOpenAuth?: () => void;
  isLoggedIn?: boolean;
}

export const SidebarNavigation = ({
  activeView,
  setActiveView,
  onOpenGraph,
  onOpenThemes,
  onToggleTerminal,
  onOpenAuth,
  isLoggedIn
}: SidebarNavigationProps) => {
  return (
    <div className="w-14 h-full border-r border-dotted border-[var(--border)] flex flex-col items-center py-6 gap-4 bg-[var(--card)]/30">
      <div className="flex-1 flex flex-col items-center gap-4">
        <Button
          onClick={() => setActiveView("explorer")}
          variant="ghost"
          size="icon"
          className={cn(
            "w-10 h-10 transition-all",
            activeView === "explorer" ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          )}
          title="Explorer (Notes)"
        >
          <FileText size={18} />
          {activeView === "explorer" && (
            <motion.div 
              layoutId="active-indicator" 
              transition={microSpring}
              className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" 
            />
          )}
        </Button>

        <Button
          onClick={() => setActiveView("plugins")}
          variant="ghost"
          size="icon"
          className={cn(
            "w-10 h-10 transition-all",
            activeView === "plugins" ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          )}
          title="Marketplace (Plugins)"
        >
          <Package size={18} />
          {activeView === "plugins" && (
            <motion.div 
              layoutId="active-indicator" 
              transition={microSpring}
              className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" 
            />
          )}
        </Button>

        <Button
          onClick={onOpenGraph}
          variant="ghost"
          size="icon"
          className="w-10 h-10 transition-all text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          title="Nexus Graph (Visualizer)"
        >
          <Share2 size={18} />
        </Button>

        <div className="w-8 h-px bg-[var(--border)] my-2 opacity-50" />
        
        <Button 
          onClick={onOpenThemes} 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          title="Select Visual Interface Theme"
        >
          <Palette size={18} />
        </Button>
        
        <Button
          onClick={onToggleTerminal}
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          title="Toggle Terminal Kernel (`)"
        >
          <TerminalIcon size={16} />
        </Button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4">
        <Button
          onClick={onOpenAuth}
          variant="ghost"
          size="icon"
          className={cn(
            "w-10 h-10 transition-all",
            isLoggedIn ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          )}
          title={isLoggedIn ? "Identity Synchronized" : "Initialize Identity (Login)"}
        >
          <div className="relative">
            <ShieldCheck size={16} />
            {isLoggedIn && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" />
            )}
          </div>
        </Button>

        <Button
          onClick={() => setActiveView("help")}
          variant="ghost"
          size="icon"
          className={cn(
            "w-10 h-10 transition-all",
            activeView === "help" ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          )}
          title="System Manual (Help)"
        >
          <HelpCircle size={18} />
          {activeView === "help" && (
            <motion.div 
              layoutId="active-indicator" 
              transition={microSpring}
              className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" 
            />
          )}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 mb-4">
         <div className="flex flex-col items-center gap-1 group cursor-help" title="SYSTEM_STATUS: OPERATIONAL">
            <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest opacity-60">Status</span>
            <div className="relative">
               <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            </div>
            <span className="text-[8px] font-mono text-[var(--accent)] font-bold uppercase tracking-tighter">Live</span>
         </div>
      </div>
    </div>
  );
};
