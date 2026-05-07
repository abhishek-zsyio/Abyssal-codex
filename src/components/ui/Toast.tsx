"use client";

import { motion, AnimatePresence } from "framer-motion";
import { spring, softSpring, microSpring, transitionDefaults } from "@/lib/transitions";
import { X, CheckCircle2, AlertCircle, Info, Terminal, ShieldAlert } from "lucide-react";
import { useToast, Toast as ToastType } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TOAST_ICONS = {
  success: <CheckCircle2 size={14} className="text-[#b8bb26]" />,
  error: <ShieldAlert size={14} className="text-[#fb4934]" />,
  warning: <AlertCircle size={14} className="text-[#fabd2f]" />,
  info: <Info size={14} className="text-[#83a598]" />,
  system: <Terminal size={14} className="text-[#d3869b]" />,
};

const TOAST_COLORS = {
  success: "border-[#b8bb26] bg-[var(--card)]",
  error: "border-[#fb4934] bg-[var(--card)]",
  warning: "border-[#fabd2f] bg-[var(--card)]",
  info: "border-[#83a598] bg-[var(--card)]",
  system: "border-[#d3869b] bg-[var(--card)]",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none w-full max-w-[320px]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            transition={softSpring}
            className={cn(
              "pointer-events-auto relative group overflow-hidden border p-4 shadow-2xl",
              TOAST_COLORS[toast.type] || "border-[var(--border)] bg-[var(--card)]"
            )}
          >
            {/* Technical Background Details */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[currentColor] to-transparent opacity-20" />
            <div className="absolute top-0 right-0 w-1 h-1 bg-[currentColor] opacity-40" />
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-[currentColor] opacity-40" />
            
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex-shrink-0">
                {TOAST_ICONS[toast.type] || TOAST_ICONS.info}
              </div>
              
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40">
                    {toast.type}_Log
                  </span>
                  <button 
                    onClick={() => removeToast(toast.id)}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
                
                <p className="text-[11px] font-mono font-bold leading-relaxed text-[var(--foreground)] uppercase tracking-wider">
                  {toast.message}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-[2px] flex-1 bg-[var(--border)] relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-[currentColor]"
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: (toast.duration || 3000) / 1000, ease: "linear" }}
                    />
                  </div>
                  <span className="text-[7px] font-mono opacity-30 tabular-nums">
                    {toast.id.split('-')[0]}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
