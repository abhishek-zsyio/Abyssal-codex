"use client";

import React from "react";
import { Scissors, Copy, Clipboard, Link, Eye, Edit3, FileCode, Command, Trash2 } from "lucide-react";
import { ContextMenu } from "@/components/ui/ContextMenu";

interface EditorContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  isEditing: boolean;
  hasSelection: boolean;
  editorRef: React.MutableRefObject<any>;
  onToggleEdit: () => void;
  onDelete: () => void;
  toast: (message: string, type: "success" | "error" | "system") => void;
}

export const EditorContextMenu = ({
  isOpen,
  x,
  y,
  onClose,
  isEditing,
  hasSelection,
  editorRef,
  onToggleEdit,
  onDelete,
  toast
}: EditorContextMenuProps) => {
  return (
    <ContextMenu 
      isOpen={isOpen}
      x={x}
      y={y}
      onClose={onClose}
      items={[
        {
          label: "Cut",
          icon: Scissors,
          shortcut: "⌘X",
          disabled: !hasSelection || !isEditing,
          onClick: () => {
            editorRef.current?.focus();
            document.execCommand('cut');
            toast("SELECTION_CUT", "system");
          }
        },
        {
          label: "Copy",
          icon: Copy,
          shortcut: "⌘C",
          disabled: !hasSelection,
          onClick: () => {
            editorRef.current?.focus();
            document.execCommand('copy');
            toast("SELECTION_COPIED", "system");
          }
        },
        {
          label: "Paste",
          icon: Clipboard,
          shortcut: "⌘V",
          disabled: !isEditing,
          onClick: async () => {
            try {
              const text = await navigator.clipboard.readText();
              const selection = editorRef.current?.getSelection();
              editorRef.current?.executeEdits("paste", [{
                range: selection,
                text: text,
                forceMoveMarkers: true
              }]);
              editorRef.current?.focus();
              toast("BUFFER_PASTED", "system");
            } catch (err) {
              toast("PASTE_FAILED", "error");
            }
          }
        },
        {
          label: "Insert Wiki Link",
          icon: Link,
          shortcut: "[[ ]]",
          disabled: !isEditing,
          onClick: () => {
            const editor = editorRef.current;
            if (editor) {
              const model = editor.getModel();
              const selection = editor.getSelection();
              const text = selection ? model.getValueInRange(selection) : "";
              editor.executeEdits("insert-link", [{
                range: selection || new (window as any).monaco.Range(1, 1, 1, 1),
                text: `[[${text}]]`,
                forceMoveMarkers: true
              }]);
              editor.focus();
            }
          }
        },
        {
          label: isEditing ? "Read Mode" : "Edit Mode",
          icon: isEditing ? Eye : Edit3,
          shortcut: "⌥V",
          divider: true,
          onClick: onToggleEdit
        },
        {
          label: "Format",
          icon: FileCode,
          shortcut: "⇧⌥F",
          disabled: !isEditing,
          onClick: () => {
            editorRef.current?.getAction('editor.action.formatDocument')?.run();
            toast("FORMATTED", "success");
          }
        },
        {
          label: "Command Palette",
          icon: Command,
          shortcut: "F1",
          onClick: () => {
            editorRef.current?.focus();
            editorRef.current?.trigger('anyString', 'editor.action.quickCommand');
          }
        },
        {
          label: "Purge Note",
          icon: Trash2,
          variant: "danger",
          divider: true,
          onClick: onDelete
        }
      ]}
    />
  );
};
