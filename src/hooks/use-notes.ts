"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Note } from "@/types/note";
import { storage } from "@/lib/storage";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load notes on mount
  useEffect(() => {
    async function init() {
      const saved = await storage.getNotes<Note[]>();
      if (saved) {
        setNotes(saved);
      } else {
        const legacy = storage.getLegacyData("notes-app-data");
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            setNotes(parsed);
            await storage.saveNotes(parsed);
          } catch (e) {
            console.error("Migration failed:", e);
          }
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  // Debounced persistence
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      await storage.saveNotes(notes);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [notes]);

  const addNote = useCallback((title = "Untitled Note", content = "") => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      tags: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: Date.now() } : n
      )
    );
  }, []);

  const exportAllNotes = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes));
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = `abyssal_codex_backup_${Date.now()}.json`;
    link.click();
  }, [notes]);

  const importNotes = useCallback((importedNotes: Note[]) => {
    if (Array.isArray(importedNotes)) {
      setNotes(importedNotes);
    }
  }, []);

  return { 
    notes, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite, 
    exportAllNotes, 
    importNotes, 
    isLoading 
  };
}
