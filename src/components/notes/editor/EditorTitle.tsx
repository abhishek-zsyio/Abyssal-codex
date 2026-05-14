"use client";

import React from "react";

interface EditorTitleProps {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
}

export const EditorTitle = ({ title, onUpdateTitle }: EditorTitleProps) => {
  const parts = title.split('/');
  const clusterPath = parts.slice(0, -1).join('/');
  const nodeName = parts[parts.length - 1] || "";

  return (
    <div className="flex flex-col mb-10 group/title-container">
      {/* Cluster Path */}
      <div className="flex items-center gap-2 mb-2 opacity-40">
        <div className="w-1.5 h-1.5 border border-[var(--primary)] rotate-45" />
        <span className="text-[7px] font-mono uppercase tracking-[0.4em]">Cluster // {clusterPath || "ROOT"}</span>
      </div>
      
      {/* Node Name */}
      <div className="relative">
        <input
          type="text"
          value={nodeName}
          onChange={(e) => {
            const newNodeName = e.target.value.replace(/\//g, '');
            const newParts = [...parts];
            newParts[newParts.length - 1] = newNodeName;
            onUpdateTitle(newParts.join('/'));
          }}
          className="w-full bg-transparent text-4xl font-black outline-none placeholder:text-[var(--border)] text-[var(--foreground)] tracking-tighter leading-none uppercase selection:bg-[var(--primary)]/30"
          placeholder="Untitled_Node…"
        />
        <div className="flex items-center gap-4 mt-2 opacity-20">
          <span className="text-[7px] font-mono uppercase tracking-[0.3em]">Type: Markdown_Buffer</span>
          <span className="text-[7px] font-mono uppercase tracking-[0.3em]">Auth: Signed_Kernel</span>
        </div>
      </div>
    </div>
  );
};

EditorTitle.displayName = "EditorTitle";
