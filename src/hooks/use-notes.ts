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

      // Supabase Sync (Notes & Folders)
      if (user) {
        const [notesRes, foldersRes] = await Promise.all([
          supabase.from("notes").select("*").order("updated_at", { ascending: false }),
          supabase.from("folders").select("path")
        ]);

        if (notesRes.data && !notesRes.error) {
          const remoteNotes: Note[] = (notesRes.data as any[]).map((n) => ({
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

        if (foldersRes.data && !foldersRes.error) {
          const remoteFolders = foldersRes.data.map(f => f.path);
          setFolders(prev => Array.from(new Set([...prev, ...remoteFolders])));
        } else if (foldersRes.error) {
          console.error("Cloud Folder Fetch Error:", foldersRes.error);
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

  const addFolder = useCallback(async (path: string) => {
    if (!folders.includes(path)) {
      const updatedFolders = [...folders, path];
      setFolders(updatedFolders);
      saveToStorage(notes, updatedFolders);

      if (user) {
        const { error } = await supabase.from("folders").insert([{ user_id: user.id, path }]);
        if (error) {
          console.error("Cloud Folder Insert Error:", error);
          toast(`SYNC_ERROR: [FOLDER_CREATION_FAILED]`, "system");
        }
      }
    }
  }, [folders, notes, saveToStorage, user, supabase, toast]);

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

  const renameFolder = useCallback(async (oldPath: string, newPath: string) => {
    const notesToUpdate = notes.filter(n => n.title.startsWith(oldPath + "/") || n.title === oldPath);
    const updatedNotes = notes.map(n => {
      if (n.title.startsWith(oldPath + "/") || n.title === oldPath) {
        const relativePath = n.title.substring(oldPath.length);
        return { ...n, title: `${newPath}${relativePath}`, updatedAt: Date.now() };
      }
      return n;
    });

    const updatedFolders = folders.map(f => {
      if (f.startsWith(oldPath + "/") || f === oldPath) {
        const relativePath = f.substring(oldPath.length);
        return `${newPath}${relativePath}`;
      }
      return f;
    });

    setNotes(updatedNotes);
    setFolders(updatedFolders);
    saveToStorage(updatedNotes, updatedFolders);

    if (user) {
      // Bulk update in Supabase
      for (const note of notesToUpdate) {
        const relativePath = note.title.substring(oldPath.length);
        const newTitle = `${newPath}${relativePath}`;
        await supabase.from("notes").update({ title: newTitle, updated_at: new Date().toISOString() }).eq("id", note.id);
      }
      // Update folder record
      const { error } = await supabase.from("folders").update({ path: newPath }).eq("path", oldPath).eq("user_id", user.id);
      if (error) console.error("Cloud Folder Rename Error:", error);
    }
  }, [notes, folders, user, supabase, saveToStorage]);

  const deleteFolder = useCallback(async (path: string) => {
    if (!window.confirm(`WIPE_CLUSTER: [${path}] AND_ALL_INTERNAL_DATA?`)) return;

    const updatedNotes = notes.filter(n => !n.title.startsWith(path + "/") && n.title !== path);
    const updatedFolders = folders.filter(f => !f.startsWith(path + "/") && f !== path);

    setNotes(updatedNotes);
    setFolders(updatedFolders);
    saveToStorage(updatedNotes, updatedFolders);

    if (user) {
      await supabase.from("notes").delete().like("title", `${path}/%`);
      await supabase.from("notes").delete().eq("title", path);
      const { error } = await supabase.from("folders").delete().eq("path", path).eq("user_id", user.id);
      if (error) console.error("Cloud Folder Delete Error:", error);
    }

    toast(`CLUSTER_DELETED: [${path}]`, "system");
  }, [notes, folders, user, supabase, saveToStorage, toast]);

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
