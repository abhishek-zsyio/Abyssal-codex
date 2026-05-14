import * as d3 from "d3-force";

export interface GraphNode extends d3.SimulationNodeDatum {
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

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  isHierarchy?: boolean;
}

export interface GraphThemeColors {
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  border: string;
  muted: string;
  card: string;
  destructive: string;
  secondary: string;
}
