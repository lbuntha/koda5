export interface SvgAssetRecord {
  id: string;
  /** Folder the file sits in. `uncategorised` means the top level. */
  category: string;
  markup: string;
  /** File mtime. Absent for the bundled registry, which has no file dates. */
  modified?: number;
}

/** Art at the top level belongs to no category yet, which is a legitimate state. */
export const UNCATEGORISED = "uncategorised";

/**
 * Offered in the category field so a collection does not end up with
 * `fruit`, `fruits` and `Fruit` meaning the same thing. Not a closed list —
 * anything kebab-case is accepted, and these vanish once real ones exist.
 */
export const SUGGESTED_SVG_CATEGORIES = [
  "fruits",
  "vegetables",
  "animals",
  "food",
  "nature",
  "objects",
  "people",
  "shapes",
  "transport",
  "manipulatives",
];

/**
 * Editing writes files into `src/assets/svg`, which only exists as a working
 * tree while the dev server is running. A built app still lists and previews
 * the collection — it just cannot change it.
 */
export const SVG_ASSETS_EDITABLE = import.meta.env.DEV;

/** Same rule as the server and the id generator: the id is the filename, the category is the folder. */
export const SVG_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error ?? `Request failed (${response.status}).`;
}

/** Everything on disk right now — the truth the bundled registry is a snapshot of. */
export async function listSvgAssets(): Promise<SvgAssetRecord[]> {
  const response = await fetch("/api/svg-assets");
  if (!response.ok) throw new Error(await readError(response));
  const body = (await response.json()) as { assets: SvgAssetRecord[] };
  return body.assets;
}

/**
 * Create, replace, or refile one asset. Regenerates the id union server-side.
 *
 * Saving under a different category moves the file, because the folder *is*
 * the category — there is no second place where that fact is recorded.
 */
export async function saveSvgAsset(
  id: string,
  markup: string,
  category: string,
): Promise<{ created: boolean; moved: boolean }> {
  const response = await fetch(`/api/svg-assets/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markup, category }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as { created: boolean; moved: boolean };
}

/**
 * Rename or refile without touching the markup.
 *
 * Both are one operation on disk — the path carries the id and the category —
 * so they share a call rather than pretending to be independent.
 */
export async function moveSvgAsset(
  id: string,
  changes: { toId?: string; category?: string },
): Promise<{ id: string; category: string }> {
  const response = await fetch(`/api/svg-assets/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as { id: string; category: string };
}

/** Delete one asset's file. There is no undo beyond version control. */
export async function deleteSvgAsset(id: string): Promise<void> {
  const response = await fetch(`/api/svg-assets/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await readError(response));
}
