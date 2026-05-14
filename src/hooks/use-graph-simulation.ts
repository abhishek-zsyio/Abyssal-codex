"use client";

import { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3-force";
import { Note } from "@/types/note";
import { GraphNode, GraphLink, GraphThemeColors } from "@/types/graph";

interface UseGraphSimulationProps {
  notes: Note[];
  folders: string[];
  themeColors: GraphThemeColors;
  isOpen: boolean;
  isPaused: boolean;
  onRequestRender: () => void;
}

export const useGraphSimulation = ({
  notes,
  folders,
  themeColors,
  isOpen,
  isPaused,
  onRequestRender,
}: UseGraphSimulationProps) => {
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const currentNodesRef = useRef<GraphNode[]>([]);
  const linkCacheRef = useRef<Map<string, { content: string, links: string[] }>>(new Map());

  const ORBIT_RADIUS = 70;
  const FOLDER_ORBIT_RADIUS = 150;

  const { initialNodes, initialLinks } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const folderNodesMap = new Map<string, GraphNode>();
    const palette = [
      themeColors.primary,
      themeColors.accent,
      themeColors.destructive,
      themeColors.foreground,
      themeColors.muted,
      themeColors.secondary !== themeColors.background ? themeColors.secondary : themeColors.accent,
    ];

    const posCache = new Map<string, { x: number, y: number, vx: number, vy: number }>();
    currentNodesRef.current.forEach(n => {
      if (n.x !== undefined) posCache.set(n.id, { x: n.x, y: n.y!, vx: n.vx!, vy: n.vy! });
    });

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
          const folderNode: GraphNode = {
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
        }
      });
    });

    const processedNotes: GraphNode[] = [];
    notes.forEach((note) => {
      const parts = note.title.split("/");
      const fileName = parts[parts.length - 1] || "Untitled";
      const parentPath = parts.length > 1 ? parts.slice(0, -1).join("/") : null;
      const parentSun = parentPath ? folderNodesMap.get(parentPath) : null;
      
      const cached = posCache.get(note.id);
      const noteNode: GraphNode = {
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
      
      if (parentSun) {
        links.push({ source: note.id, target: parentSun.id, isHierarchy: true });
      }
    });

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

    const ghostNodesMap = new Map<string, GraphNode>();
    const connectedPairs = new Set<string>();
    
    processedNotes.forEach(sourceNode => {
      let targets: string[] = [];
      const cached = linkCacheRef.current.get(sourceNode.id);
      
      if (cached && cached.content === sourceNode.content) {
        targets = cached.links;
      } else {
        const wikiLinks = sourceNode.content?.match(/\[\[(.*?)\]\]/g) || [];
        targets = wikiLinks.map(l => {
          const content = l.slice(2, -2).trim();
          return content.includes('|') ? content.split('|')[0].trim() : content;
        });
        linkCacheRef.current.set(sourceNode.id, { content: sourceNode.content, links: targets });
      }
      
      const uniqueTargets = new Set(targets);

      uniqueTargets.forEach(targetTitle => {
        if (!targetTitle) return;
        const targetTitleLower = targetTitle.toLowerCase();
        let targetNode: GraphNode | undefined;
        
        const matchingNotes = nodes.filter(n => !n.isFolder && !n.isGhost && (
            n.title.toLowerCase() === targetTitleLower || 
            n.id.toLowerCase() === targetTitleLower || 
            (n.parentFolderId && `${n.parentFolderId.replace('folder:', '')}/${n.title}`.toLowerCase() === targetTitleLower)
        ));

        if (matchingNotes.length > 0) {
            targetNode = matchingNotes.find(n => n.parentFolderId === sourceNode.parentFolderId);
            if (!targetNode) targetNode = matchingNotes[0];
        }

        if (!targetNode) {
            const cleanSunTitle = targetTitle.endsWith('/') ? targetTitle.slice(0, -1) : targetTitle;
            const cleanSunLower = cleanSunTitle.toLowerCase();
            targetNode = nodes.find(n => n.isFolder && (n.title.toLowerCase() === cleanSunLower || n.id.replace('folder:', '').toLowerCase() === cleanSunLower));
        }
        
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
    if (!isOpen) return;

    const nodesById = new Map(initialNodes.map(n => [n.id, n]));
    const visibleLinks = initialLinks.filter(l => !l.isHierarchy);
    const hierarchyLinks = initialLinks.filter(l => l.isHierarchy);

    const simulation = d3.forceSimulation<GraphNode>(initialNodes)
      .alphaDecay(0.08)
      .force("link", d3.forceLink<GraphNode, GraphLink>(visibleLinks).id(d => d.id).distance(80).strength(0.3))
      .force("charge", d3.forceManyBody().strength((d) => (d as GraphNode).isFolder ? -600 : (d as GraphNode).isRoguePlanet ? -150 : -80))
      .force("center", d3.forceCenter(0, 0).strength(0.02))
      .force("collide", d3.forceCollide<GraphNode>().radius(d => (d.isFolder ? 50 : d.isRoguePlanet ? 25 : 12)))
      .force("orbit", (alpha) => {
        hierarchyLinks.forEach(link => {
          const s = nodesById.get(typeof link.source === 'string' ? link.source : (link.source as GraphNode).id);
          const t = nodesById.get(typeof link.target === 'string' ? link.target : (link.target as GraphNode).id);
          if (!s || !t) return;
          const dx = s.x! - t.x!; const dy = s.y! - t.y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const orbitDist = s.isFolder ? FOLDER_ORBIT_RADIUS : ORBIT_RADIUS;
          const delta = orbitDist - dist;
          s.vx! += (dx / dist) * delta * 0.5 * alpha;
          s.vy! += (dy / dist) * delta * 0.4 * alpha;
        });
      })
      .on("tick", onRequestRender);

    simulationRef.current = simulation;
    for (let i = 0; i < 30; i++) simulation.tick();
    if (isPaused) simulation.stop();

    return () => {
      simulation.stop();
    };
  }, [isOpen, initialNodes, initialLinks, isPaused, onRequestRender]);

  return { simulationRef, initialNodes, initialLinks };
};
