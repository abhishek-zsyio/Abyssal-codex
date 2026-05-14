"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import * as d3 from "d3-force";

import { useGraphTheme } from "@/hooks/use-graph-theme";
import { useGraphSimulation } from "@/hooks/use-graph-simulation";
import { GraphNode, GraphLink } from "@/types/graph";
import { GraphHeader } from "./graph/GraphHeader";
import { GraphHUD } from "./graph/GraphHUD";
import { GraphNodePreview } from "./graph/GraphNodePreview";

interface GraphViewProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  variant?: "modal" | "tab";
  onSelectNote?: (id: string) => void;
  onUpdateNote?: (id: string, updates: Partial<Note>) => void;
  folders?: string[];
}

export default function GraphView({ isOpen, onClose, notes, variant = "modal", onSelectNote, onUpdateNote, folders = [] }: GraphViewProps) {
  const themeColors = useGraphTheme(isOpen);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 0.8 });
  const hoveredNodeRef = useRef<string | null>(null);
  
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [activeHoveredNode, setActiveHoveredNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHUD, setShowHUD] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<GraphNode | null>(null);
  
  const searchQueryRef = useRef("");
  const isPausedRef = useRef(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const needsRedrawRef = useRef<boolean>(true);
  const nodeTexturesRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const simulationTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(Date.now());

  const requestRender = useCallback(() => {
    needsRedrawRef.current = true;
  }, []);

  const { simulationRef, initialNodes, initialLinks } = useGraphSimulation({
    notes,
    folders,
    themeColors,
    isOpen,
    isPaused,
    onRequestRender: requestRender,
  });

  useEffect(() => {
    searchQueryRef.current = searchQuery;
    requestRender();
  }, [searchQuery, requestRender]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    requestRender();
  }, [isPaused, requestRender]);

  // Pre-render node textures (kept here for now to avoid complexity in extraction)
  useEffect(() => {
    const palette = [
      themeColors.primary, 
      themeColors.accent, 
      themeColors.destructive,
      themeColors.foreground,
      themeColors.muted,
      themeColors.secondary
    ];
    const cleanPalette = Array.from(new Set(palette.filter(Boolean)));
    const textures = new Map<string, HTMLCanvasElement>();
    
    cleanPalette.forEach(color => {
      const planetCanvas = document.createElement("canvas");
      planetCanvas.width = 48; planetCanvas.height = 48;
      const pctx = planetCanvas.getContext("2d");
      if (pctx) {
        pctx.beginPath(); pctx.arc(24, 24, 10, 0, Math.PI * 2);
        pctx.strokeStyle = color; pctx.lineWidth = 3; pctx.stroke();
        pctx.fillStyle = color + "66"; pctx.fill();
      }
      textures.set(`planet:${color}`, planetCanvas);

      const sunCanvas = document.createElement("canvas");
      sunCanvas.width = 160; sunCanvas.height = 160;
      const sctx = sunCanvas.getContext("2d");
      if (sctx) {
        sctx.beginPath(); sctx.arc(80, 80, 36, 0, Math.PI * 2);
        sctx.strokeStyle = color; sctx.lineWidth = 6; sctx.stroke();
        sctx.fillStyle = color + "33"; sctx.fill();
        sctx.beginPath(); sctx.arc(80, 80, 48, 0, Math.PI * 2);
        sctx.strokeStyle = color + "44"; sctx.lineWidth = 2; sctx.stroke();
      }
      textures.set(`sun:${color}`, sunCanvas);

      const miniSunCanvas = document.createElement("canvas");
      miniSunCanvas.width = 96; miniSunCanvas.height = 96;
      const msctx = miniSunCanvas.getContext("2d");
      if (msctx) {
        msctx.beginPath(); msctx.arc(48, 48, 22, 0, Math.PI * 2);
        msctx.strokeStyle = color; msctx.lineWidth = 4; msctx.stroke();
        msctx.fillStyle = color + "22"; msctx.fill();
      }
      textures.set(`minisun:${color}`, miniSunCanvas);

      const rogueCanvas = document.createElement("canvas");
      rogueCanvas.width = 48; rogueCanvas.height = 48;
      const rctx = rogueCanvas.getContext("2d");
      if (rctx) {
        rctx.beginPath(); rctx.arc(24, 24, 9, 0, Math.PI * 2);
        rctx.strokeStyle = color; rctx.lineWidth = 2.5; rctx.stroke();
        rctx.setLineDash([3, 3]);
        rctx.beginPath(); rctx.arc(24, 24, 14, 0, Math.PI * 2);
        rctx.strokeStyle = color + "44"; rctx.stroke();
        rctx.setLineDash([]);
      }
      textures.set(`rogue:${color}`, rogueCanvas);
    });
    nodeTexturesRef.current = textures;
    requestRender();
  }, [themeColors, requestRender]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      transformRef.current.k = Math.min(Math.max(transformRef.current.k * delta, 0.05), 5);
      requestRender();
    };
    container.addEventListener('wheel', handleWheelNative, { passive: false });

    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");
    
    const setupOffscreen = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      offscreenCanvas.width = rect.width * dpr; offscreenCanvas.height = rect.height * dpr;
      if (offscreenCtx) {
        offscreenCtx.scale(dpr, dpr);
        offscreenCtx.fillStyle = themeColors.background;
        offscreenCtx.fillRect(0, 0, rect.width, rect.height);
        
        const starColor = themeColors.foreground;
        offscreenCtx.fillStyle = starColor;
        for (let i = 0; i < 60; i++) {
          offscreenCtx.globalAlpha = Math.random() * 0.2;
          offscreenCtx.beginPath();
          offscreenCtx.arc(Math.random() * rect.width, Math.random() * rect.height, Math.random() * 0.7, 0, Math.PI * 2);
          offscreenCtx.fill();
        }
        offscreenCtx.globalAlpha = 1.0;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      setupOffscreen();
      requestRender();
    };
    resize();
    window.addEventListener("resize", resize);

    const visibleLinks = initialLinks.filter(l => !l.isHierarchy);

    let animationFrame: number;

    const render = () => {
      if (!needsRedrawRef.current) {
        animationFrame = requestAnimationFrame(render);
        return;
      }
      needsRedrawRef.current = false;

      const { x, y, k } = transformRef.current;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      const now = Date.now();
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      
      if (!isPausedRef.current) {
        simulationTimeRef.current += deltaTime;
      }
      
      const simTime = simulationTimeRef.current;

      ctx.drawImage(offscreenCanvas, 0, 0, width, height);
      ctx.fillStyle = themeColors.background;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;

      ctx.save();
      ctx.translate(width / 2 + x, height / 2 + y);
      ctx.scale(k, k);

      const curHoverId = hoveredNodeRef.current;
      ctx.lineWidth = 1.0 / k;
      
      const linksByColor = new Map<string, GraphLink[]>();
      const interSystemLinks: GraphLink[] = [];
      const highlightedLinks: GraphLink[] = [];

      visibleLinks.forEach(link => {
        const s = link.source as GraphNode; const t = link.target as GraphNode;
        if (!s.x || !t.x) return;
        
        if (curHoverId === s.id || curHoverId === t.id) {
          highlightedLinks.push(link);
          return;
        }

        const sSys = s.parentFolderId; const tSys = t.parentFolderId;
        if (sSys !== tSys) {
          interSystemLinks.push(link);
          return;
        }

        const color = (s.color || themeColors.foreground) + "22";
        if (!linksByColor.has(color)) linksByColor.set(color, []);
        linksByColor.get(color)!.push(link);
      });

      linksByColor.forEach((links, color) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        links.forEach(link => {
          const s = link.source as GraphNode; const t = link.target as GraphNode;
          ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!);
        });
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.strokeStyle = themeColors.muted + "44";
      interSystemLinks.forEach(link => {
        const s = link.source as GraphNode; const t = link.target as GraphNode;
        ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!);
      });
      ctx.stroke();

      highlightedLinks.forEach(link => {
        const s = link.source as GraphNode; const t = link.target as GraphNode;
        const sourceColor = s.color || themeColors.primary;
        const targetColor = t.color || themeColors.primary;
        
        const grad = ctx.createLinearGradient(s.x!, s.y!, t.x!, t.y!);
        grad.addColorStop(0, sourceColor + "ff");
        grad.addColorStop(1, targetColor + "66");

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.0 / k;
        ctx.shadowBlur = 15 / k;
        ctx.shadowColor = sourceColor;
        ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      if (k > 0.3) {
        interSystemLinks.forEach(link => {
          const s = link.source as GraphNode; const t = link.target as GraphNode;
          const speed = 0.0015;
          const time = (simTime * speed) % 1;
          const px = s.x! + (t.x! - s.x!) * time;
          const py = s.y! + (t.y! - s.y!) * time;
          
          ctx.beginPath();
          ctx.fillStyle = s.color || themeColors.primary;
          ctx.arc(px, py, 1.5 / k, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      initialNodes.forEach(node => {
        const isHovered = curHoverId === node.id;
        const matchesSearch = searchQueryRef.current && node.title.toLowerCase().includes(searchQueryRef.current.toLowerCase());
        
        let alpha = 1;
        if (curHoverId) alpha = isHovered ? 1 : 0.25;
        else alpha = 0.7;
        
        if (searchQueryRef.current) alpha = matchesSearch ? 1 : 0.05;

        ctx.globalAlpha = alpha;
        let typeKey = node.isFolder ? (node.isRootSun ? 'sun' : 'minisun') : 'planet';
        if (node.isRoguePlanet && !node.isFolder) typeKey = 'rogue';
        
        const color = node.color || themeColors.muted;
        const tex = nodeTexturesRef.current.get(`${typeKey}:${color}`);
        
        if (tex) {
          const tSize = typeKey === 'sun' ? 80 : (typeKey === 'minisun' ? 56 : 32);
          ctx.drawImage(tex, node.x! - tSize/2, node.y! - tSize/2, tSize, tSize);
        }

        if ((isHovered || matchesSearch || (node.isFolder && k > 0.4)) && k > 0.1) {
            ctx.fillStyle = node.isFolder ? (node.color || themeColors.primary) : (node.isRoguePlanet ? themeColors.muted : themeColors.foreground);
            ctx.font = `${node.isFolder ? 'bold' : 'normal'} ${13 / k}px JetBrains Mono, monospace`;
            ctx.fillText(node.title.toUpperCase(), node.x! + (node.size * 1.8), node.y! + 5);
        }
      });
      
      ctx.restore();
      const scanTime = (simTime * 0.0001) % 1;
      ctx.fillStyle = themeColors.primary + "05";
      ctx.fillRect(0, scanTime * height, width, 1.5);

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener('wheel', handleWheelNative);
      cancelAnimationFrame(animationFrame);
    };
  }, [isOpen, initialNodes, initialLinks, themeColors]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width / 2 - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - rect.top - rect.height / 2 - transformRef.current.y) / transformRef.current.k;

    const found = simulationRef.current?.find(mx, my, 30) || null;

    if (found?.id !== hoveredNodeRef.current) {
        hoveredNodeRef.current = found?.id || null;
        setHoveredNode(found); requestRender();
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        if (found) {
            hoverTimerRef.current = setTimeout(() => { setActiveHoveredNode(found); requestRender(); }, 200);
        } else {
            setActiveHoveredNode(null); requestRender();
        }
    }
  }, [simulationRef, requestRender]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (hoveredNodeRef.current) {
      const node = initialNodes.find(n => n.id === hoveredNodeRef.current);
      if (node) {
        const startX = e.clientX, startY = e.clientY;
        let hasMoved = false;
        const nodeStartX = node.x!, nodeStartY = node.y!;

        const onMove = (moveEvent: MouseEvent) => {
            if (isLinkMode) return; 
            const dx = (moveEvent.clientX - startX) / transformRef.current.k;
            const dy = (moveEvent.clientY - startY) / transformRef.current.k;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
            node.fx = nodeStartX + dx; node.fy = nodeStartY + dy;
            simulationRef.current?.alpha(0.05).restart();
        };

        const onUp = () => {
          if (!hasMoved) {
            if (isLinkMode && linkSource && linkSource.id !== node.id) {
                if (onUpdateNote) {
                  const sourceNote = notes.find(n => n.id === linkSource.id);
                  if (sourceNote) {
                    const targetLabel = node.isFolder ? (node.id.replace('folder:', '') + '/') : node.title;
                    const wikiLink = node.isFolder ? `[[${targetLabel}]]` : `[[${node.id}|${targetLabel}]]`;
                    const currentContent = sourceNote.content || "";
                    const newContent = currentContent.endsWith('\n') ? `${currentContent}\n${wikiLink}` : `${currentContent}\n\n${wikiLink}`;
                    onUpdateNote(sourceNote.id, { content: newContent });
                    window.dispatchEvent(new CustomEvent('abyssal-log', { detail: { message: `LINK_ESTABLISHED`, type: 'success' } }));
                  }
                }
                setLinkSource(null); setIsLinkMode(false);
            } else if (isLinkMode && !linkSource && !node.isGhost && !node.isFolder) {
                setLinkSource(node);
            } else if (onSelectNote && !node.isFolder) {
              onSelectNote(node.id);
            }
          }
          node.fx = null; node.fy = null;
          window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
      }
      return;
    }
    
    const startX = e.clientX, startY = e.clientY, initialTransform = { ...transformRef.current };
    const onMove = (moveEvent: MouseEvent) => {
      transformRef.current = { ...initialTransform, x: initialTransform.x + (moveEvent.clientX - startX), y: initialTransform.y + (moveEvent.clientY - startY) };
      requestRender();
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  }, [initialNodes, onSelectNote, isLinkMode, linkSource, notes, onUpdateNote, requestRender, simulationRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn(
          "bg-[var(--background)] border border-[var(--border)] overflow-hidden flex flex-col shadow-2xl",
          variant === "modal" ? "fixed inset-4 md:inset-8 z-[401] rounded-2xl" : "relative w-full h-full border-none"
        )}>
          {variant === "modal" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[-1] bg-black/60 backdrop-blur-sm" />}
          
          <GraphHeader 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            isLinkMode={isLinkMode} setIsLinkMode={setIsLinkMode}
            showHUD={showHUD} setShowHUD={setShowHUD}
            isPaused={isPaused} setIsPaused={setIsPaused}
            onZoomIn={() => { transformRef.current.k *= 1.2; requestRender(); }}
            onZoomOut={() => { transformRef.current.k /= 1.2; requestRender(); }}
            onReset={() => { transformRef.current = { x: 0, y: 0, k: 0.8 }; requestRender(); }}
            onClose={onClose} variant={variant}
          />

          <div ref={containerRef} className="flex-1 relative bg-[var(--background)] overflow-hidden cursor-crosshair"
               onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} style={{ touchAction: 'none' }}>
             <canvas ref={canvasRef} className="w-full h-full" />
             <GraphHUD isVisible={showHUD} nodesCount={initialNodes.length} linksCount={initialLinks.length} isLinkMode={isLinkMode} hasLinkSource={!!linkSource} />
             <GraphNodePreview node={activeHoveredNode} />
          </div>

          <div className="px-8 py-3 border-t border-[var(--border)] flex justify-between items-center text-[8px] font-mono bg-[var(--card)]/20 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />
            <div className="flex gap-10">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[var(--primary)] opacity-50" />
                  <span className="text-[var(--foreground)] font-bold tracking-widest uppercase">System_Active</span>
               </div>
               <div className="flex items-center gap-2 border-l border-[var(--border)] pl-10">
                  <span className="text-[var(--muted-foreground)] uppercase">Linkage_Engine:</span>
                  <span className="text-[var(--accent)] font-bold">READY</span>
               </div>
               <div className="flex items-center gap-2 border-l border-[var(--border)] pl-10">
                  <span className="text-[var(--muted-foreground)] uppercase">Memory_Buffer:</span>
                  <span className="text-[var(--foreground)]">0x{notes.length.toString(16).toUpperCase()}</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[var(--muted-foreground)] tracking-widest uppercase italic opacity-60">Nexus_Neural_Interface_v4.0.1</span>
               <div className="w-16 h-1.5 bg-[var(--border)] rounded-none relative overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-[var(--primary)]/40 w-1/3"
                  />
               </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
