"use client";

import { motion, AnimatePresence } from "framer-motion";
import { softSpring, microSpring } from "@/lib/transitions";
import { useEffect, useState, useMemo } from "react";
import { Terminal, Cpu, ShieldCheck, Database } from "lucide-react";
import Image from "next/image";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = useMemo(() => [
    "INITIALIZING_CORE...",
    "MOUNTING_FILESYSTEM...",
    "LOADING_CORE_MODULES...",
    "DECRYPTING_CODEX...",
    "ESTABLISHING_LINK...",
    "READY"
  ], []);

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
  }, [onFinish, statusMessages.length]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.05, 
        filter: "blur(10px) brightness(1.5)",
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
      }}
      className="fixed inset-0 z-[20000] bg-[var(--background)] flex flex-col items-center justify-center font-mono p-8 overflow-hidden"
    >

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      
      <div className="w-full max-w-sm relative">
        <div className="flex justify-between items-center mb-10 opacity-40">
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-[var(--primary)]" />
            <span className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">v4.0.1</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-[var(--accent)]" />
            <span className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Secure</span>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 relative">
             <Image src="/logo.png" alt="Abyssal Codex Logo" width={64} height={64} className="relative z-10" />
          </div>

          <h1 className="text-xl font-bold text-[var(--foreground)] tracking-[0.4em] uppercase mb-1">
            ABYSSAL_CODEX
          </h1>
          <div className="h-px w-16 bg-[var(--primary)]/30 mb-8" />

          <div className="w-full space-y-4">
            <div className="flex justify-between items-end text-[10px] font-bold">
                <div className="flex items-center gap-2 h-4 relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={statusIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={microSpring}
                      className="flex items-center gap-2"
                    >
                      <Terminal size={12} className="text-[var(--primary)]" />
                      <span className="text-[var(--foreground)]">{statusMessages[statusIndex]}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <motion.span 
                  key={progress}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-[var(--primary)]"
                >
                  {progress}%
                </motion.span>
            </div>
            
            <div className="h-px w-full bg-[var(--border)] overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--primary)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={softSpring}
                />
            </div>

            <div className="flex justify-between items-center opacity-25 text-[8px] uppercase tracking-widest pt-2">
               <div className="flex items-center gap-1.5">
                 <Database size={9} />
                 <span>Local storage</span>
               </div>
               <span>{progress}% loaded</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SplashScreen;
