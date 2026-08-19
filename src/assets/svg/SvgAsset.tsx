import React, { useId, useMemo } from "react";
import { preprocessSvgMarkup, sanitizeSvgMarkup, scopeSvgIds } from "../../utils/svg";
import { getSvgAsset } from "./registry";
import type { SvgAssetId } from "./ids";

interface SvgMarkupProps {
  /** Raw SVG source. Sanitised here — it never reaches the DOM as written. */
  markup: string;
  /**
   * Box the artwork is drawn into — a number is px, a string is any CSS length,
   * so `"100%"` fills a tile whose size is decided by its own classes. The
   * artwork scales to fit, keeping its aspect ratio.
   */
  size?: number | string;
  className?: string;
  /** Names the image for a screen reader. Omit for decoration, which is then hidden. */
  title?: string;
  /** Drawn instead when nothing survives sanitising. */
  fallback?: React.ReactNode;
  /**
   * Run `preprocessSvgMarkup` first. On for markup straight from an author,
   * off for anything the registry already normalised at load.
   */
  raw?: boolean;
}

/**
 * Draws SVG markup.
 *
 * The markup is injected as HTML, so it is sanitised here — immediately before
 * the injection, never earlier and cached — against the allowlist in
 * `utils/svg/svgPolicy.ts`. Ids are scoped per instance, so ten apples on one
 * screen each resolve their own gradient instead of all borrowing the first
 * one's.
 */
export const SvgMarkup: React.FC<SvgMarkupProps> = ({
  markup,
  size = 48,
  className = "",
  title,
  fallback = null,
  raw = false,
}) => {
  const scope = useId();

  // A counting board draws dozens of these and re-renders on every drag frame;
  // parsing the markup each time would be the expensive part.
  const safeMarkup = useMemo(() => {
    if (!markup) return "";
    const normalised = raw ? preprocessSvgMarkup(markup) : markup;
    return scopeSvgIds(sanitizeSvgMarkup(normalised), scope);
  }, [markup, raw, scope]);

  if (!safeMarkup) return <>{fallback}</>;

  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`inline-flex items-center justify-center shrink-0 select-none [&>svg]:w-full [&>svg]:h-full ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: safeMarkup }}
    />
  );
};

interface SvgAssetProps extends Omit<SvgMarkupProps, "markup" | "raw"> {
  /** Filename of the artwork without `.svg` — see `ids.ts` for the full list. */
  id: SvgAssetId;
}

/** Draws one asset from the collection, by id. */
export const SvgAsset: React.FC<SvgAssetProps> = ({ id, ...rest }) => {
  const markup = getSvgAsset(id);

  if (!markup) {
    if (import.meta.env.DEV) {
      console.warn(`[svg] no asset "${id}" in the collection — is the file in src/assets/svg?`);
    }
    return <>{rest.fallback ?? null}</>;
  }

  return <SvgMarkup markup={markup} {...rest} />;
};
