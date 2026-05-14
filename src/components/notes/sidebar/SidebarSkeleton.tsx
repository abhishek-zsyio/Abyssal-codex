"use client";

import React from "react";

// Shimmer animation via CSS keyframe in global.css
// Renders slim file-row-shaped skeletons matching ExplorerFile row height
export const SidebarSkeleton = () => (
  <div className="py-1">
    {[80, 55, 70, 45, 65, 50, 75].map((width, i) => (
      <div
        key={i}
        className="flex items-center gap-2 px-3 py-[5px]"
        style={{ paddingLeft: i % 3 === 0 ? '12px' : i % 3 === 1 ? '24px' : '20px' }}
      >
        {/* file icon placeholder */}
        <div className="w-3.5 h-3.5 bg-[var(--border)]/40 rounded-sm shrink-0 animate-pulse" />
        {/* filename placeholder */}
        <div
          className="h-2.5 bg-[var(--border)]/30 rounded-sm animate-pulse"
          style={{ width: `${width}%`, animationDelay: `${i * 60}ms` }}
        />
      </div>
    ))}
  </div>
);
