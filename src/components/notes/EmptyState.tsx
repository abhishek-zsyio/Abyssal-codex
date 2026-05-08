"use client";

import { motion } from "framer-motion";
import { Plus, Terminal, Cpu, Database, Command } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/DataDisplay";

interface EmptyStateProps {
  onAddNote: () => void;
}

const EmptyState = ({ onAddNote }: EmptyStateProps) => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-[var(--background)] p-8 text-center border-l border-[var(--border)] relative overflow-hidden">
      <div className="relative mb-12">
        <div className="relative w-32 h-32 border border-[var(--border)] bg-[var(--card)] flex items-center justify-center shadow-2xl">
          <Terminal className="text-[var(--primary)] w-12 h-12" />
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 z-20"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
           <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
           <span className="text-[10px] font-mono text-[var(--primary)] tracking-[0.2em] uppercase">System_Idle</span>
        </div>
        <h2 className="text-4xl font-bold text-[var(--foreground)] uppercase tracking-tighter mb-4">
          ABYSSAL_VAULT_EMPTY
        </h2>
        <p className="text-[var(--muted-foreground)] font-mono text-xs max-w-sm mx-auto leading-relaxed uppercase opacity-80">
          Database is currently empty. Initialize a new document instance to begin recording data.
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-8 mb-12 w-full max-w-md border-y border-[var(--border)] py-8 relative"
      >
        <div className="flex flex-col items-center">
           <Cpu size={16} className="text-[var(--muted-foreground)] mb-2" />
           <span className="text-[10px] font-mono text-[var(--muted-foreground)]">CPU: 0.02%</span>
        </div>
        <div className="flex flex-col items-center">
           <Database size={16} className="text-[var(--muted-foreground)] mb-2" />
           <span className="text-[10px] font-mono text-[var(--muted-foreground)]">MEM: 48MB</span>
        </div>
        <div className="flex flex-col items-center">
           <Command size={16} className="text-[var(--muted-foreground)] mb-2" />
           <span className="text-[10px] font-mono text-[var(--muted-foreground)]">CMD: READY</span>
        </div>
      </motion.div>
      
      <Button 
        variant="warning"
        onClick={() => onAddNote()}
        className="px-12 py-5"
      >
        <Plus size={20} className="mr-3" />
        Initialize_New_Note
      </Button>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest flex flex-wrap justify-center gap-8 px-4"
      >
        <div className="flex items-center gap-2">
          <Kbd>Cmd+K</Kbd> <span>Global Search</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Cmd+N</Kbd> <span>New Note</span>
        </div>
      </motion.div>
    </div>
  );
};

export default EmptyState;
