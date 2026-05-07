"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo, useDeferredValue } from "react";
import { Note } from "@/types/note";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Edit3, Clock, CornerDownRight, Hash, Copy, Check, Star, Download, X, Maximize, PanelRight, Trash2, Activity, FileCode, ShieldAlert, FileText, Link, Database, Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { gruvboxDark, nord, dracula, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Editor, { loader } from "@monaco-editor/react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/DataDisplay";
import { StatusIndicator } from "@/components/ui/Feedback";
import { useTheme } from "@/hooks/use-theme";
import { usePlugins } from "@/hooks/use-plugins";
import { useToast } from "@/hooks/use-toast";

import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import { splitMarkdown } from "@/utils/markdown-splitter";
import MarkdownPreview from "./MarkdownPreview";

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
  onTogglePublic?: (id: string) => void;
  allNotes?: Note[];
  onNavigate?: (id: string) => void;
  showSidebar?: boolean;
}

const EditorHeader = ({
  title,
  id,
  isFavorite,
  isPublic,
  isEditing,
  isZenMode,
  copiedContent,
  copiedLink,
  copiedShareLink,
  onToggleFavorite,
  onTogglePublic,
  onDownload,
  onToggleEdit,
  onToggleZen,
  onCopy,
  onCopyWikiLink,
  onCopyShareLink,
  onCommit,
  isRightSidebarOpen,
  onToggleRightSidebar,
  isSaving
}: any) => {
  const { isEnabled } = usePlugins();
  return (
  <header className="h-auto md:h-14 border-b border-dotted border-[var(--border)] flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 md:px-6 bg-[var(--background)] py-2 md:py-0 gap-4 md:gap-0">
    <div className="flex items-center gap-4 md:gap-8 min-w-0 flex-1">
      <div className="hidden lg:flex flex-col flex-shrink-0">
        <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-0.5">Instance_ID</span>
        <span className="text-[10px] font-mono text-[var(--primary)] font-bold">{id.split('-')[0]}</span>
      </div>
      
      <div className="h-6 w-px bg-[var(--border)] hidden lg:block opacity-50" />

      <div className="flex flex-col min-w-0 flex-1 max-w-2xl">
        <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-0.5 hidden md:block">Document_Title</span>
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] md:text-[12px] font-bold text-[var(--foreground)] uppercase tracking-widest truncate">
            {String(title || "UNTITLED_CODEX")}
          </h2>
          <AnimatePresence>
            {isSaving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-sm shrink-0"
              >
                <div className="w-1 h-1 bg-[var(--primary)] animate-pulse" />
                <span className="text-[7px] font-mono font-bold text-[var(--primary)] uppercase tracking-widest">Syncing</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4 md:gap-6 shrink-0">
      <div className="flex items-center gap-1 border-x border-[var(--border)] border-dotted px-4 h-10 hidden sm:flex">
        <Button variant="ghost" size="icon" onClick={onToggleFavorite} title="Toggle Favorite" className="h-8 w-8">
          <Star size={14} className={cn(isFavorite ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onTogglePublic} 
          title={isPublic ? "Public Fragment (Click to make Private)" : "Private Fragment (Click to Share & Copy)"} 
          className="h-8 w-8"
        >
          {copiedShareLink ? <Check size={14} className="text-[var(--accent)] animate-bounce" /> : <Globe size={14} className={cn(isPublic ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]")} />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onDownload} title="Download Source" className="h-8 w-8">
          <Download size={14} className="text-[var(--muted-foreground)]" />
        </Button>
        {isEnabled("zen-mode") && (
          <Button variant="ghost" size="icon" onClick={onToggleZen} title="Zen Mode (Cmd+B)" className="h-8 w-8">
            <Maximize size={14} className="text-[var(--muted-foreground)]" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleRightSidebar} 
          className={cn("h-8 w-8 transition-colors hidden xl:flex", isRightSidebarOpen && "text-[var(--primary)] bg-[var(--primary)]/10")}
        >
          <PanelRight size={14} />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-[var(--card)] border border-[var(--border)] p-0.5 rounded-sm overflow-hidden shadow-inner">
          <button 
            onClick={() => onToggleEdit(true)}
            title="Switch to Write Mode"
            className={cn(
              "px-3 py-1.5 transition-all rounded-sm flex items-center justify-center", 
              isEditing ? "bg-[var(--primary)] text-[var(--background)] shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30"
            )}
          >
            <Edit3 size={14} className={isEditing ? "animate-pulse" : ""} />
          </button>
          <button 
            onClick={() => onToggleEdit(false)}
            title="Switch to Read Mode"
            className={cn(
              "px-3 py-1.5 transition-all rounded-sm flex items-center justify-center", 
              !isEditing ? "bg-[var(--primary)] text-[var(--background)] shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30"
            )}
          >
            <Eye size={14} className={!isEditing ? "animate-pulse" : ""} />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 border-l border-[var(--border)] border-dotted pl-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (!isEditing) return;
              const editor = (window as any).editorInstance;
              if (editor) {
                const model = editor.getModel();
                const selection = editor.getSelection();
                const text = selection ? model.getValueInRange(selection) : "";
                editor.executeEdits("insert-link", [{
                  range: selection || new (window as any).monaco.Range(1, 1, 1, 1),
                  text: `[[${text}]]`,
                  forceMoveMarkers: true
                }]);
                editor.focus();
              }
            }} 
            className={cn("h-8 w-8", !isEditing && "opacity-30 pointer-events-none")}
            title="Insert Wiki Link"
          >
            <Link size={14} className="text-[var(--muted-foreground)]" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8" title="Copy Content">
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
            className="h-8 w-8"
            title="Copy Wiki Link"
          >
            {copiedLink ? <Check size={14} className="text-[var(--accent)]" /> : <Hash size={14} className="text-[var(--muted-foreground)]" />}
          </Button>
        </div>

        <Button variant="primary" onClick={onCommit} size="sm" className="h-8 px-5 ml-1 font-bold">
          Commit
        </Button>
      </div>
    </div>
  </header>
  );
};



const MONACO_THEMES: Record<string, string> = {
  dark: "gruvbox",
  light: "gruvbox-light",
  nord: "nord",
  monokai: "monokai",
  cyberpunk: "cyberpunk",
  solarized: "solarized",
  dracula: "dracula",
  onedark: "onedark",
  github: "github",
  catppuccin: "catppuccin",
  "rose-pine": "rose-pine",
  everforest: "everforest",
  "tokyo-night": "tokyo-night",
};

const NotesEditor = memo(({ note, onUpdate, onDelete, onToggleFavorite, onTogglePublic, allNotes = [], onNavigate, showSidebar = true }: EditorProps) => {
  const { theme } = useTheme();
  const { isEnabled, availablePlugins } = usePlugins();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(true);
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [tagInput, setTagInput] = useState("");
  const [isZenMode, setIsZenMode] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(showSidebar);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    setIsRightSidebarOpen(showSidebar);
  }, [showSidebar]);

  const backlinks = useMemo(() => {
    if (!note.title) return [];
    const wikiLink = `[[${note.title}]]`;
    const protocolLink = `(note://${encodeURIComponent(note.title)})`;
    return allNotes?.filter(n => 
      n.id !== note.id && 
      (n.content?.includes(wikiLink) || n.content?.includes(protocolLink))
    ) || [];
  }, [allNotes, note.title, note.id]);
  
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
    setIsSaving(true);
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(async () => {
      await onUpdate(id, updates);
      setIsSaving(false);
    }, 1000);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifier = isMac ? e.metaKey : e.ctrlKey;
      
      // Use Cmd+B (or Ctrl+B) - Industrial/Technical feel
      if (isModifier && e.key.toLowerCase() === 'b' && !e.shiftKey) {
        e.preventDefault();
        if (isEnabled("zen-mode")) {
          setIsZenMode(prev => !prev);
          window.dispatchEvent(new CustomEvent("abyssal-log", {
            detail: { message: `ZEN_MODE_${!isZenMode ? 'ACTIVATED' : 'DEACTIVATED'}`, type: "system" }
          }));
        } else {
          window.dispatchEvent(new CustomEvent("abyssal-log", {
            detail: { message: "ZEN_MODE_ERROR: PLUGIN_NOT_ENABLED_IN_STORE", type: "error" }
          }));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isEnabled, isZenMode]);

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
        "menu.background": "#181818",
        "menu.foreground": "#ebdbb2",
        "menu.selectionBackground": "#3c3836",
        "menu.selectionForeground": "#fabd2f",
        "menu.separatorBackground": "#3c3836",
        "menu.border": "#282828",
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
        "menu.background": "#ebdbb2",
        "menu.foreground": "#3c3836",
        "menu.selectionBackground": "#d5c4a1",
        "menu.selectionForeground": "#b57614",
        "menu.separatorBackground": "#d5c4a1",
        "menu.border": "#d5c4a1",
      },
    });
    
    monaco.editor.defineTheme("nord", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "eceff4", background: "2e3440" },
        { token: "comment", foreground: "616e88" },
        { token: "keyword", foreground: "81a1c1" },
        { token: "string", foreground: "a3be8c" },
        { token: "number", foreground: "b48ead" },
      ],
      colors: {
        "editor.background": "#2e3440",
        "editor.foreground": "#eceff4",
        "editor.lineHighlightBackground": "#3b4252",
        "editorCursor.foreground": "#88c0d0",
      },
    });

    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "f8f8f2", background: "272822" },
        { token: "comment", foreground: "75715e" },
        { token: "keyword", foreground: "f92672" },
        { token: "string", foreground: "e6db74" },
        { token: "number", foreground: "ae81ff" },
      ],
      colors: {
        "editor.background": "#272822",
        "editor.foreground": "#f8f8f2",
        "editor.lineHighlightBackground": "#3e3d32",
        "editorCursor.foreground": "#f8f8f0",
      },
    });

    monaco.editor.defineTheme("cyberpunk", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "00ff9f", background: "0d0221" },
        { token: "comment", foreground: "bc00dd" },
        { token: "keyword", foreground: "f00699" },
        { token: "string", foreground: "ff0055" },
        { token: "number", foreground: "00ff9f" },
      ],
      colors: {
        "editor.background": "#0d0221",
        "editor.foreground": "#00ff9f",
        "editor.lineHighlightBackground": "#120438",
        "editorCursor.foreground": "#f00699",
      },
    });
    
    monaco.editor.defineTheme("solarized", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "839496", background: "002b36" },
        { token: "comment", foreground: "586e75" },
        { token: "keyword", foreground: "b58900" },
        { token: "string", foreground: "2aa198" },
        { token: "number", foreground: "d33682" },
      ],
      colors: {
        "editor.background": "#002b36",
        "editor.foreground": "#839496",
        "editor.lineHighlightBackground": "#073642",
        "editorCursor.foreground": "#268bd2",
      },
    });

    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "f8f8f2", background: "282a36" },
        { token: "comment", foreground: "6272a4" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
      ],
      colors: {
        "editor.background": "#282a36",
        "editor.foreground": "#f8f8f2",
        "editor.lineHighlightBackground": "#44475a",
        "editorCursor.foreground": "#f8f8f0",
      },
    });

    monaco.editor.defineTheme("onedark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "abb2bf", background: "282c34" },
        { token: "comment", foreground: "5c6370" },
        { token: "keyword", foreground: "c678dd" },
        { token: "string", foreground: "98c379" },
        { token: "number", foreground: "d19a66" },
      ],
      colors: {
        "editor.background": "#282c34",
        "editor.foreground": "#abb2bf",
        "editor.lineHighlightBackground": "#2c313a",
        "editorCursor.foreground": "#528bff",
      },
    });

    monaco.editor.defineTheme("github", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "c9d1d9", background: "0d1117" },
        { token: "comment", foreground: "8b949e" },
        { token: "keyword", foreground: "ff7b72" },
        { token: "string", foreground: "a5d6ff" },
        { token: "number", foreground: "79c0ff" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#c9d1d9",
        "editor.lineHighlightBackground": "#161b22",
        "editorCursor.foreground": "#58a6ff",
      },
    });

    monaco.editor.defineTheme("catppuccin", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "cdd6f4", background: "1e1e2e" },
        { token: "comment", foreground: "6c7086" },
        { token: "keyword", foreground: "cba6f7" },
        { token: "string", foreground: "a6e3a1" },
        { token: "number", foreground: "fab387" },
      ],
      colors: {
        "editor.background": "#1e1e2e",
        "editor.foreground": "#cdd6f4",
        "editor.lineHighlightBackground": "#313244",
        "editorCursor.foreground": "#cba6f7",
      },
    });

    monaco.editor.defineTheme("rose-pine", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "e0def4", background: "191724" },
        { token: "comment", foreground: "6e6a86" },
        { token: "keyword", foreground: "ebbcba" },
        { token: "string", foreground: "f6c177" },
        { token: "number", foreground: "9ccfd8" },
      ],
      colors: {
        "editor.background": "#191724",
        "editor.foreground": "#e0def4",
        "editor.lineHighlightBackground": "#1f1d2e",
        "editorCursor.foreground": "#ebbcba",
      },
    });

    monaco.editor.defineTheme("everforest", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "d3c6aa", background: "2d353b" },
        { token: "comment", foreground: "7a8478" },
        { token: "keyword", foreground: "a7c080" },
        { token: "string", foreground: "e67e80" },
        { token: "number", foreground: "d699b6" },
      ],
      colors: {
        "editor.background": "#2d353b",
        "editor.foreground": "#d3c6aa",
        "editor.lineHighlightBackground": "#343f44",
        "editorCursor.foreground": "#a7c080",
      },
    });

    monaco.editor.defineTheme("tokyo-night", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "a9b1d6", background: "1a1b26" },
        { token: "comment", foreground: "565f89" },
        { token: "keyword", foreground: "bb9af7" },
        { token: "string", foreground: "9ece6a" },
        { token: "number", foreground: "ff9e64" },
      ],
      colors: {
        "editor.background": "#1a1b26",
        "editor.foreground": "#a9b1d6",
        "editor.lineHighlightBackground": "#24283b",
        "editorCursor.foreground": "#bb9af7",
      },
    });
    
    monaco.editor.setTheme(MONACO_THEMES[theme] || theme);

      // Register Wiki Link Completion Provider once
      try {
        if (!monaco.languages.wikiLinkRegistered) {
          monaco.languages.wikiLinkRegistered = true;
          
          monaco.languages.registerCompletionItemProvider('markdown', {
            triggerCharacters: ['['],
            provideCompletionItems: (model: any, position: any) => {
              const lineContent = model.getLineContent(position.lineNumber);
              const textBeforeCursor = lineContent.substring(0, position.column - 1);
              
              if (textBeforeCursor.endsWith('[[')) {
                const suggestions = (notesRef.current || []).map(n => ({
                  label: n.title || "UNTITLED",
                  kind: monaco.languages.CompletionItemKind.Reference,
                  insertText: n.title || "UNTITLED",
                  detail: `Note ID: ${n.id?.split('-')[0] || '?'}`,
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
              if (!text) return { links: [] };
              
              // Wiki links: [[Note Title]]
              const wikiRegex = /\[\[(.*?)\]\]/g;
              let match;
              while ((match = wikiRegex.exec(text)) !== null) {
                const startPos = model.getPositionAt(match.index);
                const endPos = model.getPositionAt(match.index + match[0].length);
                const title = match[1];
                
                const targetNote = (notesRef.current || []).find(n => 
                  n.title?.toLowerCase().trim() === title.toLowerCase().trim()
                );
                
                if (targetNote) {
                  links.push({
                    range: {
                      startLineNumber: startPos.lineNumber,
                      startColumn: startPos.column,
                      endLineNumber: endPos.lineNumber,
                      endColumn: endPos.column
                    },
                    url: `note://${encodeURIComponent(title)}`,
                    tooltip: `Cmd/Ctrl + Click to follow: ${title}`
                  });
                }
              }

              // Markdown note links: [Text](note://Title)
              const mdRegex = /\[.*?\]\(note:\/\/(.*?)\)/g;
              while ((match = mdRegex.exec(text)) !== null) {
                const startPos = model.getPositionAt(match.index);
                const endPos = model.getPositionAt(match.index + match[0].length);
                const titleMatch = match[1];
                const title = titleMatch ? decodeURIComponent(titleMatch) : "";
                
                const targetNote = (notesRef.current || []).find(n => 
                  n.title?.toLowerCase().trim() === title.toLowerCase().trim()
                );

                if (targetNote) {
                  links.push({
                    range: {
                      startLineNumber: startPos.lineNumber,
                      startColumn: startPos.column,
                      endLineNumber: endPos.lineNumber,
                      endColumn: endPos.column
                    },
                    url: `note://${titleMatch}`,
                    tooltip: `Cmd/Ctrl + Click to follow: ${title}`
                  });
                }
              }

              return { links };
            }
          });
        }
      } catch (err) {
        console.error("LinkProvider registration failed:", err);
      }

      // Intercept link clicks in the editor
      try {
        if (editor && typeof editor.onDidClickLink === 'function') {
          editor.onDidClickLink((e: any) => {
            const url = e?.url?.toString();
            if (url && url.includes('note:')) {
              const parts = url.split("note:");
              const titlePart = parts[parts.length - 1];
              if (!titlePart) return;
              
              const title = decodeURIComponent(titlePart.replace(/^\/\//, ""));
              
              const targetNote = (notesRef.current || []).find(n => 
                n.title?.toLowerCase().trim() === title.toLowerCase().trim()
              );

              if (targetNote) {
                window.dispatchEvent(new CustomEvent('abyssal-log', { 
                  detail: { message: `NAVIGATING_TO: [[${title}]]`, type: 'system' } 
                }));
                navigateRef.current?.(targetNote.id);
              }
            }
          });
        }

        if (editor && typeof editor.onMouseDown === 'function') {
          editor.onMouseDown((e: any) => {
            const isLink = e?.target?.type === 10; /* Link */
            if (!isLink) return;

            const url = e.target.url?.toString() || e.target.element?.href || e.target.element?.getAttribute('data-href');
            const isNoteLink = url && url.includes('note:');
            
            if (isNoteLink) {
              const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
              const modifierPressed = e.event?.metaKey || e.event?.ctrlKey;

              if (!modifierPressed) {
                window.dispatchEvent(new CustomEvent('abyssal-log', { 
                  detail: { message: `HINT: USE ${isMac ? 'CMD' : 'CTRL'}+CLICK TO FOLLOW LINK`, type: 'system' } 
                }));
              }
            }
          });
        }
      } catch (err) {
        console.error("Editor link interception failed:", err);
      }
  };

  useEffect(() => {
    if ((window as any).monaco) {
      const monacoTheme = MONACO_THEMES[theme] || theme;
      (window as any).monaco.editor.setTheme(monacoTheme);
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
          isPublic={note.isPublic}
          isEditing={isEditing}
          isZenMode={isZenMode}
          copiedContent={copiedContent}
          copiedLink={copiedLink}
          copiedShareLink={copiedShareLink}
          onToggleFavorite={() => onToggleFavorite?.(note.id)}
          onTogglePublic={() => {
            const newState = !note.isPublic;
            onTogglePublic?.(note.id);
            if (newState) {
              const origin = typeof window !== 'undefined' && window.location.origin.startsWith('http') 
                ? window.location.origin 
                : 'http://localhost:3000';
              const shareUrl = `${origin}/share/${note.id}`;
              navigator.clipboard.writeText(shareUrl);
              setCopiedShareLink(true);
              toast("PUBLIC & COPIED TO CLIPBOARD", "success");
              setTimeout(() => setCopiedShareLink(false), 2000);
            } else {
              toast("FRAGMENT_SET_TO_PRIVATE", "system");
            }
          }}
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
          onCommit={() => {
            setIsSaving(true);
            onUpdate(note.id, { title, content });
            // Simulate a brief commit process for better UX/Technical feel
            setTimeout(() => {
              setIsSaving(false);
              toast("DOCUMENT_COMMITTED_TO_STORAGE", "success");
            }, 800);
          }}
          isRightSidebarOpen={isRightSidebarOpen}
          onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          isSaving={isSaving}
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
                      theme={MONACO_THEMES[theme] || theme}
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
                        wordWrap: "on",
                        contextmenu: false,
                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex-1 h-full w-full overflow-hidden"
                  >
                    <MarkdownPreview 
                      content={content} 
                      allNotes={allNotes}
                      onNavigate={onNavigate}
                      theme={theme}
                      isEnabled={isEnabled}
                      availablePlugins={availablePlugins}
                    />
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
                className="bg-[var(--background)] overflow-y-auto overflow-x-hidden hidden xl:block border-l border-dotted border-[var(--border)] shrink-0 custom-scrollbar"
              >
                <div className="w-[360px] p-8 h-full flex flex-col">
                  <section className="space-y-12">
                    {/* Stats Module */}
                    {isEnabled("stats-plugin") && (
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
                    )}

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
