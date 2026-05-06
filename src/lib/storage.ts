import { get, set, del } from "idb-keyval";

const DB_KEY = "abyssal-codex-notes-v1";

export const storage = {
  async getNotes<T>(): Promise<T | null> {
    try {
      const data = await get<T>(DB_KEY);
      return data ?? null;
    } catch (error) {
      console.error("Storage Error (GET):", error);
      return null;
    }
  },

  async saveNotes<T>(notes: T): Promise<void> {
    try {
      await set(DB_KEY, notes);
    } catch (error) {
      console.error("Storage Error (SET):", error);
    }
  },

  async clear(): Promise<void> {
    try {
      await del(DB_KEY);
    } catch (error) {
      console.error("Storage Error (DEL):", error);
    }
  },

  getLegacyData(key: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }
};
