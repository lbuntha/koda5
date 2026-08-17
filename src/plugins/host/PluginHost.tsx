import React, { useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getPlugin, resolveActivity } from "../registry";
import { createKodaSDK, type KodaHost } from "../sdk/createKodaSDK";
import type { LearnerSnapshot, SkillResult } from "../types";

export interface PluginHostProps {
  /** Activity reference, "pluginId/activityId". */
  activityRef: string;
  /** Lesson-supplied configuration, merged over the activity's defaults. */
  params?: Record<string, unknown>;
  level?: number;
  snapshot: LearnerSnapshot;
  onAwardXp(amount: number): void;
  onComplete(result: SkillResult): void;
  onExit(): void;
}

/**
 * Mounts one activity with its SDK bound.
 *
 * This is the piece the plugin system was missing: `LearningPlugin` could
 * describe a plugin but nothing could run one, so counting had to be hardwired
 * into App.tsx.
 */
export const PluginHost: React.FC<PluginHostProps> = ({
  activityRef,
  params,
  level = 1,
  snapshot,
  onAwardXp,
  onComplete,
  onExit,
}) => {
  const { theme } = useTheme();
  const activity = resolveActivity(activityRef);

  const koda = useMemo(() => {
    const pluginId = activityRef.split("/")[0] ?? "unknown";
    const host: KodaHost = {
      awardXp: onAwardXp,
      completeSkill: onComplete,
      getSnapshot: () => snapshot,
      theme,
      exit: onExit,
    };
    const owner = getPlugin(pluginId);
    return createKodaSDK(pluginId, host, {
      features: owner?.features ?? [],
      settings: owner?.settings ?? {},
    });
    // `snapshot` is read through a getter, so it does not need to re-bind the SDK.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityRef, theme, onAwardXp, onComplete, onExit]);

  if (!activity) {
    // Visible rather than silent: a bad reference is a config bug worth seeing.
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <p className="font-mono font-black text-slate-900 dark:text-white">Activity not found</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Nothing is registered for <code className="font-mono">{activityRef}</code>. Check the
            plugin registry.
          </p>
        </div>
      </div>
    );
  }

  const Component = activity.component as React.ComponentType<{
    params: unknown;
    level: number;
    koda: typeof koda;
    onComplete(result: SkillResult): void;
  }>;

  return (
    <Component
      params={{ ...(activity.defaultParams as object), ...(params ?? {}) }}
      level={level}
      koda={koda}
      onComplete={onComplete}
    />
  );
};
