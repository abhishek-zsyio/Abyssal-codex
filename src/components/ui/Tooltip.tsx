"use client";

import React, { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: ReactNode;
  content: string;
  shortcut?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip = ({ children, content, shortcut, position = "bottom" }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === "bottom" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === "bottom" ? -10 : 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 pointer-events-none ${positions[position]}`}
          >
            <div className="bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 shadow-2xl backdrop-blur-md flex items-center gap-3 whitespace-nowrap">
              <span className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase tracking-wider">
                {content}
              </span>
              {shortcut && (
                <div className="flex items-center gap-1 border-l border-[var(--border)] pl-3">
                  <span className="text-[9px] font-mono text-[var(--muted-foreground)] opacity-60">
                    {shortcut}
                  </span>
                </div>
              )}
            </div>
            {/* Arrow */}
            <div 
              className={`absolute w-2 h-2 bg-[var(--card)] border-t border-l border-[var(--border)] rotate-45 ${
                position === "bottom" ? "-top-1 left-1/2 -translate-x-1/2" : 
                position === "top" ? "-bottom-1 left-1/2 -translate-x-1/2 rotate-[225deg]" : ""
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
