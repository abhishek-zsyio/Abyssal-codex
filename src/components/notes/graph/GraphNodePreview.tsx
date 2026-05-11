"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Node {
  id: string;
  title: string;
  content: string;
  color: string;
}

interface GraphNodePreviewProps {
  node: Node | null;
}

export const GraphNodePreview = ({ node }: GraphNodePreviewProps) => {
  return (
    <AnimatePresence>
      {node && (
        <motion.div 
          initial={{ opacity: 0, y: 20, x: "-50%", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="absolute bottom-12 left-1/2 pointer-events-none z-30 w-[450px]"
        >
          <div className="relative bg-[var(--card)]/60 backdrop-blur-2xl border border-[var(--border)] p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 overflow-hidden rounded-sm">
            {/* Scanline overlay for preview */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px]" />
            
            <div className="flex justify-between items-start border-b border-[var(--border)]/50 pb-3 relative">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: node.color, boxShadow: `0 0 10px ${node.color}` }} 
                  />
                  <h3 className="text-lg font-black font-mono tracking-tighter text-[var(--foreground)] uppercase truncate max-w-[280px]">
                    {node.title}
                  </h3>
                </div>
                <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] opacity-70">
                   Neural_Address: 0x{node.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-mono text-[var(--primary)] font-bold animate-pulse">UPLINK_LIVE</span>
                 <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase mt-1">Status: Stable</span>
              </div>
            </div>
            
            <div className="relative group">
               <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-[var(--primary)] opacity-30" />
               <div className="text-[11px] font-mono text-[var(--foreground)] line-clamp-3 leading-relaxed opacity-90 pl-2">
                 {node.content || ">> NO_ENCRYPTED_STREAM_DETECTED. CORE_EMPTY."}
               </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/30">
              <div className="flex gap-4">
                <div className="flex flex-col">
                   <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase">Complexity</span>
                   <span className="text-[9px] font-mono text-[var(--foreground)]">{(node.content.length / 100).toFixed(1)}k_BITS</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase">Integrity</span>
                   <span className="text-[9px] font-mono text-[var(--accent)]">99.8%</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div 
                    key={i} 
                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                    className="w-5 h-1 bg-[var(--primary)]" 
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

