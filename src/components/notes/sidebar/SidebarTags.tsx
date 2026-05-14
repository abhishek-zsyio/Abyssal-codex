"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarTagsProps {
  allTags: string[];
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
}

export const SidebarTags = ({
  allTags,
  activeTag,
  setActiveTag,
}: SidebarTagsProps) => {
  if (allTags.length === 0 && !activeTag) return null;

  return (
    <div className="flex-shrink-0 px-6 pt-4 empty:hidden">
      <AnimatePresence>
        {activeTag && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-3 overflow-hidden"
          >
            <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase">Filtered by:</span>
            <button
              onClick={() => setActiveTag(null)}
              className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 bg-[var(--primary)] text-[var(--background)] font-bold"
            >
              <Hash size={8} /> {activeTag} <X size={8} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {allTags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                "flex-shrink-0 flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 border transition-colors",
                activeTag === tag
                  ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] font-bold"
                  : "text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--accent)] hover:border-[var(--accent)]"
              )}
            >
              <Tag size={8} /> {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

SidebarTags.displayName = "SidebarTags";
