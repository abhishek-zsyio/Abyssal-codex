"use client";

import React from "react";

export const SidebarSkeleton = () => (
  <div className="space-y-0">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="px-6 py-4 border-b border-dotted border-[var(--border)]/50">
        <div className="flex justify-between mb-2">
          <div className="h-3 w-2/3 bg-[var(--border)] rounded-sm opacity-50" />
          <div className="h-3 w-4 bg-[var(--border)] rounded-sm opacity-30" />
        </div>
        <div className="h-2 w-full bg-[var(--border)] rounded-sm opacity-20 mb-2" />
        <div className="flex gap-1">
          <div className="h-3 w-10 bg-[var(--border)] rounded-sm opacity-10" />
          <div className="h-3 w-12 bg-[var(--border)] rounded-sm opacity-10" />
        </div>
      </div>
    ))}
  </div>
);
