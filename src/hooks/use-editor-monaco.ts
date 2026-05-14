"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */


import { useRef, useCallback, useEffect } from "react";
import { Note } from "@/types/note";
import { MONACO_THEME_DEFINITIONS } from "@/lib/monaco-themes";

export const MONACO_THEMES: Record<string, string> = {
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
  "tokyo-night-light": "tokyo-night-light",
  ayu: "ayu",
  synthwave: "synthwave",
  "night-owl": "night-owl",
  cobalt2: "cobalt2",
  "gruvbox-material": "gruvbox-material",
};

export const useEditorMonaco = (
  theme: string,
  allNotes: Note[],
  onNavigate?: (id: string) => void,
  setHasSelection?: (has: boolean) => void,
  openMenu?: (e: React.MouseEvent | MouseEvent) => void
) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const notesRef = useRef<Note[]>(allNotes || []);
  const navigateRef = useRef<(id: string) => void>(onNavigate || (() => {}));
  const openMenuRef = useRef(openMenu);
  const setHasSelectionRef = useRef(setHasSelection);

  useEffect(() => {
    notesRef.current = allNotes || [];
  }, [allNotes]);

  useEffect(() => {
    navigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    openMenuRef.current = openMenu;
  }, [openMenu]);

  useEffect(() => {
    setHasSelectionRef.current = setHasSelection;
  }, [setHasSelection]);

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    (window as any).monaco = monaco;
    (window as any).editorInstance = editor;

    // Define Themes
    Object.entries(MONACO_THEME_DEFINITIONS).forEach(([name, def]) => {
      monaco.editor.defineTheme(name, def);
    });
    
    monaco.editor.setTheme(MONACO_THEMES[theme] || theme);

    // Register Wiki Link Completion Provider
    try {
      monaco.languages.registerCompletionItemProvider('plaintext', {
        triggerCharacters: ['@', '{'],
        provideCompletionItems: (model: any, position: any) => {
          const lineContent = model.getLineContent(position.lineNumber);
          const textBeforeCursor = lineContent.substring(0, position.column - 1);
          
          // Check if we are inside @{... or just starting with @
          const match = textBeforeCursor.match(/@\{?([^@}]*)$/);
          if (!match) return { suggestions: [] };

          const hasBrace = textBeforeCursor.includes('@{');
          const word = match[1]; // What the user has typed so far
          
          const noteSuggestions = (notesRef.current || []).map(n => ({
            label: `@{${n.title}}`,
            kind: monaco.languages.CompletionItemKind.Reference,
            insertText: hasBrace ? `${n.title}}` : `{${n.title}}`,
            detail: `Path: ${n.title}`,
            documentation: n.title,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column - word.length,
              endColumn: position.column
            }
          }));

          return { suggestions: noteSuggestions };
        }
      });

      monaco.languages.registerCompletionItemProvider('markdown', {
        triggerCharacters: ['@', '{'],
        provideCompletionItems: (model: any, position: any) => {
          const lineContent = model.getLineContent(position.lineNumber);
          const textBeforeCursor = lineContent.substring(0, position.column - 1);
          
          // Check if we are inside @{... or just starting with @
          const match = textBeforeCursor.match(/@\{?([^@}]*)$/);
          if (!match) return { suggestions: [] };

          const hasBrace = textBeforeCursor.includes('@{');
          const word = match[1]; // What the user has typed so far
          
          const noteSuggestions = (notesRef.current || []).map(n => ({
            label: `@{${n.title}}`,
            kind: monaco.languages.CompletionItemKind.Reference,
            insertText: hasBrace ? `${n.title}}` : `{${n.title}}`,
            detail: `Path: ${n.title}`,
            documentation: n.title,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column - word.length,
              endColumn: position.column
            }
          }));

          // Add some helpful markdown snippets
          const snippets = [
            {
              label: "table",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "| HEADER_1 | HEADER_2 |\n| :--- | :--- |\n| DATA_1 | DATA_2 |",
              insertTextRules: monaco.languages.CompletionItemInsertRules?.InsertAsSnippet ?? 4,
              detail: "Insert Markdown Table",
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - word.length,
                endColumn: position.column
              }
            },
            {
              label: "code",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "```${1:language}\n${2:code_segment}\n```",
              insertTextRules: monaco.languages.CompletionItemInsertRules?.InsertAsSnippet ?? 4,
              detail: "Insert Code Block",
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - word.length,
                endColumn: position.column
              }
            },
            {
              label: "diagnostic",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "## DIAGNOSTIC_REPORT\nSTATUS: ${1:OK}\nTIMESTAMP: ${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}\n\n${2:Details...}",
              insertTextRules: monaco.languages.CompletionItemInsertRules?.InsertAsSnippet ?? 4,
              detail: "Technical Diagnostic Template",
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - word.length,
                endColumn: position.column
              }
            }
          ];

          return { suggestions: [...noteSuggestions, ...snippets] };
        }
      });

      // Link Provider (Clickable links in editor)
      monaco.languages.registerLinkProvider('markdown', {
        provideLinks: (model: any) => {
          const links: any[] = [];
          const text = model.getValue();
          if (!text) return { links: [] };
          
          const combinedRegex = /(?:```[\s\S]*?```|`[^`\n]*?`|@\{([\s\S]*?)\}|\[.*?\]\(note:\/\/(.*?)\))/g;
          
          let match;
          while ((match = combinedRegex.exec(text)) !== null) {
            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + match[0].length);
            
            if (match[1] !== undefined) {
              const content = match[1];
              let target = content;
              if (content.includes('|')) {
                target = content.split('|')[0].trim();
              }
              
              const targetLower = target.toLowerCase().trim();
              const targetNote = (notesRef.current || []).find(n => {
                const noteTitle = n.title?.toLowerCase().trim();
                const noteId = n.id?.toLowerCase().trim();
                return noteId === targetLower || noteTitle === targetLower || noteTitle?.endsWith('/' + targetLower);
              });
              
              if (targetNote) {
                links.push({
                  range: {
                    startLineNumber: startPos.lineNumber,
                    startColumn: startPos.column,
                    endLineNumber: endPos.lineNumber,
                    endColumn: endPos.column
                  },
                  url: `note://${encodeURIComponent(target)}`,
                  tooltip: `Cmd/Ctrl + Click to follow: ${target}`
                });
              }
            } 
            else if (match[2] !== undefined) {
              const titleMatch = match[2];
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
          }

          return { links };
        }
      });
    } catch (err) {
      console.error("Provider registration failed:", err);
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
            const targetLower = title.toLowerCase().trim();
            
            const targetNote = (notesRef.current || []).find(n => {
              const noteTitle = n.title?.toLowerCase().trim();
              const noteId = n.id?.toLowerCase().trim();
              return noteId === targetLower || noteTitle === targetLower || noteTitle?.endsWith('/' + targetLower);
            });

            if (targetNote) {
              window.dispatchEvent(new CustomEvent('abyssal-log', { 
                detail: { message: `NAVIGATING_TO: @{${title}}`, type: 'system' } 
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

    // Context Menu Interception
    if (editor) {
      editor.onContextMenu((e: any) => {
        // Check for selection
        const selection = editor.getSelection();
        setHasSelectionRef.current?.(selection && !selection.isEmpty());
        
        if (e.event && e.event.browserEvent) {
          openMenuRef.current?.(e.event.browserEvent);
        }
      });

      editor.onDidChangeCursorSelection(() => {
        const selection = editor.getSelection();
        setHasSelectionRef.current?.(selection && !selection.isEmpty());
      });
    }
  }, [theme]); // Only depend on theme for defining/setting theme

  useEffect(() => {
    if ((window as any).monaco) {
      const monacoTheme = MONACO_THEMES[theme] || theme;
      (window as any).monaco.editor.setTheme(monacoTheme);
    }
  }, [theme]);

  return {
    editorRef,
    monacoRef,
    handleEditorDidMount
  };
};
