"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash } from "lucide-react";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import * as d3 from "d3-force";

import { useTheme } from "@/hooks/use-theme";
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

interface Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  content: string;
  size: number;
  color: string;
  isGhost?: boolean;
  isFolder?: boolean;
  parentFolderId?: string;
  isNexus?: boolean;
  isRootSun?: boolean;
  isRoguePlanet?: boolean;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  isHierarchy?: boolean;
}

export default function GraphView({ isOpen, onClose, notes, variant = "modal", onSelectNote, onUpdateNote, folders = [] }: GraphViewProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 0.8 });
  const hoveredNodeRef = useRef<string | null>(null);
  
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [activeHoveredNode, setActiveHoveredNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHUD, setShowHUD] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<Node | null>(null);
  const [themeColors, setThemeColors] = useState({
    background: "#0d0d0d",
    foreground: "#ebdbb2",
    primary: "#fabd2f",
    accent: "#b8bb26",
    border: "#262626",
    muted: "#928374",
    card: "#141414",
    destructive: "#fb4934",
    secondary: "#222222"
  });
  
  const searchQueryRef = useRef("");
  const isPausedRef = useRef(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const needsRedrawRef = useRef<boolean>(true);
  const isInteractingRef = useRef<boolean>(false);
  const nodeTexturesRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const mousePosRef = useRef({ x: 0, y: 0 });
  const currentNodesRef = useRef<Node[]>([]);
  const simulationTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(Date.now());

  const requestRender = useCallback(() => {
    needsRedrawRef.current = true;
  }, []);

  const ORBIT_RADIUS = 70;
  const FOLDER_ORBIT_RADIUS = 150;

  useEffect(() => {
    searchQueryRef.current = searchQuery;
    requestRender();
  }, [searchQuery, requestRender]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    if (simulationRef.current) {
      if (isPaused) {
        simulationRef.current.stop();
      } else {
        simulationRef.current.alpha(0.3).restart();
      }
    }
    requestRender();
  }, [isPaused, requestRender]);

  // Pre-render node textures
  useEffect(() => {
    const palette = [
      themeColors.primary, 
      themeColors.accent, 
      themeColors.destructive,
      themeColors.foreground,
      themeColors.muted,
      themeColors.secondary
    ];
    // Filter out potential duplicate background colors or empty values
    const cleanPalette = Array.from(new Set(palette.filter(Boolean)));
    
    const textures = new Map<string, HTMLCanvasElement>();
    
    cleanPalette.forEach(color => {
      // ... texture generation ...
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
    const updateTheme = () => {
      const style = getComputedStyle(document.documentElement);
      setThemeColors({
        background: style.getPropertyValue("--background").trim() || "#0d0d0d",
        foreground: style.getPropertyValue("--foreground").trim() || "#ebdbb2",
        primary: style.getPropertyValue("--primary").trim() || "#fabd2f",
        accent: style.getPropertyValue("--accent").trim() || "#b8bb26",
        border: style.getPropertyValue("--border").trim() || "#262626",
        muted: style.getPropertyValue("--muted-foreground").trim() || "#928374",
        card: style.getPropertyValue("--card").trim() || "#141414",
        destructive: style.getPropertyValue("--destructive").trim() || "#fb4934",
        secondary: style.getPropertyValue("--secondary").trim() || "#222222",
      });
      requestRender();
    };
    
    updateTheme();
    // Add a small delay to ensure CSS variables are applied
    const timer = setTimeout(updateTheme, 50);
    return () => clearTimeout(timer);
  }, [theme, isOpen, requestRender]);

  const { initialNodes, initialLinks } = useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const folderNodesMap = new Map<string, Node>();
    const nodesById = new Map<string, Node>();
    const nodesByTitleMap = new Map<string, Node[]>();
    const palette = [
      themeColors.primary,
      themeColors.accent,
      themeColors.destructive,
      themeColors.foreground,
      themeColors.muted,
      themeColors.secondary !== themeColors.background ? themeColors.secondary : themeColors.accent,
    ];

    // Cache current positions
    const posCache = new Map<string, { x: number, y: number, vx: number, vy: number }>();
    currentNodesRef.current.forEach(n => {
      if (n.x !== undefined) posCache.set(n.id, { x: n.x, y: n.y!, vx: n.vx!, vy: n.vy! });
    });

    // 1. SUNS
    const allPaths = new Set<string>();
    notes.forEach(n => {
        const p = n.title.split("/");
        if (p.length > 1) allPaths.add(p.slice(0, -1).join("/"));
    });
    folders.forEach(f => allPaths.add(f));

    Array.from(allPaths).forEach(path => {
      const parts = path.split("/");
      let currentPath = "";
      parts.forEach((part, i) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!folderNodesMap.has(currentPath)) {
          const isRoot = i === 0;
          const id = `folder:${currentPath}`;
          const cached = posCache.get(id);
          const folderNode: Node = {
            id,
            title: part,
            content: `SUN:[${currentPath}]`,
            size: isRoot ? 35 : 22,
            color: palette[folderNodesMap.size % palette.length],
            isFolder: true,
            isRootSun: isRoot,
            x: cached?.x ?? (Math.random() - 0.5) * 600,
            y: cached?.y ?? (Math.random() - 0.5) * 600,
            vx: cached?.vx ?? 0,
            vy: cached?.vy ?? 0,
          };
          folderNodesMap.set(currentPath, folderNode);
          nodes.push(folderNode);
          nodesById.set(folderNode.id, folderNode);
        }
      });
    });

    // 2. PLANETS
    const processedNotes: Node[] = [];
    notes.forEach((note) => {
      const parts = note.title.split("/");
      const fileName = parts[parts.length - 1] || "Untitled";
      const parentPath = parts.length > 1 ? parts.slice(0, -1).join("/") : null;
      const parentSun = parentPath ? folderNodesMap.get(parentPath) : null;
      
      const cached = posCache.get(note.id);
      const noteNode: Node = {
        id: note.id,
        title: fileName,
        content: note.content || "",
        size: 10,
        color: parentSun ? parentSun.color : themeColors.muted,
        parentFolderId: parentSun ? parentSun.id : undefined,
        isRoguePlanet: !parentSun,
        x: cached?.x ?? (Math.random() - 0.5) * 800,
        y: cached?.y ?? (Math.random() - 0.5) * 800,
        vx: cached?.vx ?? 0,
        vy: cached?.vy ?? 0,
      };
      nodes.push(noteNode);
      processedNotes.push(noteNode);
      nodesById.set(noteNode.id, noteNode);
      
      const titleLower = fileName.toLowerCase();
      if (!nodesByTitleMap.has(titleLower)) nodesByTitleMap.set(titleLower, []);
      nodesByTitleMap.get(titleLower)!.push(noteNode);

      if (parentSun) {
        links.push({ source: note.id, target: parentSun.id, isHierarchy: true });
      }
    });

    // 3. Hierarchy
    folderNodesMap.forEach((node, path) => {
      const parts = path.split("/");
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join("/");
        const parentSun = folderNodesMap.get(parentPath);
        if (parentSun) {
          node.parentFolderId = parentSun.id;
          links.push({ source: node.id, target: parentSun.id, isHierarchy: true });
        }
      }
    });

    // 4. ROBUST NEURAL LINKS
    const ghostNodesMap = new Map<string, Node>();
    const connectedPairs = new Set<string>();
    
    processedNotes.forEach(sourceNode => {
      // Support [[Target|Alias]]
      const wikiLinks = sourceNode.content?.match(/\[\[(.*?)\]\]/g) || [];
      const targets = wikiLinks.map(l => {
        const content = l.slice(2, -2).trim();
        return content.includes('|') ? content.split('|')[0].trim() : content;
      });
      const uniqueTargets = new Set(targets);

      uniqueTargets.forEach(targetTitle => {
        if (!targetTitle) return;
        const targetTitleLower = targetTitle.toLowerCase();
        let targetNode: Node | undefined;
        
        // Resolution Logic
        const matchingNotes = nodes.filter(n => !n.isFolder && !n.isGhost && (
            n.title.toLowerCase() === targetTitleLower || // Exact filename match
            n.id.toLowerCase() === targetTitleLower || // ID match
            (n.parentFolderId && `${n.parentFolderId.replace('folder:', '')}/${n.title}`.toLowerCase() === targetTitleLower) // Full path match
        ));

        if (matchingNotes.length > 0) {
            // Priority: Same folder
            targetNode = matchingNotes.find(n => n.parentFolderId === sourceNode.parentFolderId);
            // Fallback: First match
            if (!targetNode) targetNode = matchingNotes[0];
        }

        // Priority 2: Match a folder/sun directly
        if (!targetNode) {
            const cleanSunTitle = targetTitle.endsWith('/') ? targetTitle.slice(0, -1) : targetTitle;
            const cleanSunLower = cleanSunTitle.toLowerCase();
            targetNode = nodes.find(n => n.isFolder && (n.title.toLowerCase() === cleanSunLower || n.id.replace('folder:', '').toLowerCase() === cleanSunLower));
        }
        
        // Priority 3: Ghost Planet
        if (!targetNode) {
          const ghostId = `ghost-${targetTitleLower}`;
          targetNode = ghostNodesMap.get(ghostId);
          if (!targetNode) {
            const cached = posCache.get(ghostId);
            targetNode = {
              id: ghostId, title: targetTitle, content: "", size: 6,
              color: themeColors.muted, isGhost: true,
              isRoguePlanet: true,
              x: cached?.x ?? (Math.random() - 0.5) * 1000, 
              y: cached?.y ?? (Math.random() - 0.5) * 1000,
              vx: cached?.vx ?? 0,
              vy: cached?.vy ?? 0,
            };
            ghostNodesMap.set(ghostId, targetNode);
          }
        }

        if (targetNode && targetNode.id !== sourceNode.id) {
          const pairId = [sourceNode.id, targetNode.id].sort().join("-");
          if (!connectedPairs.has(pairId)) {
            links.push({ source: sourceNode.id, target: targetNode.id });
            connectedPairs.add(pairId);
          }
        }
      });
    });

    const finalNodes = [...nodes, ...Array.from(ghostNodesMap.values())];
    currentNodesRef.current = finalNodes;
    return { initialNodes: finalNodes, initialLinks: links };
  }, [notes, folders, themeColors]);

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
        
        // Dynamic stars/noise
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

    const nodesById = new Map(initialNodes.map(n => [n.id, n]));
    const visibleLinks = initialLinks.filter(l => !l.isHierarchy);
    const hierarchyLinks = initialLinks.filter(l => l.isHierarchy);

    const simulation = d3.forceSimulation<Node>(initialNodes)
      .alphaDecay(0.05)
      .force("link", d3.forceLink<Node, Link>(visibleLinks).id(d => d.id).distance(80).strength(0.3))
      .force("charge", d3.forceManyBody().strength((d) => (d as Node).isFolder ? -600 : (d as Node).isRoguePlanet ? -150 : -80))
      .force("center", d3.forceCenter(0, 0).strength(0.02))
      .force("collide", d3.forceCollide<Node>().radius(d => (d.isFolder ? 50 : d.isRoguePlanet ? 25 : 12)))
      .force("orbit", (alpha) => {
        hierarchyLinks.forEach(link => {
          const s = nodesById.get(typeof link.source === 'string' ? link.source : (link.source as any).id);
          const t = nodesById.get(typeof link.target === 'string' ? link.target : (link.target as any).id);
          if (!s || !t) return;
          const dx = s.x! - t.x!; const dy = s.y! - t.y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const orbitDist = s.isFolder ? FOLDER_ORBIT_RADIUS : ORBIT_RADIUS;
          const delta = orbitDist - dist;
          s.vx! += (dx / dist) * delta * 0.5 * alpha;
          s.vy! += (dy / dist) * delta * 0.4 * alpha;
        });
      })
      .on("tick", () => requestRender());

    simulationRef.current = simulation;
    // Lower pre-tick to avoid blocking the main thread
    for (let i = 0; i < 30; i++) simulation.tick();
    if (isPausedRef.current) simulation.stop();

    let animationFrame: number;

    const render = () => {
      if (!needsRedrawRef.current && !isInteractingRef.current) {
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
      
      // If theme recently changed, redraw the background color to avoid flickering old theme color
      ctx.fillStyle = themeColors.background;
      ctx.globalAlpha = 0.8; // Blend with offscreen for stars
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;

      ctx.save();
      ctx.translate(width / 2 + x, height / 2 + y);
      ctx.scale(k, k);

      const curHoverId = hoveredNodeRef.current;
      const nodeToSys = new Map(initialNodes.map(n => [n.id, n.parentFolderId]));

      // 1. Neural Links (Neural Bridges)
      visibleLinks.forEach(link => {
        const s = link.source as Node; const t = link.target as Node;
        if (!s.x || !t.x) return;
        const isHovered = curHoverId === s.id || curHoverId === t.id;
        const sSys = nodeToSys.get(s.id); const tSys = nodeToSys.get(t.id);
        const isInterSystem = sSys !== tSys;
        
        const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
        const sourceColor = s.color || themeColors.primary;
        const targetColor = t.color || themeColors.primary;
        
        if (isInterSystem) {
          grad.addColorStop(0, sourceColor + (isHovered ? "ff" : "99"));
          grad.addColorStop(1, targetColor + (isHovered ? "ff" : "44"));
        } else {
          grad.addColorStop(0, (s.color || themeColors.foreground) + (isHovered ? "aa" : "22"));
          grad.addColorStop(1, (t.color || themeColors.foreground) + (isHovered ? "aa" : "11"));
        }

        ctx.beginPath();
        ctx.strokeStyle = grad;
        
        if (isInterSystem) {
          if (isHovered) {
            ctx.shadowBlur = 15 / k;
            ctx.shadowColor = sourceColor;
          }
          ctx.lineWidth = (isHovered ? 3.0 : 1.2) / k;
        } else {
          ctx.lineWidth = 1.0 / k;
        }
        
        ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
        ctx.stroke();
        if (isHovered) ctx.shadowBlur = 0;

        // Animated Data Packets for Inter-System Links
        if (isInterSystem) {
          const speed = 0.0015;
          const time = (simTime * speed) % 1;
          const px = s.x + (t.x - s.x) * time;
          const py = s.y + (t.y - s.y) * time;
          
          ctx.beginPath();
          ctx.fillStyle = sourceColor;
          ctx.arc(px, py, (isHovered ? 3 : 1.5) / k, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Solar Nodes
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
      
      // 3. Ambient Effects
      ctx.restore();
      
      // Scanline Effect
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
      simulation.stop();
    };
  }, [isOpen, initialNodes, initialLinks, theme]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width / 2 - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - rect.top - rect.height / 2 - transformRef.current.y) / transformRef.current.k;

    let found: Node | null = null;
    for (const node of initialNodes) {
      const dx = node.x! - mx; const dy = node.y! - my;
      const hitRadius = node.size * 2.2;
      if (dx * dx + dy * dy < hitRadius * hitRadius) { found = node; break; }
    }

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
  }, [initialNodes, requestRender]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (hoveredNodeRef.current) {
      const node = initialNodes.find(n => n.id === hoveredNodeRef.current);
      if (node) {
        const startX = e.clientX, startY = e.clientY;
        let hasMoved = false;
        const nodeStartX = node.x!, nodeStartY = node.y!;

        const onMove = (moveEvent: MouseEvent) => {
            mousePosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
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
                    const targetLink = node.isFolder ? targetLabel : node.id;
                    const wikiLink = node.isFolder ? `[[${targetLabel}]]` : `[[${targetLink}|${targetLabel}]]`;
                    
                    const currentContent = sourceNote.content || "";
                    const newContent = currentContent.endsWith('\n') ? 
                      `${currentContent}\n${wikiLink}` : 
                      `${currentContent}\n\n${wikiLink}`;
                    
                    onUpdateNote(sourceNote.id, { content: newContent });
                    
                    window.dispatchEvent(new CustomEvent('abyssal-log', { 
                      detail: { message: `LINK_ESTABLISHED: [[${sourceNote.title}]] -> [[${targetLabel}]]`, type: 'success' } 
                    }));
                  }
                }
                setLinkSource(null); setIsLinkMode(false);
            } else if (isLinkMode && !linkSource && !node.isGhost && !node.isFolder) {
                setLinkSource(node);
                window.dispatchEvent(new CustomEvent('abyssal-log', { 
                  detail: { message: `SOURCE_LOCKED: [[${node.title}]]`, type: 'system' } 
                }));
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
      mousePosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      transformRef.current = { ...initialTransform, x: initialTransform.x + (moveEvent.clientX - startX), y: initialTransform.y + (moveEvent.clientY - startY) };
      requestRender();
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  }, [initialNodes, onSelectNote, isLinkMode, linkSource, notes, onUpdateNote, requestRender]);

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
