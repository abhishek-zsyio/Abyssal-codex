"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { FileText, Package, Share2, Palette, Terminal as TerminalIcon, ShieldCheck, HelpCircle, Cpu, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { microSpring } from "@/lib/transitions";

interface SidebarNavigationProps {
  activeView: "explorer" | "plugins" | "help";
  setActiveView: (view: "explorer" | "plugins" | "help") => void;
  onOpenGraph?: () => void;
  onOpenThemes?: () => void;
  onToggleTerminal?: () => void;
  onOpenAuth?: () => void;
  onOpenSecurity?: () => void;
  isLoggedIn?: boolean;
  isOpen?: boolean;
}

const NavItem = ({ 
  icon: Icon, 
  title, 
  isActive, 
  onClick, 
  label,
}: { 
  icon: any, 
  title: string, 
  isActive?: boolean, 
  onClick: () => void,
  label: string,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full h-14 flex flex-col items-center justify-center relative group transition-all duration-300 outline-none",
      isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
    )}
    title={title}
  >
    {/* Active Tab Indicator (VS Code style but glowing) */}
    {isActive && (
      <motion.div 
        layoutId="nav-tab"
        className="absolute inset-y-3 left-0 w-1 bg-[var(--primary)] rounded-r-full shadow-[0_0_15px_var(--primary)] z-20"
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      />
    )}
    
    {/* Background Glow */}
    {isActive && (
      <motion.div 
        layoutId="nav-bg"
        className="absolute inset-2 bg-[var(--primary)]/5 rounded-lg -z-10 blur-sm"
        transition={{ duration: 0.3 }}
      />
    )}

    {/* Subtle Hover Background */}
    <div className={cn(
      "absolute inset-2 rounded-lg -z-10 transition-all duration-300",
      !isActive && "group-hover:bg-[var(--foreground)]/[0.03]"
    )} />

    <div className={cn(
      "transition-all duration-500 relative z-10",
      isActive ? "scale-110 drop-shadow-[0_0_10px_var(--primary)]" : "group-hover:scale-105"
    )}>
      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
    </div>
    
    {/* Label Tooltip Alternative (Minimalist) */}
    <div className={cn(
      "absolute left-16 px-2 py-1 bg-[var(--card)] border border-[var(--border)] text-[9px] font-mono uppercase tracking-widest text-[var(--foreground)] opacity-0 pointer-events-none translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-[100] whitespace-nowrap shadow-2xl",
    )}>
      {title}
    </div>
  </button>
);

export const SidebarNavigation = memo(({
  activeView,
  setActiveView,
  onOpenGraph,
  onOpenThemes,
  onToggleTerminal,
  onOpenAuth,
  onOpenSecurity,
  isLoggedIn
}: SidebarNavigationProps) => {
  return (
    <div className="w-14 h-full border-r border-[var(--border)] flex flex-col items-center py-4 bg-[var(--card)]/20 backdrop-blur-3xl relative z-50">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      
      {/* Decorative Top Node */}
      <div className="mb-4 opacity-20">
         <div className="w-1 h-1 bg-[var(--primary)]" />
      </div>

      <div className="flex-1 flex flex-col items-center gap-1 w-full">
        <NavItem 
          icon={FileText}
          label="Nodes"
          title="Explorer"
          isActive={activeView === "explorer"}
          onClick={() => setActiveView("explorer")}
        />

        <NavItem 
          icon={Package}
          label="Packs"
          title="Plugins"
          isActive={activeView === "plugins"}
          onClick={() => setActiveView("plugins")}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 w-full pb-4">
        {/* Unified Identity Node */}
        <NavItem 
          icon={ShieldCheck}
          label="Identity"
          title="Auth & Security"
          onClick={onOpenAuth || onOpenSecurity || (() => {})}
        />

        {/* Unified System Node */}
        <NavItem 
          icon={Palette}
          label="System"
          title="Themes & Terminal"
          onClick={onOpenThemes || onToggleTerminal || (() => {})}
        />

        <NavItem 
          icon={HelpCircle}
          label="Core"
          title="Manual"
          isActive={activeView === "help"}
          onClick={() => setActiveView("help")}
        />
      </div>
    </div>
  );
});
