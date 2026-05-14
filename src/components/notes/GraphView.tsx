"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  Info,
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
  const hoveredNodeRef = useRef<string | null>(null);
  const needsRedrawRef = useRef(true);
  const rafRef = useRef(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<GraphNode | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<GraphNode | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const searchRef = useRef("");
  const isPausedRef = useRef(false);

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

  useEffect(() => {
    searchRef.current = searchQuery;
    requestRender();
  }, [searchQuery, requestRender]);
  useEffect(() => {
    isPausedRef.current = isPaused;
    requestRender();
  }, [isPaused, requestRender]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

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

    // ── Pre-bake node textures (run once per themeColors change) ─────────────
    // Key: `${type}:${color}` → offscreen canvas
    const texCache = new Map<string, HTMLCanvasElement>();
    const bakeNode = (type: 'planet-root'|'planet'|'star'|'ghost', color: string, bg: string): HTMLCanvasElement => {
      const key = `${type}:${color}`;
      if (texCache.has(key)) return texCache.get(key)!;
      const SIZE = type === 'planet-root' ? 120 : type === 'planet' ? 80 : type === 'star' ? 60 : 24;
      const c = document.createElement('canvas');
      c.width = SIZE; c.height = SIZE;
      const cx = c.getContext('2d')!;
      const cx0 = SIZE / 2, cy0 = SIZE / 2;
      if (type === 'ghost') {
        cx.strokeStyle = color + '55'; cx.lineWidth = 1;
        cx.setLineDash([2, 3]);
        cx.beginPath(); cx.arc(cx0, cy0, 8, 0, Math.PI * 2); cx.stroke();
        cx.setLineDash([]);
      } else if (type === 'star') {
        const r = 5;
        const corona = cx.createRadialGradient(cx0, cy0, 0, cx0, cy0, SIZE / 2);
        corona.addColorStop(0, color + 'aa'); corona.addColorStop(0.35, color + '33'); corona.addColorStop(1, color + '00');
        cx.beginPath(); cx.arc(cx0, cy0, SIZE / 2, 0, Math.PI * 2);
        cx.fillStyle = corona; cx.fill();
        cx.beginPath(); cx.arc(cx0, cy0, r, 0, Math.PI * 2);
        cx.fillStyle = color + 'ff'; cx.fill();
      } else {
        // planet
        const r = type === 'planet-root' ? 22 : 14;
        // atmosphere
        const atm = cx.createRadialGradient(cx0, cy0, r * 0.5, cx0, cy0, r * 2.5);
        atm.addColorStop(0, color + '33'); atm.addColorStop(1, color + '00');
        cx.beginPath(); cx.arc(cx0, cy0, r * 2.5, 0, Math.PI * 2);
        cx.fillStyle = atm; cx.fill();
        // orbital ring
        cx.save(); cx.translate(cx0, cy0); cx.scale(1, 0.3);
        cx.beginPath(); cx.arc(0, 0, r * 1.85, 0, Math.PI * 2);
        cx.strokeStyle = color + '44'; cx.lineWidth = 1.5; cx.stroke();
        cx.restore();
        // sphere
        const sphere = cx.createRadialGradient(cx0 - r * 0.35, cy0 - r * 0.35, r * 0.05, cx0, cy0, r);
        sphere.addColorStop(0, color + 'ff'); sphere.addColorStop(0.65, color + 'cc'); sphere.addColorStop(1, bg + 'bb');
        cx.beginPath(); cx.arc(cx0, cy0, r, 0, Math.PI * 2);
        cx.fillStyle = sphere; cx.fill();
        // specular
        const spec = cx.createRadialGradient(cx0 - r * 0.38, cy0 - r * 0.38, 0, cx0 - r * 0.38, cy0 - r * 0.38, r * 0.55);
        spec.addColorStop(0, 'rgba(255,255,255,0.4)'); spec.addColorStop(1, 'rgba(255,255,255,0)');
        cx.beginPath(); cx.arc(cx0, cy0, r, 0, Math.PI * 2);
        cx.fillStyle = spec; cx.fill();
      }
      texCache.set(key, c);
      return c;
    };

    // Pre-warm textures for all unique colors
    const uniqueColors = Array.from(new Set(initialNodes.map(n => n.color || themeColors.muted)));
    uniqueColors.forEach(col => {
      bakeNode('planet-root', col, themeColors.background);
      bakeNode('planet', col, themeColors.background);
      bakeNode('star', col, themeColors.background);
      bakeNode('ghost', col, themeColors.background);
    });

    const drawFrame = () => {
      rafRef.current = requestAnimationFrame(drawFrame);
      if (!needsRedrawRef.current) return;
      needsRedrawRef.current = false;

      const { x, y, k } = transformRef.current;
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);

      // ── space background (theme-aware) ────────────────────────────────────
      ctx.fillStyle = themeColors.background;
      ctx.fillRect(0, 0, W, H);

      // Star field — uses theme foreground color so light themes get dark stars
      if (!(drawFrame as any)._stars) {
        (drawFrame as any)._stars = Array.from({ length: 260 }, () => ({
          x: Math.random() * 4000 - 2000,
          y: Math.random() * 4000 - 2000,
          r: Math.random() * 1.1 + 0.2,
          a: Math.random() * 0.5 + 0.1,
        }));
      }
      ctx.save();
      ctx.translate(W / 2 + x, H / 2 + y);
      ctx.scale(k, k);
      (drawFrame as any)._stars.forEach((s: any) => {
        ctx.globalAlpha = s.a * 0.6;
        ctx.fillStyle = themeColors.foreground;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r / k, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2 + x, H / 2 + y);
      ctx.scale(k, k);

      const nodeMap = new Map(initialNodes.map((n) => [n.id, n]));
      const cur = hoveredNodeRef.current;
      const q = searchRef.current.toLowerCase();

      const neighborIds = new Set<string>();
      if (cur) {
        [...wikiLinks, ...hierarchyLinks].forEach((l) => {
          const sId =
            typeof l.source === "string"
              ? l.source
              : (l.source as GraphNode).id;
          const tId =
            typeof l.target === "string"
              ? l.target
              : (l.target as GraphNode).id;
          if (sId === cur) neighborIds.add(tId);
          if (tId === cur) neighborIds.add(sId);
        });
      }

      const res = (ref: string | GraphNode): GraphNode | undefined =>
        typeof ref === "string" ? nodeMap.get(ref) : (ref as GraphNode);

      // ── nebula blobs — only at zoom > 0.3, skip at low zoom ────────────────
      const folderNodes = initialNodes.filter(n => n.isFolder && n.x !== undefined);
      if (k > 0.25) {
        folderNodes.forEach((fn) => {
          const nr = fn.isRootSun ? 200 : 120;
          const g = ctx.createRadialGradient(fn.x!, fn.y!, 0, fn.x!, fn.y!, nr);
          g.addColorStop(0, (fn.color || themeColors.primary) + "12");
          g.addColorStop(1, (fn.color || themeColors.primary) + "00");
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(fn.x!, fn.y!, nr, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      // ── hierarchy edges — plain lines (no per-edge gradient) ────────────
      ctx.lineWidth = 0.7 / k;
      hierarchyLinks.forEach((l) => {
        const s = res(l.source); const t = res(l.target);
        if (!s || !t || s.x === undefined || t.x === undefined) return;
        const hi = cur === s.id || cur === t.id || neighborIds.has(s.id) || neighborIds.has(t.id);
        ctx.strokeStyle = (s.color || themeColors.muted) + (hi ? '55' : '1a');
        ctx.lineWidth = (hi ? 1.2 : 0.6) / k;
        ctx.beginPath(); ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!); ctx.stroke();
      });

      // ── wiki edges ─────────────────────────────────────────────────────────
      if (cur) {
        // only show connected links when hovering
        wikiLinks.forEach((l) => {
          const s = res(l.source); const t = res(l.target);
          if (!s || !t || s.x === undefined || t.x === undefined) return;
          if (s.id !== cur && t.id !== cur) return;
          ctx.strokeStyle = (s.color || themeColors.primary) + 'bb';
          ctx.lineWidth = 1.5 / k;
          ctx.beginPath(); ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!); ctx.stroke();
        });
      } else {
        // Batch by color — single path per color
        const buckets = new Map<string, [number, number, number, number][]>();
        wikiLinks.forEach((l) => {
          const s = res(l.source); const t = res(l.target);
          if (!s || !t || s.x === undefined || t.x === undefined) return;
          const c = s.color || themeColors.muted;
          if (!buckets.has(c)) buckets.set(c, []);
          buckets.get(c)!.push([s.x!, s.y!, t.x!, t.y!]);
        });
        buckets.forEach((segs, color) => {
          ctx.beginPath(); ctx.strokeStyle = color + '0f'; ctx.lineWidth = 0.4 / k;
          segs.forEach(([x1, y1, x2, y2]) => { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); });
          ctx.stroke();
        });
      }

      // ── nodes — drawImage from pre-baked textures ─────────────────────────
      // Set font once for the entire label pass
      const labelFont = `400 ${9 / k}px ui-monospace, monospace`;
      const labelFontBold = `600 ${11 / k}px ui-monospace, monospace`;
      ctx.textAlign = 'left';

      initialNodes.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return;
        const isHov = node.id === cur;
        const isNeigh = neighborIds.has(node.id);
        const matched = q && node.title.toLowerCase().includes(q);

        let a = 1;
        if (q) a = matched ? 1 : 0.08;
        else if (cur) a = isHov ? 1 : isNeigh ? 0.8 : 0.15;
        else a = node.isGhost ? 0.3 : 0.9;

        ctx.globalAlpha = a;
        const c = node.color || themeColors.muted;

        if (node.isFolder) {
          const type = node.isRootSun ? 'planet-root' : 'planet';
          const tex = bakeNode(type, c, themeColors.background);
          const SIZE = tex.width;
          // drawImage is a fast GPU blit — no gradient creation per frame
          ctx.drawImage(tex, node.x! - SIZE / 2, node.y! - SIZE / 2, SIZE, SIZE);

          // hover ring (cheap stroke, only when hovered)
          if (isHov) {
            const r = node.isRootSun ? 22 : 14;
            ctx.beginPath(); ctx.arc(node.x!, node.y!, r + 5 / k, 0, Math.PI * 2);
            ctx.strokeStyle = c + '88'; ctx.lineWidth = 2 / k; ctx.stroke();
          }

        } else if (node.isGhost) {
          const tex = bakeNode('ghost', c, themeColors.background);
          ctx.drawImage(tex, node.x! - 12, node.y! - 12, 24, 24);

        } else {
          const tex = bakeNode('star', c, themeColors.background);
          const SIZE = isHov ? 60 : 44;
          ctx.drawImage(tex, node.x! - SIZE / 2, node.y! - SIZE / 2, SIZE, SIZE);

          // diffraction spikes only on hover (cheap lines)
          if (isHov) {
            const spike = 14 / k;
            ctx.strokeStyle = c + '88'; ctx.lineWidth = 0.8 / k;
            ctx.beginPath();
            ctx.moveTo(node.x! - spike, node.y!); ctx.lineTo(node.x! + spike, node.y!);
            ctx.moveTo(node.x!, node.y! - spike); ctx.lineTo(node.x!, node.y! + spike);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;

        // Labels
        const showLabel = node.isFolder || isHov || (isNeigh && k > 0.5) || matched || (k > 2.8 && !node.isGhost);
        if (showLabel) {
          ctx.globalAlpha = (isHov ? 1 : node.isFolder ? 0.85 : 0.6) * a;
          ctx.font = node.isFolder ? labelFontBold : labelFont;
          ctx.fillStyle = isHov ? themeColors.foreground : c;
          const offX = (node.isFolder ? (node.isRootSun ? 26 : 18) : 10) / k;
          const label = node.title.length > 22 ? node.title.slice(0, 22) + '…' : node.title;
          ctx.fillText(label, node.x! + offX, node.y! + 4 / k);
          ctx.globalAlpha = 1;
        }
      });

      ctx.restore();
    };

    drawFrame();
    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, initialNodes, initialLinks, themeColors, requestRender]);

  // ── mouse ──────────────────────────────────────────────────────────────────
  const hitTest = useCallback(
    (mx: number, my: number) => {
      return (
        initialNodes.find((n) => {
          if (n.x === undefined) return false;
          const dx = n.x! - mx,
            dy = n.y! - my;
          const r = n.isFolder ? (n.isRootSun ? 20 : 14) : 10;
          return dx * dx + dy * dy < r * r;
        }) || null
      );
    },
    [initialNodes],
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
                  const wl = `[[${node.title}]]`;
                  onUpdateNote(src.id, {
                    content: (src.content || "") + "\n\n" + wl,
                  });
                }
              }
              setLinkSource(null);
              setIsLinkMode(false);
            } else if (
              isLinkMode &&
              !linkSource &&
              !node.isGhost &&
              !node.isFolder
            ) {
              setLinkSource(node);
            } else if (!node.isFolder && !node.isGhost && onSelectNote) {
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

  const noteCount = initialNodes.filter(
    (n) => !n.isFolder && !n.isGhost,
  ).length;
  const folderCount = initialNodes.filter((n) => n.isFolder).length;
  const linkCount = initialLinks.filter((l) => !l.isHierarchy).length;

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
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "flex flex-col bg-[var(--background)] border border-[var(--border)]/60 shadow-2xl overflow-hidden",
              variant === "modal"
                ? "fixed inset-4 md:inset-10 z-[401] rounded-2xl"
                : "relative w-full h-full border-none rounded-none",
            )}
          >
            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]/50 bg-[var(--card)]/30 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--destructive)]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[11px] font-semibold font-mono text-[var(--foreground)] opacity-70 tracking-widest uppercase ml-1">
                  Knowledge Graph
                </span>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)] opacity-40">
                  {folderCount} folders · {noteCount} notes · {linkCount} links
                </span>
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
                      placeholder="Search nodes…"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-7 px-3 text-[11px] font-mono bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)]/50 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 mr-1"
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
                    action: () => {
                      transformRef.current = { x: 0, y: 0, k: 0.75 };
                      requestRender();
                    },
                    tip: "Reset view",
                  },
                ].map(({ icon: Icon, action, active, tip }, i) => (
                  <button
                    key={i}
                    onClick={action}
                    title={tip}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                      active
                        ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5",
                    )}
                  >
                    <Icon size={14} strokeWidth={1.8} />
                  </button>
                ))}
                {variant === "modal" && (
                  <button
                    onClick={onClose}
                    title="Close"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all ml-1"
                  >
                    <X size={14} strokeWidth={1.8} />
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
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-[var(--primary)]/10 border border-[var(--primary)]/30 backdrop-blur-xl rounded-full px-5 py-2 flex items-center gap-3 text-[11px] font-mono text-[var(--primary)]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                    {!linkSource
                      ? "Click a note to start a link"
                      : "Now click the target note"}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 select-none pointer-events-none">
                {[
                  { shape: "folder", label: "Planet  (folder)" },
                  { shape: "note", label: "Star  (note)" },
                  { shape: "ghost", label: "Asteroid  (unresolved ref)" },
                ].map(({ shape, label }) => (
                  <div key={shape} className="flex items-center gap-2">
                    {shape === "folder" && (
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]/50 shrink-0" />
                    )}
                    {shape === "note" && (
                      <div className="w-3 h-3 rounded-full bg-[var(--foreground)]/50 shrink-0" />
                    )}
                    {shape === "ghost" && (
                      <div className="w-3 h-3 rounded-full border border-dashed border-[var(--muted-foreground)]/50 shrink-0" />
                    )}
                    <span className="text-[9px] font-mono text-[var(--muted-foreground)]/60 uppercase tracking-wider">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hover hint */}
              <div className="absolute bottom-4 right-4 select-none pointer-events-none text-[9px] font-mono text-[var(--muted-foreground)]/30 uppercase tracking-wider text-right">
                scroll to zoom · drag to pan
                <br />
                click note to open
              </div>

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
                      <div className="bg-[var(--card)]/80 backdrop-blur-2xl border border-[var(--border)]/60 rounded-xl p-4 shadow-2xl">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: selectedPreview.color }}
                          />
                          <span className="text-[12px] font-semibold text-[var(--foreground)] truncate">
                            {selectedPreview.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-3 leading-relaxed font-mono">
                          {selectedPreview.content
                            .replace(/#{1,6} /g, "")
                            .replace(/\*\*/g, "")
                            .slice(0, 200) || "No content yet"}
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
