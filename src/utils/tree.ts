import { Note } from "@/types/note";

export interface TreeFolder {
  id: string; // generated for folders
  name: string;
  children: (TreeFolder | TreeFile)[];
  type: "folder";
}

export interface TreeFile {
  id: string; // note id
  name: string;
  type: "file";
  note: Note;
}

export type TreeItem = TreeFolder | TreeFile;

export function buildNoteTree(notes: Note[]): TreeItem[] {
  const root: TreeItem[] = [];

  notes.forEach((note) => {
    // Ignore folder placeholders
    if (note.title.endsWith("/.keep") || note.title === ".keep") return;

    const parts = note.title.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;

      if (isLast) {
        // It's a file
        currentLevel.push({
          id: note.id,
          name: part,
          type: "file",
          note: note,
        });
      } else {
        // It's a folder
        let folder = currentLevel.find(
          (item) => item.type === "folder" && item.name === part
        ) as TreeFolder;

        if (!folder) {
          folder = {
            id: `folder-${part}-${index}-${Math.random()}`,
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

  // Sort: Folders first, then alphabetically
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
