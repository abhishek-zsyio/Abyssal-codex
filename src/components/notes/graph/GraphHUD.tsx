"use client";

import React from "react";
import { Activity } from "lucide-react";
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
    <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none z-30">
      <div className="bg-[var(--card)]/80 border border-[var(--border)] p-4 flex flex-col gap-2 min-w-[180px]">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Neural_Freq</span>
          <span className="text-[10px] font-mono text-[var(--primary)] font-bold">60.00 Hz</span>
        </div>
        <div className="w-full h-[2px] bg-[var(--border)] overflow-hidden">
            <div 
              className="w-1/2 h-full bg-[var(--primary)]"
              style={{ animation: 'hudScan 1.5s linear infinite' }}
            />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Active_Nodes</span>
          <span className="text-[10px] font-mono text-[var(--foreground)]">{nodesCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Link_Density</span>
          <span className="text-[10px] font-mono text-[var(--accent)]">{(linksCount / (nodesCount || 1)).toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-[var(--card)]/80 border border-[var(--border)] p-2 px-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
        <span className="text-[9px] font-mono text-[var(--foreground)] uppercase tracking-tighter">Topology_Synchronized</span>
      </div>

      {isLinkMode && (
        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 p-4 flex flex-col gap-2 min-w-[180px] animate-pulse pointer-events-none">
          <span className="text-[8px] font-mono text-[var(--primary)] uppercase tracking-widest font-bold">Linkage_Protocol_Active</span>
          <span className="text-[9px] font-mono text-[var(--foreground)] leading-tight">
            {!hasLinkSource ? "SELECT_SOURCE_NODE..." : "SELECT_TARGET_NODE..."}
          </span>
        </div>
      )}
    </div>
  );
};
