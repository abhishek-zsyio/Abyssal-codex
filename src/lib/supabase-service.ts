import { SupabaseClient } from "@supabase/supabase-js";
import { Note } from "@/types/note";
import { encryptNote, decryptNote } from "@/utils/encryption";

export const supabaseService = {
  async fetchNotes(supabase: SupabaseClient, userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return Promise.all((data as any[]).map(async (n) => ({
      id: n.id,
      title: n.title,
      content: await decryptNote(n.content || "", userId),
      isFavorite: n.is_favorite ?? false,
      isPublic: n.is_public ?? false,
      tags: n.tags || [],
      updatedAt: n.updated_at ? new Date(n.updated_at).getTime() : Date.now(),
      createdAt: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
    })));
  },

  async upsertNote(supabase: SupabaseClient, userId: string, note: Note) {
    const encryptedContent = await encryptNote(note.content, userId);
    const { error } = await supabase.from("notes").upsert({
      id: note.id,
      user_id: userId,
      title: note.title,
      content: encryptedContent,
      is_favorite: note.isFavorite,
      is_public: note.isPublic,
      tags: note.tags,
      updated_at: new Date(note.updatedAt).toISOString(),
      created_at: new Date(note.createdAt).toISOString()
    }, { onConflict: 'id' });
    
    if (error) throw error;
  },

  async batchUpsertNotes(supabase: SupabaseClient, userId: string, notes: Note[]) {
    const encryptedNotes = await Promise.all(notes.map(async (n) => ({
      id: n.id,
      user_id: userId,
      title: n.title,
      content: await encryptNote(n.content || "", userId),
      is_favorite: n.isFavorite ?? false,
      is_public: n.isPublic ?? false,
      tags: n.tags || [],
      updated_at: new Date(n.updatedAt || Date.now()).toISOString(),
      created_at: new Date(n.createdAt || Date.now()).toISOString(),
    })));

    const { error } = await supabase
      .from("notes")
      .upsert(encryptedNotes, { onConflict: 'id' });
    
    if (error) throw error;
  },

  async deleteNote(supabase: SupabaseClient, id: string) {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) throw error;
  },

  async fetchFolders(supabase: SupabaseClient): Promise<string[]> {
    const { data, error } = await supabase.from("folders").select("path");
    if (error) throw error;
    return data.map(f => f.path);
  },

  async upsertFolder(supabase: SupabaseClient, userId: string, path: string) {
    const { error } = await supabase.from("folders").upsert({ user_id: userId, path }, { onConflict: 'user_id,path' });
    if (error) throw error;
  },

  async batchUpsertFolders(supabase: SupabaseClient, userId: string, paths: string[]) {
    const folderData = paths.map(path => ({ user_id: userId, path }));
    const { error } = await supabase.from("folders").upsert(folderData, { onConflict: 'user_id,path' });
    if (error) throw error;
  },

  async deleteFolder(supabase: SupabaseClient, userId: string, path: string) {
    // Delete folders matching path or starting with path/
    await supabase.from("notes").delete().like("title", `${path}/%`);
    await supabase.from("notes").delete().eq("title", path);
    const { error } = await supabase.from("folders").delete().eq("path", path).eq("user_id", userId);
    if (error) throw error;
  },

  async deleteFolderEntry(supabase: SupabaseClient, userId: string, path: string) {
    // Delete ONLY the folder entry, do not touch notes
    // Also delete any subfolder entries that were under the old path
    await supabase.from("folders").delete().like("path", `${path}/%`).eq("user_id", userId);
    const { error } = await supabase.from("folders").delete().eq("path", path).eq("user_id", userId);
    if (error) throw error;
  },

  async wipeData(supabase: SupabaseClient, userId: string) {
    const { error: notesError } = await supabase.from("notes").delete().eq("user_id", userId);
    const { error: foldersError } = await supabase.from("folders").delete().eq("user_id", userId);
    if (notesError || foldersError) throw notesError || foldersError;
  }
};
