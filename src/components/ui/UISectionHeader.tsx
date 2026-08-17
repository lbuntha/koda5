import React from "react";
import { themeSystem } from "../../lib/themeSystem";

export interface UISectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Emoji or icon shown before the title. */
  icon?: React.ReactNode;
  /** Right-hand slot — a filter, a "see all" link, a count. */
  action?: React.ReactNode;
  className?: string;
}

/** Titles a block of content. Pairs a heading with an optional one-line summary. */
export const UISectionHeader: React.FC<UISectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  className = "",
}) => {
  const s = themeSystem.sectionHeader;

  return (
    <div className={`${s.wrap} ${className}`}>
      <div>
        <h3 className={s.title}>
          {icon && <span className={s.eyebrowIcon}>{icon}</span>}
          <span>{title}</span>
        </h3>
        {subtitle && <p className={s.subtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
};

export interface UIUnitBannerProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Emoji or icon marking the unit. */
  icon?: React.ReactNode;
  /** Trailing chip, e.g. "4 Stepping Stones". Hidden on narrow screens. */
  badge?: React.ReactNode;
  className?: string;
}

/** Header strip for a unit of the learning path. */
export const UIUnitBanner: React.FC<UIUnitBannerProps> = ({
  title,
  description,
  icon,
  badge,
  className = "",
}) => {
  const s = themeSystem.unitBanner;

  return (
    <div className={`${s.banner} ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && <span className={s.icon}>{icon}</span>}
        <div className="min-w-0">
          <h4 className={s.title}>{title}</h4>
          {description && <p className={s.description}>{description}</p>}
        </div>
      </div>
      {badge && (
        <div className="text-right hidden sm:block">
          <span className={s.badge}>{badge}</span>
        </div>
      )}
    </div>
  );
};

export interface UIUnitCardProps {
  children: React.ReactNode;
  className?: string;
}

/** Container holding a unit banner plus its path nodes. */
export const UIUnitCard: React.FC<UIUnitCardProps> = ({ children, className = "" }) => (
  <div className={`${themeSystem.unitBanner.card} ${className}`}>{children}</div>
);
