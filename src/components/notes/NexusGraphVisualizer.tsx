"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Target, Zap } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Note } from "@/types/note";

interface SidebarGraphProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
}

interface Node {
  id: string;
  title: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

const NexusGraphVisualizer = ({ notes, activeNoteId, onSelectNote }: SidebarGraphProps) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  
  // Dynamic color refs for Canvas rendering
  const themeColors = useRef({
    background: "#1d2021",
    primary: "#0a0907ff",
    muted: "#928374",
    accent: "#b8bb26",
    border: "#3c3836",
    card: "#282828",
    foreground: "#ebdbb2"
  });

  useEffect(() => {
    // Read current theme colors from computed styles
    const style = getComputedStyle(document.documentElement);
    themeColors.current = {
      background: style.getPropertyValue("--background").trim() || "#1d2021",
      primary: style.getPropertyValue("--primary").trim() || "#fabd2f",
      muted: style.getPropertyValue("--muted-foreground").trim() || "#928374",
      accent: style.getPropertyValue("--accent").trim() || "#b8bb26",
      border: style.getPropertyValue("--border").trim() || "#3c3836",
      card: style.getPropertyValue("--card").trim() || "#282828",
      foreground: style.getPropertyValue("--foreground").trim() || "#ebdbb2",
    };
  }, [theme]);

  const graphNodes = useMemo(() => {
    if (notes.length === 0) return [];
    return notes.map((note, i) => {
      const angle = (i / notes.length) * Math.PI * 2;
      const radius = 60 + Math.random() * 40;
      return {
        id: note.id,
        title: note.title || "Untitled",
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 3 + Math.sqrt((note.content?.length || 0) / 100),
        color: note.id === activeNoteId ? themeColors.current.primary : themeColors.current.muted
      };
    });
  }, [notes, activeNoteId, theme]); // Added theme dependency to update colors in memo

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current!.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let animationFrame: number;
    let rotation = 0;

    const render = () => {
      rotation += 0.002;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(rotation);

      // Draw Connections
      ctx.beginPath();
      ctx.strokeStyle = themeColors.current.primary + "10"; // Low opacity primary
      ctx.lineWidth = 0.5;
      graphNodes.forEach((node, i) => {
        const next = graphNodes[(i + 1) % graphNodes.length];
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(next.x, next.y);
      });
      ctx.stroke();

      // Draw Nodes
      graphNodes.forEach(node => {
        const isActive = node.id === activeNoteId;
        const isHovered = hoveredNode?.id === node.id;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + (isHovered ? 2 : 0), 0, Math.PI * 2);
        
        if (isActive) {
          ctx.fillStyle = themeColors.current.primary;
        } else if (isHovered) {
          ctx.fillStyle = themeColors.current.foreground;
        } else {
          ctx.fillStyle = themeColors.current.border;
        }

        if (isActive || isHovered) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle as string;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        if (isActive) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size + 4, 0, Math.PI * 2);
          ctx.strokeStyle = themeColors.current.primary + "40";
          ctx.stroke();
        }
      });

      ctx.restore();
      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [graphNodes, activeNoteId, hoveredNode, theme]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;
    
    let found: Node | null = null;
    for (const node of graphNodes) {
      const dx = node.x - mx;
      const dy = node.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 15) {
        found = node;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handleClick = () => {
    if (hoveredNode) {
      onSelectNote(hoveredNode.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <div className="p-4 border-b border-dotted border-[var(--border)] bg-[var(--card)]/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-0.5">Nexus_Engine</span>
            <h1 className="text-sm font-bold text-[var(--foreground)] tracking-tight">ACTIVE_TOPOLOGY</h1>
          </div>
          <Zap size={14} className="text-[var(--primary)] animate-pulse" />
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="flex-1 relative overflow-hidden bg-[var(--background)] flex items-center justify-center cursor-crosshair"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {/* Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,118,0.02))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />

        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 bg-[var(--card)] border border-[var(--primary)] p-2 z-20 shadow-xl"
            >
              <span className="text-[9px] font-mono font-bold text-[var(--primary)] uppercase truncate block">
                {hoveredNode.title}
              </span>
              <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase block opacity-50">
                0x{hoveredNode.id.substring(0, 8)} // SECTOR_ACTIVE
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="grid grid-cols-2 gap-2">
           <div className="bg-[var(--card)] border border-[var(--border)] p-2 flex flex-col gap-1">
              <Target size={10} className="text-[var(--primary)]/50" />
              <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-tighter">Node_Count</span>
              <span className="text-[10px] font-mono font-bold text-[var(--foreground)]">{notes.length}</span>
           </div>
           <div className="bg-[var(--card)] border border-[var(--border)] p-2 flex flex-col gap-1">
              <Activity size={10} className="text-[var(--accent)]/50" />
              <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-tighter">Sync_Status</span>
              <span className="text-[10px] font-mono font-bold text-[var(--accent)]">NOMINAL</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NexusGraphVisualizer;
