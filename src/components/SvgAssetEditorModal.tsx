import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Loader2, ShieldCheck, X } from "lucide-react";
import { SvgMarkup } from "../assets/svg";
import { preprocessSvgMarkup, sanitizeSvgMarkup, isSafeSvgMarkup } from "../utils/svg";
import { themeSystem } from "../lib/themeSystem";
import {
  SUGGESTED_SVG_CATEGORIES,
  SVG_ID_PATTERN,
  UNCATEGORISED,
  moveSvgAsset,
  saveSvgAsset,
} from "../lib/svgAssetsApi";
import { playSound } from "../utils/audio";

/** Elements and attributes in a document, for comparing before and after sanitising. */
function countMarkup(markup: string): { elements: number; attributes: number } | null {
  if (!markup || typeof DOMParser === "undefined") return null;
  const parsed = new DOMParser().parseFromString(markup, "image/svg+xml");
  if (parsed.getElementsByTagName("parsererror").length > 0) return null;
  const elements = parsed.querySelectorAll("*");
  let attributes = 0;
  elements.forEach((element) => {
    attributes += element.attributes.length;
  });
  return { elements: elements.length, attributes };
}

type Verdict =
  | { state: "empty" }
  | { state: "invalid"; message: string }
  | { state: "ok"; droppedElements: number; droppedAttributes: number };

/**
 * What the pipeline will do to this markup, worked out while the author types.
 *
 * The sanitiser drops silently by design, so the one place that must not be
 * silent is here: paste artwork using something outside the allowlist and the
 * count tells you before it becomes a blank space in a lesson.
 */
function inspect(markup: string): Verdict {
  const trimmed = markup.trim();
  if (!trimmed) return { state: "empty" };
  if (!isSafeSvgMarkup(trimmed)) {
    return {
      state: "invalid",
      message: "Must start with <svg> and carry no <script>, on… handlers, or embedded documents.",
    };
  }

  const normalised = preprocessSvgMarkup(trimmed);
  const sanitised = sanitizeSvgMarkup(normalised);
  if (!sanitised) {
    return {
      state: "invalid",
      message: "The SVG could not be parsed. Check its tags and quoting.",
    };
  }

  const before = countMarkup(normalised);
  const after = countMarkup(sanitised);
  return {
    state: "ok",
    droppedElements: before && after ? Math.max(0, before.elements - after.elements) : 0,
    droppedAttributes: before && after ? Math.max(0, before.attributes - after.attributes) : 0,
  };
}

interface SvgAssetEditorModalProps {
  /** Editing an existing asset when set; adding a new one when null. */
  editingId: string | null;
  initialMarkup?: string;
  /** Category the asset is filed under. Changing it moves the file. */
  initialCategory?: string;
  /** Ids already taken, so a new asset cannot silently overwrite one. */
  existingIds: string[];
  /** Categories already in use, offered before the generic suggestions. */
  existingCategories: string[];
  onClose: () => void;
  onSaved: (id: string, markup: string, category: string) => void;
}

export const SvgAssetEditorModal: React.FC<SvgAssetEditorModalProps> = ({
  editingId,
  initialMarkup = "",
  initialCategory = "",
  existingIds,
  existingCategories,
  onClose,
  onSaved,
}) => {
  const isEdit = editingId !== null;
  const [id, setId] = useState(editingId ?? "");
  const [category, setCategory] = useState(
    initialCategory === UNCATEGORISED ? "" : initialCategory,
  );
  const [markup, setMarkup] = useState(initialMarkup);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const verdict = useMemo(() => inspect(markup), [markup]);

  const idError = (() => {
    if (!id) return null;
    if (!SVG_ID_PATTERN.test(id)) return "Lowercase letters, numbers and single hyphens only.";
    // Its own id is not a clash; anyone else's is.
    if (id !== editingId && existingIds.includes(id))
      return "An asset with this id already exists.";
    return null;
  })();

  // Blank means uncategorised, so an untouched field on an uncategorised asset
  // is not a move — comparing the raw text would claim it was.
  const filedCategory = category.trim() || UNCATEGORISED;

  const categoryError =
    category && !SVG_ID_PATTERN.test(category)
      ? "Lowercase letters, numbers and single hyphens only."
      : null;

  const canSave = Boolean(id) && !idError && !categoryError && verdict.state === "ok" && !saving;

  // What the author has typed, then what they already use, then the generic set —
  // so an existing category is one keystroke away and a near-duplicate is visible.
  const categoryOptions = [
    ...new Set([
      ...existingCategories.filter((name) => name !== UNCATEGORISED),
      ...SUGGESTED_SVG_CATEGORIES,
    ]),
  ];

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      // Stored normalised, the same shape the folder's other files are in.
      const normalised = preprocessSvgMarkup(markup.trim());
      // A rename moves the file first so the write lands on the new name rather
      // than leaving the old one behind as a copy.
      if (isEdit && editingId && id !== editingId) {
        await moveSvgAsset(editingId, { toId: id, category: filedCategory });
      }
      await saveSvgAsset(id, normalised, filedCategory);
      playSound("pop");
      onSaved(id, normalised, filedCategory);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={themeSystem.modal.overlay} onClick={onClose}>
      <div
        /* The token caps at max-w-lg; this dialog needs the room, and appending
           a second max-w would leave which one wins to CSS order. */
        className={`${themeSystem.modal.content.replace("max-w-lg", "max-w-4xl")} flex flex-col max-h-[90vh]`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? `Edit ${editingId}` : "Add SVG asset"}
      >
        <div className={themeSystem.modal.header}>
          <div>
            <h3 className="text-base font-black text-ink font-mono">
              {isEdit ? `Edit ${editingId}` : "Add artwork"}
            </h3>
            <p className="text-xs text-muted">
              Saved to{" "}
              <code className="font-mono">
                src/assets/svg/{category.trim() ? `${category.trim()}/` : ""}
                {id || "<id>"}.svg
              </code>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-muted hover:text-ink hover:bg-surface-muted transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5">
          <div className="space-y-4 min-w-0">
            <div className="space-y-1.5">
              <label htmlFor="svg-asset-id" className="text-xs font-mono font-bold text-body">
                Asset id
              </label>
              <input
                id="svg-asset-id"
                value={id}
                onChange={(event) => setId(event.target.value.trim().toLowerCase())}
                placeholder="ten-frame"
                className="w-full bg-surface-muted border border-line rounded-xl px-3 py-2 text-sm font-mono text-ink placeholder:text-muted focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              />
              <p className="text-[11px] text-muted">
                {idError ||
                  (isEdit && id !== editingId
                    ? `Renames the file, and every <SvgAsset id="${editingId}"> stops compiling until it is updated.`
                    : "Becomes the filename and the value you pass to <SvgAsset id=…>.")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="svg-asset-category" className="text-xs font-mono font-bold text-body">
                Category
              </label>
              <input
                id="svg-asset-category"
                list="svg-asset-categories"
                value={category}
                onChange={(event) => setCategory(event.target.value.trim().toLowerCase())}
                placeholder="fruits"
                className="w-full bg-surface-muted border border-line rounded-xl px-3 py-2 text-sm font-mono text-ink placeholder:text-muted focus:outline-none focus:border-indigo-500"
              />
              <datalist id="svg-asset-categories">
                {categoryOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <p className="text-[11px] text-muted">
                {categoryError ||
                  (isEdit && initialCategory && filedCategory !== initialCategory
                    ? `Saving moves the file out of ${initialCategory}.`
                    : "The folder the file lives in. Leave blank to file it later.")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="svg-asset-markup" className="text-xs font-mono font-bold text-body">
                SVG markup
              </label>
              <textarea
                id="svg-asset-markup"
                value={markup}
                onChange={(event) => setMarkup(event.target.value)}
                spellCheck={false}
                placeholder="Paste the <svg>…</svg> your generator produced"
                className="w-full h-64 bg-surface-muted border border-line rounded-xl px-3 py-2 text-xs font-mono text-ink placeholder:text-muted focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            {verdict.state === "invalid" && (
              <div className={themeSystem.flash("error", "text-xs")}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{verdict.message}</span>
              </div>
            )}
            {verdict.state === "ok" &&
              (verdict.droppedElements > 0 || verdict.droppedAttributes > 0 ? (
                <div className={themeSystem.flash("warning", "text-xs")}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    The sanitiser drops {verdict.droppedElements} element
                    {verdict.droppedElements === 1 ? "" : "s"} and {verdict.droppedAttributes}{" "}
                    attribute
                    {verdict.droppedAttributes === 1 ? "" : "s"} from this markup. Compare the
                    preview with what you expected — if something is missing, its name needs adding
                    to <code className="font-mono">utils/svg/svgPolicy.ts</code>.
                  </span>
                </div>
              ) : (
                <div className={themeSystem.flash("success", "text-xs")}>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Renders whole — nothing is dropped by the sanitiser.</span>
                </div>
              ))}
            {error && (
              <div className={themeSystem.flash("error", "text-xs")}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Live preview: exactly the pipeline the app renders through. */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-body">Preview</div>
            <div className="rounded-2xl border border-line p-4 flex items-center justify-center bg-checkerboard">
              <SvgMarkup
                markup={markup}
                raw
                size={180}
                title="Preview"
                fallback={<span className="text-xs text-muted py-16">nothing to draw</span>}
              />
            </div>
            <div className="flex items-center justify-center gap-4 rounded-2xl border border-line p-3 bg-checkerboard">
              {[24, 48, 72].map((size) => (
                <SvgMarkup key={size} markup={markup} raw size={size} title={`${size} pixels`} />
              ))}
            </div>
            <p className="text-[11px] text-muted">
              Drawn through sanitise → scope ids, the same path the app uses.
            </p>
          </div>
        </div>

        <div className={themeSystem.modal.footer}>
          <button onClick={onClose} className={themeSystem.button("secondary", "sm")}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={themeSystem.button("primary", "sm")}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEdit ? "Save changes" : "Add to collection"}
          </button>
        </div>
      </div>
    </div>
  );
};
