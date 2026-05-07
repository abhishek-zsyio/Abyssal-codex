"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Trash2, Check, Package, Zap, Star, Info, ChevronLeft, ChevronRight, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { usePlugins } from "@/hooks/use-plugins";
import { useTheme } from "@/hooks/use-theme";
import { PluginMetadata, PluginId } from "@/types/plugin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SidebarPluginsProps {
  onClose?: () => void;
}

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

  const PluginIcon = ({ name, className }: { name: string, className?: string }) => {
    const Icon = (LucideIcons as any)[name] || Package;
    return <Icon className={className} />;
  };

  const handleToggleThemePlugin = (plugin: PluginMetadata, forceEnable = false, isInstalling = false) => {
    const themeName = plugin.id.replace("theme-", "");
    
    // If it's already the active theme, and we're not forcing it (e.g. just toggling off)
    if (currentTheme === themeName && !forceEnable) {
      setTheme("dark");
      togglePlugin(plugin.id);
      toast(`Theme reset to default`, "info");
    } else {
      // Find currently enabled theme plugins and disable them
      const otherThemePlugins = availablePlugins.filter(p => p.category === "theme" && p.id !== plugin.id && isEnabled(p.id));
      otherThemePlugins.forEach(p => togglePlugin(p.id));
      
      setTheme(themeName);
      
      // If we're installing, it's already enabled by installPlugin, so skip toggle
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="flex flex-col h-full bg-[var(--background)]"
          >
            <div className="p-4 border-b border-dotted border-[var(--border)] bg-[var(--card)]/20">
              <button
                onClick={() => setSelectedPluginId(null)}
                className="flex items-center gap-2 text-[10px] font-mono text-[var(--muted-foreground)] hover:text-[var(--primary)] uppercase tracking-wider transition-colors mb-2"
              >
                <ChevronLeft size={14} /> Back to Marketplace
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--card)] border border-[var(--primary)]/30">
                  <PluginIcon name={selectedPlugin.icon} className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">
                    {selectedPlugin.name}
                  </h2>
                  <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase">
                    v{selectedPlugin.version} • {selectedPlugin.author}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <div className="prose prose-invert prose-xs max-w-none mb-6">
                <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)] mb-4">
                  {selectedPlugin.description}
                </p>
                <div className="bg-[var(--card)]/30 p-3 border border-[var(--border)] rounded-sm mb-4">
                   <h4 className="text-[9px] font-mono font-bold text-[var(--primary)] uppercase mb-2">Documentation</h4>
                   <div className="text-[10px] leading-relaxed opacity-80">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {selectedPlugin.guide || "No detailed guide available."}
                     </ReactMarkdown>
                   </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono border-b border-dotted border-[var(--border)] pb-1">
                    <span className="text-[var(--muted-foreground)] uppercase">ID</span>
                    <span className="text-[var(--foreground)]">{selectedPlugin.id}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono border-b border-dotted border-[var(--border)] pb-1">
                    <span className="text-[var(--muted-foreground)] uppercase">Category</span>
                    <span className="text-[var(--primary)] uppercase font-bold">{selectedPlugin.category}</span>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-[var(--background)] pt-4 pb-2">
                <div className="flex gap-2">
                   {!isInstalled(selectedPlugin.id) ? (
                     <Button
                       onClick={() => {
                         installPlugin(selectedPlugin.id);
                         if (selectedPlugin.category === "theme") {
                           handleToggleThemePlugin(selectedPlugin, true, true);
                           toast(`Installed and applied ${selectedPlugin.name} theme`, "success");
                         } else {
                           toast(`Installed ${selectedPlugin.name}`, "success");
                         }
                       }}
                       className="flex-1 h-9 font-mono text-[10px] uppercase shadow-[2px_2px_0_rgba(250,189,47,0.2)]"
                     >
                       <Download size={12} className="mr-2" /> Install
                     </Button>
                   ) : (
                     <>
                       <Button
                         onClick={() => {
                           if (selectedPlugin.category === "theme") {
                             handleToggleThemePlugin(selectedPlugin);
                           } else {
                             togglePlugin(selectedPlugin.id);
                             toast(`${isEnabled(selectedPlugin.id) ? 'Disabled' : 'Enabled'} ${selectedPlugin.name}`, "info");
                           }
                         }}
                         variant={isEnabled(selectedPlugin.id) ? "primary" : "outline"}
                         className="flex-1 h-9 font-mono text-[10px] uppercase"
                       >
                         {isEnabled(selectedPlugin.id) ? "Enabled" : "Disabled"}
                       </Button>
                        <Button
                          onClick={() => {
                            if (selectedPlugin.category === "theme" && currentTheme === selectedPlugin.id.replace("theme-", "")) {
                              setTheme("dark");
                              toast("Active theme removed. Reverting to default.", "info");
                            }
                            uninstallPlugin(selectedPlugin.id);
                            toast(`Uninstalled ${selectedPlugin.name}`, "system");
                            setSelectedPluginId(null);
                          }}
                         variant="danger"
                         size="icon"
                         className="h-9 w-9"
                       >
                         <Trash2 size={14} />
                       </Button>
                     </>
                   )}
                </div>
                
                <div className="mt-6 p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={12} className="text-[var(--primary)]" />
                    <span className="text-[9px] font-mono font-bold text-[var(--foreground)]">VETTED_MODULE</span>
                  </div>
                  <p className="text-[8px] font-mono text-[var(--muted-foreground)] leading-relaxed uppercase opacity-60">
                    Verified by Abyssal Core team for stability and security.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="flex flex-col h-full"
          >
            <div className="p-6 border-b border-dotted border-[var(--border)]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-1">Marketplace</span>
                  <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight text-glow">MODULE_STORE</h1>
                </div>
                {onClose && (
                  <Button size="icon" onClick={onClose} variant="ghost" className="lg:hidden">
                    <X size={18} />
                  </Button>
                )}
              </div>

              <div className="relative group mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="SEARCH_PLUGINS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] py-2 pl-9 pr-4 text-[11px] font-mono focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--muted-foreground)]"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "relative flex-shrink-0 text-[9px] font-mono px-3 py-1.5 border transition-all overflow-hidden",
                    !selectedCategory 
                      ? "text-[var(--background)] border-[var(--primary)] font-bold" 
                      : "text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--muted-foreground)] hover:bg-[var(--card)]/30"
                  )}
                >
                  {!selectedCategory && (
                    <motion.div
                      layoutId="active-cat"
                      className="absolute inset-0 bg-[var(--primary)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">ALL</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "relative flex-shrink-0 text-[9px] font-mono px-3 py-1.5 border transition-all uppercase overflow-hidden",
                      selectedCategory === cat 
                        ? "text-[var(--background)] border-[var(--primary)] font-bold" 
                        : "text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--muted-foreground)] hover:bg-[var(--card)]/30"
                    )}
                  >
                    {selectedCategory === cat && (
                      <motion.div
                        layoutId="active-cat"
                        className="absolute inset-0 bg-[var(--primary)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredPlugins.length > 0 ? (
                    filteredPlugins.map(plugin => {
                      const installed = isInstalled(plugin.id);
                      const enabled = isEnabled(plugin.id);

                      return (
                        <motion.div
                          layout
                          key={plugin.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setSelectedPluginId(plugin.id)}
                          className={cn(
                            "p-3 bg-[var(--card)]/40 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all group relative cursor-pointer",
                            installed && "border-l-2 border-l-[var(--primary)]"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-[var(--background)] border border-[var(--border)] group-hover:border-[var(--primary)]/20 transition-colors shrink-0">
                              <PluginIcon name={plugin.icon} className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="text-[11px] font-bold text-[var(--foreground)] uppercase truncate">
                                  {plugin.name}
                                </h3>
                              </div>
                              <p className="text-[9px] font-mono text-[var(--muted-foreground)] line-clamp-2 mb-3 leading-tight">
                                {plugin.description}
                              </p>
                              
                              <div className="flex items-center gap-2">
                                {!installed ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      installPlugin(plugin.id);
                                      if (plugin.category === "theme") {
                                        handleToggleThemePlugin(plugin, true, true);
                                        toast(`Installed and applied ${plugin.name} theme`, "success");
                                      } else {
                                        toast(`Installed ${plugin.name}`, "success");
                                      }
                                    }}
                                    className="text-[9px] font-mono font-bold text-[var(--primary)] hover:underline uppercase tracking-wider relative z-10"
                                  >
                                    Install
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (plugin.category === "theme") {
                                          handleToggleThemePlugin(plugin);
                                        } else {
                                          togglePlugin(plugin.id);
                                          toast(`${enabled ? 'Disabled' : 'Enabled'} ${plugin.name}`, "info");
                                        }
                                      }}
                                      className={cn(
                                        "text-[9px] font-mono font-bold uppercase tracking-wider hover:underline relative z-10",
                                        enabled ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                                      )}
                                    >
                                      {enabled ? "Disable" : "Enable"}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (plugin.category === "theme" && currentTheme === plugin.id.replace("theme-", "")) {
                                          setTheme("dark");
                                          toast("Active theme removed. Reverting to default.", "info");
                                        }
                                        uninstallPlugin(plugin.id);
                                        toast(`Uninstalled ${plugin.name}`, "system");
                                      }}
                                      className="text-[9px] font-mono font-bold text-[var(--destructive)] opacity-50 hover:opacity-100 uppercase tracking-wider hover:underline relative z-10"
                                    >
                                      Remove
                                    </button>
                                  </>
                                )}
                                
                                <div className="ml-auto flex items-center gap-1.5">
                                   {plugin.category === 'system' && <Zap size={10} className="text-[var(--primary)] opacity-50" />}
                                   <span className="text-[8px] font-mono text-[var(--muted-foreground)] opacity-50">
                                     v{plugin.version}
                                   </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center justify-center text-center opacity-30"
                    >
                      <Package size={32} className="mb-2" />
                      <p className="text-[10px] font-mono uppercase tracking-widest">No modules found</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 mt-4 bg-[var(--card)]/20 border border-dotted border-[var(--border)] rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={12} className="text-[var(--muted-foreground)]" />
                  <span className="text-[9px] font-mono font-bold text-[var(--muted-foreground)] uppercase">Marketplace Info</span>
                </div>
                <p className="text-[8px] font-mono text-[var(--muted-foreground)] leading-relaxed opacity-50">
                  Extend your codex with verified modules. Experimental modules may cause buffer instability.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-dotted border-[var(--border)] bg-[var(--card)]/10">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-[var(--primary)] animate-pulse" />
                <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
                  System Kernel: 0xAF...STABLE
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
