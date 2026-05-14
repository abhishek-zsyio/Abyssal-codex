"use client";

import React, { useState, useMemo, memo, useDeferredValue } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Check, FileCode, CornerDownRight, Hash, Database, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const SyntaxHighlighter = dynamic(() => import("react-syntax-highlighter").then(mod => mod.PrismLight), {
  ssr: false,
  loading: () => <div className="p-4 animate-pulse bg-[var(--background)] h-32 border border-[var(--border)]" />
});

import { 
  gruvboxDark
} from "react-syntax-highlighter/dist/esm/styles/prism";

const getHighlightStyle = (theme: string) => {
  return gruvboxDark; 
};

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
  isScrollable?: boolean;
}

const extractText = (children: any): string => {
  return React.Children.toArray(children)
    .map((child: any) => {
      if (typeof child === "string" || typeof child === "number") return child.toString();
      if (React.isValidElement(child) && (child.props as any).children) return extractText((child.props as any).children);
      return "";
    })
    .join("");
};

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const MarkdownPreview = memo(({ 
  content, 
  title,
  note,
  allNotes, 
  onNavigate, 
  theme, 
  isEnabled, 
  availablePlugins,
  onContextMenu,
  isScrollable = true
}: MarkdownPreviewProps) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [showAllChunks, setShowAllChunks] = useState(false);
  const deferredContent = useDeferredValue(content);

  const processedContent = useMemo(() => {
    if (!deferredContent) return "";
    const combinedRegex = /(?:```[\s\S]*?```|`[^`\n]*?`|@\{([\s\S]*?)\}|!\[\[([\s\S]*?)\]\])/g;
    return deferredContent.replace(combinedRegex, (match, linkContent, embedContent) => {
      if (linkContent !== undefined) {
        let target = linkContent;
        let alias = linkContent;
        if (linkContent.includes('|')) {
          const parts = linkContent.split('|');
          target = parts[0].trim();
          alias = parts.slice(1).join('|').trim();
        }
        return `[${alias}](note://${encodeURIComponent(target)})`;
      }
      
      if (embedContent !== undefined) {
        const targetTitle = embedContent.trim();
        const targetNote = allNotes.find(n => 
          n.title.toLowerCase() === targetTitle.toLowerCase() || 
          n.id === targetTitle ||
          n.title.toLowerCase().endsWith('/' + targetTitle.toLowerCase())
        );
        
        if (targetNote) {
          return `\n\n> [!NOTE]\n> **Embedded: ${targetNote.title}**\n\n${targetNote.content}\n\n---\n\n`;
        }
        return `\n\n> [!WARNING]\n> EMBED_FAILED: [${targetTitle}]\n\n`;
      }
      
      return match;
    });
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
      className={cn(
        "flex-1 w-full relative bg-[var(--background)] selection:bg-[var(--primary)] selection:text-[var(--background)]",
        isScrollable ? "h-full overflow-y-auto custom-scrollbar" : "h-auto"
      )}
    >
      <div className="prose prose-invert px-8 lg:px-12 py-12 max-w-4xl mx-auto relative z-10 font-sans">
        {contentChunks.length > 1 && !showAllChunks && (
          <div className="mb-10 p-4 border border-[var(--border)] bg-[var(--card)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1 opacity-40">
                <Layers size={10} className="text-[var(--primary)]" />
                <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Stream_Segmentation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase">Segment [{currentChunkIndex + 1}/{contentChunks.length}]</span>
                <div className="flex gap-1">
                  {contentChunks.map((_, i) => (
                    <div key={i} className={cn("h-0.5 transition-all", i === currentChunkIndex ? "bg-[var(--primary)] w-4" : "bg-[var(--border)] w-2")} />
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowAllChunks(true)} 
              className="px-3 h-7 border border-[var(--border)] bg-[var(--card)]/40 text-[9px] font-mono font-bold uppercase tracking-widest hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-all"
            >
              Flush_Stream
            </button>
          </div>
        )}

        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          urlTransform={(url) => url}
          components={{
            details: ({ children, ...props }: any) => (
              <details className="my-6 border border-[var(--border)] bg-[var(--card)]/10 group [&>*:not(summary)]:px-4 [&>*:not(summary)]:pb-4" {...props}>
                {children}
              </details>
            ),
            summary: ({ children, ...props }: any) => (
              <summary className="px-4 py-3 cursor-pointer font-bold text-[var(--foreground)] uppercase tracking-widest text-[9px] bg-[var(--card)]/20 hover:bg-[var(--primary)]/5 transition-all list-none flex items-center gap-3 border-b border-transparent group-open:border-[var(--border)]" {...props}>
                <div className="w-1.5 h-1.5 bg-[var(--primary)] group-open:rotate-90 transition-transform" />
                {children}
              </summary>
            ),
            h1: ({ children, node, ...props }: any) => <h1 id={slugify(extractText(children))} className="group uppercase tracking-tight" {...props}>{children}</h1>,
            h2: ({ children, node, ...props }: any) => <h2 id={slugify(extractText(children))} className="group uppercase tracking-tight" {...props}>{children}</h2>,
            h3: ({ children, node, ...props }: any) => <h3 id={slugify(extractText(children))} className="group uppercase" {...props}>{children}</h3>,
            a: ({ href, children, node, ...props }: any) => {
              const isAnchor = href?.startsWith("#");
              if (isAnchor) {
                return (
                  <a 
                    href={href} 
                    onClick={(e) => {
                      e.preventDefault();
                      const id = href.substring(1);
                      let element = containerRef.current?.querySelector(`[id="${id}"]`);
                      if (!element && !showAllChunks) {
                         setShowAllChunks(true);
                         setTimeout(() => {
                           const el = containerRef.current?.querySelector(`[id="${id}"]`);
                           if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                         }, 150);
                      } else if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="text-[var(--primary)] hover:underline decoration-dashed transition-all"
                    {...props}
                  >
                    {children}
                  </a>
                );
              }
              const isNoteLink = href?.includes("note:");
              if (isNoteLink) {
                const parts = href.split("note:");
                const targetTitle = decodeURIComponent(parts[parts.length - 1].replace(/^\/\//, ""));
                const targetLower = targetTitle.toLowerCase().trim();
                const targetNote = allNotes.find((n: any) => {
                  const noteTitle = n.title?.toLowerCase().trim();
                  const noteId = n.id?.toLowerCase().trim();
                  return noteId === targetLower || noteTitle === targetLower || noteTitle?.endsWith('/' + targetLower);
                });

                return (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (targetNote) onNavigate?.(targetNote.id);
                    }}
                    className={cn(
                      "text-[var(--accent)] hover:text-[var(--primary)] border-b border-dashed border-[var(--accent)] hover:border-solid hover:border-[var(--primary)] transition-all font-mono text-left inline-block bg-transparent p-0 border-0 cursor-pointer uppercase tracking-tight", 
                      !targetNote && "opacity-40 line-through cursor-not-allowed"
                    )}
                  >
                    {children}
                  </button>
                );
              }
              return <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-[var(--primary)] underline decoration-[var(--primary)]/30 hover:decoration-[var(--primary)] transition-all" {...props}>{children}</a>;
            },
            li: ({ children, checked, node, ...props }: any) => {
              if (checked !== null && checked !== undefined) {
                return (
                  <li className="list-none flex items-start gap-3 -ml-1 py-1">
                    <div className="relative mt-1">
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        readOnly
                        className="h-3.5 w-3.5 border border-[var(--border)] bg-[var(--card)]/40 text-[var(--primary)] focus:ring-0 cursor-pointer appearance-none checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-all"
                      />
                      {checked && <Check size={10} className="absolute top-0 left-0 text-[var(--background)]" />}
                    </div>
                    <span className={cn("flex-1 transition-all", checked && "opacity-30 line-through")}>{children}</span>
                  </li>
                );
              }
              return <li {...props}>{children}</li>;
            },
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              
              if (!inline && match) {
                const lang = match[1].toLowerCase();
                
                // Data Table Rendering (JSON/CSV)
                if (lang === 'json' || lang === 'csv') {
                  try {
                    let data: any[] = [];
                    if (lang === 'json') {
                      const parsed = JSON.parse(codeString);
                      data = Array.isArray(parsed) ? parsed : [parsed];
                    } else {
                      // Simple CSV Parser
                      const lines = codeString.split('\n').filter(l => l.trim());
                      if (lines.length > 0) {
                        const headers = lines[0].split(',').map(h => h.trim());
                        data = lines.slice(1).map(line => {
                          const values = line.split(',').map(v => v.trim());
                          const obj: any = {};
                          headers.forEach((h, i) => { obj[h] = values[i] || ''; });
                          return obj;
                        });
                      }
                    }

                    if (data.length > 0 && typeof data[0] === 'object') {
                      const headers = Object.keys(data[0]);
                      return (
                        <div className="my-8 overflow-x-auto border border-[var(--border)] bg-[var(--background)]">
                          <div className="px-4 py-2 bg-[var(--card)]/50 border-b border-[var(--border)] flex items-center gap-2">
                            <Database size={12} className="text-[var(--primary)]" />
                            <span className="text-[9px] font-mono font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Data_Table ({lang})</span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[var(--border)] bg-[var(--card)]/20">
                                {headers.map(h => (
                                  <th key={h} className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--primary)]">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {data.map((row, i) => (
                                <tr key={i} className="border-b border-[var(--border)]/30 hover:bg-[var(--primary)]/5 transition-colors">
                                  {headers.map(h => (
                                    <td key={h} className="px-4 py-2 text-[11px] font-mono text-[var(--foreground)] opacity-80">{String(row[h])}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                  } catch (e) {
                    console.error("Data table parse error:", e);
                  }
                }

                return (
                  <div className="my-8 border border-[var(--border)] bg-[var(--background)] group/code relative">
                    <div className="flex items-center justify-between px-4 py-2 bg-[var(--card)]/50 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <FileCode size={12} className="text-[var(--primary)]" />
                        <span className="text-[9px] font-mono font-bold text-[var(--muted-foreground)] uppercase tracking-widest">
                          {match[1]}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(codeString);
                          const btn = document.activeElement as HTMLButtonElement;
                          if (btn) {
                            const oldText = btn.innerHTML;
                            btn.innerHTML = "COPIED";
                            setTimeout(() => { btn.innerHTML = oldText; }, 2000);
                          }
                        }}
                        className="text-[8px] font-mono font-bold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all uppercase px-2 py-0.5 border border-[var(--border)]"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 w-8 h-full bg-[var(--card)]/20 border-r border-[var(--border)]/30 pointer-events-none" />
                      <SyntaxHighlighter 
                        style={getHighlightStyle(theme)} 
                        language={match[1]} 
                        PreTag="div" 
                        customStyle={{ margin: 0, padding: '1.25rem 1.25rem 1.25rem 2.5rem', background: 'transparent', fontSize: '12px', lineHeight: '1.6', fontFamily: 'var(--font-jetbrains-mono)' }}
                        codeTagProps={{ style: { background: 'transparent' } }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                );
              }
              return <code className={cn("px-1.5 py-0.5 bg-[var(--card)]/40 border border-[var(--border)] rounded-sm text-[var(--primary)] font-mono text-[0.9em]", className)} {...props}>{children}</code>;
            }
          }}
        >
          {showAllChunks ? contentChunks.join("\n\n") : activeChunk || "*_Buffer_Empty_*"}
        </ReactMarkdown>

        {contentChunks.length > 1 && !showAllChunks && (
          <div className="mt-12 flex items-center justify-between border-t border-[var(--border)] pt-8">
            <button 
              disabled={currentChunkIndex === 0}
              onClick={() => { setCurrentChunkIndex(prev => prev - 1); scrollToTop(); }}
              className="flex items-center gap-2 px-3 h-8 border border-[var(--border)] bg-[var(--card)]/20 text-[9px] font-mono font-bold uppercase tracking-widest hover:text-[var(--primary)] disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <CornerDownRight size={12} className="rotate-180" /> Prev_Seg
            </button>

            <div className="flex gap-1.5">
              {contentChunks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentChunkIndex(i); scrollToTop(); }}
                  className={cn(
                    "w-2 h-2 rotate-45 border transition-all",
                    i === currentChunkIndex ? "bg-[var(--primary)] border-[var(--primary)]" : "bg-transparent border-[var(--border)] hover:border-[var(--primary)]/40"
                  )}
                />
              ))}
            </div>

            <button 
              disabled={currentChunkIndex === contentChunks.length - 1}
              onClick={() => { setCurrentChunkIndex(prev => prev + 1); scrollToTop(); }}
              className="flex items-center gap-2 px-3 h-8 bg-[var(--primary)] text-black font-bold text-[9px] font-mono uppercase tracking-widest hover:brightness-110 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Next_Seg <CornerDownRight size={12} />
            </button>
          </div>
        )}

        {showAllChunks && (
          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center">
            <button onClick={() => setShowAllChunks(false)} className="text-[8px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)]">
              Restore_Segmentation
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

MarkdownPreview.displayName = "MarkdownPreview";

export default MarkdownPreview;
