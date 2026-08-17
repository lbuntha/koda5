import React, { useState } from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  Sun,
  Moon,
  Gamepad2,
  Check,
  Music,
  User,
  Flame,
  Zap,
  Terminal,
  Settings2,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Sliders,
  Boxes,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { playSound } from "../utils/audio";
import { useGlobalActionLogs, useLearningPlugins, PluginManagerAPI } from "../lib/pluginStore";
import { PluginSettingsPanel } from "./PluginSettingsPanel";

interface SettingsPageProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  kidThemeMode: "magical" | "cyber" | "candy" | "retro";
  onSelectKidTheme: (theme: "magical" | "cyber" | "candy" | "retro") => void;
  selectedAvatar: string;
  onSelectAvatar: (avatar: string) => void;
  gameSpeed: "gentle" | "brave" | "speedster";
  onSelectGameSpeed: (speed: "gentle" | "brave" | "speedster") => void;
  userProgress: {
    xp: number;
    streakDays: number;
  };
  initialSection?: "plugins" | "profile";
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  kidThemeMode,
  onSelectKidTheme,
  selectedAvatar,
  onSelectAvatar,
  gameSpeed,
  onSelectGameSpeed,
  userProgress,
  initialSection = "plugins",
}) => {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<"plugins" | "profile">(initialSection);
  const plugins = useLearningPlugins();
  const countingPlugin = plugins.find((p) => p.id === "counting-mastery");

  const handleToggleSound = () => {
    playSound("pop");
    onToggleSound();
  };

  const handleToggleVoice = () => {
    playSound("pop");
    onToggleVoice();
  };

  const themesList = [
    {
      id: "magical" as const,
      name: "Magical Forest",
      description: "Lush green & sparkling emerald woodscapes",
      bgClass: "bg-gradient-to-br from-emerald-950 to-teal-900 border-emerald-500/40 text-emerald-100",
      accent: "text-emerald-400",
      emoji: "🌿✨",
    },
    {
      id: "cyber" as const,
      name: "Cyber Quest",
      description: "Futuristic neon grids & cool spaceships",
      bgClass: "bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-500/40 text-indigo-100",
      accent: "text-indigo-400",
      emoji: "🚀🤖",
    },
    {
      id: "candy" as const,
      name: "Candy Kingdom",
      description: "Sweet fluffy pink clouds & sweet lollipops",
      bgClass: "bg-gradient-to-br from-pink-950 to-rose-900 border-rose-500/40 text-rose-100",
      accent: "text-rose-400",
      emoji: "🍭🎈",
    },
    {
      id: "retro" as const,
      name: "Retro Arcade",
      description: "Pixel-perfect nostalgic 8-bit classic gaming",
      bgClass: "bg-gradient-to-br from-amber-950 to-orange-900 border-amber-500/40 text-amber-100",
      accent: "text-amber-400",
      emoji: "👾🕹️",
    },
  ];

  const avatars = [
    { id: "dino", name: "Koda the Dino", emoji: "🦖", description: "Roaring helper" },
    { id: "astronaut", name: "Space Cadet", emoji: "👩‍🚀", description: "Cosmic math explorer" },
    { id: "wizard", name: "Koda Wizard", emoji: "🧙‍♂️", description: "Magical counter" },
    { id: "ninja", name: "Pixel Ninja", emoji: "🥷", description: "Math accuracy expert" },
  ];

  const speeds = [
    { id: "gentle" as const, name: "Gentle Explorer", desc: "No timers, cozy Socratic helpers", xpBonus: "1x XP" },
    { id: "brave" as const, name: "Brave Adventurer", desc: "Classic socratic guidance puzzles", xpBonus: "1.5x XP" },
    { id: "speedster" as const, name: "Math Speedster", desc: "Faster dynamic counters!", xpBonus: "2x XP 🔥" },
  ];

  const [customApiKey, setCustomApiKey] = React.useState(() => {
    return localStorage.getItem("custom_gemini_api_key") || "";
  });
  const [showKey, setShowKey] = React.useState(false);
  const [savedKeySuccess, setSavedKeySuccess] = React.useState(false);

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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* SECTION SELECTOR NAV TABS */}
      <div className="flex items-center gap-3 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-sm max-w-xl mx-auto">
        <button
          onClick={() => {
            playSound("pop");
            setActiveSection("plugins");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSection === "plugins"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Plugin & Feature Manager</span>
          {countingPlugin && (
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {countingPlugin.features.filter((f) => f.isEnabled).length}/{countingPlugin.features.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            playSound("pop");
            setActiveSection("profile");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSection === "profile"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Clubhouse Profile</span>
        </button>
      </div>

      {/* VIEW 1: PLUGINS & FEATURE MANAGEMENT */}
      {activeSection === "plugins" && (
        <PluginSettingsPanel />
      )}

      {/* VIEW 2: CLUBHOUSE PROFILE & GAMEPLAY */}
      {activeSection === "profile" && (
        <div className="space-y-8 animate-fadeIn">
          {/* HEADER SECTION */}
          <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 rounded-3xl p-6 border-2 border-indigo-500/30 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-indigo-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-4xl shrink-0 shadow-lg border-2 border-indigo-400/30 animate-bounce">
              {avatars.find((a) => a.id === selectedAvatar)?.emoji || "🦖"}
            </div>
            <div className="text-center md:text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Koda's Clubhouse Settings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Welcome to your Command Center!
              </h2>
              <p className="text-slate-300 text-sm max-w-lg">
                Hi! I am Koda. Tap the options below to customize your math adventure just the way you like it!
              </p>
            </div>

            {/* Dynamic XP Badge on top-right */}
            <div className="md:ml-auto flex items-center gap-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-black font-mono text-amber-400 leading-none">
                    {userProgress.streakDays} Days
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    STREAK
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-black font-mono text-indigo-300 leading-none">
                    {userProgress.xp} XP
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    POINTS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK BANNER TO JUMP TO PLUGIN SETTINGS */}
          <div
            onClick={() => {
              playSound("pop");
              setActiveSection("plugins");
            }}
            className="bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-purple-500/25 border-2 border-amber-400/40 rounded-3xl p-5 flex items-center justify-between gap-4 transition cursor-pointer group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Sliders className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black text-white font-mono">
                    Manage Counting & Learning Plugins
                  </h4>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                    CONFIGURATOR
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tune tactile pop physics, speech synthesizer rates, 1-to-1 tag badges, and pedagogical tips.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          {/* GEMINI API CONFIGURATION */}
          <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Key className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-mono">Gemini API Configuration</h3>
                  <p className="text-xs text-slate-400">Set custom API key for production (uses default in development)</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300">Custom Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Save API Key
                  </button>
                  {customApiKey && (
                    <button
                      type="button"
                      onClick={handleClearApiKey}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-mono text-xs font-bold transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {savedKeySuccess && (
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Key saved to local storage!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* AUDIO & VOICE SETTINGS */}
          <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Music className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-mono">Audio & Voice Engine</h3>
                <p className="text-xs text-slate-400">Manage sound FX & AI conversational voice</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sound Effects Toggle */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200">
                    {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">Game Sound FX</h4>
                    <p className="text-xs text-slate-400">Pops, chimes, and victory fanfares</p>
                  </div>
                </div>

                <button
                  onClick={handleToggleSound}
                  className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                      soundEnabled ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Socratic Voice Toggle */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200">
                    <Mic className={`w-5 h-5 ${voiceEnabled ? "text-indigo-400" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">Koda's Voice Speech</h4>
                    <p className="text-xs text-slate-400">Spoken socratic guidance & chat</p>
                  </div>
                </div>

                <button
                  onClick={handleToggleVoice}
                  className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                    voiceEnabled ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                      voiceEnabled ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* AVATAR CHOOSER */}
          <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-mono">Choose Your Math Avatar</h3>
                <p className="text-xs text-slate-400">Pick your favorite character companion</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {avatars.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => {
                      playSound("pop");
                      onSelectAvatar(av.id);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer text-center ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10 scale-105"
                        : "bg-slate-800/40 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-4xl">{av.emoji}</span>
                    <span className="text-xs font-bold text-white font-mono">{av.name}</span>
                    <span className="text-[10px] text-slate-400">{av.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* THEME CHOOSER */}
          <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                <Gamepad2 className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-mono">Clubhouse Theme</h3>
                <p className="text-xs text-slate-400">Visual atmosphere and aesthetic world</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themesList.map((th) => {
                const isSelected = kidThemeMode === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      playSound("pop");
                      onSelectKidTheme(th.id);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer ${th.bgClass} ${
                      isSelected ? "ring-2 ring-white shadow-lg scale-[1.02]" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{th.emoji}</span>
                      {isSelected && (
                        <span className="bg-white/20 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black mt-2">{th.name}</h4>
                    <p className="text-xs opacity-80 mt-0.5">{th.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SPEED / DIFFICULTY PACING */}
          <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-mono">Learning Pace & XP Multipliers</h3>
                <p className="text-xs text-slate-400">Adjust the timer pacing and bonus point rate</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {speeds.map((sp) => {
                const isSelected = gameSpeed === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      playSound("pop");
                      onSelectGameSpeed(sp.id);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/60 shadow-md scale-[1.02]"
                        : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black font-mono text-white">{sp.name}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {sp.xpBonus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{sp.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected Pace</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
