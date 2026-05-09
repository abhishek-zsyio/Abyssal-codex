"use client";

import React, { useEffect, useState } from "react";
import { X, Minus, Square } from "lucide-react";

const TitleBar = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).electron) {
      setIsElectron(true);
    }
  }, []);

  if (!isElectron) return null;

  const handleMinimize = () => {
    (window as any).electron.minimize();
  };

  const handleMaximize = () => {
    (window as any).electron.maximize();
  };

  const handleClose = () => {
    (window as any).electron.close();
  };

  return (
    <div 
      className="h-8 bg-[#0a0a0a] border-b border-[#1d2021] flex items-center justify-between px-3 select-none flex-shrink-0"
      style={{ WebkitAppRegion: "drag" } as any}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 border border-[#3c3836] bg-[#282828] flex items-center justify-center">
          <div className="w-1 h-1 bg-[#fb4934] animate-pulse" />
        </div>
        <span className="text-[10px] font-mono text-[#928374] uppercase tracking-widest">
          Abyssal_Codex_v1.0.4
        </span>
      </div>

      <div className="flex items-center" style={{ WebkitAppRegion: "no-drag" } as any}>
        <button 
          onClick={handleMinimize}
          className="p-1.5 hover:bg-[#1d2021] text-[#928374] hover:text-[#ebdbb2] transition-colors"
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={handleMaximize}
          className="p-1.5 hover:bg-[#1d2021] text-[#928374] hover:text-[#ebdbb2] transition-colors"
        >
          <Square size={12} />
        </button>
        <button 
          onClick={handleClose}
          className="p-1.5 hover:bg-[#fb4934]/10 hover:text-[#fb4934] text-[#928374] transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
