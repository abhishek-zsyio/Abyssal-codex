"use client";

import React from "react";
import { Play } from "lucide-react";

export const CodeBlockHeader = ({ language, code }: { language: string; code: string }) => {
  const handleRun = () => {
    window.dispatchEvent(new CustomEvent('abyssal-log', { 
      detail: { message: `EXECUTION_INITIATED: [${language.toUpperCase()}]`, type: 'system' } 
    }));
    
    if (language === 'js' || language === 'javascript') {
      try {
        const originalLog = console.log;
        let output = "";
        console.log = (...args) => {
          output += args.join(" ") + "\n";
        };
        
        // eslint-disable-next-line no-new-func
        const fn = new Function(code);
        fn();
        
        console.log = originalLog;
        window.dispatchEvent(new CustomEvent('abyssal-log', { 
          detail: { message: output || "EXECUTION_SUCCESSFUL: (NO_OUTPUT)", type: 'success' } 
        }));
      } catch (err) {
        const error = err as Error;
        window.dispatchEvent(new CustomEvent('abyssal-log', { 
          detail: { message: `RUNTIME_ERROR: ${error.message}`, type: 'error' } 
        }));
      }
    } else {
      // Simulation for other languages
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('abyssal-log', { 
          detail: { message: `${language.toUpperCase()}_RUNTIME: SYNTAX_VALIDATION_PASSED...`, type: 'info' } 
        }));
        window.dispatchEvent(new CustomEvent('abyssal-log', { 
          detail: { message: `OUTPUT: Simulated result of ${language.toUpperCase()} logic execution.`, type: 'success' } 
        }));
      }, 400);
    }
  };

  return (
    <button 
      onClick={handleRun}
      className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all uppercase tracking-widest bg-[var(--background)] px-2 py-1 border border-[var(--primary)]/30 hover:border-[var(--primary)]"
    >
      <Play size={10} /> RUN
    </button>
  );
};
