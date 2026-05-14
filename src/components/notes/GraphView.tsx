"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Link2,
  Pause,
  Play,
  Filter,
  FolderOpen,
} from "lucide-react";
import { useGraphTheme } from "@/hooks/use-graph-theme";
import { useGraphSimulation } from "@/hooks/use-graph-simulation";
import { GraphNode, GraphLink } from "@/types/graph";

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
  const [selectedPreview, setSelectedPreview] = useState<GraphNode | null>(null);
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

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // ── degree map (connection count per node) ────────────────────────────
    const degreeMap = new Map<string, number>();
    initialLinks.forEach((l) => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      degreeMap.set(sId, (degreeMap.get(sId) || 0) + 1);
      degreeMap.set(tId, (degreeMap.get(tId) || 0) + 1);
    });
    // radius for a node based on degree
    const nodeRadius = (node: GraphNode): number => {
      if (node.isGhost) return 3;
      const deg = degreeMap.get(node.id) || 0;
      if (node.isFolder) return node.isRootSun ? 10 + Math.sqrt(deg) * 1.5 : 7 + Math.sqrt(deg);
      return 4 + Math.sqrt(deg) * 0.8;
    };

    // ── per-node lerped alpha state ────────────────────────────────────────
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
      // Smooth pan animation toward targetTransform
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
      // Always run lerp; only skip full redraw if nothing changed
      const { x, y, k } = transformRef.current;
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);
      const cur = hoveredNodeRef.current;
      const q = searchRef.current.toLowerCase();

      // filter flags
      const doHideOrphans = hideOrphansRef.current;
      const doFoldersOnly = foldersOnlyRef.current;

      // compute 1st + 2nd-degree neighbor sets
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
      const neighborIds = neighbors1; // alias for hit/edge checks

      // lerp alpha targets toward actual values — triggers redraw if anything moved
      const LERP = 0.18;
      let anyChanged = false;
      initialNodes.forEach(node => {
        // filter hidden nodes
        const deg = degreeMap.get(node.id) || 0;
        const isOrphan = deg === 0 && !node.isFolder;
        if ((doHideOrphans && isOrphan) || (doFoldersOnly && !node.isFolder)) {
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
        if (Math.abs(next - prev) > 0.003) { alphaMap.set(node.id, next); anyChanged = true; needsRedrawRef.current = true; }
        else alphaMap.set(node.id, target);
      });

      if (!needsRedrawRef.current) return;
      needsRedrawRef.current = false;

      // ── background ────────────────────────────────────────────────────────
      ctx.fillStyle = themeColors.background;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(W / 2 + x, H / 2 + y);
      ctx.scale(k, k);

      const nodeMap = new Map(initialNodes.map((n) => [n.id, n]));
      const res = (ref: string | GraphNode): GraphNode | undefined =>
        typeof ref === 'string' ? nodeMap.get(ref) : (ref as GraphNode);

      // ── edges ─────────────────────────────────────────────────────────────
      // hierarchy — always drawn, very faint
      hierarchyLinks.forEach((l) => {
        const s = res(l.source); const t = res(l.target);
        if (!s || !t || s.x === undefined || t.x === undefined) return;
        const sA = alphaMap.get(s.id) ?? 1;
        const tA = alphaMap.get(t.id) ?? 1;
        if (Math.min(sA, tA) < 0.02) return;
        const connected = cur && (s.id === cur || t.id === cur || neighborIds.has(s.id) || neighborIds.has(t.id));
        const edgeA = Math.min(sA, tA);
        ctx.globalAlpha = edgeA;
        ctx.strokeStyle = (s.color || themeColors.muted) + (connected ? '60' : '22');
        ctx.lineWidth = (connected ? 1 : 0.5) / k;
        ctx.beginPath(); ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!); ctx.stroke();
      });

      // wiki links
      wikiLinks.forEach((l) => {
        const s = res(l.source); const t = res(l.target);
        if (!s || !t || s.x === undefined || t.x === undefined) return;
        const isActive = cur && (s.id === cur || t.id === cur);
        const sA = alphaMap.get(s.id) ?? 1;
        const tA = alphaMap.get(t.id) ?? 1;
        const edgeA = Math.min(sA, tA);
        if (edgeA < 0.02) return;
        ctx.globalAlpha = edgeA;
        if (isActive) {
          // glowing active edge
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

      // ── nodes ─────────────────────────────────────────────────────────────
      const labelFont = `400 ${10 / k}px ui-monospace, monospace`;
      ctx.textAlign = 'center';

      initialNodes.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return;
        const a = alphaMap.get(node.id) ?? 1;
        if (a < 0.01) return;
        const isHov = node.id === cur;
        const isNeigh = neighborIds.has(node.id);
        const matched = q && node.title.toLowerCase().includes(q);
        const c = node.color || themeColors.muted;
        const r = nodeRadius(node);

        ctx.globalAlpha = a;

        if (node.isGhost) {
          // dashed ring only
          ctx.save();
          ctx.setLineDash([1.5 / k, 2.5 / k]);
          ctx.beginPath(); ctx.arc(node.x!, node.y!, r, 0, Math.PI * 2);
          ctx.strokeStyle = c + '55'; ctx.lineWidth = 0.7 / k; ctx.stroke();
          ctx.setLineDash([]); ctx.restore();
        } else {
          // filled circle — folder gets stronger fill
          const fillAlpha = node.isFolder ? (isHov ? '40' : '25') : (isHov ? '35' : '18');
          ctx.beginPath(); ctx.arc(node.x!, node.y!, r, 0, Math.PI * 2);
          ctx.fillStyle = c + fillAlpha; ctx.fill();

          // stroke ring
          ctx.strokeStyle = c + (isHov || isNeigh ? 'ee' : 'aa');
          ctx.lineWidth = (isHov ? 1.8 : node.isFolder ? 1.2 : 0.9) / k;
          ctx.stroke();

          // outer glow ring on hover
          if (isHov) {
            ctx.beginPath(); ctx.arc(node.x!, node.y!, r + 4 / k, 0, Math.PI * 2);
            ctx.strokeStyle = c + '30'; ctx.lineWidth = 3 / k; ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;

        // Labels — show for: hovered, 1st-deg neighbor (zoom>0.6), hub (deg≥3, zoom>0.9), folders, search match
        const deg = degreeMap.get(node.id) || 0;
        const isHub = deg >= 3;
        const is2nd = neighbors2.has(node.id);
        const showLabel = isHov || matched
          || (neighbors1.has(node.id) && k > 0.5)
          || (node.isFolder && k > 0.25)
          || (isHub && k > 0.8 && !node.isGhost);
        if (showLabel) {
          const labelA = (isHov ? 1 : neighbors1.has(node.id) || node.isFolder ? 0.8 : is2nd ? 0.5 : 0.4) * a;
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
  }, [isOpen, initialNodes, initialLinks, themeColors, requestRender]);

  // ── mouse ──────────────────────────────────────────────────────────────────
  // degree map for hit-radius (recomputed from links)
  const degreeMapHit = useMemo(() => {
    const m = new Map<string, number>();
    initialLinks.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      m.set(sId, (m.get(sId) || 0) + 1);
      m.set(tId, (m.get(tId) || 0) + 1);
    });
    return m;
  }, [initialLinks]);

  const hitTest = useCallback(
    (mx: number, my: number) => {
      return (
        initialNodes.find((n) => {
          if (n.x === undefined) return false;
          const dx = n.x! - mx, dy = n.y! - my;
          const deg = degreeMapHit.get(n.id) || 0;
          const r = n.isGhost ? 3 : n.isFolder
            ? (n.isRootSun ? 10 + Math.sqrt(deg) * 1.5 : 7 + Math.sqrt(deg))
            : 4 + Math.sqrt(deg) * 0.8;
          return dx * dx + dy * dy < (r + 4) * (r + 4); // +4px tolerance
        }) || null
      );
    },
    [initialNodes, degreeMapHit],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      const mx =
        (e.clientX - r.left - r.width / 2 - transformRef.current.x) /
        transformRef.current.k;
      const my =
        (e.clientY - r.top - r.height / 2 - transformRef.current.y) /
        transformRef.current.k;
      const found = hitTest(mx, my);
      if (found?.id !== hoveredNodeRef.current) {
        hoveredNodeRef.current = found?.id || null;
        setHoveredNode(found);
        requestRender();
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        if (found && !found.isFolder) {
          hoverTimerRef.current = setTimeout(
            () => setSelectedPreview(found),
            250,
          );
        } else {
          setSelectedPreview(null);
        }
      }
    },
    [hitTest, requestRender],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const node = hoveredNodeRef.current
        ? initialNodes.find((n) => n.id === hoveredNodeRef.current)
        : null;
      if (node) {
        const sx = e.clientX,
          sy = e.clientY,
          nx0 = node.x!,
          ny0 = node.y!;
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
                if (src) {
                  onUpdateNote(src.id, { content: (src.content || "") + `\n\n[[${node.title}]]` });
                }
              }
              setLinkSource(null);
              setIsLinkMode(false);
            } else if (isLinkMode && !linkSource && !node.isGhost && !node.isFolder) {
              setLinkSource(node);
            } else if (!node.isFolder && !node.isGhost && onSelectNote) {
              // pan-to-node before opening
              if (canvasRef.current) {
                const r = canvasRef.current.getBoundingClientRect();
                targetTransformRef.current = {
                  x: -(node.x!) * transformRef.current.k,
                  y: -(node.y!) * transformRef.current.k,
                  k: transformRef.current.k,
                };
                needsRedrawRef.current = true;
              }
              onSelectNote(node.id);
            }
          }
          node.fx = null;
          node.fy = null;
          updateNodeInWorker(node.id, null, null);
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return;
      }
      // pan
      const sx = e.clientX,
        sy = e.clientY,
        it = { ...transformRef.current };
      const onMove = (ev: MouseEvent) => {
        transformRef.current = {
          ...it,
          x: it.x + ev.clientX - sx,
          y: it.y + ev.clientY - sy,
        };
        requestRender();
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [
      initialNodes,
      onSelectNote,
      isLinkMode,
      linkSource,
      notes,
      onUpdateNote,
      requestRender,
      updateNodeInWorker,
    ],
  );

  const noteCount = initialNodes.filter((n) => !n.isFolder && !n.isGhost).length;
  const folderCount = initialNodes.filter((n) => n.isFolder).length;
  const linkCount = initialLinks.filter((l) => !l.isHierarchy).length;

  // connections list for hovered node (for info panel)
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

  // fit-to-view: compute bounding box of all placed nodes
  const fitToView = useCallback(() => {
    const placed = initialNodes.filter(n => n.x !== undefined && !n.isGhost);
    if (!placed.length || !canvasRef.current) { transformRef.current = { x: 0, y: 0, k: 0.75 }; requestRender(); return; }
    const xs = placed.map(n => n.x!), ys = placed.map(n => n.y!);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const r = canvasRef.current.getBoundingClientRect();
    const W = r.width, H = r.height;
    const pad = 80;
    const k = Math.min((W - pad * 2) / (maxX - minX || 1), (H - pad * 2) / (maxY - minY || 1), 2);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    targetTransformRef.current = { x: -cx * k, y: -cy * k, k };
    needsRedrawRef.current = true;
  }, [initialNodes, requestRender]);

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
              className="fixed inset-0 z-[400] bg-black/75 backdrop-blur-md"
            />
          )}
            <motion.div
            initial={{ opacity: 0, scale: 0.99, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex flex-col bg-[var(--background)] border border-[var(--border)] shadow-2xl overflow-hidden",
              variant === "modal"
                ? "fixed inset-4 md:inset-10 z-[401] rounded-none"
                : "relative w-full h-full border-none rounded-none",
            )}
          >
            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--border)] bg-[var(--card)]/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 bg-[var(--destructive)]/70" />
                  <div className="w-2.5 h-2.5 bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 bg-[var(--primary)]/70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black font-mono text-[var(--foreground)] tracking-[0.2em] uppercase">
                    Neural_Graph_Engine
                  </span>
                  <span className="text-[7px] font-mono text-[var(--muted-foreground)] opacity-40 uppercase tracking-widest">
                    {folderCount} DIR · {noteCount} NODE · {linkCount} EDGE
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Search */}
                <AnimatePresence>
                  {showSearch && (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 180, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      type="text"
                      placeholder="FILTER_NODES..."
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 px-3 text-[10px] font-mono bg-[var(--background)] border border-[var(--border)] rounded-none focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/30 mr-1 uppercase"
                    />
                  )}
                </AnimatePresence>
                {[
                  {
                    icon: Search,
                    action: () => {
                      setShowSearch((s) => !s);
                      if (showSearch) setSearchQuery("");
                    },
                    active: showSearch,
                    tip: "Search",
                  },
                  {
                    icon: Link2,
                    action: () => setIsLinkMode((l) => !l),
                    active: isLinkMode,
                    tip: "Link mode",
                  },
                  {
                    icon: isPaused ? Play : Pause,
                    action: () => setIsPaused((p) => !p),
                    active: isPaused,
                    tip: isPaused ? "Resume" : "Pause",
                  },
                  {
                    icon: ZoomIn,
                    action: () => {
                      transformRef.current.k = Math.min(
                        transformRef.current.k * 1.25,
                        8,
                      );
                      requestRender();
                    },
                    tip: "Zoom in",
                  },
                  {
                    icon: ZoomOut,
                    action: () => {
                      transformRef.current.k = Math.max(
                        transformRef.current.k / 1.25,
                        0.05,
                      );
                      requestRender();
                    },
                    tip: "Zoom out",
                  },
                  {
                    icon: Maximize2,
                    action: fitToView,
                    tip: "Fit to view",
                  },
                ].map(({ icon: Icon, action, active, tip }, i) => (
                  <button
                    key={i}
                    onClick={action}
                    title={tip}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center transition-all border border-transparent",
                      active
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5",
                    )}
                  >
                    <Icon size={13} />
                  </button>
                ))}
                {/* Filter toggles */}
                <div className="w-px h-4 bg-[var(--border)]/40 mx-1" />
                <button
                  onClick={() => setHideOrphans(v => !v)}
                  title={hideOrphans ? "Show orphan nodes" : "Hide orphan nodes"}
                  className={cn("w-8 h-8 flex items-center justify-center transition-all border border-transparent",
                    hideOrphans ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  )}
                >
                  <Filter size={13} />
                </button>
                <button
                  onClick={() => setFoldersOnly(v => !v)}
                  title={foldersOnly ? "Show all nodes" : "Folders only"}
                  className={cn("w-8 h-8 flex items-center justify-center transition-all border border-transparent",
                    foldersOnly ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  )}
                >
                  <FolderOpen size={13} />
                </button>
                {variant === "modal" && (
                  <button
                    onClick={onClose}
                    title="Close"
                    className="w-8 h-8 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all ml-1"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* ── CANVAS ──────────────────────────────────────────────────── */}
            <div
              ref={containerRef}
              className="flex-1 relative overflow-hidden"
              style={{ cursor: hoveredNode ? "pointer" : "grab" }}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
            >
              <canvas ref={canvasRef} className="w-full h-full" />

              {/* Link mode banner */}
              <AnimatePresence>
                {isLinkMode && (
                  <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-[var(--background)] border border-[var(--primary)] px-5 h-10 flex items-center gap-3 text-[9px] font-mono text-[var(--primary)] uppercase tracking-widest"
                  >
                    <div className="w-1.5 h-1.5 bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary)]" />
                    {!linkSource
                      ? "Select source document"
                      : "Select target document"}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 select-none pointer-events-none">
                {[
                  { shape: "folder", label: "DIR  (folder)" },
                  { shape: "note", label: "NODE  (note)" },
                  { shape: "ghost", label: "REF  (unresolved)" },
                ].map(({ shape, label }) => (
                  <div key={shape} className="flex items-center gap-2">
                    {shape === "folder" && (
                      <div className="w-3 h-3 border border-[var(--primary)] bg-[var(--primary)]/20 shrink-0" />
                    )}
                    {shape === "note" && (
                      <div className="w-3 h-3 rounded-full border border-[var(--foreground)]/50 bg-[var(--foreground)]/10 shrink-0" />
                    )}
                    {shape === "ghost" && (
                      <div className="w-3 h-3 rounded-full border border-dashed border-[var(--muted-foreground)]/40 shrink-0" />
                    )}
                    <span className="text-[9px] font-mono text-[var(--muted-foreground)]/50 uppercase tracking-wider">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hover hint */}
              <div className="absolute bottom-4 right-4 select-none pointer-events-none text-[9px] font-mono text-[var(--muted-foreground)]/25 uppercase tracking-wider text-right">
                scroll · zoom &nbsp;|&nbsp; drag · pan
              </div>

              {/* Node info panel */}
              <AnimatePresence>
                {hoveredNode && !hoveredNode.isGhost && (
                  <motion.div
                    key={hoveredNode.id + '-info'}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-4 right-4 w-56 pointer-events-none select-none"
                  >
                    <div className="bg-[var(--background)] border border-[var(--border)] p-4 shadow-2xl relative">
                      <div className="absolute top-0 right-0 p-2 opacity-20">
                        <Hash size={10} className="text-[var(--primary)]" />
                      </div>
                      {/* title */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rotate-45 shrink-0" style={{ backgroundColor: hoveredNode.color }} />
                        <span className="text-[10px] font-black font-mono text-[var(--foreground)] truncate uppercase tracking-tight">
                          {hoveredNode.title}
                        </span>
                      </div>
                      {/* stats row */}
                      <div className="flex gap-4 mb-5 border-y border-[var(--border)]/30 py-2">
                        <div className="flex flex-col">
                          <span className="text-[6px] font-mono text-[var(--muted-foreground)] uppercase">Connections</span>
                          <span className="text-[9px] font-mono font-bold text-[var(--foreground)] uppercase">
                            {hoveredConnections.filter(c => c.type === 'wiki').length} UNITS
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[6px] font-mono text-[var(--muted-foreground)] uppercase">Classification</span>
                          <span className="text-[9px] font-mono font-bold text-[var(--primary)] uppercase">
                            {hoveredNode.isFolder ? 'DIRECTORY' : hoveredNode.isGhost ? 'REFERENCE' : 'DATA_NODE'}
                          </span>
                        </div>
                      </div>
                      {/* connections list */}
                      {hoveredConnections.length > 0 && (
                        <div className="space-y-1.5">
                          {hoveredConnections.slice(0, 5).map(({ node: cn, type }) => (
                            <div key={cn.id} className="flex items-center gap-2 group/conn">
                              <div className="w-1 h-1 bg-[var(--border)] shrink-0 group-hover/conn:bg-[var(--primary)]" />
                              <span className="text-[8px] font-mono text-[var(--muted-foreground)] truncate uppercase tracking-tighter">
                                {cn.title}
                              </span>
                              <span className="text-[7px] font-mono text-[var(--muted-foreground)]/20 ml-auto shrink-0 uppercase tracking-tighter">
                                {type === 'wiki' ? 'LINK' : 'CHILD'}
                              </span>
                            </div>
                          ))}
                          {hoveredConnections.length > 5 && (
                            <span className="text-[7px] font-mono text-[var(--primary)]/60 mt-2 block uppercase tracking-widest text-center border-t border-[var(--border)]/20 pt-1">
                              +{hoveredConnections.length - 5} ADDITIONAL_NODES
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Node preview tooltip */}
              <AnimatePresence>
                {selectedPreview &&
                  selectedPreview.content &&
                  !selectedPreview.isFolder && (
                    <motion.div
                      key={selectedPreview.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 pointer-events-none select-none"
                    >
                      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] p-4 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary)] opacity-40" />
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-1.5 h-1.5 rotate-45 shrink-0"
                            style={{ backgroundColor: selectedPreview.color }}
                          />
                          <span className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest truncate">
                            {selectedPreview.title}
                          </span>
                        </div>
                        <p className="text-[9px] text-[var(--muted-foreground)] line-clamp-3 leading-relaxed font-mono uppercase opacity-70">
                          {selectedPreview.content
                            .replace(/#{1,6} /g, "")
                            .replace(/\*\*/g, "")
                            .slice(0, 150) || "EMPTY_BUFFER"}
                        </p>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
