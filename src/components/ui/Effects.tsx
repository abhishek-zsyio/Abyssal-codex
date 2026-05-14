"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const Scanline = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
      <div 
        className="w-full h-[200%] bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px]"
        style={{
          animation: "scanline 10s linear infinite"
        }}
      />
    </div>
  );
};

export const Noise = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] mix-blend-overlay">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
};

export const GlitchText = ({ text, className }: { text: string; className?: string }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} data-text={text}>
      <span className="relative z-10">{text}</span>
      {isGlitching && (
        <>
          <span className="absolute top-0 left-0 -z-10 text-[var(--destructive)] translate-x-[2px] translate-y-[1px] opacity-70">
            {text}
          </span>
          <span className="absolute top-0 left-0 -z-10 text-[var(--primary)] -translate-x-[2px] -translate-y-[1px] opacity-70">
            {text}
          </span>
        </>
      )}
    </div>
  );
};

export const DataStream = () => {
  const [streams] = useState(() => Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
    left: `${i * 10}%`,
    content: Array.from({ length: 20 }).map(() => (Math.random() > 0.5 ? "1" : "0")).join("\n")
  })));

  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden font-mono text-[8px] leading-none">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute whitespace-pre"
          style={{
            left: stream.left,
            animation: `dataStreamFall ${stream.duration}s ${stream.delay}s linear infinite`,
            top: "-120px"
          }}
        >
          {stream.content}
        </div>
      ))}
    </div>
  );
};

export const Magnetic = ({ children, strength = 0.5 }: { children: React.ReactNode; strength?: number }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export const GlowCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("glow-card border border-[var(--border)] bg-[var(--card)]/50 p-4 relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[var(--primary)] opacity-0 hover:opacity-[0.03] transition-opacity pointer-events-none" />
      {children}
    </div>
  );
};

export const CornerAccents = () => {
  return (
    <>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--primary)] opacity-40 z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--primary)] opacity-40 z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--primary)] opacity-40 z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--primary)] opacity-40 z-10 pointer-events-none" />
    </>
  );
};
