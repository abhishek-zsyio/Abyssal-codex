"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarTagsProps {
  allTags: string[];
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
}

export const SidebarTags = ({ allTags, activeTag, setActiveTag }: SidebarTagsProps) => {
  if (allTags.length === 0 && !activeTag) return null;

  return (
    <div className="flex-shrink-0 border-b border-[var(--border)]/50">
      {/* active filter pill */}
      <AnimatePresence>
        {activeTag && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)]/5 border-b border-[var(--border)]/50">
              <span className="text-[8px] font-mono text-[var(--muted-foreground)]/50 uppercase tracking-wider">Filter:</span>
              <button
                onClick={() => setActiveTag(null)}
                className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)]/20 transition-colors"
              >
                <Hash size={8} />
                {activeTag}
                <X size={8} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* tag chips */}
      {allTags.length > 0 && (
        <div className="flex gap-1 overflow-x-auto no-scrollbar px-3 py-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                "flex-shrink-0 flex items-center gap-0.5 text-[8px] font-mono px-1.5 py-0.5 border transition-colors",
                activeTag === tag
                  ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/40"
                  : "text-[var(--muted-foreground)]/60 border-[var(--border)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
              )}
            >
              <Hash size={7} />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

SidebarTags.displayName = "SidebarTags";
