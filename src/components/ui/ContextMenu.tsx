"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  // Keep menu within viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let nextX = x;
      let nextY = y;

      if (x + rect.width > viewportWidth) {
        nextX = x - rect.width;
      }

      if (y + rect.height > viewportHeight) {
        nextY = y - rect.height;
      }
      
      menu.style.left = `${Math.max(8, nextX)}px`;
      menu.style.top = `${Math.max(8, nextY)}px`;
    }
  }, [isOpen, x, y]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.98, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-[50000] min-w-[240px] bg-[var(--background)]/95 backdrop-blur-md border border-[var(--primary)] shadow-[8px_8px_0px_rgba(250,189,47,0.1)] p-0.5 overflow-hidden"
          style={{ left: x, top: y }}
        >
          {/* Subtle Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

          <div className="relative z-10">
            {/* Header / System Info */}
            <div className="px-3 py-1.5 mb-0.5 bg-[var(--primary)]/5 border-b border-[var(--primary)]/20 flex items-center justify-between">
              <span className="text-[7px] font-mono text-[var(--primary)] font-black uppercase tracking-[0.3em]">System.Node.v2.4</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-[var(--primary)] animate-pulse" />
                <div className="w-1 h-1 bg-[var(--primary)]/20" />
              </div>
            </div>

            <div className="py-1">
              {items.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item.divider && <div className="my-1 border-t border-[var(--border)]/30 mx-3" />}
                  <button
                    disabled={item.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item.disabled) {
                        item.onClick();
                        onClose();
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-mono transition-all group relative",
                      item.disabled ? "opacity-25 cursor-not-allowed" : "hover:bg-[var(--primary)]/10",
                      item.variant === "danger" && "text-[var(--destructive)] hover:bg-[var(--destructive)]/10",
                      item.variant === "success" && "text-[var(--accent)] hover:bg-[var(--accent)]/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <div className="w-4 flex justify-center">
                          <item.icon size={13} className={cn(
                            "opacity-50 group-hover:opacity-100 transition-opacity",
                            item.variant === "danger" && "text-[var(--destructive)]",
                            item.variant === "success" && "text-[var(--accent)]"
                          )} />
                        </div>
                      )}
                      <span className="tracking-tight group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                    </div>
                    
                    {item.shortcut && (
                      <span className="text-[8px] font-mono opacity-30 group-hover:opacity-60 ml-4 whitespace-nowrap">
                        {item.shortcut}
                      </span>
                    )}

                    {/* Left Active Indicator */}
                    <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[var(--primary)] scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
                  </button>
                </React.Fragment>
              ))}
            </div>
            
            {/* Footer / Meta Info */}
            <div className="px-3 py-1 bg-[var(--primary)]/5 border-t border-[var(--primary)]/10 flex items-center justify-between">
              <span className="text-[6px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest opacity-50">
                Encrypted_Session_0x82
              </span>
              <span className="text-[6px] font-mono text-[var(--primary)] opacity-40 uppercase">
                {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Brutalist Corner Decorations */}
          <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 border-t-2 border-l-2 border-[var(--primary)]" />
          <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 border-b-2 border-r-2 border-[var(--primary)]" />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
