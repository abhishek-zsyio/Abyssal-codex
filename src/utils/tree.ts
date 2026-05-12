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

  // 1. Add explicitly created empty folders
  emptyFolders.forEach((path) => {
    const parts = path.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      let folder = currentLevel.find(
        (item) => item.type === "folder" && item.name === part
      ) as TreeFolder;

      if (!folder) {
        folder = {
          id: `folder:${parts.slice(0, index + 1).join("/")}`,
          name: part,
          type: "folder",
          children: [],
        };
        currentLevel.push(folder);
      }
      currentLevel = folder.children;
    });
  });

  // 2. Add files and the folders derived from their paths
  notes.forEach((note) => {
    // Ignore any remaining .keep files if they somehow got in
    if (note.title.endsWith("/.keep") || note.title === ".keep") return;

    const parts = note.title.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;

      if (isLast) {
        // Check if file already exists in this level
        if (!currentLevel.find(item => item.type === "file" && item.id === note.id)) {
          currentLevel.push({
            id: note.id,
            name: part,
            type: "file",
            note: note,
          });
        }
      } else {
        let folder = currentLevel.find(
          (item) => item.type === "folder" && item.name === part
        ) as TreeFolder;

        if (!folder) {
          folder = {
            id: `folder:${parts.slice(0, index + 1).join("/")}`,
            name: part,
            type: "folder",
            children: [],
          };
          currentLevel.push(folder);
        }
        currentLevel = folder.children;
      }
    });
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
