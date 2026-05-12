"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { FileText, Package, Share2, Palette, Terminal as TerminalIcon, ShieldCheck, HelpCircle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
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
      "w-full h-12 flex flex-col items-center justify-center relative group transition-all duration-200 outline-none",
      isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
    )}
    title={title}
  >
    {/* Active Tab Indicator */}
    {isActive && (
      <motion.div 
        layoutId="nav-tab"
        className="absolute inset-y-0 left-0 w-1 bg-[var(--primary)] shadow-[0_0_12px_var(--primary)] z-20"
        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
      />
    )}
    
    {isActive && (
      <motion.div 
        layoutId="nav-bg"
        className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent -z-10"
        transition={{ duration: 0.3 }}
      />
    )}

    <div className={cn(
      "transition-all duration-300 relative z-10",
      isActive ? "scale-110 drop-shadow-[0_0_8px_var(--primary)]" : "group-hover:translate-x-0.5"
    )}>
      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
    </div>
{/*     
    <span className={cn(
      "text-[6px] font-mono uppercase tracking-[0.2em] mt-1.5 transition-all duration-300 relative z-10",
      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
    )}>
      {label}
    </span> */}
  </button>
);

export const SidebarNavigation = memo(({
  activeView,
  setActiveView,
  onOpenGraph,
  onOpenThemes,
  onToggleTerminal,
  onOpenAuth,
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

        <NavItem 
          icon={Share2}
          label="Nexus"
          title="Graph View"
          isActive={activeView === "graph"}
          onClick={() => {
             if (onOpenGraph) onOpenGraph();
             if (setActiveView) setActiveView("graph" as any);
          }}
        />

        <div className="w-8 h-px bg-[var(--border)] my-4 opacity-20" />
        
        <NavItem 
          icon={Palette}
          label="Skin"
          title="Themes"
          onClick={onOpenThemes || (() => {})}
        />
        
        <NavItem 
          icon={TerminalIcon}
          label="Shell"
          title="Terminal"
          onClick={onToggleTerminal || (() => {})}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 w-full pb-4">
        <NavItem 
          icon={ShieldCheck}
          label="Auth"
          title="Identity"
          onClick={onOpenAuth || (() => {})}
        />

        <NavItem 
          icon={HelpCircle}
          label="Core"
          title="Manual"
          isActive={activeView === "help"}
          onClick={() => setActiveView("help")}
        />

        <div className="mt-4 pt-4 border-t border-[var(--border)] w-full flex flex-col items-center gap-4 relative">
           <div className="w-1.5 h-1.5 bg-[var(--accent)] animate-pulse" />
           
           <div className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center group cursor-pointer hover:border-[var(--primary)]/50 transition-colors">
              <Cpu size={14} className="text-[var(--primary)] opacity-40 group-hover:opacity-100 transition-all" />
           </div>
        </div>
      </div>
    </div>
  );
});
