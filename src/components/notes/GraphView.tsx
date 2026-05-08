"use client";

import { useEffect, useRef, useState, useMemo, useCallback, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, ZoomIn, ZoomOut, Maximize2, Hash, Activity, Zap, Cpu, Search } from "lucide-react";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import * as d3 from "d3-force";

import { useTheme } from "@/hooks/use-theme";
import { DataStream } from "@/components/ui/Effects";

interface GraphViewProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  variant?: "modal" | "tab";
  onSelectNote?: (id: string) => void;
  onUpdateNote?: (id: string, updates: Partial<Note>) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  content: string;
  size: number;
  color: string;
  isGhost?: boolean;
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

export default function GraphView({ isOpen, onClose, notes, variant = "modal", onSelectNote, onUpdateNote }: GraphViewProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 0.8 });
  const hoveredNodeRef = useRef<string | null>(null);
  const isDraggingNodeRef = useRef<boolean>(false);
  
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHUD, setShowHUD] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<Node | null>(null);
  
  const searchQueryRef = useRef("");
  const isPausedRef = useRef(false);
  const showHUDRef = useRef(true);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [activeHoveredNode, setActiveHoveredNode] = useState<Node | null>(null);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    showHUDRef.current = showHUD;
  }, [showHUD]);

  const deferredContent = useDeferredValue(hoveredNode?.content || "");

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
    const ghostNodesMap = new Map<string, Node>();

    notes.forEach(sourceNote => {
      const wikiLinks = sourceNote.content?.match(/\[\[(.*?)\]\]/g) || [];
      const uniqueTargets = new Set(wikiLinks.map(l => l.slice(2, -2).trim()));

      uniqueTargets.forEach(targetTitle => {
        if (!targetTitle) return;
        let targetNode = nodes.find(n => n.title.toLowerCase() === targetTitle.toLowerCase());
        
        if (!targetNode) {
          const ghostId = `ghost-${targetTitle.toLowerCase()}`;
          if (ghostNodesMap.has(ghostId)) {
            targetNode = ghostNodesMap.get(ghostId)!;
          } else {
            targetNode = {
              id: ghostId,
              title: targetTitle,
              content: "",
              size: 5,
              color: themeColors.current.muted,
              isGhost: true,
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
            };
            ghostNodesMap.set(ghostId, targetNode);
          }
        }

        if (targetNode && targetNode.id !== sourceNote.id) {
          const pairId = [sourceNote.id, targetNode.id].sort().join("-");
          if (!connectedPairs.has(pairId)) {
            links.push({ source: sourceNote.id, target: targetNode.id });
            connectedPairs.add(pairId);
          }
        }
      });
    });

    return { 
      initialNodes: [...nodes, ...Array.from(ghostNodesMap.values())], 
      initialLinks: links 
    };
  }, [notes]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
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
      .force("collision", d3.forceCollide<Node>().radius(d => d.size + 20))
      .alphaDecay(0.05);

    simulationRef.current = simulation;

    let animationFrame: number;
    let time = 0;

    const render = () => {
      if (!isPausedRef.current) time += 0.016;
      const { x, y, k } = transformRef.current;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Background - Deep Abyssal Black
      ctx.fillStyle = themeColors.current.background;
      ctx.fillRect(0, 0, width, height);

      // 1. Technical Grid (Parallax)
      ctx.save();
      ctx.translate(width / 2 + x * 0.1, height / 2 + y * 0.1);
      ctx.beginPath();
      const gridGap = 60;
      ctx.strokeStyle = themeColors.current.primary + "08";
      ctx.lineWidth = 0.5;
      for (let i = -width * 2; i < width * 2; i += gridGap) {
        ctx.moveTo(i, -height * 2);
        ctx.lineTo(i, height * 2);
      }
      for (let j = -height * 2; j < height * 2; j += gridGap) {
        ctx.moveTo(-width * 2, j);
        ctx.lineTo(width * 2, j);
      }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(width / 2 + x, height / 2 + y);
      ctx.scale(k, k);

      // 2. Links (Neural Pathways)
      ctx.beginPath();
      ctx.strokeStyle = themeColors.current.foreground + "0a";
      ctx.lineWidth = 0.5 / k;
      initialLinks.forEach(link => {
        const source = link.source as Node;
        const target = link.target as Node;
        ctx.moveTo(source.x!, source.y!);
        ctx.lineTo(target.x!, target.y!);
      });
      ctx.stroke();

      // 3. Link Flow (Neural Signals)
      if (!isPausedRef.current) {
        initialLinks.forEach((link, i) => {
          const source = link.source as Node;
          const target = link.target as Node;
          const flowSpeed = 0.2 + (i % 3) * 0.1;
          const flowPos = (time * flowSpeed + i * 0.2) % 1;
          
          const px = source.x! + (target.x! - source.x!) * flowPos;
          const py = source.y! + (target.y! - source.y!) * flowPos;
          
          // Signal Head
          ctx.beginPath();
          ctx.arc(px, py, 1.2 / k, 0, Math.PI * 2);
          ctx.fillStyle = themeColors.current.accent;
          ctx.globalAlpha = 0.6;
          ctx.fill();
          
          // Signal Tail
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - (target.x! - source.x!) * 0.05, py - (target.y! - source.y!) * 0.05);
          ctx.strokeStyle = themeColors.current.accent;
          ctx.globalAlpha = 0.2;
          ctx.lineWidth = 1 / k;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      }

      // 4. Nodes (Neural Cores)
      const currentHoverId = hoveredNodeRef.current;
      const connectedToHovered = new Set<string>();
      if (currentHoverId) {
        initialLinks.forEach(l => {
          const s = l.source as Node;
          const t = l.target as Node;
          if (s.id === currentHoverId) connectedToHovered.add(t.id);
          if (t.id === currentHoverId) connectedToHovered.add(s.id);
        });
      }

      initialNodes.forEach(node => {
        const isHovered = currentHoverId === node.id;
        const isConnected = connectedToHovered.has(node.id);
        const matchesSearch = searchQueryRef.current && node.title.toLowerCase().includes(searchQueryRef.current.toLowerCase());
        
        let opacity = currentHoverId ? (isHovered || isConnected ? 1 : 0.15) : 1;
        if (searchQueryRef.current && !matchesSearch && !isHovered && !isConnected) opacity = 0.03;
        if (searchQueryRef.current && matchesSearch) opacity = 1;

        const size = node.size * (isHovered || matchesSearch ? 1.2 : 1.0);
        ctx.globalAlpha = opacity;
        
        // Node Bloom (Technical Shroud)
        if (isHovered || matchesSearch || isConnected) {
          const bloomSize = size * (isHovered ? 4 : 2.5);
          const gradient = ctx.createRadialGradient(node.x!, node.y!, 0, node.x!, node.y!, bloomSize);
          gradient.addColorStop(0, node.color + "33");
          gradient.addColorStop(0.4, node.color + "11");
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, bloomSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core Ring
        const isLinkSrc = linkSource?.id === node.id;
        ctx.beginPath();
        if (node.isGhost) {
          ctx.setLineDash([5 / k, 3 / k]);
        }
        ctx.arc(node.x!, node.y!, size + (isHovered || isLinkSrc ? 2 : 1), 0, Math.PI * 2);
        ctx.strokeStyle = isLinkSrc ? themeColors.current.primary : (node.isGhost ? themeColors.current.muted : node.color);
        ctx.lineWidth = (isHovered || isLinkSrc ? 2 : 1) / k;
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Solid Core
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = isLinkSrc ? themeColors.current.primary : (node.isGhost ? "transparent" : node.color);
        if (node.isGhost) {
          ctx.strokeStyle = themeColors.current.muted;
          ctx.lineWidth = 1 / k;
          ctx.stroke();
        } else {
          ctx.fill();
        }

        // Data Label
        if ((isHovered || isLinkSrc) && k > 0.6) {
          ctx.fillStyle = themeColors.current.foreground;
          ctx.font = `bold ${9 / k}px JetBrains Mono, monospace`;
          ctx.fillText(node.title.toUpperCase(), node.x! + size + 8, node.y! + 3);
          
          if (isLinkSrc) {
            ctx.font = `italic ${7 / k}px JetBrains Mono, monospace`;
            ctx.fillStyle = themeColors.current.primary;
            ctx.fillText("SOURCE_NODE", node.x! + size + 8, node.y! + 12);
          } else if (node.isGhost) {
            ctx.font = `bold ${7 / k}px JetBrains Mono, monospace`;
            ctx.fillStyle = themeColors.current.destructive;
            ctx.fillText("STATUS: BROKEN_LINK", node.x! + size + 8, node.y! + 12);
          } else {
            ctx.font = `${7 / k}px JetBrains Mono, monospace`;
            ctx.fillStyle = themeColors.current.primary;
            ctx.fillText(`ID: ${node.id.substring(0, 8)}`, node.x! + size + 8, node.y! + 12);
          }
        }
      });

      // 5. Active Sector Scan
      if (currentHoverId || linkSource) {
        const hoverNodeObj = initialNodes.find(n => n.id === (currentHoverId || linkSource?.id));
        if (hoverNodeObj) {
          const scanRadius = (time * (currentHoverId ? 120 : 60)) % (currentHoverId ? 200 : 100);
          ctx.beginPath();
          ctx.arc(hoverNodeObj.x!, hoverNodeObj.y!, scanRadius, 0, Math.PI * 2);
          ctx.strokeStyle = hoverNodeObj.color;
          ctx.lineWidth = 0.5 / k;
          ctx.globalAlpha = Math.max(0, 0.4 * (1 - scanRadius / (currentHoverId ? 200 : 100)));
          ctx.stroke();
          
          // Crosshair
          const cs = 10 / k;
          ctx.beginPath();
          ctx.moveTo(hoverNodeObj.x! - cs, hoverNodeObj.y!);
          ctx.lineTo(hoverNodeObj.x! + cs, hoverNodeObj.y!);
          ctx.moveTo(hoverNodeObj.x!, hoverNodeObj.y! - cs);
          ctx.lineTo(hoverNodeObj.x!, hoverNodeObj.y! + cs);
          ctx.strokeStyle = hoverNodeObj.color;
          ctx.globalAlpha = 0.8;
          ctx.stroke();
        }
      }
      
      // 6. Link Preview Line
      if (isLinkMode && linkSource && !currentHoverId) {
        const rect = canvasRef.current!.getBoundingClientRect();
        // We need mouse pos, but we don't have it in render easily without another ref
        // Let's skip the line for now or add mouseRef
      }

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
  }, [isOpen, initialNodes, initialLinks, theme]);

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
      
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      
      if (found) {
        hoverTimerRef.current = setTimeout(() => {
          setActiveHoveredNode(found);
        }, 300); // 300ms delay to prevent flickering
      } else {
        setActiveHoveredNode(null);
      }
    }
  }, [initialNodes]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (hoveredNodeRef.current) {
      const node = initialNodes.find(n => n.id === hoveredNodeRef.current);
      if (node) {
        const startX = e.clientX;
        const startY = e.clientY;
        let hasMoved = false;

        const onMove = (moveEvent: MouseEvent) => {
          const dx = (moveEvent.clientX - startX) / transformRef.current.k;
          const dy = (moveEvent.clientY - startY) / transformRef.current.k;
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
          
          node.fx = nodeStartX + dx;
          node.fy = nodeStartY + dy;
          simulationRef.current?.alpha(0.3).restart();
        };

        const nodeStartX = node.x!;
        const nodeStartY = node.y!;

        const onUp = () => {
          if (!hasMoved) {
            if (isLinkMode) {
              if (!linkSource) {
                setLinkSource(node);
              } else if (linkSource.id !== node.id) {
                // CREATE LINK
                if (onUpdateNote) {
                  const sourceNote = notes.find(n => n.id === linkSource.id);
                  if (sourceNote) {
                    const linkText = `\n\n[[${node.title}]]`;
                    onUpdateNote(sourceNote.id, {
                      content: (sourceNote.content || "") + linkText
                    });
                    // Feedback effect could be added here
                  }
                }
                setLinkSource(null);
                setIsLinkMode(false);
              } else {
                setLinkSource(null);
              }
            } else if (onSelectNote) {
              onSelectNote(node.id);
            }
          }
          isDraggingNodeRef.current = false;
          node.fx = null;
          node.fy = null;
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        isDraggingNodeRef.current = true;
      }
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
  }, [initialNodes, onSelectNote, isLinkMode, linkSource, notes, onUpdateNote]);

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
              className="fixed inset-0 z-[400] bg-[var(--background)]/98"
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
            <div className="px-8 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/80 relative z-20">
               <div className="flex items-center gap-10">
                  <div className="flex flex-col">
                     <h2 className="text-xl font-bold font-mono tracking-tighter uppercase text-[var(--foreground)] flex items-center gap-3">
                        Nexus_Neural_Map
                        <Activity size={16} className="text-[var(--primary)]" />
                     </h2>
                  </div>
               </div>
               
               <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input 
                      type="text"
                      placeholder="LOCATE_NODE..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[var(--background)] border border-[var(--border)] py-1.5 pl-9 pr-4 text-[10px] font-mono focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--muted-foreground)] w-48"
                    />
                  </div>

                  <div className="flex bg-[var(--background)] border border-[var(--border)] p-1 rounded-lg">
                     <button 
                        onClick={() => {
                          setIsLinkMode(!isLinkMode);
                          setLinkSource(null);
                        }} 
                        className={cn("p-2 transition-all", isLinkMode ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--muted-foreground)]")}
                        title="Neural Linkage Protocol (Connect Notes)"
                      >
                         <Hash size={16} />
                      </button>
                      <button 
                        onClick={() => setShowHUD(!showHUD)} 
                        className={cn("p-2 transition-all", showHUD ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}
                        title="Toggle HUD Overlay"
                      >
                         <Activity size={16} />
                      </button>
                     <button 
                       onClick={() => setIsPaused(!isPaused)} 
                       className={cn("p-2 transition-all", isPaused ? "text-[var(--destructive)]" : "text-[var(--muted-foreground)]")}
                       title="Toggle Animation"
                     >
                        <Zap size={16} />
                     </button>
                     <div className="w-px h-4 bg-[var(--border)] mx-1 self-center" />
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
               <canvas ref={canvasRef} className="w-full h-full" style={{ willChange: 'transform' }} />

               {/* CRT Effect Layers (Graph Only - Optimized) */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-20 overflow-hidden">
                  <div 
                    className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%]"
                  />
               </div>

               {/* Tactical Overlay Elements */}
               {showHUD && (
                 <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none z-30">
                    <div className="bg-[var(--card)]/80 border border-[var(--border)] p-4 flex flex-col gap-2 min-w-[180px]">
                       <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Neural_Freq</span>
                          <span className="text-[10px] font-mono text-[var(--primary)] font-bold">60.00 Hz</span>
                       </div>
                       <div className="w-full h-[2px] bg-[var(--border)] overflow-hidden">
                           <div 
                              className="w-1/2 h-full bg-[var(--primary)]"
                              style={{ animation: 'hudScan 1.5s linear infinite' }}
                           />
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Active_Nodes</span>
                          <span className="text-[10px] font-mono text-[var(--foreground)]">{initialNodes.length}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Link_Density</span>
                          <span className="text-[10px] font-mono text-[var(--accent)]">{(initialLinks.length / initialNodes.length).toFixed(2)}</span>
                       </div>
                    </div>

                    <div className="bg-[var(--card)]/80 border border-[var(--border)] p-2 px-3 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                       <span className="text-[9px] font-mono text-[var(--foreground)] uppercase tracking-tighter">Topology_Synchronized</span>
                    </div>

                    {isLinkMode && (
                      <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 p-4 flex flex-col gap-2 min-w-[180px] animate-pulse pointer-events-none">
                         <span className="text-[8px] font-mono text-[var(--primary)] uppercase tracking-widest font-bold">Linkage_Protocol_Active</span>
                         <span className="text-[9px] font-mono text-[var(--foreground)] leading-tight">
                           {!linkSource ? "SELECT_SOURCE_NODE..." : "SELECT_TARGET_NODE..."}
                         </span>
                      </div>
                    )}
                 </div>
               )}


               <AnimatePresence>
                 {activeHoveredNode && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.98 }}
                     animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                     exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.98 }}
                     transition={{ duration: 0.2 }}
                     className="absolute bottom-10 left-1/2 pointer-events-none z-30 w-[400px]"
                   >
                      <div className="relative bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] p-4 shadow-2xl flex flex-col gap-2 overflow-hidden rounded-lg">
                         <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeHoveredNode.color }} />
                               <h3 className="text-sm font-bold font-mono tracking-tight text-[var(--foreground)] uppercase truncate max-w-[200px]">
                                  {activeHoveredNode.title}
                               </h3>
                            </div>
                            <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase">
                              ID: {activeHoveredNode.id.substring(0, 6)}
                            </span>
                         </div>
                         
                         <div className="text-[10px] font-mono text-[var(--muted-foreground)] line-clamp-2 leading-relaxed italic opacity-80">
                            {activeHoveredNode.content || "NO_DATA_STREAM_DETECTED"}
                          </div>

                         <div className="flex items-center justify-between pt-1">
                            <div className="flex gap-1">
                               {[1, 2, 3].map(i => (
                                  <div key={i} className="w-4 h-0.5 bg-[var(--primary)] opacity-20" />
                               ))}
                            </div>
                            <span className="text-[8px] font-mono text-[var(--primary)] font-bold animate-pulse">LOCKED</span>
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
