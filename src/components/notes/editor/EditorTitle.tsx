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
    <div className="flex flex-col mb-6 group/title-container">
      {/* Cluster Path (Folder) */}
      <div className="flex items-center gap-2 mb-3 group/cluster">
        <div className="w-1.5 h-1.5 border border-[var(--primary)] rotate-45 opacity-40 group-focus-within/cluster:opacity-100 transition-opacity" />
        <span className="text-[8px] font-mono uppercase tracking-[0.4em] opacity-40">CLUSTER_ID:</span>
        <input 
          type="text"
          value={clusterPath}
          onChange={(e) => {
            const newCluster = e.target.value.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
            const newTitle = newCluster ? `${newCluster}/${nodeName}` : nodeName;
            onUpdateTitle(newTitle);
          }}
          className="bg-transparent border-none outline-none text-[8px] font-mono text-[var(--primary)] uppercase tracking-[0.4em] w-full placeholder:opacity-20 focus:text-[var(--primary)]"
          placeholder="ROOT_DOMAIN"
        />
      </div>
      
      {/* Node Name (File) */}
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
          className="w-full bg-transparent text-5xl font-black outline-none placeholder:text-[var(--border)] text-[var(--foreground)] tracking-tighter leading-none selection:bg-[var(--primary)]/30"
          placeholder="UNIDENTIFIED_SEGMENT..."
        />
        <div className="absolute -bottom-4 left-0 flex items-center gap-4 opacity-20">
          <span className="text-[8px] font-mono uppercase tracking-widest">Protocol: ABYSSAL_STORAGE_V2</span>
          <span className="text-[8px] font-mono uppercase tracking-widest">Sync: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

EditorTitle.displayName = "EditorTitle";
