# 010 — Turn menu category switching into a tab switch with ClientRouter

- **Status**: TODO
- **Commit**: a18fdfa
- **Severity**: MEDIUM (missed opportunity — highest-impact motion change available)
- **Category**: Missed opportunities / Purpose & frequency
- **Estimated scope**: 2 files (Layout.astro, CategoryButtons.astro), ~15 lines changed
- **Depends on**: plan 001 (menu pages must no longer carry `.animate` entrance classes)

## Problem

Switching menu categories is the site's most-repeated interaction, the links are already prefetched (`data-astro-prefetch`), yet every tap is a white-flash full document reload — the data is local but the experience is a page load. There is no `<ClientRouter />` anywhere in the repo, even though `src/components/Head.astro:215` already listens for `astro:after-swap` in anticipation:

```js
// src/components/Head.astro:214-215 — current (already ClientRouter-ready)
document.addEventListener("DOMContentLoaded", () => init());
document.addEventListener("astro:after-swap", () => init());
```

The four category links live in `src/components/menu/CategoryButtons.astro:21-76`; each is an `<a class="shrink-0 snap-start" href=... data-astro-prefetch>` wrapping a `<Button>` whose variant flips between `"secondary"` (active) and `"ghost"`.

## Target

Astro view transitions on all `Layout.astro` pages (menu, about-us, contact, 404) — **not** the homepage, whose GSAP ScrollSmoother/ScrollTrigger stack must keep full-page loads. Category switches become an in-place morph: the page persists, each pill cross-animates via a stable `transition:name`, and the content fades.

```astro
<!-- src/layouts/Layout.astro — target head -->
---
import { ClientRouter } from "astro:transitions";
...
---
...
  <head>
    <Head ... />
    <ClientRouter />
  </head>
```

```astro
<!-- src/components/menu/CategoryButtons.astro — target: each <a> gets a stable name -->
<a
  class="shrink-0 snap-start"
  href={translatedPath(`/menu/${Category.coffee}/`)}
  data-astro-prefetch
  transition:name="category-pill-coffee"
>
```

(and `category-pill-non-coffee`, `category-pill-specialty`, `category-pill-grub` on the other three.)

With stable per-pill names, the browser's View Transitions API animates each pill's state change (ghost ↔ secondary) as a contained crossfade while the rest of the page does Astro's default fade — the pills read as a persistent tab bar instead of reloading chrome.

## Repo conventions to follow

- `Layout.astro`'s `<head>` currently contains only the `<Head>` component (`src/layouts/Layout.astro:30-37`); `<ClientRouter />` goes directly after it.
- Do NOT add ClientRouter to `src/layouts/HomeLayout.astro`. Navigations from a ClientRouter page to a non-ClientRouter page (e.g. menu → home) automatically fall back to a full load — that is the intended behavior here.
- The existing `astro:after-swap` listener in `Head.astro` re-runs `init()` (scroll state, back-to-top, and — after plan 001 — the IntersectionObserver reveal). Do not duplicate that wiring.

## Steps

1. **`src/layouts/Layout.astro`** — add `import { ClientRouter } from "astro:transitions";` to the frontmatter and `<ClientRouter />` inside `<head>` after `<Head ... />`.
2. **`src/components/menu/CategoryButtons.astro`** — add the four `transition:name` attributes to the four `<a>` elements (lines 21, 35, 49, 63) as shown in Target. Names must be exactly `category-pill-coffee`, `category-pill-non-coffee`, `category-pill-specialty`, `category-pill-grub` — stable across pages, unique within a page.

## Boundaries

- Do NOT touch `HomeLayout.astro`, any homepage component, or any GSAP code.
- Do NOT add `transition:persist` to any island (the mobile drawer must reset on navigation).
- Do NOT customize transition animations beyond the defaults + the four names — no `transition:animate` directives in this plan.
- Do NOT add new dependencies (ClientRouter ships with Astro).
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds.
- **Feel check** (`pnpm dev`):
  - `/menu/coffee` → tap "Non-Coffee": **no white flash** — the pill highlight moves, content crossfades, scroll position and the tab bar feel continuous. Repeat across all four categories.
  - Menu → About-us and menu → Contact also soft-navigate; menu → Home (logo) does a normal full load and the homepage GSAP choreography still runs correctly.
  - Browser back/forward through categories: transitions run in reverse order without errors; the back-to-top button still works after several swaps (the `astro:after-swap` re-init).
  - On about-us after a soft navigation: scroll reveals still fire (plan 001's observer re-initialized).
  - DevTools → `prefers-reduced-motion: reduce`: navigation still happens client-side but Astro suppresses the transition animations (built-in behavior) — verify no full reload and no motion.
  - Test in Safari or Firefox (no native View Transitions in older versions): category switching still works — Astro falls back gracefully.
- **Done when**: category switching reads as a tab switch in Chrome, degrades to working navigation elsewhere, and the homepage is untouched.
