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
          initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.98 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-10 left-1/2 pointer-events-none z-30 w-[400px]"
        >
          <div className="relative bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] p-4 shadow-2xl flex flex-col gap-2 overflow-hidden rounded-lg">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: node.color }} />
                <h3 className="text-sm font-bold font-mono tracking-tight text-[var(--foreground)] uppercase truncate max-w-[200px]">
                  {node.title}
                </h3>
              </div>
              <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase">
                ID: {node.id.substring(0, 6)}
              </span>
            </div>
            
            <div className="text-[10px] font-mono text-[var(--muted-foreground)] line-clamp-2 leading-relaxed italic opacity-80">
              {node.content || "NO_DATA_STREAM_DETECTED"}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-4 h-0.5 bg-[var(--primary)] opacity-20" />
                ))}
              </div>
              <span className="text-[8px] font-mono text-[var(--primary)] font-bold animate-pulse">LOCKED</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
