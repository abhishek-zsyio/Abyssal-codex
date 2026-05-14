"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { FileText, Package, Palette, ShieldCheck, HelpCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  isLoggedIn,
  onClick, 
}: { 
  icon: LucideIcon, 
  title: string, 
  isActive?: boolean, 
  isLoggedIn?: boolean,
  onClick: () => void,
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
      isActive ? "scale-110 drop-shadow-[0_0_10px_var(--primary)]" : "group-hover:scale-105",
      isLoggedIn && "text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
    )}>
      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
      {isLoggedIn && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
      )}
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
  onOpenThemes,
  onToggleTerminal,
  onOpenAuth,
  onOpenSecurity,
  isLoggedIn,
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
          title="Explorer"
          isActive={activeView === "explorer"}
          onClick={() => setActiveView("explorer")}
        />

        <NavItem 
          icon={Package}
          title="Plugins"
          isActive={activeView === "plugins"}
          onClick={() => setActiveView("plugins")}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 w-full pb-4">
        {/* Unified Identity Node */}
        <NavItem 
          icon={ShieldCheck}
          title="Auth & Security"
          isLoggedIn={isLoggedIn}
          onClick={onOpenAuth || onOpenSecurity || (() => {})}
        />

        {/* Unified System Node */}
        <NavItem 
          icon={Palette}
          title="Themes & Terminal"
          onClick={onOpenThemes || onToggleTerminal || (() => {})}
        />

        <NavItem 
          icon={HelpCircle}
          title="Manual"
          isActive={activeView === "help"}
          onClick={() => setActiveView("help")}
        />
      </div>
    </div>
  );
});

SidebarNavigation.displayName = "SidebarNavigation";
