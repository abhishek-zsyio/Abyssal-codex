"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Trash2, Package, Zap, Star, ChevronLeft, X, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { usePlugins } from "@/hooks/use-plugins";
import { useTheme } from "@/hooks/use-theme";
import { PluginMetadata, PluginId } from "@/types/plugin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SidebarPluginsProps {
  onClose?: () => void;
}

const PluginIcon = ({ name, className }: { name: string, className?: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[name] || Package;
  return <Icon className={className} />;
};

export default function SidebarPlugins({ onClose }: SidebarPluginsProps) {
  const {
    availablePlugins,
    installPlugin,
    uninstallPlugin,
    togglePlugin,
    isEnabled,
    isInstalled
  } = usePlugins();
  const { toast } = useToast();
  const { theme: currentTheme, setTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPluginId, setSelectedPluginId] = useState<PluginId | null>(null);

  const selectedPlugin = useMemo(() => 
    availablePlugins.find(p => p.id === selectedPluginId) || null,
    [availablePlugins, selectedPluginId]
  );

  const filteredPlugins = useMemo(() => {
    return availablePlugins.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availablePlugins, searchQuery, selectedCategory]);

  const categories = ["utility", "editor", "ui", "theme", "system"];

  const handleToggleThemePlugin = (plugin: PluginMetadata, forceEnable = false, isInstalling = false) => {
    const themeName = plugin.id.replace("theme-", "");
    
    if (currentTheme === themeName && !forceEnable) {
      setTheme("dark");
      togglePlugin(plugin.id);
      toast(`Theme reset to default`, "info");
    } else {
      const otherThemePlugins = availablePlugins.filter(p => p.category === "theme" && p.id !== plugin.id && isEnabled(p.id));
      otherThemePlugins.forEach(p => togglePlugin(p.id));
      
      setTheme(themeName);
      
      if (!isInstalling && !isEnabled(plugin.id)) {
        togglePlugin(plugin.id);
      }
      
      if (!isInstalling) {
        toast(`Applied ${plugin.name} theme`, "success");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-hidden">
      <AnimatePresence mode="wait">
        {selectedPluginId && selectedPlugin ? (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--card)]/10">
              <button
                onClick={() => setSelectedPluginId(null)}
                className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--muted-foreground)] hover:text-[var(--primary)] uppercase tracking-wider transition-colors mb-3"
              >
                <ChevronLeft size={12} /> Back to store
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-[var(--card)] border border-[var(--border)]">
                  <PluginIcon name={selectedPlugin.icon} className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">
                    {selectedPlugin.name}
                  </h2>
                  <div className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase mt-0.5">
                    v{selectedPlugin.version} • {selectedPlugin.author}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-mono leading-relaxed text-[var(--muted-foreground)]">
                  {selectedPlugin.description}
                </p>
                
                <div className="p-3 bg-[var(--card)]/20 border border-[var(--border)]">
                   <h4 className="text-[8px] font-mono font-bold text-[var(--primary)] uppercase tracking-[0.2em] mb-2">Documentation</h4>
                   <div className="text-[9px] font-mono leading-relaxed text-[var(--foreground)]/80 prose-invert">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {selectedPlugin.guide || "No detailed guide available."}
                     </ReactMarkdown>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 border border-[var(--border)] bg-[var(--card)]/10">
                    <span className="block text-[7px] font-mono text-[var(--muted-foreground)] uppercase mb-1">Module ID</span>
                    <span className="block text-[9px] font-mono text-[var(--foreground)] truncate">{selectedPlugin.id}</span>
                  </div>
                  <div className="p-2 border border-[var(--border)] bg-[var(--card)]/10">
                    <span className="block text-[7px] font-mono text-[var(--muted-foreground)] uppercase mb-1">Category</span>
                    <span className="block text-[9px] font-mono text-[var(--primary)] uppercase">{selectedPlugin.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--card)]/5">
              <div className="flex gap-2">
                 {!isInstalled(selectedPlugin.id) ? (
                   <button
                     onClick={() => {
                       installPlugin(selectedPlugin.id);
                       if (selectedPlugin.category === "theme") {
                         handleToggleThemePlugin(selectedPlugin, true, true);
                       }
                       toast(`Installed ${selectedPlugin.name}`, "success");
                     }}
                     className="flex-1 h-9 bg-[var(--primary)] text-[var(--background)] text-[10px] font-mono font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                   >
                     <Download size={12} /> Install Module
                   </button>
                 ) : (
                   <>
                     <button
                       onClick={() => {
                         if (selectedPlugin.category === "theme") {
                           handleToggleThemePlugin(selectedPlugin);
                         } else {
                           togglePlugin(selectedPlugin.id);
                         }
                       }}
                       className={cn(
                         "flex-1 h-9 text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border",
                         isEnabled(selectedPlugin.id)
                          ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                          : "bg-[var(--card)]/40 border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                       )}
                     >
                       {isEnabled(selectedPlugin.id) ? <Check size={12} /> : null}
                       {isEnabled(selectedPlugin.id) ? "Enabled" : "Disabled"}
                     </button>
                      <button
                        onClick={() => {
                          if (selectedPlugin.category === "theme" && currentTheme === selectedPlugin.id.replace("theme-", "")) {
                            setTheme("dark");
                          }
                          uninstallPlugin(selectedPlugin.id);
                          toast(`Uninstalled ${selectedPlugin.name}`, "info");
                          setSelectedPluginId(null);
                        }}
                        className="w-9 h-9 flex items-center justify-center border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/5 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                   </>
                 )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col h-full"
          >
            {/* Search and Filters */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-mono font-bold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Module Marketplace</span>
                {onClose && (
                  <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] lg:hidden">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative mb-3">
                <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] opacity-50" />
                <input
                  type="text"
                  placeholder="Locate module…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--card)]/40 border border-[var(--border)] py-2 pl-9 pr-4 text-[10px] font-mono focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-[var(--muted-foreground)]/30"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "flex-shrink-0 text-[8px] font-mono px-2 py-1 border transition-colors uppercase",
                    !selectedCategory 
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/40" 
                      : "text-[var(--muted-foreground)]/60 border-[var(--border)] hover:border-[var(--muted-foreground)]"
                  )}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "flex-shrink-0 text-[8px] font-mono px-2 py-1 border transition-colors uppercase",
                      selectedCategory === cat 
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/40" 
                        : "text-[var(--muted-foreground)]/60 border-[var(--border)] hover:border-[var(--muted-foreground)]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Plugin List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredPlugins.length > 0 ? (
                  filteredPlugins.map(plugin => {
                    const installed = isInstalled(plugin.id);
                    const enabled = isEnabled(plugin.id);

                    return (
                      <motion.div
                        layout
                        key={plugin.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "p-2.5 bg-[var(--card)]/20 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all group cursor-pointer relative",
                          installed && "border-l-2 border-l-[var(--primary)]"
                        )}
                        onClick={() => setSelectedPluginId(plugin.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-[var(--background)] border border-[var(--border)] group-hover:border-[var(--primary)]/30 shrink-0">
                            <PluginIcon name={plugin.icon} className="w-4 h-4 text-[var(--primary)]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h3 className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate">
                                {plugin.name}
                              </h3>
                              {installed && enabled && <div className="w-1 h-1 bg-[var(--primary)] rounded-full" />}
                            </div>
                            <p className="text-[8px] font-mono text-[var(--muted-foreground)] line-clamp-1 opacity-60">
                              {plugin.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-20">
                    <Package size={24} className="mb-2" />
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em]">No modules found</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Footer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--card)]/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 opacity-40">
                <Zap size={10} className="text-[var(--primary)]" />
                <span className="text-[7px] font-mono text-[var(--foreground)] uppercase tracking-widest">Module system active</span>
              </div>
              <span className="text-[7px] font-mono text-[var(--muted-foreground)] opacity-30">0xAF_KERNEL_LOADED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
