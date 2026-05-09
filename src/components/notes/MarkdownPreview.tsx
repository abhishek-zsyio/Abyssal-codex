"use client";

import React, { useState, useMemo, memo, useDeferredValue } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, FileCode, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  gruvboxDark, 
  nord, 
  dracula, 
  oneDark, 
  oneLight, 
  xonokai, 
  synthwave84, 
  atomDark, 
  solarizedDarkAtom,
  vscDarkPlus
} from "react-syntax-highlighter/dist/esm/styles/prism";

const getHighlightStyle = (theme: string) => {
  switch (theme) {
    case "nord": return nord;
    case "monokai": return xonokai;
    case "dracula": return dracula;
    case "cyberpunk": return synthwave84;
    case "light": return oneLight;
    case "onedark": return oneDark;
    case "tokyo-night": return vscDarkPlus;
    case "catppuccin": return atomDark;
    case "solarized": return solarizedDarkAtom;
    case "github": return atomDark; // closest match
    case "rose-pine": return dracula; // fallback
    case "everforest": return gruvboxDark; // fallback
    default: return gruvboxDark;
  }
};

import { Button } from "@/components/ui/Button";
import { splitMarkdown } from "@/utils/markdown-splitter";

import { Note } from "@/types/note";

import { PluginMetadata } from "@/types/plugin";

interface MarkdownPreviewProps {
  content: string;
  title?: string;
  note?: Note;
  allNotes: Note[];
  onNavigate?: (id: string) => void;
  theme: string;
  isEnabled: (id: string) => boolean;
  availablePlugins: PluginMetadata[];
  onContextMenu?: (e: React.MouseEvent) => void;
}

const MarkdownPreview = memo(({ 
  content, 
  title,
  note,
  allNotes, 
  onNavigate, 
  theme, 
  isEnabled, 
  availablePlugins,
  onContextMenu
}: MarkdownPreviewProps) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [showAllChunks, setShowAllChunks] = useState(false);
  const deferredContent = useDeferredValue(content);

  const processedContent = useMemo(() => {
    if (!deferredContent) return "";
    return deferredContent.replace(/\[\[(.*?)\]\]/g, (_, title) => `[${title}](note://${encodeURIComponent(title)})`);
  }, [deferredContent]);

  const contentChunks = useMemo(() => {
    if (showAllChunks) return [processedContent];
    return splitMarkdown(processedContent, 12000);
  }, [processedContent, showAllChunks]);

  const activeChunk = useMemo(() => {
    if (currentChunkIndex >= contentChunks.length) return contentChunks[0] || "";
    return contentChunks[currentChunkIndex] || "";
  }, [contentChunks, currentChunkIndex]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div 
      ref={containerRef}
      onContextMenu={onContextMenu}
      className="flex-1 h-full w-full overflow-y-auto custom-scrollbar relative bg-[var(--card)]/50 tech-grid selection:bg-[var(--primary)] selection:text-[var(--background)]"
    >
      {/* Atmospheric Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.03]" />
        <div className="absolute top-4 left-4 w-24 h-24 border-l border-t border-[var(--primary)]/30" />
        <div className="absolute bottom-4 right-4 w-24 h-24 border-r border-b border-[var(--primary)]/30" />
      </div>

      <div className="prose px-8 lg:px-16 py-16 max-w-4xl mx-auto relative z-10">
        {contentChunks.length > 1 && !showAllChunks && (
          <div className="mb-12 flex items-center justify-between bg-[var(--background)] border border-[var(--border)] p-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-1">Stream_Segmentation</span>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-bold text-[var(--primary)] uppercase">Segment [{currentChunkIndex + 1}/{contentChunks.length}]</span>
                <div className="flex gap-1">
                  {contentChunks.map((_, i) => (
                    <div key={i} className={cn("w-2 h-1 transition-all", i === currentChunkIndex ? "bg-[var(--primary)] w-4" : "bg-[var(--border)]")} />
                  ))}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAllChunks(true)} className="text-[9px] h-8">
              FLUSH_FULL_STREAM
            </Button>
          </div>
        )}

        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          urlTransform={(url) => url}
          components={{
            h1: ({ children, node, ...props }: any) => <h1 className="group" {...props}>{children}</h1>,
            h2: ({ children, node, ...props }: any) => <h2 className="group" {...props}>{children}</h2>,
            h3: ({ children, node, ...props }: any) => <h3 className="group" {...props}>{children}</h3>,
            a: ({ href, children, node, ...props }: any) => {
              const isNoteLink = href?.includes("note:");
              if (isNoteLink) {
                // Extract title even if prefixed (e.g. http://localhost:3000/note://Title)
                const parts = href.split("note:");
                const targetTitle = decodeURIComponent(parts[parts.length - 1].replace(/^\/\//, ""));
                
                const targetNote = allNotes.find((n: any) => 
                  n.title?.toLowerCase().trim() === targetTitle.toLowerCase().trim()
                );

                return (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (targetNote) {
                        window.dispatchEvent(new CustomEvent('abyssal-log', { 
                          detail: { message: `REDIRECTION_PROCEDURE_INITIATED: [[${targetTitle}]]`, type: 'success' } 
                        }));
                        onNavigate?.(targetNote.id);
                      } else {
                        window.dispatchEvent(new CustomEvent('abyssal-log', { 
                          detail: { message: `NAVIGATION_FAILURE: NOTE_"${targetTitle}"_NOT_FOUND`, type: 'error' } 
                        }));
                      }
                    }}
                    className={cn(
                      "text-[var(--accent)] hover:text-[var(--primary)] border-b border-dashed border-[var(--accent)] hover:border-solid hover:border-[var(--primary)] transition-all font-mono text-left inline-block bg-transparent p-0 border-0 cursor-pointer", 
                      !targetNote && "opacity-50 line-through cursor-not-allowed"
                    )}
                    title={targetNote ? `Navigate to ${targetTitle}` : `Note "${targetTitle}" not found`}
                  >
                    {children}
                  </button>
                );
              }
              return <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" {...props}>{children}</a>;
            },
            li: ({ children, checked, node, ...props }: any) => {
              if (checked !== null && checked !== undefined) {
                return (
                  <li className="list-none flex items-start gap-4 -ml-2 group py-1">
                    <div className="relative mt-1">
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        readOnly
                        className="h-4 w-4 rounded-none border-2 border-[var(--border)] bg-transparent text-[var(--primary)] focus:ring-0 cursor-pointer appearance-none checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-all"
                      />
                      {checked && <Check size={10} className="absolute top-0.5 left-0.5 text-[var(--background)]" />}
                    </div>
                    <span className={cn("flex-1 transition-all font-medium", checked && "opacity-40 line-through text-[var(--muted-foreground)]")}>{children}</span>
                  </li>
                );
              }
              return <li {...props}>{children}</li>;
            },
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              
              if (!inline && match) {
                return (
                  <div className="my-10 rounded-sm overflow-hidden border border-[var(--border)] bg-[var(--background)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] group/code relative">
                    <div className="flex items-center justify-between px-5 py-2.5 bg-[#282828] border-b border-dotted border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-[#fb4934]" />
                          <div className="w-1.5 h-1.5 bg-[#fabd2f]" />
                          <div className="w-1.5 h-1.5 bg-[#b8bb26]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[var(--muted-foreground)] uppercase tracking-[0.25em] ml-2 flex items-center gap-2">
                          <FileCode size={12} className="text-[var(--primary)]/50" />
                          {match[1]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(codeString);
                            const btn = document.activeElement as HTMLButtonElement;
                            if (btn) btn.innerHTML = "COPIED";
                            setTimeout(() => { if (btn) btn.innerHTML = "COPY"; }, 2000);
                          }}
                          className="text-[9px] font-mono font-bold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all uppercase tracking-widest bg-[var(--background)] px-2 py-1 border border-[var(--border)] hover:border-[var(--primary)]/30"
                        >
                          COPY
                        </button>
                        {Array.isArray(availablePlugins) && availablePlugins.map((plugin: any) => {
                          if (isEnabled(plugin.id) && plugin.hooks?.codeBlockHeader) {
                            const Hook = plugin.hooks.codeBlockHeader;
                            if (typeof Hook === 'function' || (typeof Hook === 'object' && Hook !== null)) {
                               return <Hook key={plugin.id} language={match[1]} code={codeString} />;
                            }
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 w-8 h-full bg-[#282828]/30 border-r border-dotted border-[var(--border)] pointer-events-none" />
                      <SyntaxHighlighter 
                        style={getHighlightStyle(theme)} 
                        language={match[1]} 
                        PreTag="div" 
                        customStyle={{ margin: 0, padding: '1.5rem 1.5rem 1.5rem 2.5rem', background: 'transparent', fontSize: '13px', lineHeight: '1.6', fontFamily: 'var(--font-mono)' }}
                        codeTagProps={{ style: { background: 'transparent' } }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                    <div className="corner-accent corner-tl opacity-20" />
                    <div className="corner-accent corner-br opacity-20" />
                  </div>
                );
              }
              return <code className={cn(className)} {...props}>{children}</code>;
            }
          }}
        >
          {showAllChunks ? contentChunks.join("\n\n") : activeChunk || "*_NO_CONTENT_INITIALIZED_*"}
        </ReactMarkdown>

        {contentChunks.length > 1 && !showAllChunks && (
          <div className="mt-16 flex items-center justify-between border-t border-dotted border-[var(--border)] pt-12">
            <Button 
              variant="outline" 
              disabled={currentChunkIndex === 0}
              onClick={() => {
                setCurrentChunkIndex(prev => prev - 1);
                scrollToTop();
              }}
              className="gap-2 font-mono text-[10px] uppercase tracking-widest"
            >
              <CornerDownRight size={14} className="rotate-180" /> PREV_SEGMENT
            </Button>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase mb-2">Location: {currentChunkIndex + 1} / {contentChunks.length}</span>
              <div className="flex gap-1.5">
                {contentChunks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentChunkIndex(i);
                      scrollToTop();
                    }}
                    className={cn(
                      "w-3 h-3 rotate-45 border transition-all",
                      i === currentChunkIndex ? "bg-[var(--primary)] border-[var(--primary)] scale-110 shadow-[0_0_10px_var(--primary)]" : "bg-transparent border-[var(--border)] hover:border-[var(--primary)]"
                    )}
                  />
                ))}
              </div>
            </div>

            <Button 
              variant="primary" 
              disabled={currentChunkIndex === contentChunks.length - 1}
              onClick={() => {
                setCurrentChunkIndex(prev => prev + 1);
                scrollToTop();
              }}
              className="gap-2 font-mono text-[10px] uppercase tracking-widest"
            >
              NEXT_SEGMENT <CornerDownRight size={14} />
            </Button>
          </div>
        )}

        {showAllChunks && (
          <div className="mt-12 text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowAllChunks(false)} className="text-[9px] text-[var(--muted-foreground)] hover:text-[var(--primary)]">
              RESTORE_SEGMENTATION
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

MarkdownPreview.displayName = "MarkdownPreview";

export default MarkdownPreview;
