import React from "react";
import { UIOverlayLoader, UIPageLoader } from "../ui";
import { themeSystem } from "../../lib/themeSystem";

export interface MainLayoutProps {
  /** Left rail. Expected to be a sidebar that renders its own mobile header. */
  sidebar: React.ReactNode;
  children: React.ReactNode;
  /** Swaps the content area for a centered loader — use while a view has nothing to show yet. */
  isLoading?: boolean;
  /** Dims the content and floats a loader over it — use while refreshing something already on screen. */
  isRefreshing?: boolean;
  loadingLabel?: string;
  /** Set false for views that manage their own padding and full-bleed width (games, canvases). */
  contained?: boolean;
  className?: string;
}

/**
 * The app shell: sidebar on the left, feature content on the right, and the one
 * place that decides what "loading" looks like.
 *
 * Screens should not re-implement the rail, the max-width or a spinner — they
 * render their content and pass `isLoading` / `isRefreshing` up to here, so every
 * view waits the same way.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  sidebar,
  children,
  isLoading = false,
  isRefreshing = false,
  loadingLabel = "Loading",
  contained = true,
  className = "",
}) => {
  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row font-sans bg-canvas text-body transition-colors duration-200 selection:bg-indigo-600 selection:text-white ${className}`}
    >
      {sidebar}

      <div className="flex-1 min-w-0 flex flex-col relative">
        <main
          className={
            contained
              ? `flex-1 flex flex-col ${themeSystem.spacing.page} w-full`
              : "flex-1 flex flex-col w-full"
          }
        >
          {isLoading ? <UIPageLoader label={loadingLabel} /> : children}
        </main>

        <UIOverlayLoader isOpen={!isLoading && isRefreshing} label={loadingLabel} />
      </div>
    </div>
  );
};
