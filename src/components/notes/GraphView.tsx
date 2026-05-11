"use client";

import { useEffect, useRef, useState, useMemo, useCallback, useDeferredValue } from "react";
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
  const isDraggingNodeRef = useRef<boolean>(false);
  
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHUD, setShowHUD] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<Node | null>(null);
  
  const searchQueryRef = useRef("");
  const isPausedRef = useRef(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const needsRedrawRef = useRef<boolean>(true);
  const isInteractingRef = useRef<boolean>(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nodeTexturesRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const requestRender = useCallback(() => {
    needsRedrawRef.current = true;
  }, []);

  const [activeHoveredNode, setActiveHoveredNode] = useState<Node | null>(null);

  const ORBIT_RADIUS = 120; // Reduced for tighter grouping

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Pre-render node textures
  useEffect(() => {
    const palette = ["#fabd2f", "#b8bb26", "#83a598", "#d3869b", "#fe8019", "#8ec07c", "#fb4934", "#928374", "#ebdbb2"];
    const textures = new Map<string, HTMLCanvasElement>();
    
    palette.forEach(color => {
      // 1. Regular Note Texture
      const noteCanvas = document.createElement("canvas");
      noteCanvas.width = 64; noteCanvas.height = 64;
      const ctx = noteCanvas.getContext("2d");
      if (ctx) {
        ctx.beginPath(); ctx.arc(32, 32, 12, 0, Math.PI * 2);
        ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(32, 32, 8, 0, Math.PI * 2); ctx.fill();
      }
      textures.set(`note:${color}`, noteCanvas);

      // 2. Folder Texture
      const folderCanvas = document.createElement("canvas");
      folderCanvas.width = 128; folderCanvas.height = 128;
      const fctx = folderCanvas.getContext("2d");
      if (fctx) {
        fctx.beginPath(); fctx.arc(64, 64, 32, 0, Math.PI * 2);
        fctx.strokeStyle = color; fctx.lineWidth = 6; fctx.stroke();
        fctx.fillStyle = color + "22"; fctx.fill();
      }
      textures.set(`folder:${color}`, folderCanvas);
    });
    nodeTexturesRef.current = textures;
  }, []);

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

  const { initialNodes, initialLinks } = useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const connectedPairs = new Set<string>();
    const folderNodesMap = new Map<string, Node>();
    
    const palette = [
      "#fabd2f", "#b8bb26", "#83a598", "#d3869b", "#fe8019", "#8ec07c", "#fb4934"
    ];

    // 1. Hubs from Notes AND Folders
    const allPaths = new Set([
        ...notes.map(n => {
            const p = n.title.split("/");
            return p.length > 1 ? p.slice(0, -1).join("/") : null;
        }).filter(Boolean),
        ...folders
    ]);

    allPaths.forEach((path: any) => {
      const parts = path.split("/");
      let currentPath = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!folderNodesMap.has(currentPath)) {
          const folderNode: Node = {
            id: `folder:${currentPath}`,
            title: part,
            content: `Gravity_Hub: [${currentPath}]`,
            size: 22,
            color: palette[folderNodesMap.size % palette.length],
            isFolder: true,
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
          };
          folderNodesMap.set(currentPath, folderNode);
          nodes.push(folderNode);
        }
      }
    });

    // 2. Satellites
    notes.forEach((note) => {
      const parts = note.title.split("/");
      const fileName = parts[parts.length - 1];
      const parentPath = parts.length > 1 ? parts.slice(0, -1).join("/") : null;
      const parentFolder = parentPath ? folderNodesMap.get(parentPath) : null;
      
      const noteNode: Node = {
        id: note.id,
        title: fileName || "Untitled",
        content: note.content || "",
        size: 9,
        color: parentFolder ? parentFolder.color : themeColors.current.primary,
        parentFolderId: parentFolder ? parentFolder.id : undefined,
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 500,
      };
      nodes.push(noteNode);

      if (parentFolder) {
        links.push({ source: note.id, target: parentFolder.id, isHierarchy: true });
      }
    });

    // 3. Folder Parents
    folderNodesMap.forEach((node, path) => {
      const parts = path.split("/");
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join("/");
        const parentFolder = folderNodesMap.get(parentPath);
        if (parentFolder) {
          node.parentFolderId = parentFolder.id;
          links.push({ source: node.id, target: parentFolder.id, isHierarchy: true });
        }
      }
    });

    // 4. WikiLinks (Neural Connections)
    const ghostNodesMap = new Map<string, Node>();
    notes.forEach(sourceNote => {
      const wikiLinks = sourceNote.content?.match(/\[\[(.*?)\]\]/g) || [];
      const uniqueTargets = new Set(wikiLinks.map(l => l.slice(2, -2).trim()));

      uniqueTargets.forEach(targetTitle => {
        if (!targetTitle) return;
        
        const sourceParts = sourceNote.title.split("/");
        const sourceDir = sourceParts.slice(0, -1).join("/");
        
        // 1. Try to find a NOTE in the same directory
        let targetNode = nodes.find(n => {
            if (n.isFolder) return false;
            const nParts = notes.find(note => note.id === n.id)?.title.split("/") || [];
            const nDir = nParts.slice(0, -1).join("/");
            return n.title.toLowerCase() === targetTitle.toLowerCase() && nDir === sourceDir;
        });

        // 2. Try to find a NOTE globally
        if (!targetNode) {
            targetNode = nodes.find(n => !n.isFolder && n.title.toLowerCase() === targetTitle.toLowerCase());
        }

        // 3. Try to find a FOLDER globally (matching title or path with trailing slash)
        if (!targetNode) {
            const isFolderPath = targetTitle.endsWith('/');
            const cleanTitle = isFolderPath ? targetTitle.slice(0, -1) : targetTitle;
            targetNode = nodes.find(n => n.isFolder && (n.title.toLowerCase() === cleanTitle.toLowerCase() || n.id.replace('folder:', '').toLowerCase() === cleanTitle.toLowerCase()));
        }
        
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
              x: (Math.random() - 0.5) * 1000,
              y: (Math.random() - 0.5) * 1000,
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

    // 5. Identify Nexus Nodes (Cross-Solar connections)
    nodes.forEach(node => {
        if (node.isFolder || node.isGhost) return;
        const mySystem = node.parentFolderId;
        const linkedSystems = new Set<string>();
        
        links.forEach(l => {
            if (l.isHierarchy) return;
            const sId = typeof l.source === 'string' ? l.source : (l.source as any).id;
            const tId = typeof l.target === 'string' ? l.target : (l.target as any).id;
            
            if (sId === node.id || tId === node.id) {
                const otherId = sId === node.id ? tId : sId;
                const otherNode = nodes.find(n => n.id === otherId);
                if (otherNode && otherNode.parentFolderId && otherNode.parentFolderId !== mySystem) {
                    linkedSystems.add(otherNode.parentFolderId);
                }
            }
        });
        
        if (linkedSystems.size > 0) {
            node.isNexus = true;
        }
    });

    return { 
      initialNodes: [...nodes, ...Array.from(ghostNodesMap.values())], 
      initialLinks: links 
    };
  }, [notes, themeColors.current]);

  const mousePosRef = useRef({ x: 0, y: 0 });

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
        requestRender();
      }
    };
    container.addEventListener('wheel', handleBrowserZoom, { passive: false });

    // Offscreen Canvas for static background elements
    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");
    
    const setupOffscreen = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      offscreenCanvas.width = rect.width * dpr;
      offscreenCanvas.height = rect.height * dpr;
      if (offscreenCtx) {
        offscreenCtx.scale(dpr, dpr);
        
        // Generate stars
        const stars = Array.from({ length: 150 }, () => ({
          x: (Math.random() - 0.5) * 4000,
          y: (Math.random() - 0.5) * 4000,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.1
        }));

        offscreenCtx.fillStyle = themeColors.current.background;
        offscreenCtx.fillRect(0, 0, rect.width, rect.height);
        
        stars.forEach(star => {
          offscreenCtx.beginPath();
          offscreenCtx.arc(star.x + rect.width/2, star.y + rect.height/2, star.size, 0, Math.PI * 2);
          offscreenCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          offscreenCtx.fill();
        });
      }
    };
    setupOffscreen();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0); // Cap DPR for performance
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      setupOffscreen();
      requestRender();
    };
    resize();
    window.addEventListener("resize", resize);

    const isHighNodeCount = initialNodes.length > 80;
    const visibleLinks = initialLinks.filter(l => !l.isHierarchy);
    const hierarchyLinks = initialLinks.filter(l => l.isHierarchy);
    const nodesById = new Map(initialNodes.map(n => [n.id, n]));

    const simulation = d3.forceSimulation<Node>(initialNodes)
      .force("link", d3.forceLink<Node, Link>(visibleLinks).id(d => d.id).distance(120).strength(0.5))
      .force("charge", d3.forceManyBody().strength((d) => (d as Node).isFolder ? (isHighNodeCount ? -3000 : -1800) : -350)) 
      .force("x", d3.forceX(0).strength(0.08))
      .force("y", d3.forceY(0).strength(0.08))
      .force("collision", d3.forceCollide<Node>().radius(d => d.isFolder ? 100 : 30))
      .force("orbit", (alpha) => {
        hierarchyLinks.forEach(link => {
          const s = nodesById.get(typeof link.source === 'string' ? link.source : (link.source as any).id);
          const t = nodesById.get(typeof link.target === 'string' ? link.target : (link.target as any).id);
          if (!s || !t) return;
          const dx = s.x! - t.x!;
          const dy = s.y! - t.y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const delta = ORBIT_RADIUS - dist;
          const strength = 2.0 * alpha;
          s.vx! += (dx / dist) * delta * strength;
          s.vy! += (dy / dist) * delta * strength;
        });
      })
      .alphaDecay(isHighNodeCount ? 0.07 : 0.05);

    simulationRef.current = simulation;

    // Zero Animation: Run simulation synchronously to settle instantly
    for (let i = 0; i < 300; i++) simulation.tick();
    simulation.stop();

    let animationFrame: number;
    let time = 0;

    const markInteraction = () => {
      isInteractingRef.current = true;
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false;
        requestRender();
      }, 100);
      requestRender();
    };

    const render = () => {
      const { x, y, k } = transformRef.current;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // 0. Static Background
      ctx.drawImage(offscreenCanvas, 0, 0, width, height);
      
      ctx.save();
      ctx.translate(width / 2 + x, height / 2 + y);
      ctx.scale(k, k);

      const currentHoverId = hoveredNodeRef.current;
      const hoveredNodeObj = initialNodes.find(n => n.id === currentHoverId);
      
      const isInteracting = isInteractingRef.current;
      const isZoomedOut = k < 0.4;
      const isExtremeZoomOut = k < 0.15;

      // 1. Orbit Lines & Hub Visuals
      initialNodes.forEach(node => {
        if (!node.isFolder) return;
        const isSolarHovered = currentHoverId === node.id || (hoveredNodeObj?.parentFolderId === node.id);
        
        // Orbit Path
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, ORBIT_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = node.color + (isSolarHovered ? "44" : "08");
        ctx.lineWidth = (isSolarHovered ? 1.5 : 0.8) / k;
        if (!isSolarHovered) ctx.setLineDash([5 / k, 15 / k]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Corona Effect (Disabled during interaction)
        if (!isInteracting) {
          const coronaGrad = ctx.createRadialGradient(node.x!, node.y!, node.size, node.x!, node.y!, node.size * 4);
          coronaGrad.addColorStop(0, node.color + (isSolarHovered ? "22" : "11"));
          coronaGrad.addColorStop(1, "transparent");
          ctx.fillStyle = coronaGrad;
          ctx.beginPath(); ctx.arc(node.x!, node.y!, node.size * 4, 0, Math.PI * 2); ctx.fill();
        }

        // Rotating Tech Ring
        if (isSolarHovered) {
          ctx.save();
          ctx.translate(node.x!, node.y!);
          ctx.rotate(0); // Static Ring
          ctx.beginPath();
          ctx.arc(0, 0, node.size + 8, 0, Math.PI * 0.4);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 2 / k;
          ctx.stroke();
          ctx.rotate(Math.PI);
          ctx.beginPath();
          ctx.arc(0, 0, node.size + 8, 0, Math.PI * 0.4);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 2. WikiLinks (Neural Bridges)
      visibleLinks.forEach((link, i) => {
        const source = link.source as Node;
        const target = link.target as Node;
        if (!source.id || !target.id) return; // Skip if not resolved yet

        const isHoveredLink = currentHoverId === source.id || currentHoverId === target.id;
        const isGhostLink = source.isGhost || target.isGhost;
        
        ctx.beginPath();
        if (source.parentFolderId !== target.parentFolderId && !isGhostLink) {
            // Cross-Solar Link (Different clusters or Root-to-Cluster)
            const grad = ctx.createLinearGradient(source.x!, source.y!, target.x!, target.y!);
            const sColor = source.color || themeColors.current.primary;
            const tColor = target.color || themeColors.current.primary;
            grad.addColorStop(0, sColor + (isHoveredLink ? "AA" : "44"));
            grad.addColorStop(1, tColor + (isHoveredLink ? "AA" : "44"));
            ctx.strokeStyle = grad;
            ctx.lineWidth = (isHoveredLink ? 2.5 : 1.2) / k;
        } else if (isGhostLink) {
            // Link to the "Outer Space" (Ghost Nodes)
            const grad = ctx.createLinearGradient(source.x!, source.y!, target.x!, target.y!);
            const noteNode = source.isGhost ? target : source;
            const noteColor = noteNode.color || themeColors.current.primary;
            grad.addColorStop(source.isGhost ? 1 : 0, noteColor + (isHoveredLink ? "88" : "33"));
            grad.addColorStop(source.isGhost ? 0 : 1, themeColors.current.muted + (isHoveredLink ? "55" : "22"));
            ctx.strokeStyle = grad;
            ctx.lineWidth = (isHoveredLink ? 1.5 : 1.0) / k;
            ctx.setLineDash([5 / k, 5 / k]); 
        } else {
            // Standard Intra-Solar or sibling link (Same cluster)
            ctx.strokeStyle = (source.color || themeColors.current.foreground) + (isHoveredLink ? "44" : "11");
            ctx.lineWidth = (isHoveredLink ? 1.5 : 0.8) / k;
        }
        
        ctx.moveTo(source.x!, source.y!);
        ctx.lineTo(target.x!, target.y!);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Spectral Flow / Data Packets (Optimized: LOD based)
        if (!isPausedRef.current && !isExtremeZoomOut) {
          const flowCount = isHoveredLink ? 2 : (isHighNodeCount ? 0 : 1); 
          if (flowCount > 0) {
            const flowPos = (0.3 + (i % 3) * 0.1 + i * 0.2) % 1; // Static flow
            const px = source.x! + (target.x! - source.x!) * flowPos;
            const py = source.y! + (target.y! - source.y!) * flowPos;
            ctx.beginPath();
            ctx.arc(px, py, (isHoveredLink ? 3 : 2) / k, 0, Math.PI * 2);
            ctx.fillStyle = flowPos < 0.5 ? (source.color || themeColors.current.muted) : (target.color || themeColors.current.muted);
            ctx.globalAlpha = isHoveredLink ? 0.9 : 0.4;
            ctx.fill();
          }
        }
      });

      // 3. Link Mode Tether
      if (linkSource && !isPausedRef.current) {
        const mx = (mousePosRef.current.x - width / 2 - x) / k;
        const my = (mousePosRef.current.y - height / 2 - y) / k;
        ctx.beginPath();
        ctx.setLineDash([5 / k, 5 / k]);
        ctx.moveTo(linkSource.x!, linkSource.y!);
        ctx.lineTo(mx, my);
        ctx.strokeStyle = themeColors.current.primary + "88";
        ctx.lineWidth = 2 / k;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Target Snapping Preview
        if (hoveredNodeObj && !hoveredNodeObj.isFolder && hoveredNodeObj.id !== linkSource.id) {
          ctx.beginPath();
          ctx.arc(hoveredNodeObj.x!, hoveredNodeObj.y!, hoveredNodeObj.size + 10, 0, Math.PI * 2);
          ctx.strokeStyle = themeColors.current.primary;
          ctx.stroke();
        }
      }

      // 4. Nodes
      const connectedToHovered = new Set<string>();
      if (currentHoverId) {
        visibleLinks.forEach(l => {
          const s = l.source as Node;
          const t = l.target as Node;
          if (s.id === currentHoverId) connectedToHovered.add(t.id);
          if (t.id === currentHoverId) connectedToHovered.add(s.id);
        });
      }

      initialNodes.forEach(node => {
        const isHovered = currentHoverId === node.id;
        const isConnected = connectedToHovered.has(node.id);
        const isMutualSolar = (hoveredNodeObj?.parentFolderId === node.id) || (node.parentFolderId === currentHoverId) || (hoveredNodeObj?.parentFolderId && node.parentFolderId === hoveredNodeObj.parentFolderId);
        const matchesSearch = searchQueryRef.current && node.title.toLowerCase().includes(searchQueryRef.current.toLowerCase());
        const isFolderNode = node.isFolder;
        const isNexus = node.isNexus;
        const isLinkSrc = linkSource?.id === node.id;
        
        let opacity = currentHoverId ? (isHovered || isConnected || isMutualSolar || isLinkSrc ? 1 : 0.1) : 1;
        if (searchQueryRef.current && !matchesSearch && !isHovered && !isConnected) opacity = 0.03;
        if (searchQueryRef.current && matchesSearch) opacity = 1;

        const size = node.size; // Static size (no hover scaling)
        ctx.globalAlpha = opacity;
        
        // Use pre-rendered texture atlas for maximum performance
        const textureKey = node.isFolder ? `folder:${node.color}` : `note:${node.isGhost ? themeColors.current.muted : (node.isNexus ? themeColors.current.primary : node.color)}`;
        const texture = nodeTexturesRef.current.get(textureKey);
        
        if (texture) {
          const tSize = node.isFolder ? 64 : 32;
          ctx.drawImage(texture, node.x! - tSize/2, node.y! - tSize/2, tSize, tSize);
        } else {
          // Fallback to vector if texture missing
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, node.size, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
        }

        // Labels (Disabled during heavy interaction)
        if (!isInteracting && (isHovered || matchesSearch || (isFolderNode && k > 0.6) || (isMutualSolar && k > 1.2)) && k > 0.3) {
          ctx.fillStyle = isFolderNode ? node.color : (isNexus ? themeColors.current.primary : themeColors.current.foreground);
          ctx.font = `${isFolderNode ? '900' : 'bold'} ${12 / k}px JetBrains Mono, monospace`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.fillText(node.title.toUpperCase(), node.x! + size + 12, node.y! + 4);
          ctx.shadowBlur = 0;
          
          if (isNexus) {
              ctx.font = `${8 / k}px JetBrains Mono, monospace`;
              ctx.fillStyle = themeColors.current.primary;
              ctx.fillText("BRIDGE_NODE_ACTIVE", node.x! + size + 12, node.y! + 16);
          }
        }
      });
      
      ctx.restore();

      // Screen Overlay (Static/Scanlines)
      if (showHUD) {
        ctx.save();
        ctx.globalAlpha = 0.02;
        ctx.fillStyle = "#fff";
        for (let i = 0; i < height; i += 4) {
          ctx.fillRect(0, i, width, 1);
        }
        ctx.restore();
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener('wheel', handleBrowserZoom);
      cancelAnimationFrame(animationFrame);
      simulation.stop();
    };
  }, [isOpen, initialNodes, initialLinks, theme, showHUD]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width / 2 - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - rect.top - rect.height / 2 - transformRef.current.y) / transformRef.current.k;

    let found: Node | null = null;
    for (const node of initialNodes) {
      const dx = node.x! - mx;
      const dy = node.y! - my;
      const hitRadius = node.isFolder ? node.size + 25 : node.size + 15;
      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
        found = node;
        break;
      }
    }

      const foundId = found?.id || null;
      if (foundId !== hoveredNodeRef.current) {
        hoveredNodeRef.current = foundId;
        setHoveredNode(found);
        requestRender();
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (found) {
        hoverTimerRef.current = setTimeout(() => {
          setActiveHoveredNode(found);
          requestRender();
        }, 250);
      } else {
        setActiveHoveredNode(null);
        requestRender();
      }
    }
  }, [initialNodes]);

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
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
            node.fx = nodeStartX + dx; node.fy = nodeStartY + dy;
            markInteraction();
            simulationRef.current?.alpha(0.3).restart();
          };

        const onUp = () => {
          if (!hasMoved) {
            if (isLinkMode) {
              if (!linkSource) {
                // Any existing element (File or Folder) can be a source
                if (!node.isGhost) {
                  setLinkSource(node);
                }
              } else if (linkSource.id !== node.id) {
                // Connect Source to Target
                if (onUpdateNote && !node.isGhost) {
                  // If source is a note, we can persist the link
                  const sourceNote = notes.find(n => n.id === linkSource.id);
                  if (sourceNote) {
                    // If target is a folder, link to its path with a trailing slash to disambiguate
                    const targetTitle = node.isFolder ? (node.id.replace('folder:', '') + '/') : node.title;
                    onUpdateNote(sourceNote.id, { content: (sourceNote.content || "") + `\n\n[[${targetTitle}]]` });
                  }
                }
                setLinkSource(null); 
                setIsLinkMode(false);
              } else {
                setLinkSource(null);
              }
            } else if (onSelectNote && !node.isFolder) {
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
    
    const startX = e.clientX, startY = e.clientY, initialTransform = { ...transformRef.current };
    const onMove = (moveEvent: MouseEvent) => {
      mousePosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      transformRef.current = { ...initialTransform, x: initialTransform.x + (moveEvent.clientX - startX), y: initialTransform.y + (moveEvent.clientY - startY) };
      markInteraction();
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  }, [initialNodes, onSelectNote, isLinkMode, linkSource, notes, onUpdateNote]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) return;
    const delta = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    transformRef.current.k = Math.min(Math.max(transformRef.current.k * delta, 0.05), 5);
    markInteraction();
  }, [requestRender]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {variant === "modal" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[400] bg-[var(--background)]/98 backdrop-blur-sm" />
          )}
          
          <div
            className={cn(
              "bg-[var(--background)] border border-[var(--border)] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]",
              variant === "modal" ? "fixed inset-4 md:inset-8 z-[401] rounded-2xl" : "relative w-full h-full border-none shadow-none z-0"
            )}
          >
            <GraphHeader 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLinkMode={isLinkMode}
              setIsLinkMode={setIsLinkMode}
              showHUD={showHUD}
              setShowHUD={setShowHUD}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              onZoomIn={() => transformRef.current.k *= 1.3}
              onZoomOut={() => transformRef.current.k /= 1.3}
              onReset={() => transformRef.current = { x: 0, y: 0, k: 0.8 }}
              onClose={onClose}
              variant={variant}
            />

            <div 
              ref={containerRef} 
              className="flex-1 relative cursor-default bg-[var(--background)] overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onWheel={handleWheel}
              style={{ touchAction: 'none' }}
            >
               <canvas ref={canvasRef} className="w-full h-full" style={{ willChange: 'transform' }} />

               <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-20 overflow-hidden pointer-events-none">
                  <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,4px_100%]" />
               </div>

               <GraphHUD 
                 isVisible={showHUD}
                 nodesCount={initialNodes.length}
                 linksCount={initialLinks.length}
                 isLinkMode={isLinkMode}
                 hasLinkSource={!!linkSource}
               />

               <GraphNodePreview node={activeHoveredNode} />
            </div>

            <div className="px-8 py-4 border-t border-[var(--border)] bg-[var(--background)] flex justify-between items-center text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.25em]">
               <div className="flex gap-12">
                  <div className="flex items-center gap-3">
                     <span className="text-[var(--primary)] opacity-70">SIGNAL_LATENCY:</span>
                     <span className="text-[var(--foreground)] tracking-normal">{(Math.random() * 0.05 + 0.01).toFixed(3)}ms</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[var(--primary)] opacity-70">THROUGHPUT:</span>
                     <span className="text-[var(--foreground)] tracking-normal">1.2 GB/s</span>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                     <motion.div 
                        // transition={{ duration: 2, repeat: Infinity }} // Disabled
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" 
                     />
                     <span className="text-[var(--foreground)]">NEXUS_LINK_STABLE</span>
                  </div>
                  <Hash size={14} className="opacity-50" />
                  <span className="text-[var(--foreground)] tracking-widest">0x{notes.length.toString(16).toUpperCase().padStart(4, '0')}</span>
               </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
