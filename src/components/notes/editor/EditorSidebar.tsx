"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Link as LinkIcon, ShieldAlert, Trash2, List, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
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
    const lines = content.split('\n');
    const tocHeadingIndex = lines.findIndex(line => 
      line.toLowerCase().includes('table of contents') && line.startsWith('#')
    );
    
    if (tocHeadingIndex === -1) return null;
    
    const items = [];
    for (let i = tocHeadingIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line && items.length === 0) continue;
      const match = line.match(/^[-*+]\s+\[(.*?)\]\((.*?)\)/);
      if (match) {
        items.push({ text: match[1], url: match[2] });
      } else if (line.startsWith('#')) {
        break;
      } else if (line && !line.match(/^[-*+]/) && items.length > 0) {
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
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-[var(--background)] overflow-hidden hidden xl:flex border-l border-[var(--border)] shrink-0 flex-col relative"
        >
          <div className="w-[300px] h-full flex flex-col custom-scrollbar overflow-y-auto">
            {/* Header / Info */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--card)]/10">
              <div className="flex items-center gap-2 mb-3 opacity-40">
                <Hash size={10} className="text-[var(--primary)]" />
                <span className="text-[8px] font-mono uppercase tracking-[0.3em]">Module_Properties</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-[var(--border)] bg-[var(--background)]/50">
                  <span className="block text-[7px] font-mono text-[var(--muted-foreground)] uppercase mb-1">ID_Hash</span>
                  <span className="block text-[9px] font-mono text-[var(--foreground)] truncate uppercase tracking-tight">{note.id.split('-')[0]}</span>
                </div>
                <div className="p-2 border border-[var(--border)] bg-[var(--background)]/50">
                  <span className="block text-[7px] font-mono text-[var(--muted-foreground)] uppercase mb-1">Status</span>
                  <span className="block text-[9px] font-mono text-[var(--accent)] uppercase font-bold tracking-tighter">Verified</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-8">
              {/* Index Buffer (TOC) */}
              {tocItems && (
                <div>
                  <div className="flex items-center justify-between mb-3 opacity-60">
                    <div className="flex items-center gap-1.5">
                      <List size={11} className="text-[var(--primary)]" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Index_Buffer</span>
                    </div>
                    <span className="text-[8px] font-mono opacity-40">[{tocItems.length}]</span>
                  </div>
                  <div className="space-y-1">
                    {tocItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (item.url.startsWith("#")) {
                            const id = item.url.substring(1);
                            const el = document.getElementById(id);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                            else window.dispatchEvent(new CustomEvent('abyssal-toc-scroll', { detail: { id } }));
                          } else if (item.url.includes("note://")) {
                            const target = decodeURIComponent(item.url.split("note://")[1].replace(/^\/\//, ""));
                            window.dispatchEvent(new CustomEvent('abyssal-toc-navigate', { detail: { target } }));
                          }
                        }}
                        className="w-full text-left py-1.5 px-2 hover:bg-[var(--primary)]/5 transition-all group flex items-start gap-3 border-l border-transparent hover:border-[var(--primary)]/30"
                      >
                         <span className="text-[7px] font-mono text-[var(--muted-foreground)] opacity-20 mt-1 uppercase">0x{idx.toString(16).padStart(2, '0')}</span>
                         <span className="text-[10px] font-mono uppercase tracking-tight truncate text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                           {item.text}
                         </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <div className="flex items-center gap-1.5 mb-5 opacity-60">
                  <Clock size={11} className="text-[var(--accent)]" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Temporal_Audit</span>
                </div>
                <div className="space-y-6 ml-1.5 border-l border-[var(--border)] relative">
                  {/* Genesis Node */}
                  <div className="relative pl-6">
                    <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 bg-[var(--background)] border border-[var(--border)] rotate-45" />
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="block text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Deployment</span>
                      <span className="text-[6px] font-mono opacity-30 uppercase tracking-tighter">Genesis_Node</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-mono text-[var(--foreground)] uppercase font-black tracking-tight">
                        {note.createdAt ? new Date(note.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: '2-digit' }) : "UNKNOWN"}
                      </span>
                      <span className="text-[8px] font-mono text-[var(--muted-foreground)] opacity-40 uppercase">/ INIT_SYNC</span>
                    </div>
                  </div>

                  {/* Sync Node */}
                  <div className="relative pl-6">
                    <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 bg-[var(--primary)] rotate-45 shadow-[0_0_10px_var(--primary)]" />
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="block text-[7px] font-mono text-[var(--primary)] uppercase tracking-wider flex items-center gap-2">
                        Last_Sync <span className="px-1 bg-[var(--primary)]/10 text-[6px] border border-[var(--primary)]/20 animate-pulse">LIVE</span>
                      </span>
                      <span className="text-[6px] font-mono text-[var(--accent)] uppercase tracking-tighter">Verified</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-mono text-[var(--foreground)] uppercase font-black tracking-tight">
                        {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                      </span>
                      <span className="text-[8px] font-mono text-[var(--muted-foreground)] opacity-40 uppercase">/ {Math.floor((Date.now() - new Date(note.updatedAt).getTime()) / 60000)}m ago</span>
                    </div>
                  </div>

                  {/* Integrity Check */}
                  <div className="relative pl-6 opacity-40">
                    <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 border border-[var(--border)] border-dashed rotate-45" />
                    <span className="block text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Integrity_Hash</span>
                    <span className="block text-[8px] font-mono text-[var(--foreground)] truncate font-medium">
                      SHA256: {note.id.substring(0, 16).toUpperCase()}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Backlinks */}
              {isEnabled("backlinks") && (
                <div>
                  <div className="flex items-center justify-between mb-3 opacity-60">
                    <div className="flex items-center gap-1.5">
                      <LinkIcon size={11} className="text-[var(--accent)]" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Inbound_Links</span>
                    </div>
                    <span className="text-[8px] font-mono opacity-40">[{backlinks.length}]</span>
                  </div>
                  <div className="space-y-1.5">
                    {backlinks.length === 0 ? (
                      <div className="text-[9px] font-mono text-[var(--muted-foreground)] opacity-30 italic px-2">No references detected</div>
                    ) : (
                      backlinks.map(linkNote => (
                        <button
                          key={linkNote.id}
                          onClick={() => onNavigate?.(linkNote.id)}
                          className="w-full text-left p-2 border border-[var(--border)] bg-[var(--card)]/10 hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all group flex items-start gap-2"
                        >
                          <div className="w-0.5 h-6 bg-[var(--accent)]/30 group-hover:bg-[var(--primary)] transition-colors shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] font-black text-[var(--foreground)] uppercase truncate group-hover:text-[var(--primary)] tracking-tight">{linkNote.title || "Untitled"}</span>
                            <span className="block text-[7px] font-mono text-[var(--muted-foreground)] truncate opacity-40 uppercase tracking-tighter">{linkNote.content?.substring(0, 40).replace(/#{1,6}\s/g, '')}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--destructive)]/[0.02]">
              <button 
                onClick={() => {
                  if (confirm("Permanently purge this document?")) onDelete(note.id);
                }}
                className="w-full h-8 flex items-center justify-center gap-2 border border-[var(--destructive)]/30 text-[9px] font-mono font-bold text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white transition-all uppercase tracking-widest"
              >
                <Trash2 size={11} /> Purge Document
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
