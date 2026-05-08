"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { PluginId, PluginState } from "@/types/plugin";
import { storage } from "@/lib/storage";
import { AVAILABLE_PLUGINS } from "@/lib/plugins-registry";

interface PluginContextType {
  pluginStates: Record<PluginId, PluginState>;
  isLoading: boolean;
  togglePlugin: (id: PluginId) => void;
  installPlugin: (id: PluginId) => void;
  uninstallPlugin: (id: PluginId) => void;
  isEnabled: (id: PluginId) => boolean;
  isInstalled: (id: PluginId) => boolean;
  availablePlugins: typeof AVAILABLE_PLUGINS;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export function PluginProvider({ children }: { children: ReactNode }) {
  const [pluginStates, setPluginStates] = useState<Record<PluginId, PluginState>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const saved = await storage.getPlugins<Record<PluginId, PluginState>>();
      if (!isMounted) return;

      const initial: Record<PluginId, PluginState> = {};
      AVAILABLE_PLUGINS.forEach(p => {
        initial[p.id] = {
          id: p.id,
          enabled: false,
          installed: false
        };
      });

      if (saved) {
        Object.keys(saved).forEach(id => {
          if (initial[id as PluginId]) {
            initial[id as PluginId] = { ...initial[id as PluginId], ...saved[id as PluginId] };
          }
        });
      }
      
      setPluginStates(initial);
      setIsLoading(false);
    };

    init();
    return () => { isMounted = false; };
  }, []);

  const togglePlugin = useCallback(async (id: PluginId) => {
    setPluginStates(prev => {
      const newState = {
        ...prev,
        [id]: {
          ...prev[id],
          enabled: !prev[id]?.enabled
        }
      };
      storage.savePlugins(newState);
      return newState;
    });
  }, []);

  const installPlugin = useCallback(async (id: PluginId) => {
    setPluginStates(prev => {
      const newState = {
        ...prev,
        [id]: {
          ...prev[id],
          installed: true,
          enabled: true
        }
      };
      storage.savePlugins(newState);
      return newState;
    });
  }, []);

  const uninstallPlugin = useCallback(async (id: PluginId) => {
    setPluginStates(prev => {
      const newState = {
        ...prev,
        [id]: {
          ...prev[id],
          installed: false,
          enabled: false
        }
      };
      storage.savePlugins(newState);
      return newState;
    });
  }, []);

  const isEnabled = useCallback((id: PluginId) => {
    return pluginStates[id]?.enabled || false;
  }, [pluginStates]);

  const isInstalled = useCallback((id: PluginId) => {
    return pluginStates[id]?.installed || false;
  }, [pluginStates]);

  return (
    <PluginContext.Provider value={{
      pluginStates,
      isLoading,
      togglePlugin,
      installPlugin,
      uninstallPlugin,
      isEnabled,
      isInstalled,
      availablePlugins: AVAILABLE_PLUGINS
    }}>
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugins() {
  const context = useContext(PluginContext);
  if (context === undefined) {
    return {
      pluginStates: {},
      isLoading: false,
      togglePlugin: () => {},
      installPlugin: () => {},
      uninstallPlugin: () => {},
      isEnabled: () => false,
      isInstalled: () => false,
      availablePlugins: AVAILABLE_PLUGINS
    };
  }
  return context;
}
