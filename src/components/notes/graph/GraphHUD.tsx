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
      <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] p-6 flex flex-col gap-4 min-w-[240px] shadow-2xl relative overflow-hidden group">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--primary)] opacity-40" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--primary)] opacity-40" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--primary)] opacity-40" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--primary)] opacity-40" />

        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-1">
          <div className="flex flex-col">
            <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Neural_Freq</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-mono text-[var(--primary)] font-black">60.00</span>
              <span className="text-[8px] font-mono text-[var(--primary)] opacity-50 uppercase">Hz</span>
            </div>
          </div>
          <div className="w-16 h-8 opacity-40">
             <svg viewBox="0 0 100 40" className="w-full h-full stroke-[var(--primary)] fill-none stroke-[1.5]">
                <path d="M0 20 L 10 20 L 15 10 L 25 30 L 30 20 L 100 20" strokeDasharray="4 2">
                   <animate attributeName="d" dur="3s" repeatCount="indefinite" values="M0 20 L 10 20 L 15 10 L 25 30 L 30 20 L 100 20; M0 20 L 10 20 L 15 30 L 25 10 L 30 20 L 100 20; M0 20 L 10 20 L 15 10 L 25 30 L 30 20 L 100 20" />
                </path>
             </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
               <div className="w-1 h-1 bg-[var(--primary)]" />
               <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Nodes</span>
            </div>
            <span className="text-sm font-mono text-[var(--foreground)] font-black tracking-tighter">
              {nodesCount.toString().padStart(3, '0')}
              <span className="text-[9px] text-[var(--muted-foreground)] ml-1 font-normal">UNITS</span>
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
               <div className="w-1 h-1 bg-[var(--accent)]" />
               <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Density</span>
            </div>
            <span className="text-sm font-mono text-[var(--accent)] font-black tracking-tighter">
              {(linksCount / (nodesCount || 1)).toFixed(2)}
              <span className="text-[9px] text-[var(--muted-foreground)] ml-1 font-normal">COEF</span>
            </span>
          </div>
        </div>

        <div className="space-y-2 mt-2">
           <div className="flex justify-between text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">
              <span>Sync_Load</span>
              <span className="text-[var(--primary)]">{(nodesCount * 0.42).toFixed(1)}%</span>
           </div>
           <div className="w-full h-1 bg-[var(--border)] rounded-none overflow-hidden relative">
               <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:4px_4px]" />
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(nodesCount * 2, 100)}%` }}
                 className="h-full bg-gradient-to-r from-[var(--primary)]/40 to-[var(--primary)] relative"
               >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
               </motion.div>
           </div>
        </div>
      </div>

      <div className="bg-[var(--card)]/60 backdrop-blur-md border border-[var(--border)] p-2 px-4 flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-50" />
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-none bg-[var(--accent)] animate-pulse shadow-[0_0_8px_var(--accent)]" />
           <span className="text-[8px] font-mono text-[var(--foreground)] uppercase tracking-[0.3em] font-bold">Topology_Stable</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-mono text-[var(--muted-foreground)]">SEQ_</span>
           <span className="text-[8px] font-mono text-[var(--foreground)] font-bold">0xAF92</span>
        </div>
      </div>

      {isLinkMode && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--primary)]/5 backdrop-blur-md border border-[var(--primary)]/30 p-5 flex flex-col gap-3 min-w-[240px] shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-1">
             <div className="w-1 h-1 bg-[var(--primary)] animate-ping" />
          </div>
          <div className="flex items-center gap-2">
             <Hash size={12} className="text-[var(--primary)] animate-spin-slow" />
             <span className="text-[9px] font-mono text-[var(--primary)] uppercase tracking-[0.2em] font-black italic">Neural_Linkage_Protocol</span>
          </div>
          <div className="h-px bg-gradient-to-r from-[var(--primary)]/40 to-transparent" />
          <div className="flex flex-col gap-1">
             <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase">Status_Log:</span>
             <span className="text-[10px] font-mono text-[var(--foreground)] leading-tight opacity-90 font-bold bg-[var(--primary)]/10 px-2 py-1 border-l-2 border-[var(--primary)]">
               {!hasLinkSource ? ">> WAITING_FOR_SOURCE_ID..." : ">> UPLINK_ESTABLISHED. SELECT_TARGET..."}
             </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
