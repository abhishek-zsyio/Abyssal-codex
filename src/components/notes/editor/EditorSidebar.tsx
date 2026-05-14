"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Link, ShieldAlert, Trash2, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Note } from "@/types/note";

interface EditorSidebarProps {
  isOpen: boolean;
  content: string;
  note: Note;
  backlinks: Note[];
  isEnabled: (pluginId: string) => boolean;
  onNavigate?: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EditorSidebar = ({
  isOpen,
  content,
  note,
  backlinks,
  isEnabled,
  onNavigate,
  onDelete
}: EditorSidebarProps) => {
  const tocItems = React.useMemo(() => {
    // Find the Table of Contents heading
    const lines = content.split('\n');
    const tocHeadingIndex = lines.findIndex(line => 
      line.toLowerCase().includes('table of contents') && line.startsWith('#')
    );
    
    if (tocHeadingIndex === -1) return null;
    
    const items = [];
    // Search for list items following the heading
    for (let i = tocHeadingIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line && items.length === 0) continue;
      
      // Match markdown list items with links: - [Title](target)
      const match = line.match(/^[-*+]\s+\[(.*?)\]\((.*?)\)/);
      if (match) {
        items.push({ text: match[1], url: match[2] });
      } else if (line.startsWith('#')) {
        // Stop if we hit another heading
        break;
      } else if (line && !line.match(/^[-*+]/) && items.length > 0) {
        // Stop if we hit a non-list line after starting the list
        break;
      }
    }
    return items.length > 0 ? items : null;
  }, [content]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-[var(--background)] overflow-y-auto overflow-x-hidden hidden xl:block border-l border-dotted border-[var(--border)] shrink-0 custom-scrollbar relative"
        >
          <div className="w-[360px] p-8 h-full flex flex-col">
            <section className="space-y-12">
              {/* Table of Contents / Index Buffer */}
              {tocItems && (
                <div>
                  <div className="flex items-center justify-between border-b border-dotted border-[var(--border)] pb-2 mb-6">
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] flex items-center gap-2">
                      <List size={12} className="text-[var(--primary)]" /> Index_Buffer
                    </span>
                    <span className="text-[8px] font-mono text-[var(--muted-foreground)] bg-[var(--card)] px-1 border border-[var(--border)]">{tocItems.length}</span>
                  </div>
                  
                  <div className="space-y-0.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {tocItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (item.url.startsWith("#")) {
                            const id = item.url.substring(1);
                            const el = document.getElementById(id);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            } else {
                              // Fallback for Edit mode: Emit event to scroll editor
                              window.dispatchEvent(new CustomEvent('abyssal-toc-scroll', { 
                                detail: { id } 
                              }));
                            }
                          } else if (item.url.includes("note://")) {
                            const target = decodeURIComponent(item.url.split("note://")[1].replace(/^\/\//, ""));
                            window.dispatchEvent(new CustomEvent('abyssal-toc-navigate', { 
                              detail: { target } 
                            }));
                          }
                        }}
                        className="w-full text-left py-1.5 px-2 hover:bg-[var(--primary)]/5 transition-all group flex items-start gap-3 border-l border-transparent hover:border-[var(--primary)]/30"
                        title={item.text}
                      >
                         <div className="mt-1.5 w-1 h-1 rotate-45 border bg-transparent border-[var(--primary)]/30 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)]/20 transition-all duration-300" />
                         <span className="text-[9px] font-mono uppercase tracking-wider truncate text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                           {item.text}
                         </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Module */}
              <div>
                <div className="flex items-center justify-between border-b border-dotted border-[var(--border)] pb-2 mb-6">
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] flex items-center gap-2">
                    <Clock size={12} className="text-[var(--accent)]" /> Timeline
                  </span>
                </div>
                
                <div className="relative pl-10 space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-[var(--border)] before:via-[var(--primary)]/30 before:to-[var(--border)] before:border-dotted before:border-l">
                  {/* Genesis / Init Deployment */}
                  <div className="relative group/time">
                    <div className={cn(
                      "absolute -left-[30px] top-1.5 w-2.5 h-2.5 rotate-45 border transition-all duration-300 z-10",
                      note.createdAt ? "bg-[var(--background)] border-[var(--primary)]" : "bg-[var(--border)] border-[var(--border)] opacity-50"
                    )} />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-[var(--muted-foreground)] font-mono uppercase tracking-wider">Init_Deployment</span>
                        <span className="text-[7px] font-mono px-1 bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)]">v1.0.0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--foreground)] font-mono font-bold bg-[var(--card)] px-2 py-0.5 rounded-sm border border-[var(--border)]/50">
                          {note.createdAt ? new Date(note.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' }) : "GENESIS_UNKNOWN"}
                        </span>
                        {!note.createdAt && <span className="text-[8px] text-[var(--destructive)] font-mono">LEGACY_SYNC</span>}
                      </div>
                      <span className="text-[7px] text-[var(--muted-foreground)] font-mono opacity-40">ID: {note.id.split('-')[0]}...0x01</span>
                    </div>
                  </div>

                  {/* Last Buffer Sync */}
                  <div className="relative group/time">
                    <div className="absolute -left-[30px] top-1.5 w-2.5 h-2.5 rotate-45 bg-[var(--primary)] shadow-[0_0_12px_rgba(250,189,47,0.6)] border border-[var(--primary)] z-10" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-[var(--primary)] font-mono uppercase tracking-wider font-bold">Last_Buffer_Sync</span>
                        <span className="text-[7px] font-mono px-1 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30">HEAD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--primary)] font-mono font-bold bg-[var(--primary)]/5 px-2 py-0.5 rounded-sm border border-[var(--primary)]/20 shadow-[inset_0_0_10px_rgba(250,189,47,0.05)]">
                          {new Date(note.updatedAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </span>
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-[var(--primary)] rounded-full" />
                          <span className="text-[7px] text-[var(--primary)] font-mono uppercase">Live</span>
                        </div>
                      </div>
                      <span className="text-[7px] text-[var(--muted-foreground)] font-mono opacity-40">ID: {note.id.split('-')[1]}...0xAF</span>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="relative pt-2">
                    <div className="flex items-center gap-2 text-[8px] font-mono text-[var(--muted-foreground)] italic">
                      <div className="absolute -left-[30px] w-5 h-[1px] bg-[var(--border)]" />
                      END_OF_TRACE
                    </div>
                  </div>
                </div>
              </div>

              {/* Inbound References */}
              {isEnabled("backlinks") && (
                <div>
                  <div className="flex items-center justify-between border-b border-dotted border-[var(--border)] pb-2 mb-6">
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] flex items-center gap-2">
                      <Link size={12} className="text-[var(--accent)]" /> Inbound_References
                    </span>
                    <span className="text-[8px] font-mono text-[var(--muted-foreground)] bg-[var(--card)] px-1 border border-[var(--border)]">{backlinks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {backlinks.length === 0 ? (
                      <div className="text-[9px] font-mono text-[var(--muted-foreground)] italic opacity-50 px-2">NO_INBOUND_LINKS_DETECTED</div>
                    ) : (
                      backlinks.map(linkNote => (
                        <button
                          key={linkNote.id}
                          onClick={() => onNavigate?.(linkNote.id)}
                          className="w-full text-left bg-[var(--card)]/30 border border-[var(--border)] p-2 hover:border-[var(--primary)]/50 hover:bg-[var(--card)] transition-all group relative overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate group-hover:text-[var(--primary)]">{linkNote.title || "UNTITLED"}</span>
                            <span className="text-[8px] font-mono text-[var(--muted-foreground)] truncate opacity-60">{linkNote.content?.substring(0, 40)}...</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert size={12} className="text-[var(--destructive)]" />
                  <span className="text-[9px] font-mono text-[var(--destructive)] uppercase tracking-[0.2em] font-bold">Critical_Operations</span>
                </div>
                <div className="grid gap-2">
                  <Button 
                    variant="ghost" 
                    className="justify-start h-10 text-[9px] font-mono hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 border border-[var(--border)] hover:border-[var(--destructive)]/30 group px-4" 
                    onClick={() => {
                      if (confirm("Are you sure you want to permanently purge this data stream? This action cannot be undone.")) {
                        onDelete(note.id);
                      }
                    }}
                  >
                    <Trash2 size={12} className="mr-3 opacity-50 group-hover:opacity-100 transition-opacity" /> 
                    <span className="tracking-widest">PURGE_DATA_STREAM</span>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
