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
import { EditorTitle } from "./editor/EditorTitle";
import { EditorTags } from "./editor/EditorTags";
import { EditorFooter } from "./editor/EditorFooter";
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
    
    return deferredAllNotes.filter(n => {
      if (n.id === note.id || !n.content) return false;
      const cleanContent = n.content.replace(/```[\s\S]*?```|`[^`\n]*?`/g, '');
      return cleanContent.includes(wikiLink) || cleanContent.includes(protocolLink);
    });
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

  useEffect(() => {
    const handleTocScroll = (e: any) => {
      const id = e.detail?.id;
      if (editorRef.current && id) {
        const model = editorRef.current.getModel();
        if (!model) return;
        
        const lines = model.getLinesContent();
        const lineIndex = lines.findIndex((line: string) => {
          const match = line.match(/^(#{1,6})\s+(.+)$/);
          if (match) {
            const slug = match[2].toLowerCase().trim()
              .replace(/[^\w\s-]/g, "")
              .replace(/[\s_-]+/g, "-")
              .replace(/^-+|-+$/g, "");
            return slug === id;
          }
          return false;
        });

        if (lineIndex !== -1) {
          editorRef.current.revealLineInCenter(lineIndex + 1);
          editorRef.current.setPosition({ lineNumber: lineIndex + 1, column: 1 });
          editorRef.current.focus();
        }
      }
    };

    const handleTocNavigate = (e: any) => {
      const targetLabel = e.detail?.target?.toLowerCase().trim();
      if (!targetLabel) return;

      const targetNote = allNotes.find((n: Note) => {
        const noteTitle = n.title?.toLowerCase().trim();
        const noteId = n.id?.toLowerCase().trim();
        return noteId === targetLabel || noteTitle === targetLabel || noteTitle?.endsWith('/' + targetLabel);
      });
      if (targetNote) {
        onNavigate?.(targetNote.id);
      }
    };

    window.addEventListener('abyssal-toc-scroll', handleTocScroll);
    window.addEventListener('abyssal-toc-navigate', handleTocNavigate);
    return () => {
      window.removeEventListener('abyssal-toc-scroll', handleTocScroll);
      window.removeEventListener('abyssal-toc-navigate', handleTocNavigate);
    };
  }, [isEditing, editorRef, allNotes, onNavigate]);

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
            }
          }}
          onDownload={handleDownloadMd}
          onToggleEdit={setIsEditing}
          onToggleZen={() => setIsZenMode(!isZenMode)}
          onCopy={() => {
            navigator.clipboard.writeText(content);
            toast("COPIED TO CLIPBOARD", "success");
          }}
          onCommit={() => {
            setIsSaving(true);
            onUpdate(note.id, { title, content });
            setTimeout(() => {
              setIsSaving(false);
              toast("DOCUMENT_COMMITTED_TO_STORAGE", "success");
            }, 800);
          }}
          onUpdateTitle={(newTitle) => {
            setTitle(newTitle);
            debouncedUpdate(note.id, { title: newTitle });
          }}
          isRightSidebarOpen={isRightSidebarOpen}
          onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          isSaving={isSaving}
        />
      )}

      <div className="flex-1 flex overflow-hidden relative group">
        <main 
          onContextMenu={openMenu}
          className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-[var(--background)] border-r border-[var(--border)]"
        >
          <div className={cn("flex flex-col", isEditing ? "h-full" : "min-h-full")}>
            <div className="pt-8 lg:pt-12 px-8 lg:px-12 pb-0">
               <EditorTitle 
                 title={title}
                 onUpdateTitle={(newTitle) => {
                   setTitle(newTitle);
                   debouncedUpdate(note.id, { title: newTitle });
                 }}
               />
               
               <EditorTags 
                 tags={note.tags || []}
                 tagInput={tagInput}
                 setTagInput={setTagInput}
                 onAddTag={handleAddTag}
                 onRemoveTag={(tag) => onUpdate(note.id, { tags: note.tags?.filter(t => t !== tag) })}
               />
            </div>

            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 h-full min-h-0 overflow-hidden">
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
                    className="flex-1 h-auto w-full overflow-visible"
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
                      isScrollable={false}
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
      
      {!isZenMode && <EditorFooter noteId={note.id} />}

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
