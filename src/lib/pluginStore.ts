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

const DEFAULT_PLUGINS: LearningPlugin[] = [
  {
    id: "counting-mastery",
    name: "Counting Mastery Engine",
    version: "2.4.0",
    description: "Core interactive counting, one-to-one correspondence & quantity visualization engine.",
    category: "core",
    author: "Koda Math Lab",
    isEnabled: true,
    iconName: "Sparkles",
    stats: { totalEvents: 142, lastActive: new Date().toISOString() },
    settings: {
      speechRate: 1.0,
      popScaleFactor: 1.2,
      hapticIntensity: "crisp",
      autoReadQuestions: false,
      showItemCountBadges: true,
      tenFrameAccentColor: "emerald",
      confettiParticles: 40,
    },
    features: [
      {
        id: "tactile_pop",
        name: "Tactile Object Bounce & Pop FX",
        description: "Plays animated elastic bounce and pop scaling when interacting with countable items.",
        isEnabled: true,
        tag: "Visual & Haptic",
      },
      {
        id: "haptic_feedback",
        name: "Haptic Vibration Feedback (Navigator.vibrate)",
        description: "Sends crisp tactile vibration pulses synchronized with the manipulative tap-pop-anim sequence.",
        isEnabled: true,
        tag: "Haptic",
      },
      {
        id: "audio_speech",
        name: "Audio Speech Counter (TTS)",
        description: "Speaks cardinal number words ('one, two, three...') aloud upon touching objects.",
        isEnabled: true,
        tag: "Audio",
      },
      {
        id: "counting_badges",
        name: "1-to-1 Correspondence Badges",
        description: "Displays numbered index badges on touched objects to prevent double-counting.",
        isEnabled: true,
        tag: "Cognitive",
      },
      {
        id: "spatial_randomizer",
        name: "Spatial Arrangement Randomizer",
        description: "Randomizes object geometries across clusters, circles, lines, columns, and scattered fields.",
        isEnabled: true,
        tag: "Pedagogy",
      },
      {
        id: "magnetic_snapping",
        name: "Ten-Frame Magnetic Chamber Snapping",
        description: "Snaps energy fuel cells smoothly into place with tactile grid highlight glow.",
        isEnabled: true,
        tag: "Manipulative",
      },
      {
        id: "socratic_hints",
        name: "Socratic Hint & Guidance Tips",
        description: "Provides scaffolded hints and conceptual breakdowns on demand.",
        isEnabled: true,
        tag: "Pedagogy",
      },
      {
        id: "gamification_multipliers",
        name: "XP Multipliers & Victory Confetti",
        description: "Awards bonus XP, streak flames, and celebratory particle bursts upon level completion.",
        isEnabled: true,
        tag: "Rewards",
      },
      {
        id: "sound_chimes",
        name: "Sound FX & Interactive Chimes",
        description: "Plays pleasant audio feedback tones for popping, tapping, and validating answers.",
        isEnabled: true,
        tag: "Audio",
      },
    ],
  },
  {
    id: "step-header-tagger",
    name: "Contextual Step Header",
    version: "1.2.0",
    description: "Dynamic progression tracking pills, difficulty markers, and audio question reader.",
    category: "visualizer",
    author: "Koda Pedagogical Core",
    isEnabled: true,
    iconName: "Layers",
    stats: { totalEvents: 88, lastActive: new Date().toISOString() },
    settings: {
      showDifficultyPill: true,
      showStepBreadcrumb: true,
      highContrastHeader: false,
    },
    features: [
      {
        id: "step_progress_badge",
        name: "Step Progression Breadcrumb",
        description: "Displays current question number and total step checkpoints (e.g. Step 1 of 5).",
        isEnabled: true,
        tag: "Visual",
      },
      {
        id: "tts_readout_button",
        name: "Question Text-to-Speech Button",
        description: "Allows children to listen to the question prompt with natural voice synthesis.",
        isEnabled: true,
        tag: "Accessibility",
      },
      {
        id: "concept_banner",
        name: "Collapsible Pedagogical Concept Banner",
        description: "Shows underlying math learning objectives and mastery domain tags.",
        isEnabled: true,
        tag: "Pedagogy",
      },
      {
        id: "difficulty_badge",
        name: "Bloom's Difficulty Rating Pill",
        description: "Indicates skill difficulty level (Foundation, Intermediate, Mastery).",
        isEnabled: true,
        tag: "Pedagogy",
      },
    ],
  },
  {
    id: "feedback-drawer",
    name: "Adaptive Feedback Drawer",
    version: "1.3.0",
    description: "Socratic success celebrations, structured error guidance, and instant AI tutor links.",
    category: "utility",
    author: "Synthesis Adaptive Engine",
    isEnabled: true,
    iconName: "Zap",
    stats: { totalEvents: 64, lastActive: new Date().toISOString() },
    settings: {
      autoDismissSeconds: 0,
      showKodaVoiceLink: true,
    },
    features: [
      {
        id: "celebration_banner",
        name: "Celebration Banner with Stars",
        description: "Displays rich feedback modal highlighting specific mathematical achievements.",
        isEnabled: true,
        tag: "Visual",
      },
      {
        id: "socratic_error_hint",
        name: "Socratic Error Guidance & Clarification",
        description: "Breaks down incorrect attempts with helpful guiding questions rather than plain answers.",
        isEnabled: true,
        tag: "Pedagogy",
      },
      {
        id: "koda_voice_launcher",
        name: "Koda Live Voice Link",
        description: "Quick 1-tap button to chat with Koda Live Voice for instant conversational help.",
        isEnabled: true,
        tag: "AI Assistant",
      },
      {
        id: "streak_counter_hud",
        name: "Streak Multiplier HUD",
        description: "Maintains active streak counter and fires streak bonus sounds.",
        isEnabled: true,
        tag: "Gamification",
      },
    ],
  },
  {
    id: "gemini-coach",
    name: "Gemini Live Voice Coach",
    version: "3.1.0",
    description: "Multi-modal AI assistant providing real-time low-latency voice feedback and whiteboard vision.",
    category: "assistant",
    author: "Google Gemini Core",
    isEnabled: true,
    iconName: "Mic",
    stats: { totalEvents: 42, lastActive: new Date().toISOString() },
    settings: {
      voicePersona: "Kore",
      autoPcmPlayback: true,
      maxTurnTokens: 250,
    },
    features: [
      {
        id: "live_audio_stream",
        name: "Real-time Voice Conversation",
        description: "Bi-directional Socratic audio dialogue via Gemini 2.5/Flash WebSocket stream.",
        isEnabled: true,
        tag: "AI Audio",
      },
      {
        id: "socratic_prompting",
        name: "Pedagogical Socratic Scaffolding",
        description: "Guides learners with questions instead of revealing answers directly.",
        isEnabled: true,
        tag: "Pedagogy",
      },
      {
        id: "whiteboard_vision",
        name: "Whiteboard Canvas Vision",
        description: "Transmits whiteboard doodles and handwritten math formulas to Gemini for visual analysis.",
        isEnabled: true,
        tag: "Multimodal",
      },
    ],
  },
  {
    id: "whiteboard-scratchpad",
    name: "Interactive Whiteboard Scratchpad",
    version: "1.1.0",
    description: "Full-featured digital canvas for freehand drawing, tally counting, and equation scratch work.",
    category: "visualizer",
    author: "Koda Creative Tools",
    isEnabled: true,
    iconName: "PenTool",
    stats: { totalEvents: 31, lastActive: new Date().toISOString() },
    settings: {
      defaultStrokeWidth: 4,
      defaultColor: "#818cf8",
      enableGridBackground: true,
    },
    features: [
      {
        id: "freehand_canvas",
        name: "Smooth Drawing & Stroke Smoothing",
        description: "Fluid touch/mouse drawing canvas with high-contrast color palette.",
        isEnabled: true,
        tag: "Tools",
      },
      {
        id: "math_tally_helper",
        name: "Tally & Grouping Dot Helper",
        description: "Quick dot stamps for tallying numbers and grouping quantities.",
        isEnabled: true,
        tag: "Manipulative",
      },
      {
        id: "undo_redo_history",
        name: "Undo / Redo Stroke Memory",
        description: "Full action history stack for safe sketching and experimentation.",
        isEnabled: true,
        tag: "Utility",
      },
    ],
  },
];

// LocalStorage Persistence Keys
const STORAGE_KEY_PLUGINS = "koda_learning_plugins_v2";
const STORAGE_KEY_LOGS = "koda_plugin_logs_v2";

// Initialize plugins from LocalStorage or default
function loadStoredPlugins(): LearningPlugin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLUGINS);
    if (!raw) return DEFAULT_PLUGINS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PLUGINS;

    // Merge with DEFAULT_PLUGINS in case new plugins/features were added in newer versions
    return DEFAULT_PLUGINS.map((def) => {
      const found = parsed.find((p: any) => p.id === def.id);
      if (!found) return def;

      const mergedFeatures = def.features.map((defFeat) => {
        const savedFeat = found.features?.find((f: any) => f.id === defFeat.id);
        return savedFeat ? { ...defFeat, isEnabled: savedFeat.isEnabled } : defFeat;
      });

      return {
        ...def,
        isEnabled: typeof found.isEnabled === "boolean" ? found.isEnabled : def.isEnabled,
        settings: { ...def.settings, ...found.settings },
        stats: {
          totalEvents: found.stats?.totalEvents ?? def.stats?.totalEvents ?? 0,
          lastActive: found.stats?.lastActive ?? def.stats?.lastActive ?? new Date().toISOString(),
        },
        features: mergedFeatures,
      };
    });
  } catch (err) {
    console.warn("Failed to load stored plugins:", err);
    return DEFAULT_PLUGINS;
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

let globalActionLogs: PluginActionLog[] = [
  {
    id: "init-log-0",
    timestamp: new Date().toISOString(),
    pluginId: "counting-mastery",
    actionType: "START_LEVEL",
    level: 1,
    step: 1,
    status: "info",
    details: "Counting Mastery v2.4.0 active with 8 granular feature modules.",
  },
];

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
