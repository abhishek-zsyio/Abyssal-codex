"use client";

import React from "react";
import { motion } from "framer-motion";

interface EditorFooterProps {
  noteId: string;
}

export const EditorFooter = ({ noteId }: EditorFooterProps) => {
  return (
    <footer className="h-12 border-t border-[var(--border)] px-8 flex items-center justify-between text-[9px] font-mono text-[var(--muted-foreground)] bg-[var(--background)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      <div className="flex items-center gap-10 relative z-10">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
           <span className="uppercase tracking-[0.2em] font-black text-[var(--foreground)]">System_Live</span>
        </div>
        <div className="h-4 w-px bg-[var(--border)] opacity-30" />
        <span className="uppercase tracking-widest">Buffer: Markdown_Stream_V1</span>
        <span className="opacity-40 uppercase">0xABYS_CORE_ACTIVE</span>
      </div>
      <div className="flex items-center gap-4 relative z-10">
         <span className="opacity-40 uppercase tracking-tighter">Loc: {noteId.split('-')[0].toUpperCase()}</span>
         <div className="w-20 h-1 bg-[var(--border)]/20 relative overflow-hidden">
            <motion.div 
               className="absolute inset-y-0 left-0 bg-[var(--primary)]" 
               initial={{ width: "0%" }}
               animate={{ width: "65%" }}
               transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
         </div>
      </div>
    </footer>
  );
};

EditorFooter.displayName = "EditorFooter";
