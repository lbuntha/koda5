import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Zap,
  Mic,
  PenTool,
  Sliders,
  Check,
  X,
  RefreshCw,
  Play,
  Volume2,
  Download,
  Upload,
  Info,
  Terminal,
  Trash2,
  Flame,
  Activity,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Cpu,
  Star,
  Boxes,
  HelpCircle,
  Eye,
} from "lucide-react";
import {
  LearningPlugin,
  PluginFeature,
  PluginManagerAPI,
  useLearningPlugins,
  useGlobalActionLogs,
  usePlugin,
} from "../lib/pluginStore";
import { playSound, speakWebSpeech } from "../utils/audio";
import { triggerHaptic, triggerTapPopHaptic, isHapticsSupported } from "../utils/haptics";

interface PluginSettingsPanelProps {
  onClose?: () => void;
  compactMode?: boolean;
}

export const PluginSettingsPanel: React.FC<PluginSettingsPanelProps> = ({
  onClose,
  compactMode = false,
}) => {
  const plugins = useLearningPlugins();
  const logs = useGlobalActionLogs();
  const countingPlugin = usePlugin("counting-mastery");

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPluginId, setSelectedPluginId] = useState<string>("counting-mastery");
  const [logFilterPlugin, setLogFilterPlugin] = useState<string>("all");
  const [logFilterStatus, setLogFilterStatus] = useState<string>("all");

  // Sandbox Tester State
  const [sandboxTaps, setSandboxTaps] = useState<number>(0);
  const [isSandboxPopping, setIsSandboxPopping] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [importStatusMessage, setImportStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  // Categories list
  const categories = [
    { id: "all", label: "All Plugins", count: plugins.length },
    { id: "core", label: "Core Engines", count: plugins.filter((p) => p.category === "core").length },
    { id: "visualizer", label: "Visualizers", count: plugins.filter((p) => p.category === "visualizer").length },
    { id: "utility", label: "Utility & Feedback", count: plugins.filter((p) => p.category === "utility").length },
    { id: "assistant", label: "AI Assistants", count: plugins.filter((p) => p.category === "assistant").length },
  ];

  // Filtered plugins
  const filteredPlugins = plugins.filter((plug) => {
    const matchesCategory = selectedCategory === "all" || plug.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      plug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plug.features.some((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchesPlugin = logFilterPlugin === "all" || log.pluginId === logFilterPlugin;
    const matchesStatus = logFilterStatus === "all" || log.status === logFilterStatus;
    return matchesPlugin && matchesStatus;
  });

  // Handle Master Plugin Toggle
  const handleTogglePlugin = (pluginId: string) => {
    playSound("pop");
    PluginManagerAPI.togglePlugin(pluginId);
  };

  // Handle Feature Toggle
  const handleToggleFeature = (pluginId: string, featureId: string) => {
    playSound("pop");
    PluginManagerAPI.toggleFeature(pluginId, featureId);
  };

  // Handle Setting Update
  const handleUpdateSetting = (pluginId: string, key: string, val: any) => {
    playSound("pop");
    PluginManagerAPI.updatePluginSetting(pluginId, key, val);
  };

  // Handle Sandbox Item Click
  const handleSandboxTap = () => {
    const isPopEnabled = PluginManagerAPI.isFeatureEnabled("counting-mastery", "tactile_pop");
    const isAudioEnabled = PluginManagerAPI.isFeatureEnabled("counting-mastery", "audio_speech");
    const isSoundEnabled = PluginManagerAPI.isFeatureEnabled("counting-mastery", "sound_chimes");
    const isHapticEnabled = PluginManagerAPI.isFeatureEnabled("counting-mastery", "haptic_feedback", true);

    if (isSoundEnabled) {
      playSound("pop");
    }

    if (isHapticEnabled) {
      triggerTapPopHaptic();
    }

    if (isPopEnabled) {
      setIsSandboxPopping(true);
      setTimeout(() => setIsSandboxPopping(false), 420);
    }

    const nextCount = sandboxTaps + 1;
    setSandboxTaps(nextCount);

    if (isAudioEnabled) {
      const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
      const word = words[nextCount % words.length] || String(nextCount);
      speakWebSpeech(word);
    }

    PluginManagerAPI.logAction(
      "counting-mastery",
      "TAP_ITEM",
      1,
      nextCount,
      "info",
      `Sandbox tactile test item tapped (${nextCount}). Pop=${isPopEnabled}, Haptic=${isHapticEnabled}, TTS=${isAudioEnabled}`
    );
  };

  // Handle Export Config
  const handleExport = () => {
    playSound("pop");
    const configStr = PluginManagerAPI.exportConfig();
    navigator.clipboard.writeText(configStr);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 3000);
  };

  // Handle Import Config
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const success = PluginManagerAPI.importConfig(importJsonText.trim());
    if (success) {
      playSound("levelup");
      setImportStatusMessage({ type: "success", text: "Plugins configuration applied successfully!" });
      setTimeout(() => {
        setImportModalOpen(false);
        setImportStatusMessage(null);
        setImportJsonText("");
      }, 1500);
    } else {
      playSound("error");
      setImportStatusMessage({ type: "error", text: "Invalid JSON format. Please verify configuration format." });
    }
  };

  // Get icon component
  const getPluginIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className={`${className} text-amber-400`} />;
      case "Layers":
        return <Layers className={`${className} text-cyan-400`} />;
      case "Zap":
        return <Zap className={`${className} text-indigo-400`} />;
      case "Mic":
        return <Mic className={`${className} text-emerald-400`} />;
      case "PenTool":
        return <PenTool className={`${className} text-pink-400`} />;
      default:
        return <Cpu className={`${className} text-purple-400`} />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* TOP HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-purple-950/80 rounded-3xl p-6 sm:p-7 border-2 border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-mono font-bold">
              <Sliders className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
              <span>Plugin Architecture & Feature Manager</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Counting Plugin & Feature Settings
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Granularly configure interactive counting behaviors, tactile physics, speech engines, visualizers, and pedagogical hints across Koda's learning ecosystem.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                playSound("pop");
                PluginManagerAPI.enableAll();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Enable all plugins & features"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Enable All</span>
            </button>

            <button
              onClick={() => {
                playSound("pop");
                PluginManagerAPI.resetAllToDefaults();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Reset all plugins to defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Export configuration JSON to clipboard"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copiedExport ? "Copied JSON!" : "Export JSON"}</span>
            </button>

            <button
              onClick={() => {
                playSound("pop");
                setImportModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Import JSON configuration"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: COUNTING MASTERY PLUGIN SPOTLIGHT & LIVE SANDBOX */}
      {countingPlugin && (
        <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl shadow-amber-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Counting Plugin Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black text-white font-mono tracking-tight">
                    {countingPlugin.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-mono font-bold">
                    v{countingPlugin.version}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
                    By {countingPlugin.author}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {countingPlugin.description}
                </p>
              </div>
            </div>

            {/* Plugin Main Switch */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-400">
                {countingPlugin.isEnabled ? "Plugin Enabled" : "Plugin Disabled"}
              </span>
              <button
                onClick={() => handleTogglePlugin("counting-mastery")}
                className={`px-4 py-2 rounded-2xl font-mono text-xs font-black transition-all transform active:scale-95 cursor-pointer flex items-center gap-2 ${
                  countingPlugin.isEnabled
                    ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md shadow-amber-400/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750"
                }`}
              >
                {countingPlugin.isEnabled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>ACTIVE</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>DISABLED</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Granular Sub-Features Grid for Counting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white font-mono flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Granular Feature Toggles ({countingPlugin.features.filter((f) => f.isEnabled).length}/{countingPlugin.features.length} Active)</span>
              </h4>
              <button
                onClick={() => {
                  playSound("pop");
                  PluginManagerAPI.resetPluginToDefaults("counting-mastery");
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Counting Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {countingPlugin.features.map((feat) => {
                const isActive = countingPlugin.isEnabled && feat.isEnabled;
                return (
                  <div
                    key={feat.id}
                    className={`rounded-2xl p-4 border transition-all flex items-start justify-between gap-3 ${
                      isActive
                        ? "bg-slate-800/80 border-amber-500/30 shadow-sm"
                        : "bg-slate-900/60 border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white font-mono leading-tight">
                          {feat.name}
                        </span>
                        {feat.tag && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/20">
                            {feat.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>

                    {/* Switch Button */}
                    <button
                      onClick={() => handleToggleFeature("counting-mastery", feat.id)}
                      disabled={!countingPlugin.isEnabled}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-black transition-all shrink-0 cursor-pointer ${
                        !countingPlugin.isEnabled
                          ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-750"
                          : feat.isEnabled
                          ? "bg-amber-400 text-slate-950 font-black shadow-sm hover:bg-amber-300"
                          : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750"
                      }`}
                    >
                      {feat.isEnabled ? "ON" : "OFF"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Counting Configurations & Interactive Sandbox */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3 border-t border-slate-800">
            {/* Configuration Sliders */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider font-mono text-amber-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Engine Fine-Tuning</span>
              </h5>

              <div className="space-y-3.5 text-xs">
                {/* Speech Rate Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300">Speech Rate (TTS Speed)</span>
                    <span className="text-amber-400 font-bold">
                      {countingPlugin.settings?.speechRate ?? 1.0}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.1"
                    value={countingPlugin.settings?.speechRate ?? 1.0}
                    onChange={(e) =>
                      handleUpdateSetting("counting-mastery", "speechRate", parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.7x (Gentle)</span>
                    <span>1.0x (Standard)</span>
                    <span>1.4x (Fast)</span>
                  </div>
                </div>

                {/* Pop Scale Factor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300">Tactile Bounce Scale</span>
                    <span className="text-amber-400 font-bold">
                      {countingPlugin.settings?.popScaleFactor ?? 1.2}x
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1.1, 1.2, 1.35].map((scale) => (
                      <button
                        key={scale}
                        onClick={() => handleUpdateSetting("counting-mastery", "popScaleFactor", scale)}
                        className={`py-1.5 rounded-xl font-mono text-[11px] font-bold border transition cursor-pointer ${
                          (countingPlugin.settings?.popScaleFactor ?? 1.2) === scale
                            ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm"
                            : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300"
                        }`}
                      >
                        {scale === 1.1 ? "Subtle (1.1x)" : scale === 1.2 ? "Standard (1.2x)" : "Energetic (1.35x)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Haptic Vibration Intensity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span>Haptic Vibration Intensity</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isHapticsSupported() ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30" : "bg-slate-900 text-slate-500"
                      }`}>
                        {isHapticsSupported() ? "Navigator.vibrate Ready" : "Simulated/Unsupported"}
                      </span>
                    </span>
                    <span className="text-amber-400 font-bold uppercase text-[11px]">
                      {countingPlugin.settings?.hapticIntensity ?? "crisp"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "subtle", label: "Subtle (10ms)", type: "light" as const },
                      { id: "crisp", label: "Crisp (18ms)", type: "pop" as const },
                      { id: "strong", label: "Strong (32ms)", type: "heavy" as const },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          handleUpdateSetting("counting-mastery", "hapticIntensity", opt.id);
                          triggerHaptic(opt.type);
                        }}
                        className={`py-1.5 rounded-xl font-mono text-[10px] font-bold border transition cursor-pointer ${
                          (countingPlugin.settings?.hapticIntensity ?? "crisp") === opt.id
                            ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm"
                            : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ten Frame Accent Theme */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300">Ten-Frame Theme</span>
                    <span className="text-amber-400 font-bold uppercase">
                      {countingPlugin.settings?.tenFrameAccentColor ?? "emerald"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
                      { id: "cyan", label: "Cyan", color: "bg-cyan-500" },
                      { id: "amber", label: "Amber", color: "bg-amber-500" },
                      { id: "purple", label: "Purple", color: "bg-purple-500" },
                    ].map((themeOpt) => (
                      <button
                        key={themeOpt.id}
                        onClick={() => handleUpdateSetting("counting-mastery", "tenFrameAccentColor", themeOpt.id)}
                        className={`py-1.5 px-2 rounded-xl font-mono text-[10px] font-bold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          (countingPlugin.settings?.tenFrameAccentColor ?? "emerald") === themeOpt.id
                            ? "bg-slate-800 border-amber-400 text-white font-black ring-1 ring-amber-400"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${themeOpt.color}`} />
                        <span>{themeOpt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Live Feature Sandbox / Tester */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h5 className="text-xs font-black uppercase tracking-wider font-mono text-amber-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Live Feature Sandbox</span>
                  </h5>
                  <span className="text-[10px] font-mono text-slate-500">
                    Test your toggles live
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Tap the test manipulative below to feel the <strong>Navigator.vibrate()</strong> haptic pulses synchronized with the <strong>tap-pop-anim</strong> bounce.
                </p>
              </div>

              {/* Centered Interactive Sandbox Item */}
              <div className="flex flex-col items-center justify-center py-3">
                <button
                  onClick={handleSandboxTap}
                  style={{
                    transform: isSandboxPopping
                      ? `scale(${countingPlugin.settings?.popScaleFactor ?? 1.2})`
                      : "scale(1)",
                  }}
                  className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-400/50 flex items-center justify-center text-4xl transition-transform duration-200 shadow-lg shadow-amber-500/10 cursor-pointer active:scale-90 select-none ${
                    isSandboxPopping ? "tap-pop-anim ring-4 ring-amber-400/40 shadow-amber-500/30" : ""
                  }`}
                  title="Click to test counting interaction"
                >
                  <span>⭐</span>
                  {/* Tapped Badge */}
                  {PluginManagerAPI.isFeatureEnabled("counting-mastery", "counting_badges") && sandboxTaps > 0 && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shadow-md animate-bounce">
                      {sandboxTaps}
                    </span>
                  )}
                </button>
                <span className="text-[11px] font-mono text-slate-400 mt-3">
                  Tapped <strong className="text-amber-300">{sandboxTaps}</strong> times in test arena
                </span>
              </div>

              {/* Reset Sandbox Taps & Test Celebration */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    playSound("pop");
                    triggerTapPopHaptic();
                    setSandboxTaps(0);
                  }}
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Reset Test Counter
                </button>

                <button
                  onClick={() => {
                    playSound("levelup");
                    triggerHaptic("levelup");
                    speakWebSpeech("Spectacular! Socratic Counting Engine is running at peak performance.");
                    PluginManagerAPI.logAction(
                      "counting-mastery",
                      "CHECK_ANSWER",
                      1,
                      1,
                      "success",
                      "Sandbox celebration & crescendo haptic test triggered successfully."
                    );
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Test Celebration + Haptics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ALL PLUGINS & FEATURES MANAGEMENT DIRECTORY */}
      <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-400" />
              <span>Installed Learning Plugins ({plugins.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any plugin to view and configure its modular capabilities.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plugins & features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playSound("pop");
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${selectedCategory === cat.id ? "bg-indigo-700 text-indigo-100" : "bg-slate-900 text-slate-400"}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Plugins Cards List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPlugins.map((plug) => {
            const isCounting = plug.id === "counting-mastery";
            const activeFeaturesCount = plug.features.filter((f) => f.isEnabled).length;

            return (
              <div
                key={plug.id}
                className={`bg-slate-950/80 border rounded-2xl p-5 transition-all space-y-4 ${
                  plug.isEnabled
                    ? "border-slate-700/80 shadow-md"
                    : "border-slate-800/80 opacity-70"
                }`}
              >
                {/* Plugin Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-center shrink-0">
                      {getPluginIcon(plug.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white font-mono">{plug.name}</h4>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                          v{plug.version}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          {plug.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{plug.description}</p>
                    </div>
                  </div>

                  {/* Plugin Master Switch & Stats */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      {activeFeaturesCount}/{plug.features.length} Features
                    </span>

                    <button
                      onClick={() => handleTogglePlugin(plug.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer ${
                        plug.isEnabled
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                          : "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-750"
                      }`}
                    >
                      {plug.isEnabled ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>
                </div>

                {/* Plugin Sub-Features Expandable Tray */}
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {plug.features.map((feat) => {
                      const isFeatActive = plug.isEnabled && feat.isEnabled;
                      return (
                        <div
                          key={feat.id}
                          className={`rounded-xl p-3 border transition flex items-start justify-between gap-2.5 ${
                            isFeatActive
                              ? "bg-slate-900/90 border-slate-750"
                              : "bg-slate-950 border-slate-850 opacity-50"
                          }`}
                        >
                          <div className="space-y-0.5 pr-1">
                            <span className="text-xs font-bold text-slate-200 font-mono block leading-snug">
                              {feat.name}
                            </span>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              {feat.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleFeature(plug.id, feat.id)}
                            disabled={!plug.isEnabled}
                            className={`px-2 py-1 rounded-lg font-mono text-[9px] font-black transition cursor-pointer shrink-0 ${
                              !plug.isEnabled
                                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                : feat.isEnabled
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700"
                            }`}
                          >
                            {feat.isEnabled ? "ON" : "OFF"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: REAL-TIME TELEMETRY & DIAGNOSTIC LOG STREAM */}
      <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-mono">Live Plugin Diagnostics & Telemetry</h3>
              <p className="text-xs text-slate-400">Chronological interaction event stream across active plugins</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by plugin */}
            <select
              value={logFilterPlugin}
              onChange={(e) => setLogFilterPlugin(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="all">All Plugins ({logs.length})</option>
              {plugins.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Clear button */}
            <button
              onClick={() => {
                playSound("pop");
                PluginManagerAPI.clearLogs();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
              title="Clear Diagnostics Stream"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs Output Box */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/90 font-mono text-[11px] h-[300px] overflow-y-auto space-y-2.5 custom-scrollbar shadow-inner">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-16 flex flex-col items-center gap-1.5">
              <span>⚡ No telemetry logs matching current filter.</span>
              <span className="text-[10px]">Interact with counting tasks or sandbox buttons to trigger events!</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const getStatusColor = () => {
                if (log.status === "error") return "text-rose-400 bg-rose-500/10 border-rose-500/20";
                if (log.status === "success") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
              };

              return (
                <div key={log.id} className="pb-2.5 border-b border-slate-900 last:border-b-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${getStatusColor()}`}>
                        {log.actionType}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Level {log.level} {log.step ? `• Step ${log.step}` : ""}
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium pl-1 leading-relaxed">
                    <span className="text-purple-400 font-bold">[{log.pluginId}]</span> {log.details}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* IMPORT CONFIGURATION MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-mono font-bold text-white">
                <Upload className="w-5 h-5 text-indigo-400" />
                <span>Import Plugin Configurations</span>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Paste exported JSON plugins configuration below to restore or synchronize settings across instances.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "id": "counting-mastery", "isEnabled": true, ... } ]'
                rows={7}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />

              {importStatusMessage && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    importStatusMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  }`}
                >
                  {importStatusMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{importStatusMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Apply Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
