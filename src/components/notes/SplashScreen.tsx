"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Hash, Terminal, Cpu, ShieldCheck, Database } from "lucide-react";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = [
    "INITIALIZING_CORE...",
    "MOUNTING_FILESYSTEM...",
    "LOADING_CORE_MODULES...",
    "DECRYPTING_CODEX...",
    "ESTABLISHING_LINK...",
    "READY"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev < statusMessages.length - 1 ? prev + 1 : prev));
    }, 400);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[20000] bg-[var(--background)] flex flex-col items-center justify-center font-mono p-8"
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      
      <div className="w-full max-w-md relative">
        <div className="flex justify-between items-center mb-12 opacity-50">
          <div className="flex items-center gap-4">
            <Cpu size={14} className="text-[var(--primary)]" />
            <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">System_v.4.0.1</span>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck size={14} className="text-[var(--accent)]" />
            <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Secure_Link</span>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="mb-8 relative">
             <img src="/logo.png" alt="Abyssal Codex Logo" className="w-20 h-20 relative z-10" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-[0.4em] uppercase mb-2">
            ABYSSAL_CODEX
          </h1>
          <div className="h-px w-24 bg-[var(--primary)]/30 mb-12" />

          <div className="w-full space-y-4">
            <div className="flex justify-between items-end text-[10px] font-bold">
               <div className="flex items-center gap-2">
                 <Terminal size={12} className="text-[var(--primary)]" />
                 <span className="text-[var(--foreground)]">{statusMessages[statusIndex]}</span>
               </div>
               <span className="text-[var(--primary)]">{progress}%</span>
            </div>
            
            <div className="h-1 w-full bg-[var(--border)] overflow-hidden">
               <motion.div 
                 className="h-full bg-[var(--primary)]" 
                 style={{ width: `${progress}%` }}
               />
            </div>

            <div className="flex justify-between items-center opacity-30 text-[8px] uppercase tracking-widest pt-2">
               <div className="flex items-center gap-2">
                 <Database size={10} />
                 <span>Syncing_Local_Storage</span>
               </div>
               <span>Hash: 0x82...f92</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SplashScreen;
