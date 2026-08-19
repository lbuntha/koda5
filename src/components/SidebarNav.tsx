import React from "react";
import { Award, LogOut, Mic, Moon, Sun } from "lucide-react";
import { UserProgress } from "../types";
import { playSound } from "../utils/audio";
import { useTheme } from "../context/ThemeContext";
import {
  type SidebarConfig,
  type SidebarProfileConfig,
  UIMenu,
  UIMenuItem,
  UIMenuLabel,
  UIMenuSeparator,
  UISidebar,
  UISidebarNav,
  UISidebarProfile,
  resolveSidebarIcon,
} from "./ui";
import sidebarNav from "../data/sidebarNav.json";
import { SessionAPI, useSession } from "../lib/sync";
import { getCourseLessons } from "../curriculum";
import { useViewer } from "../skills/viewer";
import { svgAssetIds } from "../assets/svg";

type TabId = "home" | "game" | "skills" | "assets" | "settings";

const config = sidebarNav as SidebarConfig;

interface SidebarNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  userProgress: UserProgress;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenLiveVoice: () => void;
  onOpenWhiteboard: () => void;
  onOpenLexicon: () => void;
}

/** Two letters from an email, so the avatar says something true. */
const initialsFor = (email?: string): string => {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
};

/**
 * Account menu on the sidebar footer. Owns the light/dark switch, and the one
 * place in the app where signing out is a single gesture.
 *
 * The row itself stays the *learner's* name: the child is who is using the
 * tablet. The account is the adult it syncs to, which is why it appears as a
 * labelled section here rather than replacing the name.
 */
const ProfileMenu: React.FC<{ profile: SidebarProfileConfig }> = ({ profile }) => {
  const { theme, setTheme } = useTheme();
  const session = useSession();

  // Signed in, the row *is* the account: the JSON profile was a placeholder
  // from before there was one, and a name nobody typed is worse than no name.
  const shown: SidebarProfileConfig = session
    ? {
        name: session.email ?? "Signed in",
        role: session.familyName ? `${session.role} · ${session.familyName}` : session.role,
        initials: initialsFor(session.email),
      }
    : profile;

  return (
    <UIMenu
      side="top"
      align="start"
      className="w-[calc(100%-0.25rem)]"
      trigger={({ toggle, isOpen }) => (
        <UISidebarProfile
          profile={shown}
          hasMenu
          isMenuOpen={isOpen}
          onClick={() => {
            playSound("pop");
            toggle();
          }}
        />
      )}
    >
      {({ close }) => (
        <>
          <UIMenuLabel>Appearance</UIMenuLabel>
          <UIMenuItem
            icon={<Sun />}
            isActive={theme === "light"}
            onSelect={() => {
              playSound("pop");
              setTheme("light");
              close();
            }}
          >
            Light
          </UIMenuItem>
          <UIMenuItem
            icon={<Moon />}
            isActive={theme === "dark"}
            onSelect={() => {
              playSound("pop");
              setTheme("dark");
              close();
            }}
          >
            Dark
          </UIMenuItem>

          <UIMenuSeparator />

          {/* The app is behind the gate, so this menu only ever belongs to
              somebody signed in — "sign in" here would be an offer with
              nothing behind it. */}
          <UIMenuLabel>{session?.email ?? "Signed in"}</UIMenuLabel>
          <UIMenuItem
            icon={<LogOut />}
            tone="danger"
            onSelect={() => {
              playSound("pop");
              void SessionAPI.signOut();
              close();
            }}
          >
            Sign out
          </UIMenuItem>
        </>
      )}
    </UIMenu>
  );
};

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  userProgress,
  onOpenLiveVoice,
}) => {
  const viewer = useViewer();

  // The learner-facing nav reflects what the gate actually lets through: the
  // badge counts real lessons, and an entry with nothing behind it is dropped
  // rather than leading to an empty page.
  const lessonCount = getCourseLessons(viewer).length;
  const session = useSession();

  // Plugins and Art write family settings, which is a parent's to do — see
  // docs/BACKEND.md §5. Hiding them is courtesy; the server is what enforces it,
  // and a signed-out device is the app as it has always been.
  const parentOnly = new Set(["skills", "assets"]);
  const isLearnerDevice = session?.role === "learner";

  const sections = config.sections.map((section) => ({
    ...section,
    items: section.items
      .map((item) => {
        if (item.id === "game") return { ...item, badge: `${lessonCount} Levels` };
        // Counted from the folder, so the badge cannot drift from what is there.
        if (item.id === "assets") return { ...item, badge: `${svgAssetIds.length} SVG` };
        return item;
      })
      .filter((item) => item.id !== "game" || lessonCount > 0)
      .filter((item) => !(isLearnerDevice && parentOnly.has(item.id))),
  }));

  const BrandIcon = resolveSidebarIcon(config.brand.icon);
  const logo = config.brand.logoUrl;

  return (
    <UISidebar
      brand={{
        title: config.brand.title,
        subtitle: config.brand.subtitle,
        iconBare: Boolean(logo),
        icon: logo ? (
          <img src={logo} alt="" className="w-9 h-9 rounded-xl shrink-0" />
        ) : (
          <BrandIcon className="w-5 h-5 text-white" />
        ),
      }}
      onInteract={() => playSound("pop")}
      mobileBrand={
        <div className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt="" className="w-7 h-7 rounded-lg shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <BrandIcon className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-tight">
            {config.brand.title}
          </span>
        </div>
      }
      mobileActions={
        <>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60">
            <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{userProgress.xp} XP</span>
          </div>

          <button
            onClick={() => {
              playSound("pop");
              onOpenLiveVoice();
            }}
            className="p-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 text-xs shadow-sm transition cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-black font-mono">KODA</span>
          </button>
        </>
      }
      footer={
        config.profile && (
          <ProfileMenu profile={config.profile} />
        )
      }
    >
      <UISidebarNav
        sections={sections}
        activeId={activeTab}
        onSelect={(id) => {
          playSound("pop");
          onSelectTab(id as TabId);
        }}
      />
    </UISidebar>
  );
};
