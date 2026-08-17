import React, { useMemo, useState } from "react";
import { ChevronDown, Package, Power, RotateCcw } from "lucide-react";
import { PluginManagerAPI, useLearningPlugins, type LearningPlugin } from "../../lib/pluginStore";
import { PLUGINS } from "../../plugins/registry";
import type { SettingField, SkillPlugin } from "../../plugins/types";
import { themeSystem } from "../../lib/themeSystem";
import { UIBadge, UISectionHeader, UIStatGrid, UIStatTile } from "../ui";
import { playSound } from "../../utils/audio";

const STATUS_TONE: Record<string, "success" | "warning" | "neutral"> = {
  published: "success",
  beta: "warning",
  draft: "neutral",
};

/** One control, rendered from the plugin's own `settingsSchema`. */
const SettingControl: React.FC<{
  field: SettingField;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
}> = ({ field, value, disabled, onChange }) => {
  const label = (
    <div className="min-w-0">
      <div className="text-sm font-bold text-slate-900 dark:text-white">{field.label}</div>
      {field.help && (
        <div className="text-xs text-slate-500 dark:text-slate-400">{field.help}</div>
      )}
    </div>
  );

  if (field.type === "number") {
    const current = typeof value === "number" ? value : field.min;
    return (
      <div className="flex items-center justify-between gap-4 py-3">
        {label}
        <div className="flex items-center gap-3 shrink-0">
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={current}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-36 accent-indigo-600 disabled:opacity-40"
            aria-label={field.label}
          />
          <span className="w-14 text-right text-sm font-mono font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
            {current}
            {field.unit ?? ""}
          </span>
        </div>
      </div>
    );
  }

  if (field.type === "choice") {
    return (
      <div className="flex items-center justify-between gap-4 py-3">
        {label}
        <div className="flex items-center gap-1.5 shrink-0">
          {field.options.map((opt) => (
            <button
              key={opt.value}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border-2 transition disabled:opacity-40 ${
                value === opt.value
                  ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/40"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      {label}
      <button
        disabled={disabled}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={Boolean(value)}
        aria-label={field.label}
        className={`w-11 h-6 rounded-full border-2 transition shrink-0 disabled:opacity-40 ${
          value
            ? "bg-indigo-600 border-indigo-700"
            : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
};

const PluginCard: React.FC<{
  skill: SkillPlugin;
  stored: LearningPlugin | undefined;
  expanded: boolean;
  onToggleExpand: () => void;
}> = ({ skill, stored, expanded, onToggleExpand }) => {
  const { manifest } = skill;
  const isEnabled = stored?.isEnabled ?? true;
  const features = stored?.features ?? skill.features;
  const settings = { ...skill.settings, ...(stored?.settings ?? {}) };
  const activeCount = features.filter((f) => f.isEnabled).length;

  return (
    <div className={themeSystem.card("default", "overflow-hidden")}>
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        aria-expanded={expanded}
      >
        <span className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border-2 border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-black text-slate-900 dark:text-white">
              {manifest.name}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              v{manifest.version}
            </span>
            <UIBadge variant={STATUS_TONE[manifest.status] ?? "neutral"}>{manifest.status}</UIBadge>
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {skill.lessons.length} lessons · {Object.keys(skill.activities).length} activities ·
            ages {manifest.audience.ages[0]}–{manifest.audience.ages[1]} ·{" "}
            {manifest.audience.category}
          </span>
        </span>

        <span className="text-[11px] font-mono font-black text-slate-500 dark:text-slate-400 shrink-0">
          {activeCount}/{features.length}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t-2 border-slate-200 dark:border-slate-800 p-4 space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">{manifest.description}</p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                playSound("pop");
                PluginManagerAPI.togglePlugin(manifest.id);
              }}
              className={themeSystem.button(isEnabled ? "secondary" : "primary", "sm")}
            >
              <Power />
              {isEnabled ? "Disable skill" : "Enable skill"}
            </button>
            <button
              onClick={() => {
                playSound("pop");
                PluginManagerAPI.resetPluginToDefaults(manifest.id);
              }}
              className={themeSystem.button("ghost", "sm")}
            >
              <RotateCcw />
              Reset
            </button>
          </div>

          {/* Features — every one of these is checked in code. */}
          <div>
            <div className={themeSystem.sectionHeader.subtitle}>Features</div>
            <div className="mt-2 divide-y-2 divide-slate-100 dark:divide-slate-800">
              {features.map((feat) => (
                <div key={feat.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {feat.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {feat.description}
                    </div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={feat.isEnabled}
                    aria-label={feat.name}
                    disabled={!isEnabled}
                    onClick={() => {
                      playSound("pop");
                      PluginManagerAPI.toggleFeature(manifest.id, feat.id);
                    }}
                    className={`w-11 h-6 rounded-full border-2 transition shrink-0 disabled:opacity-40 ${
                      feat.isEnabled
                        ? "bg-indigo-600 border-indigo-700"
                        : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        feat.isEnabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings — rendered from the manifest's schema, so a new skill needs
              no code here. */}
          {skill.settingsSchema.length > 0 && (
            <div>
              <div className={themeSystem.sectionHeader.subtitle}>Settings</div>
              <div className="mt-2 divide-y-2 divide-slate-100 dark:divide-slate-800">
                {skill.settingsSchema.map((field) => (
                  <SettingControl
                    key={field.key}
                    field={field}
                    value={settings[field.key]}
                    disabled={!isEnabled}
                    onChange={(v) => PluginManagerAPI.updatePluginSetting(manifest.id, field.key, v)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Plugin manager.
 *
 * Reads the registry, so every registered skill appears with no edit here. The
 * page it replaced hardcoded one plugin id in 18 places and rendered bespoke
 * controls for that plugin's settings.
 */
export const PluginManagerPage: React.FC = () => {
  const stored = useLearningPlugins();
  const [expandedId, setExpandedId] = useState<string | null>(PLUGINS[0]?.manifest.id ?? null);

  const storedById = useMemo(
    () => new Map(stored.map((p) => [p.id, p])),
    [stored],
  );

  const totals = useMemo(() => {
    const features = PLUGINS.flatMap((p) => storedById.get(p.manifest.id)?.features ?? p.features);
    return {
      plugins: PLUGINS.length,
      enabled: PLUGINS.filter((p) => storedById.get(p.manifest.id)?.isEnabled ?? true).length,
      lessons: PLUGINS.reduce((n, p) => n + p.lessons.length, 0),
      activeFeatures: `${features.filter((f) => f.isEnabled).length}/${features.length}`,
    };
  }, [storedById]);

  return (
    <div className={themeSystem.spacing.section}>
      <UISectionHeader
        icon="🧩"
        title="Plugins"
        subtitle="Every skill registered in this build. Toggle a skill or tune how it behaves."
      />

      <UIStatGrid>
        <UIStatTile icon={<Package />} value={String(totals.plugins)} label="Installed" />
        <UIStatTile
          icon={<Power />}
          value={String(totals.enabled)}
          label="Enabled"
          tone="success"
        />
        <UIStatTile icon={<span>📚</span>} value={String(totals.lessons)} label="Lessons" />
        <UIStatTile icon={<span>🎛️</span>} value={totals.activeFeatures} label="Features on" />
      </UIStatGrid>

      <div className="space-y-3">
        {PLUGINS.map((skill) => (
          <PluginCard
            key={skill.manifest.id}
            skill={skill}
            stored={storedById.get(skill.manifest.id)}
            expanded={expandedId === skill.manifest.id}
            onToggleExpand={() =>
              setExpandedId(expandedId === skill.manifest.id ? null : skill.manifest.id)
            }
          />
        ))}
      </div>
    </div>
  );
};
