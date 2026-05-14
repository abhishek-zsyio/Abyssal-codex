import * as d3 from "d3-force";
import { GraphNode, GraphLink } from "@/types/graph";

let simulation: d3.Simulation<GraphNode, GraphLink> | null = null;
let nodes: GraphNode[] = [];
let links: GraphLink[] = [];

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "INIT": {
      nodes = payload.nodes;
      links = payload.links;

      const wikiLinks = links.filter(l => !l.isHierarchy);
      const hierarchyLinks = links.filter(l => l.isHierarchy);
      const nodesById = new Map(nodes.map(n => [n.id, n]));

      simulation = d3.forceSimulation<GraphNode>(nodes)
        .alphaDecay(0.04)
        .velocityDecay(0.55)
        // Wiki/reference links — loose spring
        .force("link", d3.forceLink<GraphNode, GraphLink>(wikiLinks)
          .id(d => d.id)
          .distance(120)
          .strength(0.15)
        )
        // Repulsion — folders push harder, notes push gently
        .force("charge", d3.forceManyBody<GraphNode>().strength(d =>
          (d as GraphNode).isFolder
            ? (d as GraphNode).isRootSun ? -1800 : -900
            : (d as GraphNode).isGhost ? -60 : -220
        ))
        // Weak gravity to center
        .force("center", d3.forceCenter(0, 0).strength(0.03))
        // Collision — generous padding so nothing overlaps
        .force("collide", d3.forceCollide<GraphNode>().radius(d =>
          (d as GraphNode).isFolder
            ? (d as GraphNode).isRootSun ? 80 : 55
            : (d as GraphNode).isGhost ? 20 : 30
        ).strength(0.7))
        // Hierarchy orbit force — pull notes toward parent folder
        .force("orbit", (alpha) => {
          hierarchyLinks.forEach(link => {
            const sId = typeof link.source === "string" ? link.source : (link.source as any).id;
            const tId = typeof link.target === "string" ? link.target : (link.target as any).id;
            const child = nodesById.get(sId);
            const parent = nodesById.get(tId);
            if (!child || !parent) return;

            const dx = child.x! - parent.x!;
            const dy = child.y! - parent.y!;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            // Target distance: notes ~130px from folder, sub-folders ~220px
            const target = child.isFolder ? 220 : 130;
            const diff = (dist - target) / dist;

            const strength = 0.6 * alpha;
            child.vx! -= dx * diff * strength;
            child.vy! -= dy * diff * strength;
            parent.vx! += dx * diff * strength * 0.2;
            parent.vy! += dy * diff * strength * 0.2;
          });
        })
        .on("tick", () => {
          self.postMessage({
            type: "TICK",
            nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y, vx: n.vx, vy: n.vy }))
          });
        });
      break;
    }

    case "UPDATE_NODES":
      if (simulation) {
        payload.nodes.forEach((u: any) => {
          const node = nodes.find(n => n.id === u.id);
          if (node) { node.fx = u.fx; node.fy = u.fy; }
        });
        simulation.alpha(0.15).restart();
      }
      break;

    case "PAUSE":
      simulation?.stop();
      break;

    case "RESUME":
      simulation?.alpha(0.1).restart();
      break;
  }
};
