"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Note } from "@/types/note";
import { storage } from "@/lib/storage";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    async function init() {
      if (lastUserId.current === (user?.id ?? null)) return;
      
      const isSwitchingUser = lastUserId.current !== undefined && lastUserId.current !== (user?.id ?? null);
      lastUserId.current = user?.id ?? null;

      if (isSwitchingUser) {
        setNotes([]);
        setFolders([]);
        setIsLoading(true);
      }

      // Load Notes
      const savedNotes = await storage.getNotes<Note[]>(user?.id);
      let currentNotes: Note[] = [];
      if (savedNotes) {
        currentNotes = savedNotes;
      }

      // Load Folders
      const savedFolders = await storage.getFolders<string[]>(user?.id);
      if (savedFolders) {
        setFolders(savedFolders);
      }

      // Supabase Sync (Notes only for now)
      if (user) {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("updated_at", { ascending: false });

        if (data && !error) {
          const remoteNotes: Note[] = (data as any[]).map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            isFavorite: n.is_favorite ?? false,
            isPublic: n.is_public ?? false,
            tags: n.tags || [],
            updatedAt: n.updated_at ? new Date(n.updated_at).getTime() : Date.now(),
            createdAt: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
          }));

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

  const saveToStorage = useCallback(async (notesToSave: Note[], foldersToSave: string[]) => {
    await storage.saveNotes(notesToSave, user?.id);
    await storage.saveFolders(foldersToSave, user?.id);
  }, [user]);

  const addNote = useCallback(async (title: string = "Untitled", content: string = "") => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      isFavorite: false,
      tags: [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveToStorage(updatedNotes, folders);

    if (user) {
      const { error } = await supabase.from("notes").insert([{
        id: newNote.id,
        user_id: user.id,
        title: newNote.title,
        content: newNote.content,
        is_favorite: newNote.isFavorite,
        tags: newNote.tags,
        updated_at: new Date(newNote.updatedAt).toISOString(),
        created_at: new Date(newNote.createdAt).toISOString()
      }]);
      if (error) console.error("Cloud Save Error:", error);
    }
    
    return newNote.id;
  }, [notes, folders, user, supabase, saveToStorage]);

  const addFolder = useCallback((path: string) => {
    if (!folders.includes(path)) {
      const updatedFolders = [...folders, path];
      setFolders(updatedFolders);
      saveToStorage(notes, updatedFolders);
    }
  }, [folders, notes, saveToStorage]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map((n) => 
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    setNotes(updatedNotes);
    saveToStorage(updatedNotes, folders);

    if (user) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("notes")
        .update(dbUpdates)
        .eq("id", id);
      if (error) console.error("Cloud Update Error:", error);
    }
  }, [notes, folders, user, supabase, saveToStorage]);

  const deleteNote = useCallback(async (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    saveToStorage(updatedNotes, folders);

    if (user) {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) console.error("Cloud Delete Error:", error);
    }
  }, [notes, folders, user, supabase, saveToStorage]);

  const toggleFavorite = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote(id, { isFavorite: !note.isFavorite });
    }
  }, [notes, updateNote]);

  const togglePublic = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote(id, { isPublic: !note.isPublic });
    }
  }, [notes, updateNote]);

  const exportAllNotes = useCallback(() => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abyssal-docs-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("EXPORT_COMPLETE: [JSON_BUFFER]", "system");
  }, [notes, toast]);

  const importNotes = useCallback(async (importedNotes: Note[]) => {
    const updatedNotes = [...importedNotes, ...notes];
    const uniqueNotes = Array.from(new Map(updatedNotes.map(n => [n.id, n])).values());
    setNotes(uniqueNotes);
    saveToStorage(uniqueNotes, folders);
    toast(`IMPORT_SUCCESS: [${importedNotes.length}_ENTRIES]`, "system");
  }, [notes, folders, saveToStorage, toast]);

  const deleteAllNotes = useCallback(async () => {
    if (!window.confirm("WIPE_ALL_DATA: [CONFIRM_DESTRUCTION?]")) return;
    
    setNotes([]);
    setFolders([]);
    await storage.saveNotes([], user?.id);
    await storage.saveFolders([], user?.id);

    if (user) {
      const { error } = await supabase.from("notes").delete().eq("user_id", user.id);
      if (error) console.error("Cloud Wipe Error:", error);
    }
    
    toast("SYSTEM_WIPE_COMPLETE: [BUFFER_CLEARED]", "system");
  }, [user, supabase, toast]);

  return {
    notes,
    folders,
    isLoading,
    addNote,
    addFolder,
    updateNote,
    deleteNote,
    toggleFavorite,
    togglePublic,
    exportAllNotes,
    importNotes,
    deleteAllNotes,
  };
}
