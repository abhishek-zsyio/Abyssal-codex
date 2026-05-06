import * as React from "react";
import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn(
      "pointer-events-none inline-flex h-5 select-none items-center gap-1 border border-[var(--border)] bg-[var(--card)] px-1.5 font-mono text-[10px] font-bold text-[var(--muted-foreground)] opacity-100",
      className
    )}>
      {children}
    </kbd>
  );
}

export function Badge({ children, variant = "default", className }: { 
  children: React.ReactNode; 
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const variants = {
    default: "bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--border)]",
    success: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    warning: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
    danger: "bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20",
    info: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20", // Reusing accent for info in Gruvbox
  };

  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 border text-[9px] font-mono font-bold tracking-tight",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
