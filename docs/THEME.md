# Learn with Koda theme contract

This is the learner-facing theme carried from `koda-v4`. It is playful, calm,
touch-friendly, and built for children. New plugins should consume semantic tokens
and shared UI primitives instead of copying hex values into feature code.

## Product identity

- Product name: **Learn with Koda**.
- Audience: children learning independently, primarily on touch devices.
- Voice: encouraging, short, clear, and positive.
- Shape language: round controls, `rounded-2xl` or `rounded-3xl` cards, friendly icon wells.
- Motion: brief and purposeful; always respect `prefers-reduced-motion`.

## Semantic tokens

| Role          | Utility                 | Value     | Use                                  |
| ------------- | ----------------------- | --------- | ------------------------------------ |
| Canvas        | `bg-koda-canvas`        | `#FAF9FF` | App background                       |
| Surface       | `bg-koda-surface`       | `#FFFFFF` | Cards, toolbar, menus                |
| Ink           | `text-koda-ink`         | `#21183D` | Headings and important content       |
| Body          | `text-koda-body`        | `#6E6480` | Explanations and labels              |
| Muted         | `text-koda-muted`       | `#9387AB` | Low-emphasis metadata                |
| Primary       | `bg-koda-primary`       | `#6844EA` | Play buttons and selected navigation |
| Primary hover | `bg-koda-primary-hover` | `#5938D2` | Hover/pressed primary actions        |
| Accent        | `text-koda-accent`      | `#9A85FF` | Decorative emphasis                  |
| Soft          | `bg-koda-soft`          | `#F3EFFF` | Active navigation and purple wells   |
| Border        | `border-koda-border`    | `#E7E2F1` | Cards and controls                   |
| Divider       | `border-koda-divider`   | `#EEE9FA` | Quiet separators                     |

Tokens are defined once in `src/styles/index.css` under Tailwind's `@theme` block.
Change them there to update all plugins.

## Typography roles

The UI loads local **Plus Jakarta Sans** files. **JetBrains Mono** is reserved for
technical values. Feature components must inherit the global font.

- `koda-page-title`: the page greeting or destination title.
- `koda-section-title`: home-page section titles.
- `koda-card-title`: activity and feature card titles.
- `koda-nav-label`: learner navigation labels.
- `koda-label`: important supporting labels.
- `koda-metric`: XP, streak, and progress values.
- `koda-chip`: compact badges and metadata.

## Shared primitives

Import `Card`, `Button`, and `Badge` from `src/components/ui`.

```tsx
import { Badge, Button, Card } from '../../components/ui';

export function ReadingPluginHome() {
  return (
    <Card className="p-5">
      <Badge>New adventure</Badge>
      <h2 className="koda-card-title mt-3">Story Explorer</h2>
      <p className="mt-1 text-sm font-semibold text-koda-body">
        Read a short story and find the hidden clues.
      </p>
      <Button className="mt-4">Play</Button>
    </Card>
  );
}
```

## Learner UI rules

1. Make primary touch targets at least 40 px; main activity actions should be larger.
2. Keep one clear action per activity card. Prefer “Play,” “Continue,” or “Try again.”
3. Use purple for primary actions, selected navigation, and current learning steps.
4. Use semantic color for rewards and state: amber for XP, orange for streaks,
   emerald for completed, and rose for errors.
5. Keep copy short. Explain the next action rather than implementation details.
6. Use friendly art or an honest empty state; never show a broken image placeholder.
7. Keep `p-4 sm:p-6`, `gap-3` to `gap-6`, and responsive one-column layouts.
8. Avoid admin tables, dense controls, and marketing-style hero sections.

## Plugin contract

Each `AppPlugin` supplies `id`, `name`, `description`, `version`, and `component`.
The home page renders enabled plugin components and wraps each with
`data-plugin-id` for inspection and testing.

1. Create `src/plugins/<plugin-name>/index.tsx` and its component.
2. Export an object implementing `AppPlugin`.
3. Register it in `src/core/plugins/registry.ts`.
4. Open **Plugin Lab** in the app and toggle it to test mount/unmount behavior.
5. Run `npm test`, `npm run lint`, and `npm run build`.
