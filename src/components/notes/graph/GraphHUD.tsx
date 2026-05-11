"use client";

import React from "react";
import { Activity, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GraphHUDProps {
  isVisible: boolean;
  nodesCount: number;
  linksCount: number;
  isLinkMode: boolean;
  hasLinkSource: boolean;
}

export const GraphHUD = ({
  isVisible,
  nodesCount,
  linksCount,
  isLinkMode,
  hasLinkSource
}: GraphHUDProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none z-30 select-none">
      <div className="bg-[var(--card)]/60 backdrop-blur-xl border border-[var(--border)] p-5 flex flex-col gap-3 min-w-[220px] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
          <div className="flex flex-col">
            <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Neural_Freq</span>
            <span className="text-xs font-mono text-[var(--primary)] font-black">60.00 Hz</span>
          </div>
          <div className="w-12 h-6 opacity-50">
             <svg viewBox="0 0 100 40" className="w-full h-full stroke-[var(--primary)] fill-none">
                <path d="M0 20 Q 25 5, 50 20 T 100 20" strokeDasharray="4 2">
                   <animate attributeName="d" dur="2s" repeatCount="indefinite" values="M0 20 Q 25 5, 50 20 T 100 20; M0 20 Q 25 35, 50 20 T 100 20; M0 20 Q 25 5, 50 20 T 100 20" />
                </path>
             </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Nodes</span>
            <span className="text-[11px] font-mono text-[var(--foreground)] font-bold">{nodesCount.toString().padStart(3, '0')}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Density</span>
            <span className="text-[11px] font-mono text-[var(--accent)] font-bold">{(linksCount / (nodesCount || 1)).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-1">
           <div className="flex justify-between text-[7px] font-mono text-[var(--muted-foreground)] uppercase">
              <span>Sync_Load</span>
              <span>{(nodesCount * 0.42).toFixed(1)}%</span>
           </div>
           <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(nodesCount * 2, 100)}%` }}
                 className="h-full bg-[var(--primary)]"
               />
           </div>
        </div>
      </div>

      <div className="bg-[var(--card)]/60 backdrop-blur-md border border-[var(--border)] p-2 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
           <span className="text-[8px] font-mono text-[var(--foreground)] uppercase tracking-widest">Topology_Stable</span>
        </div>
        <span className="text-[8px] font-mono text-[var(--muted-foreground)]">0xAF92</span>
      </div>

      {isLinkMode && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--primary)]/10 backdrop-blur-md border border-[var(--primary)]/40 p-4 flex flex-col gap-2 min-w-[220px] shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
        >
          <div className="flex items-center gap-2">
             <Hash size={12} className="text-[var(--primary)] animate-spin-slow" />
             <span className="text-[8px] font-mono text-[var(--primary)] uppercase tracking-widest font-black">Linkage_Active</span>
          </div>
          <div className="h-px bg-[var(--primary)]/20 my-1" />
          <span className="text-[9px] font-mono text-[var(--foreground)] leading-tight opacity-90">
            {!hasLinkSource ? ">> WAITING_FOR_SOURCE_ID..." : ">> UPLINK_ESTABLISHED. SELECT_TARGET..."}
          </span>
        </motion.div>
      )}
    </div>
  );
};
