import React from "react";
import { Award, LogOut, Mic, Moon, Sun, User } from "lucide-react";
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

type TabId = "home" | "game" | "settings";

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

/** Account menu on the sidebar footer. Owns the light/dark switch. */
const ProfileMenu: React.FC<{ profile: SidebarProfileConfig }> = ({ profile }) => {
  const { theme, setTheme } = useTheme();

  return (
    <UIMenu
      side="top"
      align="start"
      className="w-[calc(100%-0.25rem)]"
      trigger={({ toggle, isOpen }) => (
        <UISidebarProfile
          profile={profile}
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

          <UIMenuItem icon={<User />} onSelect={close}>
            View profile
          </UIMenuItem>
          <UIMenuItem icon={<LogOut />} tone="danger" onSelect={close}>
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
      footer={config.profile && <ProfileMenu profile={config.profile} />}
    >
      <UISidebarNav
        sections={config.sections}
        activeId={activeTab}
        onSelect={(id) => {
          playSound("pop");
          onSelectTab(id as TabId);
        }}
      />
    </UISidebar>
  );
};
