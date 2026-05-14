"use client";

import { motion } from "framer-motion";
import { Laptop, ShieldAlert, Monitor, Cpu } from "lucide-react";

export function MobileRestriction() {
  return (
    <div className="h-screen w-full bg-[#030303] flex flex-col items-center justify-center p-8 relative overflow-hidden font-mono text-[var(--primary)] selection:bg-[var(--primary)] selection:text-black">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full border border-[var(--primary)]/30 bg-black/40 backdrop-blur-xl p-8 relative"
      >
        {/* Corner Accents */}
        <div className="absolute -top-px -left-px w-8 h-8 border-t border-l border-[var(--primary)]" />
        <div className="absolute -bottom-px -right-px w-8 h-8 border-b border-r border-[var(--primary)]" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
            <ShieldAlert className="w-6 h-6 text-[var(--primary)] animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Access_Restricted</h1>
            <p className="text-[10px] opacity-50 uppercase tracking-[0.2em] mt-1">Environment Compatibility Error</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-wider">
              <span>System_Check</span>
              <span className="text-[var(--primary)]">[FAILED]</span>
            </div>
            <div className="h-1 bg-[var(--primary)]/10 w-full relative overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-1/3 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]"
              />
            </div>
          </div>

          <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Cpu className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed opacity-80 uppercase tracking-tight">
                The Abyssal Codex IDE is a high-density neural workspace designed for large-scale document orchestration. 
                Mobile environments lack the requisite viewport resolution and processing overhead.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[var(--primary)]/20 p-3 flex flex-col items-center gap-2 text-center opacity-40">
              <Monitor className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-widest">Desktop Required</span>
            </div>
            <div className="border border-[var(--primary)]/20 p-3 flex flex-col items-center gap-2 text-center">
              <Laptop className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-[9px] uppercase tracking-widest text-[var(--primary)]">IDE Optimized</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--primary)]/10 flex justify-between items-center">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-[var(--primary)]/40" />
            <div className="w-2 h-2 bg-[var(--primary)]/20" />
            <div className="w-2 h-2 bg-[var(--primary)]/10" />
          </div>
          <span className="text-[9px] opacity-30 uppercase tracking-[0.3em]">SECURE_TERMINAL_V4.0</span>
        </div>
      </motion.div>

      {/* Shared Link Notice */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-[10px] opacity-40 uppercase tracking-[0.2em] max-w-[280px] text-center leading-relaxed"
      >
        Public share links remain accessible on mobile devices for read-only consultation.
      </motion.p>
    </div>
  );
}
