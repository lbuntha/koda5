import React, { useState, useSyncExternalStore } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Key,
  Mic,
  Monitor,
  Moon,
  Music,
  RotateCcw,
  Star,
  Sun,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { playSound } from "../utils/audio";
import { themeSystem } from "../lib/themeSystem";
import { UISectionHeader } from "./ui";
import { ScoringAPI, type ScoringConfig } from "../lib/scoring";
import { clearProgress } from "../lib/learnerProgress";

interface SettingsPageProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

/** On/off switch. The track colour carries the state; the knob only moves. */
const Switch: React.FC<{ checked: boolean; onChange: () => void; label: string; tone?: "emerald" | "indigo" }> = ({
  checked,
  onChange,
  label,
  tone = "indigo",
}) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:ring-indigo-500 ${
      checked
        ? tone === "emerald"
          ? "bg-emerald-600"
          : "bg-indigo-600"
        : "bg-slate-300 dark:bg-slate-700"
    }`}
  >
    <div
      className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all absolute top-1 ${
        checked ? "left-6" : "left-1"
      }`}
    />
  </button>
);

/** One labelled setting row inside a card. */
const SettingRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}> = ({ icon, title, description, control }) => (
  <div className="bg-surface-muted border border-line rounded-2xl p-4 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-ink font-mono">{title}</h4>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </div>
    {control}
  </div>
);


/** One numeric scoring control: a slider and the value it is set to. */
const ScoringSlider: React.FC<{
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format(value: number): string;
  onChange(value: number): void;
}> = ({ label, description, value, min, max, step, format, onChange }) => (
  <div className="bg-surface-muted border border-line rounded-2xl p-4 flex items-center justify-between gap-4">
    <div className="min-w-0">
      <h4 className="text-sm font-bold text-ink font-mono">{label}</h4>
      <p className="text-xs text-muted">{description}</p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-28 sm:w-36 accent-indigo-600"
        aria-label={label}
      />
      <span className="w-14 text-right text-sm font-mono font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
        {format(value)}
      </span>
    </div>
  </div>
);

/**
 * The reward economy, in one place.
 *
 * Every skill scores its rounds through the same function, and that function
 * reads these values — so tuning them here changes counting, addition and
 * anything installed later, with no skill edit and no rebuild. A skill that
 * set its own rates is the thing this replaces: XP is one number a learner
 * carries across every skill, so it cannot mean two things.
 */
const ScoringSection: React.FC = () => {
  useSyncExternalStore(ScoringAPI.subscribe, ScoringAPI.version);
  const config = ScoringAPI.current();
  const set = (patch: Partial<ScoringConfig>) => ScoringAPI.update(patch);

  return (
    <section className={themeSystem.card("default", `${themeSystem.spacing.card} space-y-4`)}>
      <UISectionHeader
        title="Scoring & XP"
        subtitle="What a finished level is worth — applies to every skill"
        icon={<Star className="w-5 h-5 text-amber-500" />}
        action={
          ScoringAPI.isEdited() ? (
            <button
              onClick={() => {
                ScoringAPI.reset();
                playSound("pop");
              }}
              className={themeSystem.button("secondary", "sm")}
            >
              <RotateCcw />
              Reset
            </button>
          ) : undefined
        }
      />

      <div className="space-y-3">
        <ScoringSlider
          label="Two-star share"
          description="How much of a level's XP a two-star round pays."
          value={config.twoStarShare}
          min={0}
          max={1}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => set({ twoStarShare: v })}
        />
        <ScoringSlider
          label="One-star share"
          description="Same, for a round below the two-star line."
          value={config.oneStarShare}
          min={0}
          max={1}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => set({ oneStarShare: v })}
        />
        <ScoringSlider
          label="XP per level"
          description="What one finished level is worth at three stars. The only place XP is set."
          value={config.xpPerLevel}
          min={0}
          max={200}
          step={5}
          format={(v) => `${v} XP`}
          onChange={(v) => set({ xpPerLevel: v })}
        />
        <ScoringSlider
          label="Coins per star"
          description="Same rule, in coins."
          value={config.coinsPerStar}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v}`}
          onChange={(v) => set({ coinsPerStar: v })}
        />
        <ScoringSlider
          label="Three stars at"
          description="First-try accuracy needed for a perfect round."
          value={config.threeStarAt}
          min={0.5}
          max={1}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => set({ threeStarAt: v })}
        />
        <ScoringSlider
          label="Two stars at"
          description="Below this, a round earns one star."
          value={config.twoStarAt}
          min={0}
          max={0.95}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => set({ twoStarAt: v })}
        />
      </div>


    </section>
  );
};


/**
 * Wipe this device's learner and start again.
 *
 * Two steps, because it takes away every star and all the XP a child has
 * earned. Reloads afterwards: the progress is React state at the top of the
 * app, so the cleanest way to adopt an empty learner is to start over.
 */
const ProgressSection: React.FC = () => {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className={themeSystem.card("default", `${themeSystem.spacing.card} space-y-4`)}>
      <UISectionHeader
        title="Learner Progress"
        subtitle="XP, stars and finished levels, saved on this device"
        icon={<Trash2 className="w-5 h-5 text-rose-500" />}
      />

      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              clearProgress();
              window.location.reload();
            }}
            className={themeSystem.button("danger", "sm")}
          >
            <Trash2 />
            Erase progress
          </button>
          <button onClick={() => setConfirming(false)} className={themeSystem.button("secondary", "sm")}>
            Cancel
          </button>
          <span className="text-xs text-muted">
            Every star and all XP, gone. Skills and settings are untouched.
          </span>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className={themeSystem.button("secondary", "sm")}>
          <Trash2 />
          Reset progress
        </button>
      )}
    </section>
  );
};

/**
 * System settings — the device-level preferences that apply across the whole
 * app: appearance, audio output, and the API credential. Learner-facing
 * personalisation lives with the learner; skill configuration lives in the
 * Skill Manager.
 */
export const SettingsPage: React.FC<SettingsPageProps> = ({
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("custom_gemini_api_key") || "");
  const [showKey, setShowKey] = useState(false);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  const handleToggleSound = () => {
    // Toggle first so switching sound back on is confirmed by the pop itself.
    onToggleSound();
    playSound("pop");
  };

  const handleToggleVoice = () => {
    playSound("pop");
    onToggleVoice();
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("custom_gemini_api_key", customApiKey.trim());
    playSound("pop");
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 3000);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("custom_gemini_api_key");
    setCustomApiKey("");
    playSound("pop");
  };

  return (
    <div className={`max-w-3xl mx-auto ${themeSystem.spacing.page} space-y-6 pb-16`}>
      <div>
        <h2 className={themeSystem.typography("h2")}>System Settings</h2>
        <p className={themeSystem.typography("body-sm", "mt-1")}>
          Preferences that apply across the whole app on this device.
        </p>
      </div>

      {/* APPEARANCE */}
      <section className={themeSystem.card("default", `${themeSystem.spacing.card} space-y-4`)}>
        <UISectionHeader
          title="Appearance"
          subtitle="Light or dark interface"
          icon={<Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <SettingRow
          icon={
            isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />
          }
          title="Dark Mode"
          description={isDark ? "Dark surfaces, light text" : "Light surfaces, dark text"}
          control={
            <Switch
              checked={isDark}
              onChange={() => {
                playSound("pop");
                toggleTheme();
              }}
              label="Dark mode"
            />
          }
        />
      </section>

      {/* AUDIO & VOICE */}
      <section className={themeSystem.card("default", `${themeSystem.spacing.card} space-y-4`)}>
        <UISectionHeader
          title="Audio & Voice"
          subtitle="Sound FX and spoken guidance — both off leaves the app silent"
          icon={<Music className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SettingRow
            icon={
              soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted" />
              )
            }
            title="Sound FX"
            description="Pops, chimes, and victory fanfares"
            control={
              <Switch checked={soundEnabled} onChange={handleToggleSound} label="Sound effects" tone="emerald" />
            }
          />
          <SettingRow
            icon={
              <Mic className={`w-5 h-5 ${voiceEnabled ? "text-indigo-600 dark:text-indigo-400" : "text-muted"}`} />
            }
            title="Koda's Voice"
            description="Spoken socratic guidance & chat"
            control={<Switch checked={voiceEnabled} onChange={handleToggleVoice} label="Voice speech" />}
          />
        </div>
      </section>

      {/* SCORING */}
      <ScoringSection />

      {/* LEARNER PROGRESS */}
      <ProgressSection />

      {/* GEMINI API */}
      <section className={themeSystem.card("default", `${themeSystem.spacing.card} space-y-4`)}>
        <UISectionHeader
          title="Gemini API"
          subtitle="Custom key for production — the development default is used when blank"
          icon={<Key className="w-5 h-5 text-amber-500" />}
        />

        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="gemini-api-key" className="text-xs font-mono font-bold text-body">
              Custom Gemini API Key
            </label>
            <div className="relative">
              <input
                id="gemini-api-key"
                type={showKey ? "text" : "password"}
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-surface-muted border border-line rounded-2xl px-4 py-3 pr-12 text-sm font-mono text-ink placeholder:text-muted focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button type="submit" className={themeSystem.button("primary", "sm")}>
                Save API Key
              </button>
              {customApiKey && (
                <button type="button" onClick={handleClearApiKey} className={themeSystem.button("secondary", "sm")}>
                  Clear
                </button>
              )}
            </div>

            {savedKeySuccess && (
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Key saved to local storage!
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};
