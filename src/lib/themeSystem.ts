export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "ghost"
  | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export type CardVariant = "default" | "glass" | "bordered" | "interactive";
export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "neutral";
export type FlashType = "info" | "success" | "warning" | "error";
export type TypographyVariant = "h1" | "h2" | "h3" | "h4" | "body" | "body-sm" | "caption" | "subtitle";
export type StatTone = "primary" | "streak" | "success" | "danger";
export type SurfaceVariant = "default" | "glass" | "bordered" | "interactive";
export type FeatureVariant = "default" | "accent" | "subtle";
export type PathNodeState = "completed" | "current" | "available" | "locked";
export type KidMessageTone = "correct" | "tryAgain" | "hint" | "celebrate";

/**
 * Central Theme & Design System Function/Utility Engine
 * Manages standard design tokens and styles for buttons, cards, badges, 
 * flash messages, modals, dialogues, data tables, and typography across the app.
 */
export const themeSystem = {
  /* One spacing scale, 4px-based. Every surface picks its padding and every
     stack picks its gap from here, so rhythm stays consistent as pages grow.
       page 16/24 · card 16/20 · cardSm 12/16 · section 20 · grid 12 · stack 10 */
  spacing: {
    page: "p-4 lg:p-6",
    section: "space-y-5",
    grid: "gap-3",
    card: "p-4 sm:p-5",
    cardSm: "p-3 sm:p-4",
    stack: "space-y-2.5",
    row: "gap-3",
  },

  /* Light-first with `dark:` overrides. Solid variants keep the same fill in both
     themes — the surface behind them changes, so the fill does not need to. The
     focus ring's offset must track the surface, or it disappears in dark. */
  button: (variant: ButtonVariant = "primary", size: ButtonSize = "md", className: string = "") => {
    /* Depth is geometry, not blur: a 4px darker bottom edge that compresses to
       2px on press, so the control reads as physically pushed. */
    const base =
      "inline-flex items-center justify-center font-black font-mono uppercase tracking-wider transition-all duration-100 rounded-2xl cursor-pointer border-2 border-b-4 active:border-b-2 active:translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4 [&>svg]:shrink-0";

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5 [&>svg]:w-3.5 [&>svg]:h-3.5",
      md: "px-4 py-2.5 text-sm gap-2 [&>svg]:w-4 [&>svg]:h-4",
      lg: "px-6 py-3.5 text-base gap-2.5 [&>svg]:w-5 [&>svg]:h-5",
      icon: "p-2.5 gap-0 [&>svg]:w-4 [&>svg]:h-4",
    };

    const variants = {
      primary:
        "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700 focus-visible:ring-indigo-500",
      secondary:
        "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-900 focus-visible:ring-slate-400",
      success:
        "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 focus-visible:ring-emerald-500",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white border-rose-700 focus-visible:ring-rose-500",
      /* Brand amber is a light yellow, so it carries dark ink — white would fail contrast. */
      warning:
        "bg-amber-400 hover:bg-amber-300 text-slate-900 border-amber-600 focus-visible:ring-amber-500",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-800/60 dark:text-slate-400 border-transparent focus-visible:ring-slate-400",
      outline:
        "bg-transparent hover:bg-indigo-50 text-indigo-600 border-indigo-300 dark:hover:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800 focus-visible:ring-indigo-500",
    };

    return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  },

  card: (variant: CardVariant = "default", className: string = "") => {
    const base = "rounded-2xl transition-all duration-200";
    const variants = {
      default: "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800",
      glass: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80",
      bordered: "bg-transparent border-2 border-slate-300 dark:border-slate-700",
      interactive: "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 cursor-pointer",
    };

    return `${base} ${variants[variant]} ${className}`;
  },

  badge: (variant: BadgeVariant = "primary", className: string = "") => {
    const base = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide";
    const variants = {
      primary: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60",
      success: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
      warning: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
      danger: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60",
      info: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60",
      neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    };

    return `${base} ${variants[variant]} ${className}`;
  },

  flash: (type: FlashType = "info", className: string = "") => {
    const base = "p-4 rounded-2xl border-2 flex items-start gap-3 transition-all";
    const types = {
      info: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60 text-sky-900 dark:text-sky-200",
      success: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200",
      warning: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200",
      error: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200",
    };
    return `${base} ${types[type]} ${className}`;
  },

  typography: (variant: TypographyVariant = "body", className: string = "") => {
    const variants = {
      h1: "text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white",
      h2: "text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white",
      h3: "text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100",
      h4: "text-lg font-semibold text-slate-800 dark:text-slate-200",
      body: "text-base text-slate-700 dark:text-slate-300 leading-relaxed",
      "body-sm": "text-sm text-slate-600 dark:text-slate-400 leading-normal",
      caption: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
      subtitle: "text-sm font-medium text-indigo-600 dark:text-indigo-400 tracking-wide",
    };
    return `${variants[variant]} ${className}`;
  },

  table: {
    wrapper: "w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
    table: "w-full text-left border-collapse text-sm",
    header: "bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-4 py-3 uppercase tracking-wider text-xs",
    row: "border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors",
    cell: "px-4 py-3 text-slate-700 dark:text-slate-300",
  },

  modal: {
    overlay: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in",
    content: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg w-full max-w-lg overflow-hidden animate-scale-up",
    header: "px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between",
    body: "p-6 max-h-[75vh] overflow-y-auto",
    footer: "px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3",
  },

  /* KPI stat tiles. The icon carries identity; the value and label stay on ink
     tokens so the number never wears the accent hue. */
  statTile: {
    grid: "grid grid-cols-2 sm:grid-cols-4 gap-3",

    tile: (variant: SurfaceVariant = "default", className: string = "") => {
      const base = "rounded-2xl p-3 sm:p-4 flex items-center gap-3 transition";
      const variants = {
        default:
          "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 cursor-default",
        glass:
          "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 cursor-default",
        bordered: "bg-transparent border-2 border-slate-300 dark:border-slate-700 cursor-default",
        interactive:
          "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 cursor-pointer",
      };
      return `${base} ${variants[variant]} ${className}`;
    },
    well: "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6",
    value:
      "text-base sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums",
    label:
      "text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide",

    tone: (tone: StatTone = "primary") =>
      ({
        primary: "text-indigo-600 dark:text-indigo-400",
        streak: "text-amber-500 dark:text-amber-400",
        success: "text-emerald-600 dark:text-emerald-400",
        danger: "text-rose-600 dark:text-rose-400",
      })[tone],
  },

  /* Hero/feature card: an eyebrow row, a title, a highlighted note, meta chips,
     and one primary action. */
  featureCard: {
    card: (variant: FeatureVariant = "default", className: string = "") => {
      const base = "relative overflow-hidden rounded-2xl p-4 sm:p-5 border-2 transition";
      const variants = {
        default: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
        accent:
          "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60",
        subtle:
          "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80",
      };
      return `${base} ${variants[variant]} ${className}`;
    },
    body: "relative z-10 flex flex-col md:flex-row items-center justify-between gap-4",
    icon: "w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-600/20 border-2 border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 [&>svg]:w-4 [&>svg]:h-4",
    eyebrow:
      "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 font-mono font-black text-xs px-3 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 uppercase tracking-wider",
    title:
      "text-2xl sm:text-3xl font-black tracking-tight leading-tight text-slate-900 dark:text-white",
    note: "flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs sm:text-sm max-w-xl font-medium",
    noteStrong: "text-slate-900 dark:text-white font-mono",
    metaRow: "flex flex-wrap items-center justify-center md:justify-start gap-3 pt-0.5",
    metaLead: "text-indigo-700 dark:text-indigo-400 font-mono text-xs font-black uppercase tracking-wider",
    metaItem:
      "flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:shrink-0",
    metaDot: "text-slate-500 dark:text-slate-400",
    action:
      "w-full md:w-auto shrink-0 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm font-mono uppercase tracking-wider border-2 border-b-4 border-indigo-700 active:border-b-2 active:translate-y-0.5 transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer group",
  },

  /* Stepping-stone node on the learning path. Laid out on a grid rather than a
     winding column — the offsets left most of the card empty and the alignment
     read as accidental. */
  pathNode: {
    grid: "grid grid-cols-2 sm:grid-cols-4 gap-4 pt-7",
    item: "flex flex-col items-center gap-2 text-center",

    circle: (state: PathNodeState = "available") => {
      /* Same pressable geometry as the buttons: a 4px darker underside that
         compresses on tap. Locked nodes are flat grey and do not move. */
      const base =
        "relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-100 border-2 border-b-4";
      const press = "active:border-b-2 active:translate-y-0.5 cursor-pointer";
      const states = {
        completed: `bg-indigo-400 dark:bg-indigo-600 hover:bg-indigo-300 dark:hover:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-900 ${press}`,
        current: `bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white border-indigo-800 dark:border-indigo-800 ${press}`,
        available: `bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 border-slate-300 dark:border-slate-900 ${press}`,
        locked:
          "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed",
      };
      return `${base} ${states[state]}`;
    },

    starBadge:
      "absolute -top-1 -right-1 bg-amber-400 text-slate-900 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-600",
    /* Duolingo floats the call-to-action above the node as a speech bubble. */
    startBadge:
      "absolute -top-7 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 font-black text-[11px] px-3 py-1 rounded-xl uppercase tracking-wider font-mono border-2 border-b-4 border-slate-200 dark:border-slate-600 whitespace-nowrap",

    title: (state: PathNodeState = "available") => {
      const base = "text-xs font-black font-mono block leading-tight";
      const states = {
        completed: "text-slate-700 dark:text-slate-200",
        current: "text-indigo-700 dark:text-indigo-300",
        available: "text-slate-700 dark:text-slate-300",
        locked: "text-slate-500 dark:text-slate-400",
      };
      return `${base} ${states[state]}`;
    },

    subtitle: "text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate",
  },

  sectionHeader: {
    wrap: "flex items-center justify-between gap-4",
    title:
      "text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-2",
    eyebrowIcon: "text-indigo-500 dark:text-indigo-400",
    subtitle: "text-xs sm:text-sm text-slate-600 dark:text-indigo-200/70 font-medium",
  },

  /* Unit grouping on the learning path. The original used one-off hex purples;
     these map onto the brand indigo scale so both themes resolve. */
  unitBanner: {
    card: "bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-800 relative overflow-hidden",
    banner:
      "rounded-2xl bg-indigo-600 dark:bg-indigo-900 p-3 sm:p-4 flex items-center justify-between gap-3 mb-4 border-2 border-b-4 border-indigo-700 dark:border-indigo-950",
    icon: "text-2xl sm:text-3xl shrink-0",
    title: "text-sm sm:text-base font-black uppercase tracking-wide text-white dark:text-indigo-50",
    description: "text-xs sm:text-[13px] text-indigo-100 dark:text-indigo-200/90 font-bold",
    badge:
      "bg-indigo-500 dark:bg-indigo-800 text-white border-2 border-b-4 border-indigo-700 dark:border-indigo-950 px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider whitespace-nowrap",
  },

  /* Feedback shown to a learner. Large type and a big single action, because
     the reader is five. Tone carries an icon as well as a colour. */
  kidMessage: {
    wrap: (tone: KidMessageTone = "correct") => {
      const base =
        "flex items-start gap-3 p-4 sm:p-5 rounded-2xl border-2 w-full max-w-3xl mx-auto";
      return `${base} ${{
        correct: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800",
        celebrate: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800",
        tryAgain: "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800",
        hint: "bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700",
      }[tone]}`;
    },

    icon: (tone: KidMessageTone = "correct") => {
      const base =
        "shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6";
      return `${base} ${{
        correct: "bg-emerald-600 text-white",
        celebrate: "bg-indigo-600 text-white",
        tryAgain: "bg-amber-400 text-slate-900",
        hint: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200",
      }[tone]}`;
    },

    title: "text-lg sm:text-xl font-black text-slate-900 dark:text-white",
    message: "text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 mt-0.5",
    xp: "text-xs font-black font-mono px-2 py-1 rounded-lg bg-amber-400 text-slate-900",

    action: (tone: KidMessageTone = "correct") => {
      const base =
        "shrink-0 self-center px-5 py-3 min-h-[48px] rounded-2xl font-black font-mono uppercase tracking-wider text-sm text-white border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all duration-100 cursor-pointer";
      return `${base} ${{
        correct: "bg-emerald-600 hover:bg-emerald-500 border-emerald-800",
        celebrate: "bg-indigo-600 hover:bg-indigo-500 border-indigo-800",
        tryAgain: "bg-amber-500 hover:bg-amber-400 border-amber-700 !text-slate-900",
        hint: "bg-slate-600 hover:bg-slate-500 border-slate-800",
      }[tone]}`;
    },
  },

  menu: {
    panel:
      "min-w-[13rem] rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-900/5 dark:shadow-black/40 p-1.5 z-50",
    label:
      "px-2.5 pt-2 pb-1 text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400",
    separator: "my-1.5 h-px bg-slate-200 dark:bg-slate-700/80",

    item: (isActive: boolean = false, tone: "default" | "danger" = "default") => {
      const base =
        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-bold font-mono transition cursor-pointer text-left [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0";
      if (tone === "danger") {
        return `${base} text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`;
      }
      return isActive
        ? `${base} bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300`
        : `${base} text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800`;
    },
  },

  dialog: {
    overlay: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4",
    content: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4",
    actions: "flex items-center justify-end gap-3 pt-2",
  },

  /* Light-first with `dark:` overrides, matching the rest of this file. The
     `dark` variant is driven by the `.dark` class ThemeContext puts on <html>
     (see the @custom-variant in index.css), not by the OS setting. */
  sidebar: {
    /* Off-canvas drawer under `lg`, sticky rail at `lg` and up. */
    aside: "fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/90 text-slate-900 dark:text-slate-100 transition-all duration-300 flex flex-col justify-between p-3.5 sm:p-4",
    widthExpanded: "lg:w-64",
    widthCollapsed: "lg:w-20",
    drawerOpen: "translate-x-0 w-72",
    drawerClosed: "-translate-x-full lg:translate-x-0",
    overlay: "lg:hidden fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm",
    mobileHeader:
      "lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between",
    mobileMenuButton:
      "p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition border-2 border-slate-200 dark:border-slate-700",
    brandBar:
      "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/90",
    brandIcon:
      "w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0",
    brandIconSm: "w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center",
    brandTitle:
      "font-mono font-black text-lg text-slate-900 dark:text-white tracking-tight leading-tight",
    brandTitleSm: "font-mono font-black text-base text-slate-900 dark:text-white tracking-tight",
    brandSubtitle:
      "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono",
    iconButton:
      "p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition border-2 border-slate-200 dark:border-slate-700",
    sectionLabel:
      "text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono px-3 mb-2",
    footer: "pt-3 border-t border-slate-200 dark:border-slate-800/90 space-y-3",

    navItem: (isActive: boolean = false, isCollapsed: boolean = false, className: string = "") => {
      const base =
        "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group";
      const collapsed = isCollapsed ? "lg:justify-center lg:px-2" : "";
      /* Selection reads as a soft wash of the brand hue rather than a solid
         fill, so the rail stays quiet and the label keeps its contrast. */
      const state = isActive
        ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border-2 border-indigo-200 dark:border-indigo-500/40"
        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70";
      return `${base} ${collapsed} ${state} ${className}`;
    },

    /* Sizes whatever icon element the caller passes, so Lucide's 24px default
       does not leak through the wrapper. */
    navIcon: (isActive: boolean = false) =>
      `inline-flex shrink-0 transition [&>svg]:w-5 [&>svg]:h-5 ${
        isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
      }`,

    navLabel: (isActive: boolean = false) =>
      `text-sm font-mono tracking-tight ${
        isActive
          ? "font-extrabold text-indigo-700 dark:text-indigo-300"
          : "font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
      }`,

    navBadge:
      "text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 font-black uppercase",

    profileRow:
      "w-full flex items-center gap-2.5 p-2 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer text-left",
    profileChevron: "ml-auto shrink-0 text-slate-400 dark:text-slate-500 transition",
    profileAvatar:
      "w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-mono font-black text-sm overflow-hidden",
    profileName:
      "text-sm font-extrabold font-mono text-slate-900 dark:text-white leading-tight truncate",
    profileRole:
      "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate",
  },
};
