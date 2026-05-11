"use client";

import { get, set, del } from "idb-keyval";


const DB_KEY = "abyssal-codex-notes-v1";
const FOLDERS_KEY = "abyssal-codex-folders-v1";
const PLUGINS_KEY = "abyssal-codex-plugins-v1";

export const storage = {
  async getNotes<T>(userId?: string): Promise<T | null> {
    try {
      const key = userId ? `${DB_KEY}-${userId}` : DB_KEY;
      const data = await get<T>(key);
      return data ?? null;
    } catch (error) {
      console.error("Storage Error (GET):", error);
      return null;
    }
  },

  async saveNotes<T>(notes: T, userId?: string): Promise<void> {
    try {
      const key = userId ? `${DB_KEY}-${userId}` : DB_KEY;
      await set(key, notes);
    } catch (error) {
      console.error("Storage Error (SET):", error);
    }
  },

  async getFolders<T>(userId?: string): Promise<T | null> {
    try {
      const key = userId ? `${FOLDERS_KEY}-${userId}` : FOLDERS_KEY;
      const data = await get<T>(key);
      return data ?? null;
    } catch (error) {
      console.error("Folder Storage Error (GET):", error);
      return null;
    }
  },

  async saveFolders<T>(folders: T, userId?: string): Promise<void> {
    try {
      const key = userId ? `${FOLDERS_KEY}-${userId}` : FOLDERS_KEY;
      await set(key, folders);
    } catch (error) {
      console.error("Folder Storage Error (SET):", error);
    }
  },

  async getPlugins<T>(): Promise<T | null> {
    try {
      const data = await get<T>(PLUGINS_KEY);
      return data ?? null;
    } catch (error) {
      console.error("Plugin Storage Error (GET):", error);
      return null;
    }
  },

  async savePlugins<T>(plugins: T): Promise<void> {
    try {
      await set(PLUGINS_KEY, plugins);
    } catch (error) {
      console.error("Plugin Storage Error (SET):", error);
    }
  },

  async clear(): Promise<void> {
    try {
      await Promise.all([
        del(DB_KEY),
        del(PLUGINS_KEY)
      ]);
    } catch (error) {
      console.error("Storage Error (DEL):", error);
    }
  },

  getLegacyData(key: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }
};
