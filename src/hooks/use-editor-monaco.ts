"use client";

import { useRef, useCallback, useEffect } from "react";
import { Note } from "@/types/note";

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
};

export const useEditorMonaco = (
  theme: string,
  allNotes: Note[],
  onNavigate?: (id: string) => void,
  setHasSelection?: (has: boolean) => void,
  openMenu?: (e: any) => void
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
