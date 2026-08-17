import React, { createContext, useContext, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, Menu, X } from "lucide-react";
import { themeSystem } from "../../lib/themeSystem";
import { resolveSidebarIcon } from "./sidebarIcons";

/**
 * Shared sidebar shell.
 *
 * Owns only the chrome that every sidebar needs — the responsive drawer, the
 * desktop collapse rail, branding and the footer slot. Product-specific content
 * (coach banners, XP cards, whatever a screen needs) is passed as children so
 * this stays reusable; use `useUISidebar()` inside that content to react to the
 * collapsed state instead of threading props down by hand.
 */

interface UISidebarContextValue {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  /** Collapsed rail hides labels on desktop, but the mobile drawer always shows them. */
  showLabels: boolean;
  closeMobile: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const UISidebarContext = createContext<UISidebarContextValue>({
  isCollapsed: false,
  isMobileOpen: false,
  showLabels: true,
  closeMobile: () => {},
  setCollapsed: () => {},
});

export const useUISidebar = () => useContext(UISidebarContext);

export interface UISidebarBrand {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Skip the tinted icon well — for logos that already carry their own ground. */
  iconBare?: boolean;
}

export interface UISidebarProps {
  brand: UISidebarBrand;
  children: React.ReactNode;
  /** Pinned to the bottom of the rail, above the safe area. */
  footer?: React.ReactNode;
  /** Compact brand shown in the mobile header bar. Falls back to `brand`. */
  mobileBrand?: React.ReactNode;
  /** Right-hand slot of the mobile header — quick stats, a call button, etc. */
  mobileActions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  /** Fired on open/close/collapse so the host can play a sound or haptic. */
  onInteract?: () => void;
  className?: string;
}

export const UISidebar: React.FC<UISidebarProps> = ({
  brand,
  children,
  footer,
  mobileBrand,
  mobileActions,
  collapsible = true,
  defaultCollapsed = false,
  onInteract,
  className = "",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const s = themeSystem.sidebar;
  const showLabels = !isCollapsed || isMobileOpen;

  const ctx = useMemo<UISidebarContextValue>(
    () => ({
      isCollapsed,
      isMobileOpen,
      showLabels,
      closeMobile: () => setIsMobileOpen(false),
      setCollapsed: setIsCollapsed,
    }),
    [isCollapsed, isMobileOpen, showLabels],
  );

  return (
    <UISidebarContext.Provider value={ctx}>
      {/* Mobile header bar — the only way to reach the drawer under `lg`. */}
      <header className={s.mobileHeader}>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              onInteract?.();
              setIsMobileOpen(true);
            }}
            className={s.mobileMenuButton}
            aria-label="Open navigation menu"
            aria-expanded={isMobileOpen}
          >
            <Menu className="w-5 h-5" />
          </button>

          {mobileBrand ?? (
            <div className="flex items-center gap-2">
              {brand.icon &&
                (brand.iconBare ? brand.icon : <div className={s.brandIconSm}>{brand.icon}</div>)}
              <span className={s.brandTitleSm}>{brand.title}</span>
            </div>
          )}
        </div>

        {mobileActions && <div className="flex items-center gap-2">{mobileActions}</div>}
      </header>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className={s.overlay}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${s.aside} ${
          isMobileOpen ? s.drawerOpen : s.drawerClosed
        } ${isCollapsed ? s.widthCollapsed : s.widthExpanded} ${className}`}
      >
        <div className="space-y-4">
          <div className={s.brandBar}>
            <div
              className={`flex items-center gap-3 ${
                isCollapsed ? "lg:justify-center lg:w-full" : ""
              }`}
            >
              {brand.icon &&
                (brand.iconBare ? brand.icon : <div className={s.brandIcon}>{brand.icon}</div>)}

              {showLabels && (
                <div>
                  <h1 className={s.brandTitle}>{brand.title}</h1>
                  {brand.subtitle && <p className={s.brandSubtitle}>{brand.subtitle}</p>}
                </div>
              )}
            </div>

            {collapsible && (
              <button
                onClick={() => {
                  onInteract?.();
                  setIsCollapsed(!isCollapsed);
                }}
                className={`hidden lg:flex ${s.iconButton}`}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              onClick={() => setIsMobileOpen(false)}
              className={`lg:hidden ${s.iconButton}`}
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {children}
        </div>

        {footer && <div className={s.footer}>{footer}</div>}
      </aside>
    </UISidebarContext.Provider>
  );
};

export interface UISidebarSectionProps {
  /** Hidden automatically while the desktop rail is collapsed. */
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const UISidebarSection: React.FC<UISidebarSectionProps> = ({
  label,
  children,
  className = "",
}) => {
  const { isCollapsed } = useUISidebar();

  return (
    <nav className={`space-y-1 ${className}`}>
      {label && (
        <div
          className={`${themeSystem.sidebar.sectionLabel} ${isCollapsed ? "lg:hidden" : ""}`}
        >
          {label}
        </div>
      )}
      {children}
    </nav>
  );
};

export interface UISidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  /** Trailing chip; hidden while the item is active, matching the nav's resting style. */
  badge?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const UISidebarNavItem: React.FC<UISidebarNavItemProps> = ({
  icon,
  label,
  badge,
  isActive = false,
  onClick,
  className = "",
}) => {
  const { isCollapsed, showLabels, closeMobile } = useUISidebar();
  const s = themeSystem.sidebar;

  return (
    <button
      onClick={() => {
        onClick?.();
        // Selecting a destination dismisses the drawer it was chosen from.
        closeMobile();
      }}
      className={s.navItem(isActive, isCollapsed, className)}
      title={label}
      aria-current={isActive ? "page" : undefined}
    >
      <span className={s.navIcon(isActive)}>{icon}</span>

      {showLabels && (
        <div className="flex-1 flex items-center justify-between text-left">
          <span className={s.navLabel(isActive)}>{label}</span>
          {!isActive && badge && <span className={s.navBadge}>{badge}</span>}
        </div>
      )}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* JSON-driven configuration                                                   */
/* -------------------------------------------------------------------------- */

/** Plain-data nav item. `icon` is a key into the sidebar icon registry. */
export interface SidebarNavItemConfig {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
}

export interface SidebarSectionConfig {
  id?: string;
  label?: string;
  items: SidebarNavItemConfig[];
}

export interface SidebarBrandConfig {
  title: string;
  subtitle?: string;
  /** Key into the sidebar icon registry. Ignored when `logoUrl` is set. */
  icon?: string;
  /** Image logo (e.g. the app favicon). Rendered bare, without an icon well. */
  logoUrl?: string;
}

export interface SidebarProfileConfig {
  name: string;
  role?: string;
  /** Image URL. When absent the avatar falls back to `initials`, then to the name. */
  avatarUrl?: string;
  initials?: string;
}

/** Shape of a sidebar JSON file. Fully serializable — no components, no functions. */
export interface SidebarConfig {
  brand: SidebarBrandConfig;
  sections: SidebarSectionConfig[];
  profile?: SidebarProfileConfig;
}

export interface UISidebarProfileProps {
  profile: SidebarProfileConfig;
  onClick?: () => void;
  /** Shows the disclosure chevron — set when the row opens a menu. */
  hasMenu?: boolean;
  isMenuOpen?: boolean;
}

/** Account row for the footer slot. Collapses to just the avatar on the rail. */
export const UISidebarProfile: React.FC<UISidebarProfileProps> = ({
  profile,
  onClick,
  hasMenu = false,
  isMenuOpen = false,
}) => {
  const { showLabels } = useUISidebar();
  const s = themeSystem.sidebar;

  const initials =
    profile.initials ??
    profile.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const avatar = (
    <div className={s.profileAvatar}>
      {profile.avatarUrl ? (
        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );

  if (!showLabels) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onClick}
          title={profile.name}
          aria-label={profile.name}
          aria-haspopup={hasMenu || undefined}
          aria-expanded={hasMenu ? isMenuOpen : undefined}
        >
          {avatar}
        </button>
      </div>
    );
  }

  return (
    <button
      className={s.profileRow}
      onClick={onClick}
      aria-haspopup={hasMenu || undefined}
      aria-expanded={hasMenu ? isMenuOpen : undefined}
    >
      {avatar}
      <div className="min-w-0">
        <div className={s.profileName}>{profile.name}</div>
        {profile.role && <div className={s.profileRole}>{profile.role}</div>}
      </div>
      {hasMenu && (
        <ChevronUp
          className={`w-4 h-4 ${s.profileChevron} ${isMenuOpen ? "" : "rotate-180"}`}
        />
      )}
    </button>
  );
};

export interface UISidebarNavProps {
  sections: SidebarSectionConfig[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Renders sections and items straight from config, resolving icon names to
 * components. Use this when the nav comes from JSON; compose `UISidebarSection`
 * and `UISidebarNavItem` by hand when a screen needs bespoke items.
 */
export const UISidebarNav: React.FC<UISidebarNavProps> = ({ sections, activeId, onSelect }) => (
  <>
    {sections.map((section, i) => (
      <UISidebarSection key={section.id ?? section.label ?? i} label={section.label}>
        {section.items.map((item) => {
          const Icon = resolveSidebarIcon(item.icon);
          return (
            <UISidebarNavItem
              key={item.id}
              icon={<Icon />}
              label={item.label}
              badge={item.badge}
              isActive={activeId === item.id}
              onClick={() => onSelect(item.id)}
            />
          );
        })}
      </UISidebarSection>
    ))}
  </>
);
