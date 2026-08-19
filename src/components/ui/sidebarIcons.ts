import {
  Award,
  BookOpen,
  Brain,
  CircleHelp,
  Flame,
  Gamepad2,
  Home,
  type LucideIcon,
  Mic,
  PenTool,
  Settings,
  Shapes,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

/**
 * Name -> icon map for JSON-driven config.
 *
 * JSON cannot carry a component, so config files reference an icon by string
 * and this registry resolves it. Icons are imported explicitly rather than via
 * `import * as` so the bundler can still drop the ~1500 lucide icons we do not
 * use. Adding a new icon to a config means adding one line here.
 */
export const sidebarIcons = {
  award: Award,
  book: BookOpen,
  brain: Brain,
  flame: Flame,
  game: Gamepad2,
  home: Home,
  mic: Mic,
  pen: PenTool,
  settings: Settings,
  shapes: Shapes,
  shop: ShoppingBag,
  sparkles: Sparkles,
  trophy: Trophy,
  users: Users,
  zap: Zap,
} satisfies Record<string, LucideIcon>;

export type SidebarIconName = keyof typeof sidebarIcons;

/**
 * Falls back to a visible placeholder rather than throwing or rendering nothing —
 * a typo in config should be obvious in the UI, not crash the shell.
 */
export const resolveSidebarIcon = (name?: string): LucideIcon =>
  (name && sidebarIcons[name as SidebarIconName]) || CircleHelp;
