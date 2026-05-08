"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Note } from "@/types/note";

const OmniConsole = dynamic(() => import("@/components/notes/OmniConsole"), { ssr: false });
const ThemeModal = dynamic(() => import("@/components/notes/ThemeModal"), { ssr: false });
const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { ssr: false });

interface HomeModalsProps {
  isOmniConsoleOpen: boolean;
  setIsOmniConsoleOpen: (open: boolean) => void;
  notes: Note[];
  handleSelectNote: (id: string) => void;
  handleAddNote: (title?: string) => void;
  exportAllNotes?: () => void;
  setIsThemeModalOpen: (open: boolean) => void;
  setSidebarView: (view: "explorer" | "plugins" | "help") => void;
  setIsSidebarOpen: (open: boolean) => void;
  handleDeleteNote: (id: string) => void;
  isThemeModalOpen: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

export const HomeModals = ({
  isOmniConsoleOpen,
  setIsOmniConsoleOpen,
  notes,
  handleSelectNote,
  handleAddNote,
  exportAllNotes,
  setIsThemeModalOpen,
  setSidebarView,
  setIsSidebarOpen,
  handleDeleteNote,
  isThemeModalOpen,
  isAuthModalOpen,
  setIsAuthModalOpen
}: HomeModalsProps) => {
  return (
    <>
      <OmniConsole 
        isOpen={isOmniConsoleOpen}
        onClose={() => setIsOmniConsoleOpen(false)}
        notes={notes}
        onSelectNote={handleSelectNote}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        exportAllNotes={exportAllNotes || (() => {})}
        onOpenThemes={() => setIsThemeModalOpen(true)}
        onOpenPlugins={() => {
          setSidebarView("plugins");
          setIsSidebarOpen(true);
          setIsOmniConsoleOpen(false);
        }}
      />
      <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
