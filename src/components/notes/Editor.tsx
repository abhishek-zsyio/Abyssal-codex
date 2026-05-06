"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Note } from "@/types/note";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Edit3, Save, Clock, CornerDownRight, Hash, Copy, Check, Star, Download, X, Maximize, Minimize, PanelRight, Trash2, Activity, FileCode, ShieldAlert, FileText, Link, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Editor, { loader } from "@monaco-editor/react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/DataDisplay";
import { StatusIndicator } from "@/components/ui/Feedback";
import { useTheme } from "@/hooks/use-theme";

import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';

if (typeof window !== "undefined") {
  SyntaxHighlighter.registerLanguage('json', json);
  SyntaxHighlighter.registerLanguage('markdown', markdown);
  SyntaxHighlighter.registerLanguage('typescript', typescript);
  SyntaxHighlighter.registerLanguage('javascript', javascript);
  SyntaxHighlighter.registerLanguage('python', python);
  SyntaxHighlighter.registerLanguage('bash', bash);

  loader.config({
    paths: {
      vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs"
    }
  });
}

interface EditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  allNotes?: Note[];
  onNavigate?: (id: string) => void;
}

const EditorHeader = ({
  title,
  id,
  isFavorite,
  isEditing,
  isZenMode,
  copiedContent,
  copiedLink,
  onToggleFavorite,
  onDownload,
  onToggleEdit,
  onToggleZen,
  onCopy,
  onCopyWikiLink,
  onCommit,
  isRightSidebarOpen,
  onToggleRightSidebar
}: any) => (
  <header className="h-auto md:h-14 border-b border-dotted border-[var(--border)] flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 md:px-6 bg-[var(--background)] py-2 md:py-0 gap-3 md:gap-0">
    <div className="flex items-center gap-4 md:gap-6 min-w-0">
      <div className="hidden lg:flex flex-col">
        <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-0.5">Instance_ID</span>
        <span className="text-[10px] font-mono text-[var(--primary)] font-bold">{id.split('-')[0]}</span>
      </div>
      
      <div className="h-6 w-px bg-[var(--border)] hidden lg:block" />

      <div className="flex flex-col min-w-0">
        <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-0.5 hidden md:block">Document_Title</span>
        <h2 className="text-[10px] md:text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest truncate max-w-[200px] md:max-w-[300px]">
          {title || "UNTITLED_CODEX"}
        </h2>
      </div>
    </div>

    <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 md:border-r md:border-[var(--border)] md:pr-4 md:mr-2">
        <Button variant="ghost" size="icon" onClick={onToggleFavorite} className="h-8 w-8 flex-shrink-0">
          <Star size={14} className={cn(isFavorite ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDownload} className="h-8 w-8 flex-shrink-0 hidden sm:flex">
          <Download size={14} className="text-[var(--muted-foreground)]" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleZen} className="h-8 w-8 flex-shrink-0">
          <Maximize size={14} className="text-[var(--muted-foreground)]" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleRightSidebar} 
          className={cn("h-8 w-8 flex-shrink-0 transition-colors hidden xl:flex", isRightSidebarOpen && "text-[var(--primary)] bg-[var(--primary)]/10")}
        >
          <PanelRight size={14} />
        </Button>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div className="flex bg-[var(--card)] border border-[var(--border)] p-0.5 rounded-sm">
          <button 
            onClick={() => onToggleEdit(true)}
            className={cn(
              "px-2 md:px-3 py-1 text-[9px] font-bold uppercase transition-all rounded-sm", 
              isEditing ? "bg-[var(--primary)] text-[var(--background)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            Write
          </button>
          <button 
            onClick={() => onToggleEdit(false)}
            className={cn(
              "px-2 md:px-3 py-1 text-[9px] font-bold uppercase transition-all rounded-sm", 
              !isEditing ? "bg-[var(--primary)] text-[var(--background)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            Read
          </button>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            if (!isEditing) return;
            const editor = (window as any).editorInstance;
            if (editor && typeof editor.getModel === 'function') {
              const model = editor.getModel();
              if (model) {
                const selection = editor.getSelection();
                const text = selection ? model.getValueInRange(selection) : "";
                editor.executeEdits("insert-link", [{
                  range: selection || new (window as any).monaco.Range(1, 1, 1, 1),
                  text: `[[${text}]]`,
                  forceMoveMarkers: true
                }]);
                editor.focus();
              }
            }
          }} 
          className={cn("h-8 w-8 flex-shrink-0", !isEditing && "opacity-30 pointer-events-none")}
          title="Insert Note Link (Wiki Link)"
        >
          <Link size={14} className="text-[var(--muted-foreground)]" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8 flex-shrink-0">
          {copiedContent ? <Check size={14} className="text-[var(--accent)]" /> : <Copy size={14} className="text-[var(--muted-foreground)]" />}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            const link = `[[${title || "Untitled Note"}]]`;
            navigator.clipboard.writeText(link);
            onCopyWikiLink();
          }} 
          className="h-8 w-8 flex-shrink-0"
          title="Copy Wiki Link to Clipboard"
        >
          {copiedLink ? <Check size={14} className="text-[var(--accent)]" /> : <Hash size={14} className="text-[var(--muted-foreground)]" />}
        </Button>

        <Button variant="primary" onClick={onCommit} size="sm" className="h-8 px-3 md:px-5 ml-1">
          Commit
        </Button>
      </div>
    </div>
  </header>
);

const NotesEditor = memo(({ note, onUpdate, onDelete, onToggleFavorite, allNotes = [], onNavigate }: EditorProps) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(true);
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [tagInput, setTagInput] = useState("");
  const [isZenMode, setIsZenMode] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const backlinks = useMemo(() => {
    if (!note.title) return [];
    const wikiLink = `[[${note.title}]]`;
    const protocolLink = `(note://${encodeURIComponent(note.title)})`;
    return allNotes?.filter(n => 
      n.id !== note.id && 
      (n.content?.includes(wikiLink) || n.content?.includes(protocolLink))
    ) || [];
  }, [allNotes, note.title, note.id]);

  const processedContent = useMemo(() => {
    if (!content) return "";
    return content.replace(/\[\[(.*?)\]\]/g, (_, title) => `[${title}](note://${encodeURIComponent(title)})`);
  }, [content]);
  
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const notesRef = useRef<Note[]>(allNotes || []);
  const navigateRef = useRef(onNavigate);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    notesRef.current = allNotes || [];
  }, [allNotes]);

  useEffect(() => {
    navigateRef.current = onNavigate;
  }, [onNavigate]);

  const debouncedUpdate = useCallback((id: string, updates: Partial<Note>) => {
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate(id, updates);
    }, 500);
  }, [onUpdate]);

  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
  }, [note.id]);

  const handleDownloadMd = () => {
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(`# ${title}\n\n${content}`);
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = `${title.replace(/\s+/g, '_') || 'untitled'}.md`;
    link.click();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      onUpdate(note.id, { tags: Array.from(new Set([...(note.tags || []), tagInput.trim()])) });
      setTagInput("");
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    (window as any).monaco = monaco;
    (window as any).editorInstance = editor;
    monaco.editor.defineTheme("gruvbox", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "ebdbb2", background: "111111" },
        { token: "comment", foreground: "928374" },
        { token: "keyword", foreground: "fb4934" },
        { token: "string", foreground: "b8bb26" },
        { token: "number", foreground: "d3869b" },
      ],
      colors: {
        "editor.background": "#111111",
        "editor.foreground": "#ebdbb2",
        "editor.lineHighlightBackground": "#3c3836",
        "editorCursor.foreground": "#fabd2f",
      },
    });
    
    monaco.editor.defineTheme("gruvbox-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "", foreground: "3c3836", background: "fbf1c7" },
        { token: "comment", foreground: "7c6f64" },
        { token: "keyword", foreground: "9d0006" },
        { token: "string", foreground: "79740e" },
        { token: "number", foreground: "8f3f71" },
      ],
      colors: {
        "editor.background": "#fbf1c7",
        "editor.foreground": "#3c3836",
        "editor.lineHighlightBackground": "#ebdbb2",
        "editorCursor.foreground": "#b57614",
      },
    });
    
    monaco.editor.setTheme(theme === "dark" ? "gruvbox" : "gruvbox-light");

    // Register Wiki Link Completion Provider once
    if (!monaco.languages.wikiLinkRegistered) {
      monaco.languages.wikiLinkRegistered = true;
      
      // Completion Provider
      monaco.languages.registerCompletionItemProvider('markdown', {
        triggerCharacters: ['['],
        provideCompletionItems: (model: any, position: any) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: position.column - 2,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });

          if (textUntilPosition === '[[') {
            const suggestions = notesRef.current.map(n => ({
              label: n.title || "UNTITLED",
              kind: monaco.languages.CompletionItemKind.Reference,
              insertText: n.title || "UNTITLED",
              detail: n.id.split('-')[0],
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column
              }
            }));

            return { suggestions };
          }
          return { suggestions: [] };
        }
      });

      // Link Provider (Clickable links in editor)
      monaco.languages.registerLinkProvider('markdown', {
        provideLinks: (model: any) => {
          const links: any[] = [];
          const text = model.getValue();
          
          // Wiki links: [[Note Title]]
          const wikiRegex = /\[\[(.*?)\]\]/g;
          let match;
          while ((match = wikiRegex.exec(text)) !== null) {
            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + match[0].length);
            const title = match[1];
            const targetNote = notesRef.current.find(n => n.title === title);
            
            if (targetNote) {
              links.push({
                range: {
                  startLineNumber: startPos.lineNumber,
                  startColumn: startPos.column,
                  endLineNumber: endPos.lineNumber,
                  endColumn: endPos.column
                },
                url: `note://${encodeURIComponent(title)}`,
                tooltip: `Follow link to: ${title}`
              });
            }
          }

          // Markdown note links: [Text](note://Title)
          const mdRegex = /\[.*?\]\(note:\/\/(.*?)\)/g;
          while ((match = mdRegex.exec(text)) !== null) {
            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + match[0].length);
            const title = decodeURIComponent(match[1]);
            const targetNote = notesRef.current.find(n => n.title === title);

            if (targetNote) {
              links.push({
                range: {
                  startLineNumber: startPos.lineNumber,
                  startColumn: startPos.column,
                  endLineNumber: endPos.lineNumber,
                  endColumn: endPos.column
                },
                url: `note://${match[1]}`,
                tooltip: `Follow link to: ${title}`
              });
            }
          }

          return { links };
        }
      });

      // Intercept link clicks in the editor
      editor.onMouseDown((e: any) => {
        // Check if Cmd/Ctrl is pressed AND it's a link
        if ((e.event.metaKey || e.event.ctrlKey) && e.target.type === 10 /* Link */) {
          const url = e.target.element?.href || e.target.element?.getAttribute('data-href') || e.target.detail?.url?.toString();
          if (url?.startsWith('note://')) {
            e.event.preventDefault();
            e.event.stopPropagation();
            const title = decodeURIComponent(url.replace('note://', ''));
            const targetNote = notesRef.current.find(n => n.title === title);
            if (targetNote) {
              window.dispatchEvent(new CustomEvent('abyssal-log', { 
                detail: { message: `NAVIGATING_TO: [[${title}]] (ID: ${targetNote.id.split('-')[0]})`, type: 'system' } 
              }));
              navigateRef.current?.(targetNote.id);
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    if ((window as any).monaco) {
      (window as any).monaco.editor.setTheme(theme === "dark" ? "gruvbox" : "gruvbox-light");
    }
  }, [theme]);


  return (
    <div className={cn(
      "flex flex-col overflow-hidden bg-[var(--background)]",
      isZenMode ? "fixed inset-0 z-[100]" : "flex-1 h-full"
    )}>
      {isZenMode && (
        <Button 
          variant="warning" 
          size="icon" 
          onClick={() => setIsZenMode(false)}
          className="fixed top-6 right-6 z-[110] shadow-2xl border-[var(--primary)] rounded-full h-12 w-12"
        >
          <X size={20} />
        </Button>
      )}
      {!isZenMode && (
        <EditorHeader 
          title={title} 
          id={note.id} 
          isFavorite={note.isFavorite}
          isEditing={isEditing}
          isZenMode={isZenMode}
          copiedContent={copiedContent}
          copiedLink={copiedLink}
          onToggleFavorite={() => onToggleFavorite?.(note.id)}
          onDownload={handleDownloadMd}
          onToggleEdit={setIsEditing}
          onToggleZen={() => setIsZenMode(!isZenMode)}
          onCopy={() => {
            navigator.clipboard.writeText(content);
            setCopiedContent(true);
            setTimeout(() => setCopiedContent(false), 2000);
          }}
          onCopyWikiLink={() => {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }}
          onCommit={() => onUpdate(note.id, { title, content })}
          isRightSidebarOpen={isRightSidebarOpen}
          onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        />
      )}

      <div className="flex-1 flex overflow-hidden relative group">
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-[var(--card)] border-r border-dotted border-[var(--border)]">
          <div className="h-full flex flex-col">
            <div className="pt-12 lg:pt-20 px-8 lg:px-12 pb-0">
               <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  debouncedUpdate(note.id, { title: e.target.value });
                }}
                className="w-full bg-transparent text-4xl font-bold mb-3 outline-none placeholder:text-[var(--border)] text-[var(--foreground)] tracking-tighter"
                placeholder="TITLE..."
              />
              <div className="flex flex-wrap items-center gap-2 border-b border-dotted border-[var(--border)] pb-3 mb-2">
                {(note.tags || []).map(tag => (
                  <Badge key={tag} variant="success" className="gap-1">
                    <Hash size={8} /> {tag}
                    <button onClick={() => onUpdate(note.id, { tags: note.tags?.filter(t => t !== tag) })} className="hover:text-[var(--destructive)] ml-1">
                      <X size={8} />
                    </button>
                  </Badge>
                ))}
                <input 
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Add Tag..."
                  className="bg-transparent border-none outline-none text-[10px] font-mono text-[var(--muted-foreground)] w-24"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <Editor
                      key={note.id}
                      height="100%"
                      defaultLanguage="markdown"
                      defaultValue={content}
                      theme={theme === "dark" ? "gruvbox" : "gruvbox-light"}
                      onChange={(val) => {
                        setContent(val || "");
                        debouncedUpdate(note.id, { content: val || "" });
                      }}
                      onMount={handleEditorDidMount}
                      options={{ 
                        minimap: { enabled: false }, 
                        fontSize: 16, 
                        fontFamily: "var(--font-jetbrains-mono)", 
                        padding: { top: 20 },
                        automaticLayout: true,
                        wordWrap: "on"
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex-1 h-full w-full overflow-y-auto custom-scrollbar relative bg-[var(--card)]/50 tech-grid selection:bg-[var(--primary)] selection:text-[var(--background)]"
                  >
                    {/* Atmospheric Accents */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.03]" />
                      <div className="absolute top-4 left-4 w-24 h-24 border-l border-t border-[var(--primary)]/30" />
                      <div className="absolute bottom-4 right-4 w-24 h-24 border-r border-b border-[var(--primary)]/30" />
                    </div>

                    <div className="prose px-8 lg:px-16 py-16 max-w-4xl mx-auto relative z-10">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="group">{children}</h1>,
                          h2: ({ children }) => <h2 className="group">{children}</h2>,
                          h3: ({ children }) => <h3 className="group">{children}</h3>,
                          a: ({ href, children, ...props }: any) => {
                            if (href?.startsWith("note://")) {
                              const targetTitle = decodeURIComponent(href.replace("note://", ""));
                              const targetNote = allNotes.find(n => 
                                n.title?.toLowerCase().trim() === targetTitle.toLowerCase().trim()
                              );
                              return (
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (targetNote) {
                                      window.dispatchEvent(new CustomEvent('abyssal-log', { 
                                        detail: { message: `REDIRECTION_PROCEDURE_INITIATED: [[${targetTitle}]]`, type: 'success' } 
                                      }));
                                      onNavigate?.(targetNote.id);
                                    }
                                  }}
                                  className={cn(
                                    "text-[var(--accent)] hover:text-[var(--primary)] border-b border-dashed border-[var(--accent)] hover:border-solid hover:border-[var(--primary)] transition-all font-mono", 
                                    !targetNote && "opacity-50 line-through cursor-not-allowed"
                                  )}
                                  title={targetNote ? `Navigate to ${targetTitle}` : `Note "${targetTitle}" not found`}
                                >
                                  {children}
                                </button>
                              );
                            }
                            return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                          },
                          li: ({ children, checked, ...props }: any) => {
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
                                  {/* Code Block Header */}
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
                                    </div>
                                  </div>
                                  <div className="relative">
                                    {/* Line Number Decoration */}
                                    <div className="absolute top-0 left-0 w-8 h-full bg-[#282828]/30 border-r border-dotted border-[var(--border)] pointer-events-none" />
                                    <SyntaxHighlighter 
                                      style={gruvboxDark} 
                                      language={match[1]} 
                                      PreTag="div" 
                                      customStyle={{ 
                                        margin: 0, 
                                        padding: '1.5rem 1.5rem 1.5rem 2.5rem',
                                        background: 'transparent',
                                        fontSize: '13px',
                                        lineHeight: '1.6',
                                        fontFamily: 'var(--font-mono)'
                                      }}
                                      codeTagProps={{
                                        style: { background: 'transparent' }
                                      }}
                                      {...props}
                                    >
                                      {codeString}
                                    </SyntaxHighlighter>
                                  </div>
                                  {/* Corner Accents */}
                                  <div className="corner-accent corner-tl opacity-20" />
                                  <div className="corner-accent corner-br opacity-20" />
                                </div>
                              );
                            }
                            return <code className={cn(className)} {...props}>{children}</code>;
                          }
                        }}
                      >
                        {processedContent || "*_NO_CONTENT_INITIALIZED_*"}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
        
        {!isZenMode && (
          <AnimatePresence>
            {isRightSidebarOpen && (
              <motion.aside 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-[var(--background)] overflow-y-auto hidden xl:block border-l border-dotted border-[var(--border)] shrink-0 custom-scrollbar"
              >
                <div className="w-[360px] p-8 h-full flex flex-col">
                  <section className="space-y-12">
                    {/* Stats Module */}
                    <div className="relative">
                      <div className="flex items-center justify-between border-b border-dotted border-[var(--border)] pb-2 mb-6">
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] flex items-center gap-2">
                          <Activity size={12} className="text-[var(--primary)]" /> System_Analysis
                        </span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-[var(--primary)] animate-pulse" />
                          <div className="w-4 h-1 bg-[var(--primary)]/20" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Words_Vol", value: content.split(/\s+/).filter(Boolean).length, unit: "WDS", icon: FileText, progress: 65 },
                          { label: "Char_Stream", value: content.length, unit: "CHR", icon: Hash, progress: 40 },
                          { label: "Read_Latency", value: Math.ceil(content.split(/\s+/).length / 200), unit: "MIN", icon: Clock, progress: 25 },
                          { label: "Encryption", value: "MD_CODEX", unit: "", icon: Database, progress: 100 },
                        ].map((stat, idx) => (
                          <div key={idx} className="bg-[var(--card)]/30 border border-[var(--border)] p-3 relative group overflow-hidden transition-all hover:border-[var(--primary)]/30">
                            <div className="corner-accent corner-tl opacity-20" />
                            <div className="corner-accent corner-br opacity-20" />
                            
                            <div className="flex flex-col gap-2 relative z-10">
                              <div className="flex items-center justify-between">
                                <span className="text-[7px] text-[var(--muted-foreground)] font-mono uppercase tracking-widest">{stat.label}</span>
                                <stat.icon size={8} className="text-[var(--primary)] opacity-40" />
                              </div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm text-[var(--primary)] font-mono font-bold leading-none tabular-nums tracking-tighter">
                                  {stat.value}
                                </span>
                                {stat.unit && <span className="text-[7px] text-[var(--muted-foreground)] font-mono uppercase">{stat.unit}</span>}
                              </div>
                              
                              {/* Micro Progress Bar */}
                              <div className="h-[2px] w-full bg-[var(--border)] mt-1 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stat.progress}%` }}
                                  className="h-full bg-[var(--primary)]/40"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
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
                              {!note.createdAt && <span className="text-[8px] text-[var(--destructive)] font-mono animate-pulse">LEGACY_SYNC</span>}
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
                                <div className="w-1 h-1 bg-[var(--primary)] rounded-full animate-ping" />
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
                              <div className="flex items-center gap-2 mb-1">
                                <FileText size={10} className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors" />
                                <span className="text-[10px] font-mono font-bold text-[var(--foreground)] truncate">{linkNote.title || "UNTITLED"}</span>
                              </div>
                              <span className="text-[8px] font-mono text-[var(--muted-foreground)] opacity-50 line-clamp-1 break-all">ID:{linkNote.id.split('-')[0]}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

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
        )}
      </div>
      
      {!isZenMode && (
        <footer className="h-10 border-t border-dotted border-[var(--border)] px-8 flex items-center justify-between text-[10px] font-mono text-[var(--muted-foreground)] bg-[var(--background)]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><Clock size={12} className="text-[var(--primary)]" /> SYSTEM_OK</span>
            <span className="text-[var(--accent)] uppercase">Buffer: Markdown</span>
          </div>
          <StatusIndicator />
        </footer>
      )}
    </div>
  );
});

NotesEditor.displayName = "NotesEditor";

export default NotesEditor;
