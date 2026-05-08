"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Terminal, ArrowLeft, Cpu } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen bg-[#0a0a0a] text-[#ebdbb2] flex flex-col items-center justify-center font-mono p-8 relative overflow-hidden">
      {/* Background Glitch Effects */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(#fb4934 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      


      <div className="z-10 flex flex-col items-center max-w-lg text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 border-2 border-[#fb4934] flex items-center justify-center mb-12 relative"
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#fb4934]" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#fb4934]" />
          <ShieldAlert size={48} className="text-[#fb4934]" />
        </motion.div>

        <div className="space-y-2 mb-12">
          <div className="flex items-center justify-center gap-4 opacity-50 mb-4">
             <div className="h-px w-12 bg-[#fb4934]" />
             <span className="text-[10px] tracking-[0.5em] text-[#fb4934]">CRITICAL_ERROR</span>
             <div className="h-px w-12 bg-[#fb4934]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            Sector_Not_Found
          </h1>
          <p className="text-[#928374] text-xs uppercase tracking-[0.2em] mt-6">
            The requested address [0x404_DATA] returned a null pointer.
            <br />Data integrity cannot be verified.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
           <Link 
            href="/" 
            className="flex items-center justify-center gap-3 px-6 py-4 bg-[#fabd2f] text-[#0a0a0a] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#ebdbb2] transition-all group"
          >
            <Terminal size={14} />
            Return_To_Core
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-3 px-6 py-4 border border-[#282828] text-[#928374] text-[10px] font-bold uppercase tracking-[0.2em] hover:border-[#fb4934] hover:text-[#fb4934] transition-all"
          >
            <Cpu size={14} />
            Retry_Sync
          </button>
        </div>

        <div className="mt-20 flex items-center gap-8 opacity-20">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[8px] uppercase tracking-widest">Error_Code</span>
            <span className="text-[10px] font-bold tracking-tighter uppercase">ERR_DATA_SEG_01</span>
          </div>
          <div className="w-px h-8 bg-[#ebdbb2]" />
          <div className="flex flex-col items-start gap-1">
            <span className="text-[8px] uppercase tracking-widest">System_Status</span>
            <span className="text-[10px] font-bold tracking-tighter uppercase">Degraded</span>
          </div>
        </div>
      </div>


    </div>
  );
}
