"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Note } from "@/types/note";
import { storage } from "@/lib/storage";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { encryptNote, decryptNote } from "@/utils/encryption";
import { updateLinksInContent } from "@/utils/wiki-links";

import { supabaseService } from "@/lib/supabase-service";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const lastUserId = useRef<string | null | undefined>(undefined);
  const pendingSyncRef = useRef<{ notes: Note[], folders: string[] } | null>(null);

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

      // Load Local Storage
      const savedNotes = await storage.getNotes<Note[]>(user?.id);
      let currentNotes: Note[] = [];
      if (savedNotes) {
        currentNotes = await Promise.all(savedNotes.map(async n => ({
          ...n,
          content: await decryptNote(n.content || "", user?.id)
        })));
      }

      const savedFolders = await storage.getFolders<string[]>(user?.id);
      if (savedFolders) setFolders(savedFolders);

      // Cloud Sync
      if (user) {
        try {
          const [remoteNotes, remoteFolders] = await Promise.all([
            supabaseService.fetchNotes(supabase, user.id),
            supabaseService.fetchFolders(supabase)
          ]);

          setNotes(() => {
            const merged = [...remoteNotes];
            currentNotes.forEach(localNote => {
              const remoteNoteIndex = merged.findIndex(rn => rn.id === localNote.id);
              if (remoteNoteIndex === -1) {
                merged.push(localNote);
              } else {
                if (localNote.updatedAt > merged[remoteNoteIndex].updatedAt) {
                  merged[remoteNoteIndex] = localNote;
                }
              }
            });
            return merged;
          });
          setFolders(prev => Array.from(new Set([...prev, ...remoteFolders])));
        } catch (error) {
          console.error("Cloud Fetch Error:", error);
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
    pendingSyncRef.current = { notes: notesToSave, folders: foldersToSave };
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      const syncData = pendingSyncRef.current;
      if (!syncData) return;
      
      const encryptedNotes = await Promise.all(syncData.notes.map(async n => ({
        ...n,
        content: await encryptNote(n.content, user?.id)
      })));

      await storage.saveNotes(encryptedNotes, user?.id);
      await storage.saveFolders(syncData.folders, user?.id);
      saveTimeoutRef.current = null;
      pendingSyncRef.current = null;
    }, 2000);
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
      try {
        await supabaseService.upsertNote(supabase, user.id, newNote);
      } catch (error) {
        console.error("Cloud Save Error:", error);
      }
    }
    return newNote.id;
  }, [notes, folders, user, supabase, saveToStorage]);

  const addFolder = useCallback(async (path: string) => {
    if (!folders.includes(path)) {
      const updatedFolders = [...folders, path];
      setFolders(updatedFolders);
      saveToStorage(notes, updatedFolders);

      if (user) {
        try {
          await supabaseService.upsertFolder(supabase, user.id, path);
        } catch (error) {
          console.error("Cloud Folder Insert Error:", error);
          toast(`SYNC_ERROR: [FOLDER_CREATION_FAILED]`, "system");
        }
      }
    }
  }, [folders, notes, saveToStorage, user, supabase, toast]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    const noteToUpdate = notes.find(n => n.id === id);
    const oldTitle = noteToUpdate?.title;
    const newTitle = updates.title;

    let updatedNotes = notes.map((n) => 
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );

    if (oldTitle && newTitle && oldTitle !== newTitle) {
      updatedNotes = updatedNotes.map(n => ({
        ...n,
        content: updateLinksInContent(n.content, oldTitle, newTitle)
      }));
      toast(`REFACTOR_COMPLETE: [LINKS_UPDATED]`, "system");
    }

    setNotes(updatedNotes);
    saveToStorage(updatedNotes, folders);

    if (user) {
      const updatedNote = updatedNotes.find(n => n.id === id);
      if (updatedNote) {
        try {
          await supabaseService.upsertNote(supabase, user.id, updatedNote);
          
          if (oldTitle && newTitle && oldTitle !== newTitle) {
            const linkedNotes = updatedNotes.filter(n => n.id !== id && n.content.includes(newTitle));
            if (linkedNotes.length > 0) {
              await supabaseService.batchUpsertNotes(supabase, user.id, linkedNotes);
            }
          }
        } catch (error) {
          console.error("Cloud Update Error:", error);
        }
      }
    }
  }, [notes, folders, user, supabase, saveToStorage, toast]);

  const renameFolder = useCallback(async (oldPath: string, newPath: string) => {
    const notesInFolder = notes.filter(n => n.title.startsWith(oldPath + "/") || n.title === oldPath);
    
    let updatedNotes = notes.map(n => {
      if (n.title.startsWith(oldPath + "/") || n.title === oldPath) {
        const relativePath = n.title.substring(oldPath.length);
        return { ...n, title: `${newPath}${relativePath}`, updatedAt: Date.now() };
      }
      return n;
    });

    for (const note of notesInFolder) {
      const relativePath = note.title.substring(oldPath.length);
      const oldTitle = note.title;
      const newTitle = `${newPath}${relativePath}`;
      updatedNotes = updatedNotes.map(n => ({
        ...n,
        content: updateLinksInContent(n.content, oldTitle, newTitle)
      }));
    }

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
      try {
        const affectedNotes = updatedNotes.filter(n => 
          n.title.startsWith(newPath) || notesInFolder.some(inf => inf.id === n.id)
        );
        
        const affectedFolders = updatedFolders.filter(f => 
          f.startsWith(newPath + "/") || f === newPath
        );

        await supabaseService.batchUpsertNotes(supabase, user.id, affectedNotes);
        await supabaseService.batchUpsertFolders(supabase, user.id, affectedFolders);
        await supabaseService.deleteFolderEntry(supabase, user.id, oldPath);
      } catch (error) {
        console.error("Cloud Folder Rename Error:", error);
      }
    }
    toast(`CLUSTER_REFACTORED: [LINKS_SYNCED]`, "system");
  }, [notes, folders, user, supabase, saveToStorage, toast]);

  const deleteFolder = useCallback(async (path: string) => {
    if (!window.confirm(`WIPE_CLUSTER: [${path}] AND_ALL_INTERNAL_DATA?`)) return;

    const updatedNotes = notes.filter(n => !n.title.startsWith(path + "/") && n.title !== path);
    const updatedFolders = folders.filter(f => !f.startsWith(path + "/") && f !== path);

    setNotes(updatedNotes);
    setFolders(updatedFolders);
    saveToStorage(updatedNotes, updatedFolders);

    if (user) {
      try {
        await supabaseService.deleteFolder(supabase, user.id, path);
      } catch (error) {
        console.error("Cloud Folder Delete Error:", error);
      }
    }
    toast(`CLUSTER_DELETED: [${path}]`, "system");
  }, [notes, folders, user, supabase, saveToStorage, toast]);

  const deleteNote = useCallback(async (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    saveToStorage(updatedNotes, folders);

    if (user) {
      try {
        await supabaseService.deleteNote(supabase, id);
      } catch (error) {
        console.error("Cloud Delete Error:", error);
      }
    }
  }, [notes, folders, user, supabase, saveToStorage]);

  const toggleFavorite = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) updateNote(id, { isFavorite: !note.isFavorite });
  }, [notes, updateNote]);

  const togglePublic = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) updateNote(id, { isPublic: !note.isPublic });
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
    const extractedFolders = new Set<string>();
    importedNotes.forEach(note => {
      const parts = note.title.split("/");
      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) extractedFolders.add(parts.slice(0, i).join("/"));
      }
    });

    const updatedNotes = [...importedNotes, ...notes];
    const uniqueNotes = Array.from(new Map(updatedNotes.map(n => [n.id, n])).values());
    const updatedFolders = Array.from(new Set([...folders, ...Array.from(extractedFolders)]));

    setNotes(uniqueNotes);
    setFolders(updatedFolders);
    saveToStorage(uniqueNotes, updatedFolders);

    if (user) {
      toast(`SYNCING_IMPORT: [UPLOADING_TO_CLOUD]`, "system");
      try {
        await supabaseService.batchUpsertNotes(supabase, user.id, importedNotes);
        await supabaseService.batchUpsertFolders(supabase, user.id, Array.from(extractedFolders));
        toast(`IMPORT_SUCCESS: [${importedNotes.length}_ENTRIES_SYNCED]`, "system");
      } catch (error) {
        console.error("Cloud Import Error:", error);
        toast(`SYNC_ERROR: [CLOUD_IMPORT_FAILED]`, "system");
      }
    } else {
      toast(`IMPORT_SUCCESS: [${importedNotes.length}_ENTRIES_LOCAL_ONLY]`, "system");
    }
  }, [notes, folders, saveToStorage, user, supabase, toast]);

  const deleteAllNotes = useCallback(async () => {
    if (!window.confirm("WIPE_ALL_DATA: [CONFIRM_DESTRUCTION?]")) return;
    
    setNotes([]);
    setFolders([]);
    await storage.saveNotes([], user?.id);
    await storage.saveFolders([], user?.id);

    if (user) {
      try {
        await supabaseService.wipeData(supabase, user.id);
      } catch (error) {
        console.error("Cloud Wipe Error:", error);
      }
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
    renameFolder,
    deleteFolder,
    toggleFavorite,
    togglePublic,
    exportAllNotes,
    importNotes,
    deleteAllNotes,
  };
}
