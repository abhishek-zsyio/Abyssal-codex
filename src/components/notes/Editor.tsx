"use client";

import React, { useState, useEffect, useCallback, useMemo, memo, useDeferredValue } from "react";
import { Note } from "@/types/note";
import { Hash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { loader } from "@monaco-editor/react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/DataDisplay";
import { useTheme } from "@/hooks/use-theme";
import { usePlugins } from "@/hooks/use-plugins";
import { useToast } from "@/hooks/use-toast";
import { useContextMenu } from "@/hooks/use-context-menu";

import MarkdownPreview from "./MarkdownPreview";
import { EditorHeader } from "./editor/EditorHeader";
import { EditorSidebar } from "./editor/EditorSidebar";
import { EditorContextMenu } from "./editor/EditorContextMenu";
import { useEditorMonaco, MONACO_THEMES } from "@/hooks/use-editor-monaco";

if (typeof window !== "undefined") {
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
  const deferredContent = useDeferredValue(content);
  const { isOpen, x, y, openMenu, closeMenu } = useContextMenu();
  const [hasSelection, setHasSelection] = useState(false);
  
  useEffect(() => {
    setIsRightSidebarOpen(showSidebar);
  }, [showSidebar]);

  const deferredAllNotes = useDeferredValue(allNotes);
  const deferredTitle = useDeferredValue(note.title);

  const backlinks = useMemo(() => {
    if (!deferredTitle || !deferredAllNotes) return [];
    const wikiLink = `[[${deferredTitle}]]`;
    const protocolLink = `(note://${encodeURIComponent(deferredTitle)})`;
    return deferredAllNotes.filter(n => 
      n.id !== note.id && 
      (n.content?.includes(wikiLink) || n.content?.includes(protocolLink))
    );
  }, [deferredAllNotes, deferredTitle, note.id]);
  
  const { editorRef, handleEditorDidMount } = useEditorMonaco(
    theme, 
    allNotes, 
    onNavigate, 
    setHasSelection, 
    openMenu
  );

  const updateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

  return (
    <div className={cn(
      "flex flex-col overflow-hidden bg-[var(--background)] relative",
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
          onCopyShareLink={() => {}} // Placeholder if needed
          onCommit={() => {
            setIsSaving(true);
            onUpdate(note.id, { title, content });
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
        <main 
          onContextMenu={openMenu}
          className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-[var(--card)] border-r border-dotted border-[var(--border)]"
        >
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
                      content={deferredContent} 
                      title={deferredTitle}
                      note={note}
                      allNotes={allNotes}
                      onNavigate={onNavigate}
                      theme={theme}
                      isEnabled={isEnabled}
                      availablePlugins={availablePlugins}
                      onContextMenu={openMenu}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
        
        {!isZenMode && (
          <EditorSidebar 
            isOpen={isRightSidebarOpen}
            content={content}
            note={note}
            backlinks={backlinks}
            isEnabled={isEnabled}
            onNavigate={onNavigate}
            onDelete={onDelete}
          />
        )}
      </div>
      
      {!isZenMode && (
        <footer className="h-10 border-t border-dotted border-[var(--border)] px-8 flex items-center justify-between text-[10px] font-mono text-[var(--muted-foreground)] bg-[var(--background)]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">OK SYSTEM_OK</span>
            <span className="text-[var(--accent)] uppercase">Buffer: Markdown</span>
          </div>
        </footer>
      )}

      <EditorContextMenu 
        isOpen={isOpen}
        x={x}
        y={y}
        onClose={closeMenu}
        isEditing={isEditing}
        hasSelection={hasSelection}
        editorRef={editorRef}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onDelete={() => {
          if (confirm("Are you sure you want to permanently purge this data stream?")) {
            onDelete(note.id);
          }
        }}
        toast={toast}
      />
    </div>
  );
});

NotesEditor.displayName = "NotesEditor";

export default NotesEditor;
