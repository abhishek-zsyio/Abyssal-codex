"use client";

import { useState, useCallback, useEffect } from 'react';


interface MenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

export function useContextMenu() {
  const [menu, setMenu] = useState<MenuState>({ isOpen: false, x: 0, y: 0 });

  const openMenu = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (menu.isOpen) closeMenu();
    };

    if (menu.isOpen) {
      window.addEventListener('click', handleGlobalClick);
    }

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [menu.isOpen, closeMenu]);

  return {
    ...menu,
    openMenu,
    closeMenu,
  };
}
