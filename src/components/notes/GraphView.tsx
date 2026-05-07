"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, ZoomIn, ZoomOut, Maximize2, Hash, Activity, Zap, Cpu } from "lucide-react";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import * as d3 from "d3-force";

import { useTheme } from "@/hooks/use-theme";

interface GraphViewProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  variant?: "modal" | "tab";
  onSelectNote?: (id: string) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  content: string;
  size: number;
  color: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export default function GraphView({ isOpen, onClose, notes, variant = "modal", onSelectNote }: GraphViewProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 0.8 });
  const hoveredNodeRef = useRef<string | null>(null);
  
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  const themeColors = useRef({
    background: "#0d0d0d",
    foreground: "#ebdbb2",
    primary: "#fabd2f",
    accent: "#b8bb26",
    border: "#262626",
    muted: "#928374",
    destructive: "#fb4934",
    card: "#141414"
  });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    themeColors.current = {
      background: style.getPropertyValue("--background").trim() || "#0d0d0d",
      foreground: style.getPropertyValue("--foreground").trim() || "#ebdbb2",
      primary: style.getPropertyValue("--primary").trim() || "#fabd2f",
      accent: style.getPropertyValue("--accent").trim() || "#b8bb26",
      border: style.getPropertyValue("--border").trim() || "#262626",
      muted: style.getPropertyValue("--muted-foreground").trim() || "#928374",
      destructive: style.getPropertyValue("--destructive").trim() || "#fb4934",
      card: style.getPropertyValue("--card").trim() || "#141414",
    };
  }, [theme, isOpen]);

  const particles = useMemo(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      p.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2
      });
    }
    return p;
  }, []);

  const { initialNodes, initialLinks } = useMemo(() => {
    const nodeColors = [
      themeColors.current.primary,
      themeColors.current.accent,
      themeColors.current.destructive,
      themeColors.current.muted,
    ];

    const nodes: Node[] = notes.map((note, i) => ({
      id: note.id,
      title: note.title || "Untitled",
      content: note.content || "",
      size: 6 + Math.sqrt((note.content?.length || 0) / 60),
      color: nodeColors[i % nodeColors.length],
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
    }));

    const links: Link[] = [];
    const connectedPairs = new Set<string>();

    notes.forEach(sourceNote => {
      const wikiLinks = sourceNote.content?.match(/\[\[(.*?)\]\]/g) || [];
      const uniqueTargets = new Set(wikiLinks.map(l => l.slice(2, -2).toLowerCase().trim()));

      uniqueTargets.forEach(targetTitle => {
        const targetNode = nodes.find(n => n.title.toLowerCase().trim() === targetTitle);
        if (targetNode && targetNode.id !== sourceNote.id) {
          const pairKey = [sourceNote.id, targetNode.id].sort().join("---");
          if (!connectedPairs.has(pairKey)) {
            links.push({ source: sourceNote.id, target: targetNode.id });
            connectedPairs.add(pairKey);
          }
        }
      });
    });

    return { initialNodes: nodes, initialLinks: links };
  }, [notes, theme]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleBrowserZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1.05 : 1 / 1.05;
        transformRef.current.k = Math.min(Math.max(transformRef.current.k * delta, 0.1), 4);
      }
    };
    container.addEventListener('wheel', handleBrowserZoom, { passive: false });

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const simulation = d3.forceSimulation<Node>(initialNodes)
      .force("link", d3.forceLink<Node, Link>(initialLinks).id(d => d.id).distance(120).strength(0.5))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide<Node>().radius(d => d.size + 20));

    simulationRef.current = simulation;

    let animationFrame: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      const { x, y, k } = transformRef.current;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // Environmental Grid
      ctx.save();
      ctx.translate(width / 2 + x * 0.1, height / 2 + y * 0.1);
      ctx.strokeStyle = themeColors.current.foreground + "08"; // Very subtle
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let i = -20; i <= 20; i++) {
        ctx.beginPath(); ctx.moveTo(-2000, i * gridSize); ctx.lineTo(2000, i * gridSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i * gridSize, -2000); ctx.lineTo(i * gridSize, 2000); ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(width / 2 + x, height / 2 + y);
      ctx.scale(k, k);

      // Ambient Particles
      ctx.fillStyle = themeColors.current.foreground + "33"; // 0.2 opacity
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (Math.abs(p.x) > 1000) p.vx *= -1;
        if (Math.abs(p.y) > 1000) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / k, 0, Math.PI * 2);
        ctx.fill();
      });

      // Curved Neural Links
      ctx.lineWidth = 1 / k;
      initialLinks.forEach(link => {
        const source = link.source as Node;
        const target = link.target as Node;
        
        const midX = (source.x! + target.x!) / 2;
        const midY = (source.y! + target.y!) / 2;
        const dist = Math.sqrt(Math.pow(target.x! - source.x!, 2) + Math.pow(target.y! - source.y!, 2));
        const offset = dist * 0.15;
        
        const angle = Math.atan2(target.y! - source.y!, target.x! - source.x!);
        const cx = midX + Math.cos(angle + Math.PI/2) * offset;
        const cy = midY + Math.sin(angle + Math.PI/2) * offset;

        ctx.beginPath();
        ctx.moveTo(source.x!, source.y!);
        ctx.quadraticCurveTo(cx, cy, target.x!, target.y!);
        
        const grad = ctx.createLinearGradient(source.x!, source.y!, target.x!, target.y!);
        grad.addColorStop(0, themeColors.current.muted + "0D"); // 0.05
        grad.addColorStop(0.5, themeColors.current.muted + "33"); // 0.2
        grad.addColorStop(1, themeColors.current.muted + "0D");
        
        ctx.strokeStyle = grad;
        ctx.stroke();

        // Data Flow Animation
        const progress = (time * 0.2 + (source.x! + source.y!) * 0.005) % 1;
        const t = progress;
        const px = (1-t)*(1-t)*source.x! + 2*(1-t)*t*cx + t*t*target.x!;
        const py = (1-t)*(1-t)*source.y! + 2*(1-t)*t*cy + t*t*target.y!;
        
        ctx.beginPath();
        ctx.arc(px, py, 1 / k, 0, Math.PI * 2);
        ctx.fillStyle = themeColors.current.primary + "66"; // 0.4
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'lighter';

      // Nodes (Neural Cores)
      initialNodes.forEach(node => {
        const isHovered = hoveredNodeRef.current === node.id;
        const size = node.size * (isHovered ? 1.2 : 1.0);
        
        // Bloom
        const grad = ctx.createRadialGradient(node.x!, node.y!, 0, node.x!, node.y!, size * 3);
        grad.addColorStop(0, isHovered ? node.color : node.color + "44");
        grad.addColorStop(1, "transparent");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Center light
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

        if (k > 0.5 || isHovered) {
          ctx.font = `${(isHovered ? 12 : 10) / k}px JetBrains Mono, monospace`;
          ctx.fillStyle = isHovered ? themeColors.current.foreground : themeColors.current.foreground + "66";
          ctx.textAlign = "center";
          ctx.fillText(node.title, node.x!, node.y! + size + 20 / k);
        }
      });

      ctx.restore();
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener('wheel', handleBrowserZoom);
      cancelAnimationFrame(animationFrame);
      simulation.stop();
    };
  }, [isOpen, initialNodes, initialLinks, particles, theme]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width / 2 - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - rect.top - rect.height / 2 - transformRef.current.y) / transformRef.current.k;

    let found: Node | null = null;
    for (const node of initialNodes) {
      const dx = node.x! - mx;
      const dy = node.y! - my;
      if (Math.sqrt(dx * dx + dy * dy) < node.size + 15) {
        found = node;
        break;
      }
    }

    const foundId = found?.id || null;
    if (foundId !== hoveredNodeRef.current) {
      hoveredNodeRef.current = foundId;
      setHoveredNode(found);
    }
  }, [initialNodes]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (hoveredNodeRef.current) {
      onSelectNote?.(hoveredNodeRef.current);
      return;
    }
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialTransform = { ...transformRef.current };

    const onMove = (moveEvent: MouseEvent) => {
      transformRef.current = {
        ...initialTransform,
        x: initialTransform.x + (moveEvent.clientX - startX),
        y: initialTransform.y + (moveEvent.clientY - startY)
      };
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [onSelectNote]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) return;
    const delta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    transformRef.current.k = Math.min(Math.max(transformRef.current.k * delta, 0.05), 4);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {variant === "modal" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[400] bg-[var(--background)]/98 backdrop-blur-xl"
            />
          )}
          
          <motion.div
            initial={variant === "modal" ? { opacity: 0, scale: 0.98, y: 30 } : { opacity: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={variant === "modal" ? { opacity: 0, scale: 0.98, y: 30 } : { opacity: 0 }}
            className={cn(
              "bg-[var(--background)] border border-[var(--border)] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]",
              variant === "modal" ? "fixed inset-4 md:inset-8 z-[401] rounded-2xl" : "relative w-full h-full border-none shadow-none z-0"
            )}
          >
            {/* Abyssal Header */}
            <div className="px-8 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/50 backdrop-blur-md relative z-20">
               <div className="flex items-center gap-10">
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--destructive)] animate-pulse" />
                        <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.4em]">Node_Synchronizer.v4</span>
                     </div>
                     <h2 className="text-xl font-bold font-mono tracking-tighter uppercase text-[var(--foreground)] flex items-center gap-3">
                        Nexus_Neural_Map
                        <Activity size={16} className="text-[var(--primary)]" />
                     </h2>
                  </div>
                  
                  <div className="hidden lg:flex gap-12 border-l border-[var(--border)] pl-12">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase mb-1">Topology_Density</span>
                        <span className="text-xs font-mono font-bold text-[var(--foreground)] tracking-widest">{notes.length} SECTORS</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase mb-1">Encryption_Stream</span>
                        <div className="flex items-center gap-2">
                           <Zap size={10} className="text-[var(--primary)]" />
                           <span className="text-[10px] font-mono font-bold text-[var(--accent)] uppercase">Active_AES_256</span>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="flex bg-[var(--background)] border border-[var(--border)] p-1 rounded-lg">
                     <button onClick={() => transformRef.current.k *= 1.25} className="p-2 hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
                        <ZoomIn size={16} />
                     </button>
                     <button onClick={() => transformRef.current.k /= 1.25} className="p-2 hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
                        <ZoomOut size={16} />
                     </button>
                     <button onClick={() => transformRef.current = { x: 0, y: 0, k: 0.8 }} className="p-2 hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all border-l border-[var(--border)]">
                        <Maximize2 size={16} />
                     </button>
                  </div>
                  {variant === "modal" && (
                    <button onClick={onClose} className="p-2.5 hover:bg-[var(--destructive)]/10 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all rounded-full border border-transparent hover:border-[var(--destructive)]/20">
                      <X size={24} />
                    </button>
                  )}
               </div>
            </div>

            {/* Neural Stage */}
            <div 
              ref={containerRef} 
              className="flex-1 relative cursor-default bg-[var(--background)] overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onWheel={handleWheel}
              style={{ touchAction: 'none' }}
            >
               <canvas ref={canvasRef} className="w-full h-full" />

               {/* Tactical Overlay Elements */}


               <AnimatePresence>
                 {hoveredNode && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 20, scale: 0.95 }}
                     className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none z-30 min-w-[500px]"
                   >
                      <div className="relative group">
                         {/* Bracket Corners */}
                         <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: hoveredNode.color }} />
                         <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: hoveredNode.color }} />
                         <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: hoveredNode.color }} />
                         <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: hoveredNode.color }} />

                         {/* Main Content Card */}
                         <div className="bg-[var(--card)]/90 backdrop-blur-3xl border border-[var(--border)] p-6 shadow-2xl flex flex-col gap-4 overflow-hidden">
                            {/* Scanning Animation */}
                            <motion.div 
                               initial={{ x: "-100%" }}
                               animate={{ x: "100%" }}
                               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                               className="absolute top-0 left-0 h-[1px] w-full"
                               style={{ background: `linear-gradient(90deg, transparent, ${hoveredNode.color}, transparent)` }}
                            />

                            <div className="flex justify-between items-start">
                               <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-3">
                                     <div className="relative flex items-center justify-center">
                                        <Target size={20} style={{ color: hoveredNode.color }} className="relative z-10" />
                                        <div className="absolute inset-0 blur-lg scale-150 opacity-40" style={{ backgroundColor: hoveredNode.color }} />
                                     </div>
                                     <h3 className="text-2xl font-bold font-mono tracking-tighter text-[var(--foreground)] uppercase leading-none">
                                        {hoveredNode.title}
                                     </h3>
                                  </div>
                                  <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] pl-8">
                                     Sector_Index: 0x{hoveredNode.id.substring(0, 8)} // Coord: {Math.floor(hoveredNode.x!)},{Math.floor(hoveredNode.y!)}
                                  </span>
                               </div>
                               
                               <div className="flex flex-col items-end gap-1">
                                  <span className="text-[8px] font-mono text-[var(--primary)] uppercase font-bold tracking-widest">Target_Acquired</span>
                                  <div className="flex gap-1">
                                     {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-2 h-1 bg-[var(--accent)] opacity-30" />
                                     ))}
                                  </div>
                               </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4 border-t border-[var(--border)] pt-4">
                               <div className="col-span-8 flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                     <Activity size={10} className="text-[var(--muted-foreground)]" />
                                     <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Neural_Payload_Dump</span>
                                  </div>
                                  <div className="bg-[var(--background)] p-3 border border-[var(--border)] relative overflow-hidden group">
                                     <p className="text-[10px] font-mono text-[var(--foreground)] line-clamp-3 leading-relaxed relative z-10 italic opacity-80">
                                        {hoveredNode.content || "NO_READABLE_DATA_STREAM_FOUND_IN_THIS_SECTOR"}
                                     </p>
                                     <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[repeating-linear-gradient(transparent,transparent_2px,#fff_2px,#fff_4px)]" />
                                  </div>
                                </div>

                                <div className="col-span-4 flex flex-col gap-3">
                                   <div className="bg-[var(--background)] border border-[var(--border)] p-3 flex flex-col justify-center gap-1">
                                      <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase">Logic_Mass</span>
                                      <div className="flex items-end gap-2">
                                         <span className="text-xl font-bold font-mono text-[var(--foreground)] leading-none">{hoveredNode.content.length}</span>
                                         <span className="text-[8px] font-mono text-[var(--muted-foreground)] mb-0.5">BITS</span>
                                      </div>
                                   </div>
                                   <div className="bg-[var(--background)] border border-[var(--border)] p-3 flex flex-col justify-center gap-1">
                                      <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase">Encryption</span>
                                      <div className="flex items-center gap-2">
                                         <Cpu size={12} className="text-[var(--accent)]" />
                                         <span className="text-[9px] font-mono font-bold text-[var(--accent)]">VERIFIED</span>
                                      </div>
                                   </div>
                                </div>
                            </div>

                            {/* Footer HUD elements */}
                            <div className="flex justify-between items-center text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] mt-1 opacity-50">
                               <span>Secure_Neural_Link_Protocol_v4.2</span>
                               <span>Sector_Safety_Status: [CLEAR]</span>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Abyssal Footer */}
            <div className="px-8 py-3 border-t border-[var(--border)] bg-[var(--background)] flex justify-between items-center text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
               <div className="flex gap-10">
                  <div className="flex items-center gap-2">
                     <span className="text-[var(--primary)]">LATENCY:</span>
                     <span className="text-[var(--foreground)] tracking-normal">0.02ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[var(--primary)]">FPS:</span>
                     <span className="text-[var(--foreground)] tracking-normal">60.0</span>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                     <span>Neural_Channel_Synced</span>
                  </div>
                  <Hash size={12} />
                  <span className="text-[var(--foreground)]">0x{notes.length.toString(16).toUpperCase().padStart(4, '0')}</span>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
