"use client";

import { Spinner } from "@/components/ui/Feedback";

export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--background)] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 border border-[var(--primary)]" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-[var(--primary)]" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <Spinner className="w-16 h-16 text-[var(--primary)]" />
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-mono font-bold uppercase tracking-[0.3em] text-[var(--primary)] animate-pulse">
            Initializing_Codex
          </h2>
          <div className="h-0.5 w-48 bg-[var(--border)] relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[var(--primary)] animate-[loading_2s_ease-in-out_infinite]" />
          </div>
          <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest mt-2">
            Protocol: Alpha-9 // Neural Link Established
          </span>
        </div>
      </div>
    </div>
  );
}
