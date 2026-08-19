# SVG collection

Artwork lives here as plain `.svg` files, one folder per category:

```
fruits/apple.svg          -> id "apple",     category "fruits"
manipulatives/ten-frame.svg
mango.svg                 -> id "mango",     uncategorised
```

The filename is the id and the folder is the category — there is no manifest,
so the tree cannot disagree with itself. Ids are **global**: `<SvgAsset
id="apple" />` names one asset, so the same filename in two categories is an
error the generator refuses to write past.

## Adding art

Two routes, same result — a file in this folder.

**From the app** (dev server only): the sidebar's *Art* page manages the whole
collection — category rail with counts, search, A–Z or most-recent order,
preview at the sizes artwork actually gets used at, and:

- **Add artwork** — paste markup, name it, file it. Previewed through the real
  pipeline first, with a count of what the sanitiser drops, so a bad paste is
  caught before it is saved.
- **Edit** — same panel against the stored file. Changing the id renames the
  file; changing the category moves it.
- **Select** tiles for bulk **Move to…** (existing or new category) or
  **Delete**. Deleting the last file in a category removes the empty folder.

Every one of those writes the working tree, so the next `git status` shows what
you did.

**By hand**: drop the `.svg` in, then `npm run svg:ids` (automatic on
`npm run dev` / `npm run build`).

Either way the name is lowercase-kebab-case — it becomes the id, and both the
generator and the save endpoint refuse anything else. Then use it:
`<SvgAsset id="your-id" size={64} title="An apple" />`.

Nothing else registers the file. `registry.ts` globs the folder, so there is no
list to update and no import to add. A built app can list and preview the
collection but not change it: the write endpoint (`svgAssetRoutes.ts`) refuses
outside development, because it edits the working tree.

## What happens to the markup

Paste it as the generator gave it to you — the pipeline in `src/utils/svg`
handles the rest:

- **on load** — `preprocessSvgMarkup` drops the authored `width`/`height` so the
  art fills whatever box it is given, keeps the `viewBox`, adds `xmlns`, and
  hyphenates JSX-style attributes (`strokeWidth` → `stroke-width`), which AI
  output is full of.
- **on render** — `sanitizeSvgMarkup` rebuilds the markup keeping only what
  `svgPolicy.ts` allows, then `scopeSvgIds` namespaces every `id` to that one
  instance so repeated copies do not share gradients or clip paths.

So: no scripts, no event handlers, no remote references survive; anything
outside the allowlist is dropped rather than rendered. If artwork comes out
blank, that is the sanitiser refusing something — check the browser console and
`svgPolicy.ts` for the element or attribute it dropped.

## Writing code against the collection

`SvgAssetId` is a literal union generated from the folder, so an unknown id is a
type error rather than a blank space. `svgAssetIds` lists everything at runtime
(useful for a picker), and `hasSvgAsset(id)` narrows an unknown string.

A skill's `thumbnail` in `manifest.json` is one of those runtime lookups: put an
id from here in it (`"thumbnail": "counting-quest"`) and the Learn tile draws the
artwork instead of an emoji. Ids are checked before icon names, so art called
`star` wins over the `star` icon.
