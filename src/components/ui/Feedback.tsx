import * as React from "react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-6 h-6", className)}>
      <div className="absolute inset-0 border-2 border-[var(--border)] opacity-20" />
      <div className="absolute inset-0 border-2 border-[var(--primary)] border-t-transparent animate-spin" />
    </div>
  );
}

export function StatusIndicator({ status = "stable" }: { status?: "stable" | "busy" | "error" }) {
  const colors = {
    stable: "bg-[var(--accent)]",
    busy: "bg-[var(--primary)] animate-pulse",
    error: "bg-[var(--destructive)]",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-2 h-2", colors[status])} />
      <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
        {status}
      </span>
    </div>
  );
}
