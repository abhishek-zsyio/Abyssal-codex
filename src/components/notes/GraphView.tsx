"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import { useGraphTheme } from "@/hooks/use-graph-theme";
import { useGraphSimulation } from "@/hooks/use-graph-simulation";
import { GraphNode } from "@/types/graph";

// Sub-components
import { GraphControls } from "./graph/GraphControls";
import { GraphInfoPanel } from "./graph/GraphInfoPanel";
import { GraphLegend, GraphHints } from "./graph/GraphLegend";

interface GraphViewProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  variant?: "modal" | "tab";
  onSelectNote?: (id: string) => void;
  onUpdateNote?: (id: string, updates: Partial<Note>) => void;
  folders?: string[];
}

export default function GraphView({
  isOpen,
  onClose,
  notes,
  variant = "modal",
  onSelectNote,
  onUpdateNote,
  folders = [],
}: GraphViewProps) {
  const themeColors = useGraphTheme(isOpen);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 0.75 });
  const targetTransformRef = useRef<{ x: number; y: number; k: number } | null>(null);
  const hoveredNodeRef = useRef<string | null>(null);
  const needsRedrawRef = useRef(true);
  const rafRef = useRef(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<GraphNode | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [hideOrphans, setHideOrphans] = useState(false);
  const [foldersOnly, setFoldersOnly] = useState(false);

  const searchRef = useRef("");
  const isPausedRef = useRef(false);
  const hideOrphansRef = useRef(false);
  const foldersOnlyRef = useRef(false);

  const requestRender = useCallback(() => {
    needsRedrawRef.current = true;
  }, []);

  const { initialNodes, initialLinks, updateNodeInWorker } = useGraphSimulation(
    {
      notes,
      folders,
      themeColors,
      isOpen,
      isPaused,
      onRequestRender: requestRender,
    },
  );

  useEffect(() => { searchRef.current = searchQuery; requestRender(); }, [searchQuery, requestRender]);
  useEffect(() => { isPausedRef.current = isPaused; requestRender(); }, [isPaused, requestRender]);
  useEffect(() => { hideOrphansRef.current = hideOrphans; requestRender(); }, [hideOrphans, requestRender]);
  useEffect(() => { foldersOnlyRef.current = foldersOnly; requestRender(); }, [foldersOnly, requestRender]);

  // degree map for node radius computation
  const degreeMap = useMemo(() => {
    const m = new Map<string, number>();
    initialLinks.forEach((l) => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      m.set(sId, (m.get(sId) || 0) + 1);
      m.set(tId, (m.get(tId) || 0) + 1);
    });
    return m;
  }, [initialLinks]);

  const nodeRadius = useCallback((node: GraphNode): number => {
    if (node.isGhost) return 3;
    const deg = degreeMap.get(node.id) || 0;
    if (node.isFolder) return node.isRootSun ? 10 + Math.sqrt(deg) * 1.5 : 7 + Math.sqrt(deg);
    return 4 + Math.sqrt(deg) * 0.8;
  }, [degreeMap]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // per-node lerped alpha state
    const alphaMap = new Map<string, number>();
    initialNodes.forEach(n => alphaMap.set(n.id, 1));

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      transformRef.current.k = Math.min(
        Math.max(transformRef.current.k * factor, 0.05),
        8,
      );
      requestRender();
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.scale(dpr, dpr);
      requestRender();
    };
    resize();
    window.addEventListener("resize", resize);

    const wikiLinks = initialLinks.filter((l) => !l.isHierarchy);
    const hierarchyLinks = initialLinks.filter((l) => l.isHierarchy);

    const drawFrame = () => {
      rafRef.current = requestAnimationFrame(drawFrame);
      if (targetTransformRef.current) {
        const T = targetTransformRef.current;
        const cur = transformRef.current;
        const TLERP = 0.1;
        const nx = cur.x + (T.x - cur.x) * TLERP;
        const ny = cur.y + (T.y - cur.y) * TLERP;
        const nk = cur.k + (T.k - cur.k) * TLERP;
        transformRef.current = { x: nx, y: ny, k: nk };
        if (Math.abs(nx - T.x) < 0.5 && Math.abs(ny - T.y) < 0.5 && Math.abs(nk - T.k) < 0.001)
          targetTransformRef.current = null;
        needsRedrawRef.current = true;
      }
      const { x, y, k } = transformRef.current;
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);
      const cur = hoveredNodeRef.current;
      const q = searchRef.current.toLowerCase();

      const neighbors1 = new Set<string>();
      const neighbors2 = new Set<string>();
      if (cur) {
        initialLinks.forEach((l) => {
          const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          if (sId === cur) neighbors1.add(tId);
          if (tId === cur) neighbors1.add(sId);
        });
        initialLinks.forEach((l) => {
          const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          if (neighbors1.has(sId) && tId !== cur) neighbors2.add(tId);
          if (neighbors1.has(tId) && sId !== cur) neighbors2.add(sId);
        });
      }

      const LERP = 0.18;
      initialNodes.forEach(node => {
        const deg = degreeMap.get(node.id) || 0;
        const isOrphan = deg === 0 && !node.isFolder;
        if ((hideOrphansRef.current && isOrphan) || (foldersOnlyRef.current && !node.isFolder)) {
          alphaMap.set(node.id, 0); return;
        }
        let target: number;
        if (q) target = node.title.toLowerCase().includes(q) ? 1 : 0.04;
        else if (cur) {
          if (node.id === cur) target = 1;
          else if (neighbors1.has(node.id)) target = 0.9;
          else if (neighbors2.has(node.id)) target = 0.45;
          else target = 0.05;
        }
        else target = node.isGhost ? 0.2 : 1;
        const prev = alphaMap.get(node.id) ?? target;
        const next = prev + (target - prev) * LERP;
        if (Math.abs(next - prev) > 0.003) { alphaMap.set(node.id, next); needsRedrawRef.current = true; }
        else alphaMap.set(node.id, target);
      });

      if (!needsRedrawRef.current) return;
      needsRedrawRef.current = false;

      ctx.fillStyle = themeColors.background;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(W / 2 + x, H / 2 + y);
      ctx.scale(k, k);

      const nodeMap = new Map(initialNodes.map((n) => [n.id, n]));
      const res = (ref: string | GraphNode): GraphNode | undefined =>
        typeof ref === 'string' ? nodeMap.get(ref) : (ref as GraphNode);

      hierarchyLinks.forEach((l) => {
        const s = res(l.source); const t = res(l.target);
        if (!s || !t || s.x === undefined || t.x === undefined) return;
        const sA = alphaMap.get(s.id) ?? 1;
        const tA = alphaMap.get(t.id) ?? 1;
        const edgeA = Math.min(sA, tA);
        if (edgeA < 0.02) return;
        const connected = cur && (s.id === cur || t.id === cur || neighbors1.has(s.id) || neighbors1.has(t.id));
        ctx.globalAlpha = edgeA;
        ctx.strokeStyle = (s.color || themeColors.muted) + (connected ? '60' : '22');
        ctx.lineWidth = (connected ? 1 : 0.5) / k;
        ctx.beginPath(); ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!); ctx.stroke();
      });

      wikiLinks.forEach((l) => {
        const s = res(l.source); const t = res(l.target);
        if (!s || !t || s.x === undefined || t.x === undefined) return;
        const sA = alphaMap.get(s.id) ?? 1;
        const tA = alphaMap.get(t.id) ?? 1;
        const edgeA = Math.min(sA, tA);
        if (edgeA < 0.02) return;
        const isActive = cur && (s.id === cur || t.id === cur);
        ctx.globalAlpha = edgeA;
        if (isActive) {
          ctx.strokeStyle = (s.color || themeColors.primary) + 'cc';
          ctx.lineWidth = 1.5 / k;
          ctx.shadowColor = s.color || themeColors.primary;
          ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!); ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = (s.color || themeColors.muted) + '18';
          ctx.lineWidth = 0.5 / k;
          ctx.beginPath(); ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      initialNodes.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return;
        const a = alphaMap.get(node.id) ?? 1;
        if (a < 0.01) return;
        const isHov = node.id === cur;
        const isNeigh = neighbors1.has(node.id);
        const matched = q && node.title.toLowerCase().includes(q);
        const c = node.color || themeColors.muted;
        const r = nodeRadius(node);

        ctx.globalAlpha = a;
        if (node.isGhost) {
          ctx.save();
          ctx.setLineDash([1.5 / k, 2.5 / k]);
          ctx.beginPath(); ctx.arc(node.x!, node.y!, r, 0, Math.PI * 2);
          ctx.strokeStyle = c + '55'; ctx.lineWidth = 0.7 / k; ctx.stroke();
          ctx.setLineDash([]); ctx.restore();
        } else {
          const fillAlpha = node.isFolder ? (isHov ? '40' : '25') : (isHov ? '35' : '18');
          ctx.beginPath(); ctx.arc(node.x!, node.y!, r, 0, Math.PI * 2);
          ctx.fillStyle = c + fillAlpha; ctx.fill();
          ctx.strokeStyle = c + (isHov || isNeigh ? 'ee' : 'aa');
          ctx.lineWidth = (isHov ? 1.8 : node.isFolder ? 1.2 : 0.9) / k;
          ctx.stroke();
          if (isHov) {
            ctx.beginPath(); ctx.arc(node.x!, node.y!, r + 4 / k, 0, Math.PI * 2);
            ctx.strokeStyle = c + '30'; ctx.lineWidth = 3 / k; ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
        const deg = degreeMap.get(node.id) || 0;
        const isHub = deg >= 3;
        const showLabel = isHov || matched || (neighbors1.has(node.id) && k > 0.5) || (node.isFolder && k > 0.25) || (isHub && k > 0.8 && !node.isGhost);
        if (showLabel) {
          const labelA = (isHov ? 1 : neighbors1.has(node.id) || node.isFolder ? 0.8 : 0.4) * a;
          ctx.globalAlpha = labelA;
          const fSize = node.isFolder ? (node.isRootSun ? 11 : 10) : 9;
          ctx.font = `${node.isFolder ? 600 : 400} ${fSize / k}px ui-monospace, monospace`;
          ctx.fillStyle = isHov ? themeColors.foreground : c;
          const label = node.title.length > 20 ? node.title.slice(0, 20) + '…' : node.title;
          ctx.fillText(label, node.x!, node.y! + r + 10 / k);
          ctx.globalAlpha = 1;
        }
      });
      ctx.restore();
    };

    drawFrame();
    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, initialNodes, initialLinks, themeColors, requestRender, nodeRadius, degreeMap]);

  const hitTest = useCallback((mx: number, my: number) => {
    return initialNodes.find((n) => {
      if (n.x === undefined) return false;
      const dx = n.x! - mx, dy = n.y! - my;
      const r = nodeRadius(n);
      return dx * dx + dy * dy < (r + 4) * (r + 4);
    }) || null;
  }, [initialNodes, nodeRadius]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - r.left - r.width / 2 - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - r.top - r.height / 2 - transformRef.current.y) / transformRef.current.k;
    const found = hitTest(mx, my);
    if (found?.id !== hoveredNodeRef.current) {
      hoveredNodeRef.current = found?.id || null;
      setHoveredNode(found);
      requestRender();
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    }
  }, [hitTest, requestRender]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const node = hoveredNodeRef.current ? initialNodes.find((n) => n.id === hoveredNodeRef.current) : null;
    if (node) {
      const sx = e.clientX, sy = e.clientY, nx0 = node.x!, ny0 = node.y!;
      let moved = false;
      const onMove = (ev: MouseEvent) => {
        if (isLinkMode) return;
        const dx = (ev.clientX - sx) / transformRef.current.k;
        const dy = (ev.clientY - sy) / transformRef.current.k;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        node.fx = nx0 + dx;
        node.fy = ny0 + dy;
        updateNodeInWorker(node.id, node.fx, node.fy);
        requestRender();
      };
      const onUp = () => {
        if (!moved) {
          if (isLinkMode && linkSource && linkSource.id !== node.id) {
            if (onUpdateNote) {
              const src = notes.find((n) => n.id === linkSource.id);
              if (src) onUpdateNote(src.id, { content: (src.content || "") + `\n\n[[${node.title}]]` });
            }
            setLinkSource(null); setIsLinkMode(false);
          } else if (isLinkMode && !linkSource && !node.isGhost && !node.isFolder) {
            setLinkSource(node);
          } else if (!node.isFolder && !node.isGhost && onSelectNote) {
            if (canvasRef.current) {
              targetTransformRef.current = { x: -(node.x!) * transformRef.current.k, y: -(node.y!) * transformRef.current.k, k: transformRef.current.k };
              needsRedrawRef.current = true;
            }
            onSelectNote(node.id);
          }
        }
        node.fx = null; node.fy = null;
        updateNodeInWorker(node.id, null, null);
        window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
      return;
    }
    const sx = e.clientX, sy = e.clientY, it = { ...transformRef.current };
    const onMove = (ev: MouseEvent) => {
      transformRef.current = { ...it, x: it.x + ev.clientX - sx, y: it.y + ev.clientY - sy };
      requestRender();
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  }, [initialNodes, onSelectNote, isLinkMode, linkSource, notes, onUpdateNote, requestRender, updateNodeInWorker]);

  const fitToView = useCallback(() => {
    const placed = initialNodes.filter(n => n.x !== undefined && !n.isGhost);
    if (!placed.length || !canvasRef.current) { transformRef.current = { x: 0, y: 0, k: 0.75 }; requestRender(); return; }
    const xs = placed.map(n => n.x!), ys = placed.map(n => n.y!);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const r = canvasRef.current.getBoundingClientRect();
    const W = r.width, H = r.height, pad = 80;
    const k = Math.min((W - pad * 2) / (maxX - minX || 1), (H - pad * 2) / (maxY - minY || 1), 2);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    targetTransformRef.current = { x: -cx * k, y: -cy * k, k };
    needsRedrawRef.current = true;
  }, [initialNodes, requestRender]);

  const hoveredConnections = useMemo(() => {
    if (!hoveredNode) return [];
    const connected: { node: GraphNode; type: 'wiki' | 'folder' }[] = [];
    const nodeMap = new Map(initialNodes.map(n => [n.id, n]));
    initialLinks.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      if (sId === hoveredNode.id) {
        const n = nodeMap.get(tId); if (n) connected.push({ node: n, type: l.isHierarchy ? 'folder' : 'wiki' });
      } else if (tId === hoveredNode.id) {
        const n = nodeMap.get(sId); if (n) connected.push({ node: n, type: l.isHierarchy ? 'folder' : 'wiki' });
      }
    });
    return connected;
  }, [hoveredNode, initialNodes, initialLinks]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {variant === "modal" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[400] bg-black/75 backdrop-blur-md" />
          )}
          <motion.div
            initial={{ opacity: 0, scale: 0.99, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "flex flex-col bg-[var(--background)]/80 backdrop-blur-2xl border border-[var(--border)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden",
              variant === "modal" ? "fixed inset-4 md:inset-10 z-[401] rounded-none" : "relative w-full h-full border-none rounded-none",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--border)] bg-[var(--card)]/5 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[var(--destructive)]/50 border border-[var(--destructive)]/20 shadow-[0_0_8px_var(--destructive)]/10" />
                  <div className="w-2.5 h-2.5 bg-yellow-500/50 border border-yellow-500/20" />
                  <div className="w-2.5 h-2.5 bg-[var(--primary)]/50 border border-[var(--primary)]/20 shadow-[0_0_8px_var(--primary)]/10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black font-mono text-[var(--foreground)] tracking-[0.3em] uppercase">Neural_Graph_Engine <span className="text-[var(--primary)] opacity-40 ml-1">v4.0</span></span>
                  <span className="text-[7px] font-mono text-[var(--muted-foreground)] opacity-40 uppercase tracking-[0.2em]">Active_Entities: {initialNodes.length} &nbsp;|&nbsp; Stream_Links: {initialLinks.length}</span>
                </div>
              </div>

              <GraphControls 
                showSearch={showSearch} setShowSearch={setShowSearch}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                isLinkMode={isLinkMode} setIsLinkMode={setIsLinkMode}
                isPaused={isPaused} setIsPaused={setIsPaused}
                hideOrphans={hideOrphans} setHideOrphans={setHideOrphans}
                foldersOnly={foldersOnly} setFoldersOnly={setFoldersOnly}
                onZoomIn={() => { transformRef.current.k = Math.min(transformRef.current.k * 1.25, 8); requestRender(); }}
                onZoomOut={() => { transformRef.current.k = Math.max(transformRef.current.k / 1.25, 0.05); requestRender(); }}
                onFitToView={fitToView}
                variant={variant}
                onClose={onClose}
              />
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ cursor: hoveredNode ? "pointer" : "grab" }} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown}>
              <canvas ref={canvasRef} className="w-full h-full" />
              <AnimatePresence>
                {isLinkMode && (
                  <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} className="absolute top-4 left-1/2 -translate-x-1/2 bg-[var(--background)] border border-[var(--primary)] px-5 h-10 flex items-center gap-3 text-[9px] font-mono text-[var(--primary)] uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary)]" />
                    {!linkSource ? "Select source document" : "Select target document"}
                  </motion.div>
                )}
              </AnimatePresence>
              <GraphLegend />
              <GraphHints />
              <GraphInfoPanel hoveredNode={hoveredNode} hoveredConnections={hoveredConnections} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
