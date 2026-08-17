import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, EyeOff, Package, Play, Power, RotateCcw, X } from "lucide-react";
import { PluginManagerAPI, useLearningPlugins, type LearningPlugin } from "../../lib/pluginStore";
import { PLUGINS, hiddenReason, type HiddenReason } from "../../plugins/registry";
import { setViewer, useViewer, type Viewer } from "../../plugins/viewer";
import type { Lesson, SettingField, SkillPlugin } from "../../plugins/types";
import { themeSystem } from "../../lib/themeSystem";
import { UIBadge, UISectionHeader, UIStatGrid, UIStatTile } from "../ui";
import { playSound } from "../../utils/audio";
import { PluginHost } from "../../plugins/host/PluginHost";

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

const HIDDEN_COPY: Record<Exclude<HiddenReason, null>, string> = {
  draft: "Draft — visible to developers only.",
  "beta-not-opted-in": "Beta — turn on beta skills below to see it.",
  "outside-age-range": "Outside this learner's age range.",
  "disabled-here": "Switched off on this device.",
};

const PluginRow: React.FC<{
  skill: SkillPlugin;
  stored: LearningPlugin | undefined;
  viewer: Viewer;
  onOpen: () => void;
}> = ({ skill, stored, viewer, onOpen }) => {
  const { manifest } = skill;
  const isEnabled = stored?.isEnabled ?? true;
  const features = stored?.features ?? skill.features;
  const settings = { ...skill.settings, ...(stored?.settings ?? {}) };
  const activeCount = features.filter((f) => f.isEnabled).length;
  const hidden = hiddenReason(skill, viewer);
  const activityCount = Object.keys(skill.activities).length;
  const activityLabel = `${activityCount} ${activityCount === 1 ? "activity" : "activities"}`;

  return (
    <button
      onClick={onOpen}
      className={themeSystem.card(
        "interactive",
        "w-full flex items-center gap-3 p-4 text-left",
      )}
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
          {hidden && <UIBadge variant="neutral">not shown</UIBadge>}
        </span>
        <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {skill.lessons.length} lessons · {activityLabel} · ages {manifest.audience.ages[0]}–
          {manifest.audience.ages[1]} · {manifest.audience.category}
        </span>
      </span>

      <span className="text-[11px] font-mono font-black text-slate-500 dark:text-slate-400 shrink-0">
        {activeCount}/{features.length}
      </span>
      <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
    </button>
  );
};

/** Everything about one skill: what it is, whether it reaches the learner, and how it behaves. */
const PluginDetail: React.FC<{
  skill: SkillPlugin;
  stored: LearningPlugin | undefined;
  viewer: Viewer;
  onBack: () => void;
  onPreview: (lesson: Lesson) => void;
}> = ({ skill, stored, viewer, onBack, onPreview }) => {
  const { manifest } = skill;
  const isEnabled = stored?.isEnabled ?? true;
  const features = stored?.features ?? skill.features;
  const settings = { ...skill.settings, ...(stored?.settings ?? {}) };
  const hidden = hiddenReason(skill, viewer);

  return (
    <div className={themeSystem.spacing.section}>
      <button onClick={onBack} className={themeSystem.button("ghost", "sm")}>
        <ChevronLeft />
        All plugins
      </button>

      <div className={themeSystem.card("default", "p-4 sm:p-5 space-y-5")}>
        <div className="flex items-start gap-3">
          <span className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border-2 border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-mono font-black text-lg text-slate-900 dark:text-white">
                {manifest.name}
              </h2>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                v{manifest.version}
              </span>
              <UIBadge variant={STATUS_TONE[manifest.status] ?? "neutral"}>
                {manifest.status}
              </UIBadge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {manifest.description}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              by {manifest.author} · ages {manifest.audience.ages[0]}–{manifest.audience.ages[1]} ·{" "}
              {manifest.audience.category}
            </p>
          </div>
        </div>

        {hidden && (
          <div className={themeSystem.flash("warning")}>
            <EyeOff className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-sm">{HIDDEN_COPY[hidden]}</p>
          </div>
        )}

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
            Reset to defaults
          </button>
        </div>
      </div>

      <div className={themeSystem.card("default", "p-4 sm:p-5")}>
        <div className={themeSystem.sectionHeader.subtitle}>Features</div>
        <div className="mt-2 divide-y-2 divide-slate-100 dark:divide-slate-800">
          {features.map((feat) => (
            <div key={feat.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{feat.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{feat.description}</div>
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

      {skill.settingsSchema.length > 0 && (
        <div className={themeSystem.card("default", "p-4 sm:p-5")}>
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

      <div className={themeSystem.card("default", "p-4 sm:p-5")}>
        <div className={themeSystem.sectionHeader.subtitle}>Lessons it contributes</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Open one to try it. Nothing you do in a preview counts towards progress.
        </p>
        <ol className="mt-2 divide-y-2 divide-slate-100 dark:divide-slate-800">
          {skill.lessons.map((lesson) => (
            <li key={lesson.id}>
              <button
                onClick={() => {
                  playSound("pop");
                  onPreview(lesson);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
              >
                <span className="text-lg shrink-0">{lesson.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">
                    {lesson.title}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                    {lesson.concept}
                  </span>
                </span>
                <span className="hidden sm:block text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                  {lesson.activity}
                </span>
                <Play className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

/**
 * Runs one lesson exactly as a learner would see it, but sealed off from their
 * record: XP and completions are swallowed rather than written. That is the
 * point of a preview — you can play a lesson to check it without inflating a
 * child's progress, and you can preview a skill that is switched off.
 */
const LessonPreview: React.FC<{ lesson: Lesson; onClose: () => void }> = ({
  lesson,
  onClose,
}) => {
  const [awarded, setAwarded] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <UIBadge variant="warning">Preview</UIBadge>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {lesson.title}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
            {lesson.activity} · progress is not saved
            {awarded > 0 && ` · ${awarded} XP discarded`}
          </div>
        </div>
        <button onClick={onClose} className={themeSystem.button("secondary", "sm")}>
          <X />
          Close
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <PluginHost
          activityRef={lesson.activity}
          params={lesson.params}
          level={(lesson.params?.level as number) ?? 1}
          snapshot={PREVIEW_SNAPSHOT}
          onExit={onClose}
          // Swallowed on purpose — a preview must not touch the learner's record.
          onAwardXp={(xp) => setAwarded((n) => n + xp)}
          onComplete={() => {}}
        />
      </div>
    </div>
  );
};

/** Stand-in learner for previews, so a skill reading progress still renders. */
const PREVIEW_SNAPSHOT = {
  xp: 0,
  level: 1,
  streakDays: 0,
  problemsSolved: 0,
  dailyGoal: 5,
  dailySolved: 0,
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
  const viewer = useViewer();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Lesson | null>(null);

  const storedById = useMemo(
    () => new Map(stored.map((p) => [p.id, p])),
    [stored],
  );

  const totals = useMemo(() => {
    const features = PLUGINS.flatMap((p) => storedById.get(p.manifest.id)?.features ?? p.features);
    return {
      plugins: PLUGINS.length,
      visible: PLUGINS.filter((p) => hiddenReason(p, viewer) === null).length,
      lessons: PLUGINS.reduce((n, p) => n + p.lessons.length, 0),
      activeFeatures: `${features.filter((f) => f.isEnabled).length}/${features.length}`,
    };
  }, [storedById, viewer]);

  const selected = PLUGINS.find((p) => p.manifest.id === selectedId);
  if (selected) {
    return (
      <>
        <PluginDetail
          skill={selected}
          stored={storedById.get(selected.manifest.id)}
          viewer={viewer}
          onBack={() => {
            playSound("pop");
            setSelectedId(null);
          }}
          onPreview={setPreview}
        />
        {preview && <LessonPreview lesson={preview} onClose={() => setPreview(null)} />}
      </>
    );
  }

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
          value={String(totals.visible)}
          label="Visible to learner"
          tone="success"
        />
        <UIStatTile icon={<span>📚</span>} value={String(totals.lessons)} label="Lessons" />
        <UIStatTile icon={<span>🎛️</span>} value={totals.activeFeatures} label="Features on" />
      </UIStatGrid>

      {/* Who the gate is being evaluated against. No accounts yet, so this is
          per-device — see plugins/viewer.ts. */}
      <div className={themeSystem.card("default", "p-4 flex flex-wrap items-center gap-4")}>
        <span className="text-sm font-bold text-slate-900 dark:text-white">Viewing as</span>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Age</span>
          <input
            type="number"
            min={3}
            max={12}
            value={viewer.age}
            onChange={(e) => setViewer({ age: Number(e.target.value) })}
            className="w-16 px-2 py-1 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
          />
        </label>

        <button
          role="switch"
          aria-checked={viewer.betaOptIn}
          onClick={() => setViewer({ betaOptIn: !viewer.betaOptIn })}
          className={themeSystem.button(viewer.betaOptIn ? "primary" : "secondary", "sm")}
        >
          Beta skills {viewer.betaOptIn ? "on" : "off"}
        </button>

        <button
          role="switch"
          aria-checked={viewer.isDeveloper}
          onClick={() => setViewer({ isDeveloper: !viewer.isDeveloper })}
          className={themeSystem.button(viewer.isDeveloper ? "primary" : "secondary", "sm")}
        >
          Developer {viewer.isDeveloper ? "on" : "off"}
        </button>
      </div>

      <div className="space-y-3">
        {PLUGINS.map((skill) => (
          <PluginRow
            key={skill.manifest.id}
            skill={skill}
            stored={storedById.get(skill.manifest.id)}
            viewer={viewer}
            onOpen={() => {
              playSound("pop");
              setSelectedId(skill.manifest.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};
