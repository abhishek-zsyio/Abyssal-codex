import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import { microSpring } from "@/lib/transitions";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] shadow-[0_0_15px_rgba(250,189,47,0.2)]",
      secondary: "bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)]",
      outline: "bg-transparent border-[var(--border)] text-[var(--muted-foreground)]",
      ghost: "bg-transparent border-transparent text-[var(--muted-foreground)]",
      danger: "bg-transparent border-[var(--destructive)]/30 text-[var(--destructive)]",
      success: "bg-transparent border-[var(--accent)]/30 text-[var(--accent)]",
      warning: "bg-transparent border-[var(--primary)]/30 text-[var(--primary)]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-[10px]",
      md: "px-4 py-2 text-xs",
      lg: "px-6 py-3 text-sm",
      icon: "p-2",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ 
          scale: 1.02, 
          filter: "brightness(1.1)",
          backgroundColor: variant === "ghost" ? "var(--card)" : undefined,
          borderColor: (variant === "outline" || variant === "ghost") ? "var(--primary)" : undefined,
          color: (variant === "outline" || variant === "ghost") ? "var(--primary)" : undefined,
        }}
        whileTap={{ scale: 0.96 }}
        transition={microSpring}
        className={cn(
          "inline-flex items-center justify-center font-mono font-bold uppercase tracking-[0.1em] border transition-colors disabled:opacity-50 disabled:pointer-events-none",
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
