"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { FileText, Package, Palette, ShieldCheck, HelpCircle, Network, Terminal, LucideIcon, User } from "lucide-react";
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
  icon: LucideIcon;
  title: string;
  isActive?: boolean;
  isLoggedIn?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      "relative w-full h-11 flex items-center justify-center group transition-colors outline-none",
      isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
    )}
  >
    {/* Active Indicator */}
    {isActive && (
      <motion.div
        layoutId="nav-indicator"
        className="absolute left-0 w-0.5 h-6 bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]"
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      />
    )}

    {/* Icon */}
    <div className="relative z-10 transition-transform group-hover:scale-110 active:scale-95">
      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
      {isLoggedIn && (
        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[var(--primary)] border border-[var(--background)] rounded-full animate-pulse" />
      )}
    </div>

    {/* Tooltip */}
    <div className="absolute left-14 z-[100] px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] text-[8px] font-mono uppercase tracking-[0.2em] text-[var(--foreground)] opacity-0 pointer-events-none translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap shadow-2xl">
      {title}
    </div>
  </button>
);

const Divider = () => (
  <div className="w-6 h-px bg-[var(--border)]/30 my-2" />
);

export const SidebarNavigation = memo(({
  activeView,
  setActiveView,
  onOpenThemes,
  onToggleTerminal,
  onOpenAuth,
  onOpenSecurity,
  onOpenGraph,
  isLoggedIn,
}: SidebarNavigationProps) => {
  return (
    <div className="w-12 h-full border-r border-[var(--border)] flex flex-col items-center py-2 bg-[var(--background)] relative z-50 shrink-0">
      {/* Logo Mark */}
      <div className="w-full h-12 flex items-center justify-center mb-2">
        <div className="w-5 h-5 border border-[var(--primary)] flex items-center justify-center relative">
          <div className="w-2 h-2 bg-[var(--primary)] rotate-45" />
          <div className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-[var(--primary)]" />
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex flex-col items-center w-full flex-1">
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
        {onOpenGraph && (
          <NavItem
            icon={Network}
            title="Graph_View"
            onClick={onOpenGraph}
          />
        )}
      </div>

      {/* Bottom Nav */}
      <div className="flex flex-col items-center w-full">
        <Divider />
        {onToggleTerminal && (
          <NavItem
            icon={Terminal}
            title="Console"
            onClick={onToggleTerminal}
          />
        )}
        {onOpenThemes && (
          <NavItem
            icon={Palette}
            title="Interface"
            onClick={onOpenThemes}
          />
        )}
        <NavItem
          icon={isLoggedIn ? User : ShieldCheck}
          title={isLoggedIn ? "Identity_Profile" : "Auth_Gateway"}
          isLoggedIn={isLoggedIn}
          onClick={onOpenAuth || onOpenSecurity || (() => {})}
        />
        <NavItem
          icon={HelpCircle}
          title="Protocol_Docs"
          isActive={activeView === "help"}
          onClick={() => setActiveView("help")}
        />
      </div>
    </div>
  );
});

SidebarNavigation.displayName = "SidebarNavigation";
