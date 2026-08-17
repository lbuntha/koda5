import { PluginManagerAPI, type PluginFeature } from "../../lib/pluginStore";
import { playBase64Pcm, playSound, speakWebSpeech } from "../../utils/audio";
import { triggerHaptic, triggerTapPopHaptic } from "../../utils/haptics";
import type { KodaSDK, LearnerSnapshot, PluginAction, SkillResult, SoundType } from "../types";

/**
 * A plugin's own declared defaults, used when the persisted store has no entry
 * for this id yet — a freshly registered skill must still work before anyone has
 * opened Plugin Lab.
 */
export interface PluginDefaults {
  features: PluginFeature[];
  settings: Record<string, unknown>;
}

/**
 * Services the app must supply. Everything else the SDK builds for itself.
 * Kept deliberately small — the more the host injects, the more a plugin can
 * accidentally depend on.
 */
export interface KodaHost {
  awardXp(amount: number): void;
  completeSkill(result: SkillResult): void;
  getSnapshot(): LearnerSnapshot;
  theme: "light" | "dark";
  exit(): void;
}

const apiKey = () => localStorage.getItem("custom_gemini_api_key") || "";

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, customApiKey: apiKey() }),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Builds the global API for one plugin.
 *
 * `pluginId` is bound once here, so a skill can neither read another plugin's
 * configuration nor log under another plugin's name — the bug that exists today
 * where counting logs against "step-header-tagger".
 *
 * Calls that could ever cross a process boundary return Promises even where the
 * current implementation is synchronous, so sandboxing a plugin later is a swap
 * rather than a rewrite of every skill.
 */
export function createKodaSDK(
  pluginId: string,
  host: KodaHost,
  defaults: PluginDefaults = { features: [], settings: {} },
): KodaSDK {
  const knownToStore = () => PluginManagerAPI.getPlugin(pluginId) !== undefined;

  return {
    pluginId,

    sound: {
      play(type: SoundType) {
        playSound(type);
      },
    },

    haptics: {
      tap() {
        triggerTapPopHaptic();
      },
      success() {
        triggerHaptic("success");
      },
    },

    speech: {
      async say(text: string, opts?: { rate?: number }) {
        if (!text) return;
        const data = await postJson<{ audio?: string }>("/api/tutor/speech", {
          text,
          voice: "Kore",
        });
        if (data?.audio) {
          playBase64Pcm(data.audio);
          return;
        }
        // Server unavailable or no key configured — the browser still speaks.
        speakWebSpeech(text, opts?.rate);
      },
      stop() {
        window.speechSynthesis?.cancel();
      },
    },

    progress: {
      async awardXp(amount: number) {
        host.awardXp(amount);
      },
      async complete(result: SkillResult) {
        host.completeSkill(result);
      },
      async snapshot() {
        // A copy, never live state — live state cannot cross a boundary.
        return { ...host.getSnapshot() };
      },
    },

    ai: {
      async tutor(message: string, ctx: Record<string, unknown> = {}) {
        const data = await postJson<{ replyText?: string }>("/api/tutor/respond", {
          userMessage: message,
          ...ctx,
        });
        return data?.replyText ?? "";
      },
      async generateProblem(spec: Record<string, unknown>) {
        return await postJson<unknown>("/api/tutor/generate-problem", spec);
      },
      async analyzeDrawing(imageBase64: string, prompt = "") {
        const data = await postJson<{ feedback?: string }>("/api/tutor/analyze-drawing", {
          image: imageBase64,
          prompt,
        });
        return data?.feedback ?? "";
      },
    },

    config: {
      get<T>(key: string, fallback: T): T {
        if (knownToStore()) return PluginManagerAPI.getPluginSetting<T>(pluginId, key, fallback);
        const declared = defaults.settings[key];
        return (declared === undefined ? fallback : declared) as T;
      },
      isEnabled(featureId: string, fallback = false) {
        if (knownToStore()) return PluginManagerAPI.isFeatureEnabled(pluginId, featureId, fallback);
        const declared = defaults.features.find((f) => f.id === featureId);
        return declared ? declared.isEnabled : fallback;
      },
    },

    log(action: PluginAction, detail: string, level = 0, step?: number) {
      PluginManagerAPI.logAction(pluginId, action, level, step, "info", detail);
    },

    ui: {
      theme: host.theme,
      exit: host.exit,
    },
  };
}
