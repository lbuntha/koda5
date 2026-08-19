import React from "react";
import { SvgAsset, hasSvgAsset } from "../../assets/svg";
import { resolveLessonIcon, lessonIcons } from "./lessonIcons";

/**
 * Category artwork. Colour is decoration only — every tile sits beside the
 * skill's name and category in words, so nothing depends on telling two
 * gradients apart.
 */
export const SKILL_CATEGORY_ART: Record<string, { art: string; label: string }> = {
  "number-sense": { art: "from-indigo-500 to-violet-500", label: "Number Sense" },
  operations: { art: "from-emerald-500 to-teal-500", label: "Operations" },
  "place-value": { art: "from-amber-500 to-orange-500", label: "Place Value" },
  patterns: { art: "from-sky-500 to-cyan-500", label: "Patterns" },
  fractions: { art: "from-rose-500 to-pink-500", label: "Fractions" },
  measurement: { art: "from-lime-500 to-emerald-500", label: "Measurement" },
  geometry: { art: "from-fuchsia-500 to-purple-500", label: "Geometry" },
};

export const skillArtFor = (category?: string) =>
  SKILL_CATEGORY_ART[category ?? ""] ?? { art: "from-slate-500 to-slate-600", label: "Skill" };

const isImage = (v: string) =>
  v.startsWith("http") || v.startsWith("/") || v.startsWith("data:");

export interface UISkillThumbnailProps {
  /** The manifest's `thumbnail`, or a per-install override. */
  thumbnail?: string;
  /** Fallback when `thumbnail` is empty — usually the first lesson's icon. */
  fallbackIconName?: string;
  category?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "w-10 h-10 rounded-xl text-xl [&_svg]:w-5 [&_svg]:h-5",
  md: "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-3xl [&_svg]:w-7 [&_svg]:h-7",
  lg: "w-20 h-20 rounded-3xl text-4xl [&_svg]:w-10 [&_svg]:h-10",
};

/**
 * Artwork gets no tile behind it and a wider footprint than the chrome sizes.
 *
 * A drawn asset already carries its own shape, shadow and colour — the
 * gradient square was a second frame around a framed thing, and it squeezed a
 * wide piece like `counting-quest` into a letterboxed band. Room to fill
 * instead: the art keeps its aspect ratio and simply draws larger.
 */
const ART_SIZES = {
  sm: "w-12 h-12",
  md: "w-16 h-16 sm:w-20 sm:h-20",
  lg: "w-24 h-24",
};

/**
 * A skill's tile, from one editable string.
 *
 * Four forms in one field so the editor can stay a single text box: a URL or
 * data URI renders as an image, an id from the SVG collection draws that
 * artwork, a known icon key renders that icon, and anything else renders as
 * text — which is how an emoji works without needing its own field or an
 * upload.
 *
 * Art is checked before icon names, so where both sets hold the same word (a
 * `star.svg` and the `star` icon) the drawn artwork wins.
 */
export const UISkillThumbnail: React.FC<UISkillThumbnailProps> = ({
  thumbnail,
  fallbackIconName,
  category,
  size = "md",
  className = "",
}) => {
  const art = skillArtFor(category).art;
  const box = `${SIZES[size]} bg-gradient-to-br ${art} flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${className}`;
  const value = thumbnail?.trim();

  if (value && isImage(value)) {
    return (
      <div className={box}>
        {/* Decorative: the skill's name is always rendered beside it. */}
        <img src={value} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  if (value && hasSvgAsset(value)) {
    return (
      <div
        className={`${ART_SIZES[size]} flex items-center justify-center shrink-0 ${className}`}
      >
        {/* Decorative, like the image branch: the skill's name sits beside it. */}
        <SvgAsset id={value} size="100%" />
      </div>
    );
  }

  if (value && !(value in lessonIcons)) {
    return (
      <div className={box}>
        <span aria-hidden="true" className="leading-none">
          {value}
        </span>
      </div>
    );
  }

  const Icon = resolveLessonIcon(value || fallbackIconName);
  return (
    <div className={box}>
      <Icon className="text-white" />
    </div>
  );
};
