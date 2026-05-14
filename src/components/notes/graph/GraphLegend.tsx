"use client";

import React from "react";

export function GraphLegend() {
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 select-none pointer-events-none">
      {[
        { shape: "folder", label: "DIR  (folder)" },
        { shape: "note", label: "NODE  (note)" },
        { shape: "ghost", label: "REF  (unresolved)" },
      ].map(({ shape, label }) => (
        <div key={shape} className="flex items-center gap-2">
          {shape === "folder" && (
            <div className="w-3 h-3 border border-[var(--primary)] bg-[var(--primary)]/20 shrink-0" />
          )}
          {shape === "note" && (
            <div className="w-3 h-3 rounded-full border border-[var(--foreground)]/50 bg-[var(--foreground)]/10 shrink-0" />
          )}
          {shape === "ghost" && (
            <div className="w-3 h-3 rounded-full border border-dashed border-[var(--muted-foreground)]/40 shrink-0" />
          )}
          <span className="text-[9px] font-mono text-[var(--muted-foreground)]/50 uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GraphHints() {
  return (
    <div className="absolute bottom-4 right-4 select-none pointer-events-none text-[9px] font-mono text-[var(--muted-foreground)]/25 uppercase tracking-wider text-right">
      scroll · zoom &nbsp;|&nbsp; drag · pan
    </div>
  );
}
