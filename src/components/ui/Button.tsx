import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] hover:bg-[var(--primary)]/90 shadow-[0_0_15px_rgba(250,189,47,0.2)]",
      secondary: "bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]",
      outline: "bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5",
      ghost: "bg-transparent border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]",
      danger: "bg-transparent border-[var(--destructive)]/30 text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-[var(--background)] hover:border-[var(--destructive)]",
      success: "bg-transparent border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--background)] hover:border-[var(--accent)]",
      warning: "bg-transparent border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] hover:border-[var(--primary)]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-[10px]",
      md: "px-4 py-2 text-xs",
      lg: "px-6 py-3 text-sm",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-mono font-bold uppercase tracking-[0.1em] border transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
