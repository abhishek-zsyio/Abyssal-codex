"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  currentPath?: string | null;
}

export default function NewFolderModal({ isOpen, onClose, onConfirm, currentPath }: NewFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onConfirm(folderName.trim());
      onClose();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[501] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="pointer-events-auto w-full max-w-md bg-[var(--background)] border border-[var(--border)] shadow-2xl overflow-hidden relative"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
                <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,4px_100%]" />
              </div>

              <div className="relative z-10">
                <div className="px-6 py-4 border-b border-dotted border-[var(--border)] flex items-center justify-between bg-[var(--card)]/30">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-mono text-[var(--primary)] uppercase tracking-[0.4em] block mb-0.5">
                      DIR_ALLOCATION // NEW_CLUSTER
                    </span>
                    <h2 className="text-xs font-bold font-mono text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                      <FolderPlus size={14} className="text-[var(--primary)]" />
                      Create_Folder
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                        Folder_Identifier
                      </label>
                      {currentPath && (
                        <span className="text-[8px] font-mono text-[var(--primary)] opacity-50 uppercase tracking-tighter truncate max-w-[200px]">
                          Location: {currentPath}
                        </span>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] opacity-50 group-focus-within:text-[var(--primary)] transition-colors">
                         <Terminal size={12} />
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        placeholder="ENTER_CLUSTER_NAME..."
                        className="w-full bg-[var(--card)]/30 border border-[var(--border)]/50 py-3 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--card)]/50 transition-all placeholder:text-[var(--muted-foreground)]/30 text-[var(--foreground)]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      disabled={!folderName.trim()}
                      className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--background)] font-black uppercase tracking-widest text-[10px] rounded-none border-none shadow-[0_0_15px_rgba(250,189,47,0.2)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                    >
                      INITIATE_ALLOCATION
                    </Button>
                    <div className="flex items-center justify-center gap-2 py-1">
                      <div className="w-1 h-1 bg-[var(--muted-foreground)] opacity-20 rounded-full" />
                      <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] opacity-40">
                        Press ESC to abort operation
                      </span>
                      <div className="w-1 h-1 bg-[var(--muted-foreground)] opacity-20 rounded-full" />
                    </div>
                  </div>
                </form>
                
                <div className="px-6 py-2 bg-[var(--card)]/50 border-t border-dotted border-[var(--border)] flex items-center gap-2">
                  <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-pulse" />
                  <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest opacity-60">
                    Kernel_Status: Awaiting_Input_Parameters
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
