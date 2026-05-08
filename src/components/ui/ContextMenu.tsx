"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { microSpring } from "@/lib/transitions";
import { LucideIcon } from "lucide-react";

export interface ContextMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
  variant?: "default" | "danger" | "success";
  divider?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Keep menu within viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (x + rect.width > viewportWidth) {
        menu.style.left = `${x - rect.width}px`;
      } else {
        menu.style.left = `${x}px`;
      }

      if (y + rect.height > viewportHeight) {
        menu.style.top = `${y - rect.height}px`;
      } else {
        menu.style.top = `${y}px`;
      }
    }
  }, [isOpen, x, y]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={microSpring}
          className="fixed z-[1000] min-w-[220px] bg-[var(--background)] border border-[var(--primary)] shadow-[0_0_20px_rgba(250,189,47,0.15)] p-1 overflow-hidden"
          style={{ left: x, top: y }}
        >
          {/* Scanner Line Effect */}
          <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[1px] bg-[var(--primary)]/20 pointer-events-none z-0"
          />

          <div className="relative z-10">
            {/* Header / Meta */}
            <div className="px-3 py-1 mb-1 border-b border-dotted border-[var(--border)] flex items-center justify-between">
              <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em]">System_Context</span>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-[var(--primary)]" />
                <div className="w-2 h-1 bg-[var(--primary)]/30" />
              </div>
            </div>

            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.divider && <div className="my-1 border-t border-dotted border-[var(--border)] mx-2" />}
                <button
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick();
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-all group relative overflow-hidden",
                    item.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--primary)] hover:text-[var(--background)]",
                    item.variant === "danger" && "text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-[var(--background)]",
                    item.variant === "success" && "text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--background)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon size={12} className="opacity-70 group-hover:opacity-100" />}
                    <span className="font-bold">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className={cn(
                      "text-[8px] opacity-40 group-hover:opacity-100",
                      item.disabled ? "hidden" : "block"
                    )}>
                      {item.shortcut}
                    </span>
                  )}
                  
                  {/* Hover Bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </React.Fragment>
            ))}
            
            {/* Footer / Meta */}
            <div className="mt-1 pt-1 border-t border-dotted border-[var(--border)] px-3">
              <span className="text-[7px] font-mono text-[var(--muted-foreground)] italic opacity-50 uppercase tracking-tighter">
                Access_Level: 0x88_ROOT
              </span>
            </div>
          </div>

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[var(--primary)]" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[var(--primary)]" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[var(--primary)]" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[var(--primary)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
