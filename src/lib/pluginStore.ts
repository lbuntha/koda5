import { useState, useEffect } from "react";

/**
 * Interface representing a granular sub-feature of a plugin.
 */
export interface PluginFeature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  tag?: string;
}

/**
 * Interface representing a modular Learning Plugin in the system.
 */
export interface LearningPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category: "core" | "utility" | "assistant" | "visualizer" | "manipulative";
  author: string;
  isEnabled: boolean;
  iconName: string;
  features: PluginFeature[];
  settings?: Record<string, any>;
  stats?: {
    totalEvents: number;
    lastActive: string;
  };
}

/**
 * Interface representing a chronological action logged globally in the system.
 */
export interface PluginActionLog {
  id: string;
  timestamp: string;
  pluginId: string;
  actionType:
    | "START_LEVEL"
    | "TAP_ITEM"
    | "CHECK_ANSWER"
    | "NEXT_QUESTION"
    | "OPEN_TIP"
    | "PLAY_AUDIO"
    | "EXIT_GAME"
    | "EARN_XP"
    | "TOGGLE_FEATURE"
    | "PLUGIN_STATE";
  level: number;
  step?: number;
  status?: "success" | "error" | "info";
  details: string;
}

/**
 * No built-in plugins.
 *
 * This array previously declared five: counting-mastery (which duplicated the
 * counting plugin's manifest) and four UI fragments — step-header-tagger,
 * feedback-drawer, gemini-coach, whiteboard-scratchpad. Between them the four
 * owned 14 feature flags, and an audit found **not one of them was ever checked
 * in code**: every toggle in Plugin Lab did nothing.
 *
 * A switch that does not switch anything is worse than no switch, so they are
 * gone. The UI they nominally described (step header, feedback banner, voice
 * coach, whiteboard) is untouched — it was never gated by these flags.
 *
 * Plugins now come from src/plugins/registry.ts via registerPlugin(), which
 * means everything Plugin Lab lists is real.
 */
const DEFAULT_PLUGINS: LearningPlugin[] = [];

const STORAGE_KEY_PLUGINS = "koda_learning_plugins_v2";
const STORAGE_KEY_LOGS = "koda_plugin_logs_v2";

// Initialize plugins from LocalStorage or default
function loadStoredPlugins(): LearningPlugin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLUGINS);
    if (!raw) return [...DEFAULT_PLUGINS];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_PLUGINS];

    // Start from what was persisted. Plugins are supplied by the registry now,
    // so a stored entry with no matching built-in is normal — not stale. This
    // used to map over DEFAULT_PLUGINS, which silently dropped every saved
    // choice once that array was emptied.
    const byId = new Map<string, LearningPlugin>();
    for (const p of parsed) {
      if (p && typeof p.id === "string" && Array.isArray(p.features)) {
        byId.set(p.id, p as LearningPlugin);
      }
    }

    // Built-ins fill in anything never persisted.
    for (const def of DEFAULT_PLUGINS) {
      if (!byId.has(def.id)) byId.set(def.id, def);
    }

    return [...byId.values()];
  } catch (err) {
    console.warn("Failed to load stored plugins:", err);
    return [...DEFAULT_PLUGINS];
  }
}

function saveStoredPlugins(plugins: LearningPlugin[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PLUGINS, JSON.stringify(plugins));
  } catch (err) {
    console.warn("Failed to save plugins to localStorage:", err);
  }
}

let globalPlugins: LearningPlugin[] = loadStoredPlugins();

// Starts empty. The seed entry referenced a plugin id that no longer exists and
// claimed a feature count that was never true; real activity arrives via log().
let globalActionLogs: PluginActionLog[] = [];

// List of active subscribers for reactive updates
const pluginSubscribers = new Set<() => void>();
const logSubscribers = new Set<() => void>();

const notifyPlugins = () => {
  saveStoredPlugins(globalPlugins);
  pluginSubscribers.forEach((sub) => sub());
};
const notifyLogs = () => logSubscribers.forEach((sub) => sub());

/**
 * Main programmatic Global Plugin API
 */
export const PluginManagerAPI = {
  /**
   * Register a plugin declared by the registry.
   *
   * The plugin's own manifest is the source of truth for its shape — name,
   * version, features, settings defaults. Persisted state (whether it or its
   * features are switched off) wins over the manifest, so a parent's choice
   * survives a redeploy while new features still appear.
   *
   * Idempotent: registering the same id twice re-merges rather than duplicating.
   */
  registerPlugin: (incoming: LearningPlugin): void => {
    const existing = globalPlugins.find((p) => p.id === incoming.id);

    if (!existing) {
      globalPlugins = [...globalPlugins, incoming];
    } else {
      globalPlugins = globalPlugins.map((p) =>
        p.id !== incoming.id
          ? p
          : {
              ...incoming,
              isEnabled: p.isEnabled,
              settings: { ...incoming.settings, ...p.settings },
              features: incoming.features.map((f) => {
                const saved = p.features.find((sf) => sf.id === f.id);
                return saved ? { ...f, isEnabled: saved.isEnabled } : f;
              }),
            },
      );
    }
    notifyPlugins();
  },

  // Get list of all installed plugins
  getPlugins: (): LearningPlugin[] => [...globalPlugins],

  // Get specific plugin
  getPlugin: (id: string): LearningPlugin | undefined => {
    return globalPlugins.find((p) => p.id === id);
  },

  // Check if whole plugin is enabled
  isPluginEnabled: (pluginId: string): boolean => {
    const plug = globalPlugins.find((p) => p.id === pluginId);
    return plug ? plug.isEnabled : false;
  },

  // Check if a specific feature of a plugin is enabled
  isFeatureEnabled: (pluginId: string, featureId: string, defaultIfNotFound = false): boolean => {
    const plug = globalPlugins.find((p) => p.id === pluginId);
    if (!plug || !plug.isEnabled) return false;
    const feat = plug.features.find((f) => f.id === featureId);
    return feat !== undefined ? feat.isEnabled : defaultIfNotFound;
  },

  // Toggle state of a plugin
  togglePlugin: (id: string): void => {
    globalPlugins = globalPlugins.map((p) => {
      if (p.id === id) {
        const nextState = !p.isEnabled;
        return {
          ...p,
          isEnabled: nextState,
          stats: {
            totalEvents: (p.stats?.totalEvents || 0) + 1,
            lastActive: new Date().toISOString(),
          },
        };
      }
      return p;
    });
    notifyPlugins();
    const plug = globalPlugins.find((p) => p.id === id);
    PluginManagerAPI.logAction(
      id,
      "PLUGIN_STATE",
      0,
      undefined,
      "info",
      `Plugin '${plug?.name || id}' switched ${plug?.isEnabled ? "ENABLED" : "DISABLED"}.`
    );
  },

  // Toggle state of a specific feature
  toggleFeature: (pluginId: string, featureId: string): void => {
    globalPlugins = globalPlugins.map((p) => {
      if (p.id === pluginId) {
        const updatedFeatures = p.features.map((f) => {
          if (f.id === featureId) {
            return { ...f, isEnabled: !f.isEnabled };
          }
          return f;
        });
        return {
          ...p,
          features: updatedFeatures,
          stats: {
            totalEvents: (p.stats?.totalEvents || 0) + 1,
            lastActive: new Date().toISOString(),
          },
        };
      }
      return p;
    });
    notifyPlugins();
    const targetFeat = globalPlugins.find((p) => p.id === pluginId)?.features.find((f) => f.id === featureId);
    PluginManagerAPI.logAction(
      pluginId,
      "TOGGLE_FEATURE",
      0,
      undefined,
      "info",
      `Feature '${targetFeat?.name || featureId}' set to ${targetFeat?.isEnabled ? "ON" : "OFF"}.`
    );
  },

  // Set specific feature state directly
  setFeatureState: (pluginId: string, featureId: string, isEnabled: boolean): void => {
    globalPlugins = globalPlugins.map((p) => {
      if (p.id === pluginId) {
        return {
          ...p,
          features: p.features.map((f) => (f.id === featureId ? { ...f, isEnabled } : f)),
        };
      }
      return p;
    });
    notifyPlugins();
  },

  // Update plugin settings object
  updatePluginSetting: (pluginId: string, key: string, value: any): void => {
    globalPlugins = globalPlugins.map((p) => {
      if (p.id === pluginId) {
        return {
          ...p,
          settings: { ...p.settings, [key]: value },
        };
      }
      return p;
    });
    notifyPlugins();
  },

  // Get specific setting value with fallback
  getPluginSetting: <T = any>(pluginId: string, key: string, defaultValue: T): T => {
    const plug = globalPlugins.find((p) => p.id === pluginId);
    if (!plug || !plug.settings || plug.settings[key] === undefined) return defaultValue;
    return plug.settings[key] as T;
  },

  // Enable all plugins
  enableAll: (): void => {
    globalPlugins = globalPlugins.map((p) => ({
      ...p,
      isEnabled: true,
      features: p.features.map((f) => ({ ...f, isEnabled: true })),
    }));
    notifyPlugins();
    PluginManagerAPI.logAction("system", "PLUGIN_STATE", 0, undefined, "info", "All plugins and features enabled.");
  },

  // Disable all plugins
  disableAll: (): void => {
    globalPlugins = globalPlugins.map((p) => ({
      ...p,
      isEnabled: false,
    }));
    notifyPlugins();
    PluginManagerAPI.logAction("system", "PLUGIN_STATE", 0, undefined, "info", "All plugins disabled.");
  },

  // Reset all plugins to default configurations
  resetAllToDefaults: (): void => {
    globalPlugins = DEFAULT_PLUGINS;
    saveStoredPlugins(DEFAULT_PLUGINS);
    notifyPlugins();
    PluginManagerAPI.logAction("system", "PLUGIN_STATE", 0, undefined, "info", "All plugins reset to factory defaults.");
  },

  // Reset single plugin to default
  resetPluginToDefaults: (pluginId: string): void => {
    const def = DEFAULT_PLUGINS.find((p) => p.id === pluginId);
    if (!def) return;
    globalPlugins = globalPlugins.map((p) => (p.id === pluginId ? def : p));
    notifyPlugins();
    PluginManagerAPI.logAction(pluginId, "PLUGIN_STATE", 0, undefined, "info", `Plugin '${def.name}' reset to factory defaults.`);
  },

  // Export current configuration as JSON string
  exportConfig: (): string => {
    return JSON.stringify(globalPlugins, null, 2);
  },

  // Import configuration from JSON string
  importConfig: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) return false;
      globalPlugins = parsed;
      saveStoredPlugins(globalPlugins);
      notifyPlugins();
      PluginManagerAPI.logAction("system", "PLUGIN_STATE", 0, undefined, "success", "Configuration imported successfully.");
      return true;
    } catch {
      return false;
    }
  },

  // Log a new interaction programmatically
  logAction: (
    pluginId: string,
    actionType: PluginActionLog["actionType"],
    level: number,
    step?: number,
    status?: PluginActionLog["status"],
    details = ""
  ): void => {
    const newLog: PluginActionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      pluginId,
      actionType,
      level,
      step,
      status: status || "info",
      details,
    };
    globalActionLogs = [newLog, ...globalActionLogs].slice(0, 500); // Limit logs to 500
    
    // Update stats counter for the target plugin
    const target = globalPlugins.find((p) => p.id === pluginId);
    if (target && target.stats) {
      target.stats.totalEvents = (target.stats.totalEvents || 0) + 1;
      target.stats.lastActive = new Date().toISOString();
    }

    notifyLogs();
  },

  // Retrieve chronological action logs
  getLogs: (): PluginActionLog[] => [...globalActionLogs],

  // Reset all logs
  clearLogs: (): void => {
    globalActionLogs = [];
    notifyLogs();
  },
};

/**
 * Custom React Hook to observe the global action logs reactively
 */
export function useGlobalActionLogs() {
  const [logs, setLogs] = useState<PluginActionLog[]>(PluginManagerAPI.getLogs());

  useEffect(() => {
    const handleUpdate = () => setLogs(PluginManagerAPI.getLogs());
    logSubscribers.add(handleUpdate);
    return () => {
      logSubscribers.delete(handleUpdate);
    };
  }, []);

  return logs;
}

/**
 * Custom React Hook to observe installed learning plugins reactively
 */
export function useLearningPlugins() {
  const [plugins, setPlugins] = useState<LearningPlugin[]>(PluginManagerAPI.getPlugins());

  useEffect(() => {
    const handleUpdate = () => setPlugins(PluginManagerAPI.getPlugins());
    pluginSubscribers.add(handleUpdate);
    return () => {
      pluginSubscribers.delete(handleUpdate);
    };
  }, []);

  return plugins;
}

/**
 * Custom React Hook to observe a single plugin reactively
 */
export function usePlugin(pluginId: string) {
  const [plugin, setPlugin] = useState<LearningPlugin | undefined>(() => PluginManagerAPI.getPlugin(pluginId));

  useEffect(() => {
    const handleUpdate = () => setPlugin(PluginManagerAPI.getPlugin(pluginId));
    pluginSubscribers.add(handleUpdate);
    return () => {
      pluginSubscribers.delete(handleUpdate);
    };
  }, [pluginId]);

  return plugin;
}
