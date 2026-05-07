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

  const loadPlugins = useCallback(async () => {
    const saved = await storage.getPlugins<Record<PluginId, PluginState>>();
    const initial: Record<PluginId, PluginState> = {};
    
    // Always start with all plugins from registry as disabled/uninstalled
    AVAILABLE_PLUGINS.forEach(p => {
      initial[p.id] = {
        id: p.id,
        enabled: false,
        installed: false
      };
    });

    // Merge saved data over initial states
    if (saved) {
      Object.keys(saved).forEach(id => {
        if (initial[id]) {
          initial[id] = { ...initial[id], ...saved[id] };
        }
      });
    }
    
    setPluginStates(initial);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  const saveState = useCallback(async (newState: Record<PluginId, PluginState>) => {
    setPluginStates(newState);
    await storage.savePlugins(newState);
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
