import { Note } from "@/types/note";

export interface TreeFolder {
  id: string;
  name: string;
  children: (TreeFolder | TreeFile)[];
  type: "folder";
}

export interface TreeFile {
  id: string;
  name: string;
  type: "file";
  note: Note;
}

export type TreeItem = TreeFolder | TreeFile;

export function buildNoteTree(notes: Note[], emptyFolders: string[] = []): TreeItem[] {
  const root: TreeItem[] = [];
  const folderCache = new Map<string, TreeFolder>();

  const getOrCreateFolder = (path: string): TreeFolder => {
    if (folderCache.has(path)) return folderCache.get(path)!;

    const parts = path.split("/");
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join("/");
    
    const folder: TreeFolder = {
      id: `folder:${path}`,
      name,
      type: "folder",
      children: [],
    };

    folderCache.set(path, folder);

    if (parentPath) {
      const parentFolder = getOrCreateFolder(parentPath);
      parentFolder.children.push(folder);
    } else {
      root.push(folder);
    }

    return folder;
  };

  // 1. Process empty folders
  emptyFolders.forEach((path) => {
    if (path) getOrCreateFolder(path);
  });

  // 2. Process notes
  notes.forEach((note) => {
    if (note.title.endsWith("/.keep") || note.title === ".keep") return;

    const parts = note.title.split("/");
    const fileName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join("/");

    const file: TreeFile = {
      id: note.id,
      name: fileName,
      type: "file",
      note: note,
    };

    if (parentPath) {
      const parentFolder = getOrCreateFolder(parentPath);
      // Avoid duplicates
      if (!parentFolder.children.find(item => item.type === "file" && item.id === note.id)) {
        parentFolder.children.push(file);
      }
    } else {
      if (!root.find(item => item.type === "file" && item.id === note.id)) {
        root.push(file);
      }
    }
  });

  const sortItems = (items: TreeItem[]) => {
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    items.forEach((item) => {
      if (item.type === "folder") {
        sortItems(item.children);
      }
    });
  };

  sortItems(root);
  return root;
}
