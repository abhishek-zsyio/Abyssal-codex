import { LucideIcon } from "lucide-react";

export type PluginId = string;

export interface PluginMetadata {
  id: PluginId;
  name: string;
  description: string;
  author: string;
  version: string;
  icon: string; // Name of the Lucide icon
  category: "utility" | "editor" | "ui" | "system" | "theme";
  guide?: string; // Markdown documentation for the plugin
  // Dynamic hooks for injection
  hooks?: {
    editorHeaderRight?: React.ComponentType<any>;
    codeBlockHeader?: React.ComponentType<{ language: string; code: string }>;
    editorSidebar?: React.ComponentType<any>;
  };
}

export interface PluginState {
  id: PluginId;
  enabled: boolean;
  installed: boolean;
}

export interface PluginStoreState {
  plugins: Record<PluginId, PluginState>;
}
