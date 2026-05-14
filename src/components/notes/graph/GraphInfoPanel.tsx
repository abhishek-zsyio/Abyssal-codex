"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash } from "lucide-react";
import { GraphNode } from "@/types/graph";

interface GraphInfoPanelProps {
  hoveredNode: GraphNode | null;
  hoveredConnections: { node: GraphNode; type: 'wiki' | 'folder' }[];
}

export function GraphInfoPanel({ hoveredNode, hoveredConnections }: GraphInfoPanelProps) {
  if (!hoveredNode || hoveredNode.isGhost) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.15 }}
      className="absolute top-4 right-4 w-56 pointer-events-none select-none"
    >
      <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Hash size={12} className="text-[var(--primary)]" />
        </div>
        {/* title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-2 rotate-45 shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: hoveredNode.color || 'var(--primary)' }} />
          <span className="text-[11px] font-black font-mono text-[var(--foreground)] truncate uppercase tracking-tight">
            {hoveredNode.title}
          </span>
        </div>
        {/* stats row */}
        <div className="flex gap-5 mb-6 border-y border-[var(--border)]/10 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[6px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">unit_refs</span>
            <span className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase">
              {hoveredConnections.filter(c => c.type === 'wiki').length}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[6px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">class_type</span>
            <span className="text-[10px] font-mono font-bold text-[var(--primary)] uppercase">
              {hoveredNode.isFolder ? 'DIRECTORY' : hoveredNode.isGhost ? 'REFERENCE' : 'DATA_NODE'}
            </span>
          </div>
        </div>
        {/* connections list */}
        {hoveredConnections.length > 0 && (
          <div className="space-y-2">
            {hoveredConnections.slice(0, 5).map(({ node: cn, type }) => (
              <div key={cn.id} className="flex items-center gap-3 group/conn">
                <div className="w-1 h-1 bg-[var(--border)] shrink-0 group-hover/conn:bg-[var(--primary)] group-hover/conn:shadow-[0_0_5px_var(--primary)] transition-all" />
                <span className="text-[8px] font-mono text-[var(--muted-foreground)] truncate uppercase tracking-tight group-hover/conn:text-[var(--foreground)] transition-colors">
                  {cn.title}
                </span>
                <span className="text-[7px] font-mono text-[var(--muted-foreground)]/20 ml-auto shrink-0 uppercase tracking-tighter">
                  {type === 'wiki' ? 'LINK' : 'CHILD'}
                </span>
              </div>
            ))}
            {hoveredConnections.length > 5 && (
              <div className="mt-3 border-t border-[var(--border)]/10 pt-2 text-center">
                <span className="text-[7px] font-mono text-[var(--primary)]/40 uppercase tracking-[0.2em]">
                  +{hoveredConnections.length - 5} OVERFLOW_UNITS
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
