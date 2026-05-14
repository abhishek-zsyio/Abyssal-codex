"use client";

import { useMemo, useRef, useEffect, useState } from "react";
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
  const workerRef = useRef<Worker | null>(null);
  const currentNodesRef = useRef<GraphNode[]>([]);
  const linkCacheRef = useRef<Map<string, { content: string, links: string[] }>>(new Map());

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
        const wikiLinks = sourceNode.content?.match(/§\{(.*?)\}/g) || [];
        targets = wikiLinks.map(l => {
          const content = l.slice(2, -1).trim();
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

    // Initialize worker
    const worker = new Worker(
      new URL("../lib/workers/graph.worker.ts", import.meta.url)
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data.type === "TICK") {
        const updatedPositions = e.data.nodes;
        const nodeMap = new Map(updatedPositions.map((n: any) => [n.id, n]));
        
        initialNodes.forEach(node => {
          const updated = nodeMap.get(node.id);
          if (updated) {
            node.x = updated.x;
            node.y = updated.y;
            node.vx = updated.vx;
            node.vy = updated.vy;
          }
        });
        onRequestRender();
      }
    };

    worker.postMessage({ 
      type: "INIT", 
      payload: { nodes: initialNodes, links: initialLinks } 
    });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [isOpen, initialNodes, initialLinks, onRequestRender]);

  useEffect(() => {
    if (isPaused) {
      workerRef.current?.postMessage({ type: "PAUSE" });
    } else {
      workerRef.current?.postMessage({ type: "RESUME" });
    }
  }, [isPaused]);

  // Helper to update node in worker (for dragging)
  const updateNodeInWorker = (id: string, fx: number | null, fy: number | null) => {
    workerRef.current?.postMessage({
      type: "UPDATE_NODES",
      payload: { nodes: [{ id, fx, fy }] }
    });
  };

  return { 
    initialNodes, 
    initialLinks, 
    updateNodeInWorker 
  };
};
