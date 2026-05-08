"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Note } from "@/types/note";
import { storage } from "@/lib/storage";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  // Load notes on mount and handle user switching
  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    async function init() {
      // Avoid re-running if user hasn't changed
      if (lastUserId.current === (user?.id ?? null)) return;
      
      const isSwitchingUser = lastUserId.current !== undefined && lastUserId.current !== (user?.id ?? null);
      lastUserId.current = user?.id ?? null;

      // 1. If switching accounts, clear current memory state to prevent cross-contamination
      if (isSwitchingUser) {
        setNotes([]);
        setIsLoading(true);
      }

      // 2. Load from Local Storage (User-Specific)
      const saved = await storage.getNotes<Note[]>(user?.id);
      let currentNotes: Note[] = [];

      if (saved) {
        currentNotes = saved;
      } else {
        const legacy = storage.getLegacyData("notes-app-data");
        if (legacy && !user) { // Only migrate legacy data to guest session
          try {
            currentNotes = JSON.parse(legacy);
            await storage.saveNotes(currentNotes);
          } catch (e) {
            console.error("Migration failed:", e);
          }
        }
      }

      // 3. If logged in, fetch from Supabase and merge
      if (user) {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("updated_at", { ascending: false });

        if (data && !error) {
          const remoteNotes: Note[] = data.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            isFavorite: n.is_favorite,
            isPublic: n.is_public,
            tags: n.tags || [],
            updatedAt: n.updated_at ? new Date(n.updated_at).getTime() : Date.now(),
            createdAt: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
          }));

          // Merge: remote wins, but keep local-only notes if they belong to this session
          setNotes(() => {
            const localOnly = currentNotes.filter(ln => !remoteNotes.find(rn => rn.id === ln.id));
            return [...remoteNotes, ...localOnly];
          });
        } else {
          setNotes(currentNotes);
        }
      } else {
        setNotes(currentNotes);
      }
      
      setIsLoading(false);
    }
    init();
  }, [user, supabase]);

  // Sync to Supabase helper
  const syncToCloud = useCallback(async (notesToSync: Note[]) => {
    if (!user) return;

    // Filter for valid UUIDs to prevent Supabase errors with legacy IDs
    const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    const upsertData = notesToSync
      .filter(n => validUuidRegex.test(n.id))
      .map(n => ({
        id: n.id,
        user_id: user.id,
        title: n.title,
        content: n.content,
        is_favorite: n.isFavorite,
        is_public: n.isPublic,
        tags: n.tags,
        updated_at: new Date(n.updatedAt || Date.now()).toISOString(),
        created_at: new Date(n.createdAt || Date.now()).toISOString(),
      }));

    if (upsertData.length === 0) return;

    const { error } = await supabase
      .from("notes")
      .upsert(upsertData, { onConflict: "id" });

    if (error) {
      toast(`Cloud sync failed: ${error.message || "Unknown error"}`, "error");
      console.error("Cloud Sync Error Details:", error);
    }
  }, [user, supabase]);

  // Debounced persistence
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      await storage.saveNotes(notes, user?.id);
      if (user) {
        await syncToCloud(notes);
      }
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
    toast(`Note created: ${title}`, "success");
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      )
    );
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (user) {
      await supabase.from("notes").delete().eq("id", id);
    }
    toast("Note deleted successfully", "system");
  }, [user, supabase, toast]);

  const togglePublic = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isPublic: !n.isPublic, updatedAt: Date.now() } : n
      )
    );
    const note = notes.find(n => n.id === id);
    if (note) {
      const newState = !note.isPublic;
      toast(newState ? "Note is now PUBLIC" : "Note is now PRIVATE", "system");
    }
  }, [notes, toast]);

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
    toast("Backup exported successfully", "success");
  }, [notes, toast]);

  const importNotes = useCallback((importedNotes: Note[]) => {
    if (Array.isArray(importedNotes)) {
      setNotes(importedNotes);
      toast(`Imported ${importedNotes.length} notes`, "success");
    }
  }, [toast]);

  return { 
    notes, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite, 
    togglePublic,
    exportAllNotes, 
    importNotes, 
    isLoading 
  };
}
