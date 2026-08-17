# 008 — Smooth the menu's skeleton → content handoff and image pop-in

- **Status**: TODO
- **Commit**: a18fdfa
- **Severity**: MEDIUM
- **Category**: Missed transition / Performance
- **Estimated scope**: 3 files (MenuList.astro, MenuListLoading.astro, SanityImage.astro), ~30 lines changed
- **Depends on**: plan 001 (uses the `html.js` class it introduces)

## Problem

The menu page's most visible seam has no motion covering it:

**1. The server-island swap is a hard cut with a height jump.** The `server:defer` fallback is exactly 4 pulsing blocks; the resolved list renders every item in the category (often 8+). When the island resolves, the skeleton is replaced instantaneously and the page height jumps:

```astro
<!-- src/components/menu/MenuListLoading.astro:5-13 — current -->
<div
  class="grid grid-cols-2 items-center gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-8 md:gap-y-16"
>
  {
    Array.from({ length: 4 }).map((_) => (
      <div class="h-60 w-full animate-pulse place-self-center rounded-4xl bg-gray-200" />
    ))
  }
</div>
```

```astro
<!-- src/components/menu/MenuList.astro:35-45 — current -->
<div
  class="grid grid-cols-2 items-stretch gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-8 md:gap-y-16"
>
  {
    menuItems.map((item) => (
      <div class="h-full">
        <MenuItem menuItem={item} lang={lang} />
      </div>
    ))
  }
</div>
```

**2. Every card image then pops in separately as it decodes**, inside the `min-h-32`/`md:h-60` card containers, with no intrinsic dimensions and no load transition:

```astro
<!-- src/components/SanityImage.astro:25 — current -->
{image && <img src={image.url()} alt={node.alt || ""} title={node.alt} />}
```

## Target

1. The resolved grid fades in via `@starting-style` — pure CSS, fires exactly when the island's DOM is inserted, interruptible, zero JS:

```astro
<!-- src/components/menu/MenuList.astro — target grid -->
<div
  class="menu-grid grid grid-cols-2 items-stretch gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-8 md:gap-y-16"
>
  ...
</div>

<style>
  .menu-grid {
    opacity: 1;
    transition: opacity 250ms var(--ease-out-quint);
    @starting-style {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .menu-grid {
      transition-duration: 0.2s;
    }
  }
</style>
```

(Opacity-only — an opacity fade is kept under reduced motion per the guidelines. `--ease-out-quint` = `cubic-bezier(0.23, 1, 0.32, 1)`, defined in `src/styles/global.css:154`.)

2. The skeleton shows 8 blocks (two full rows on desktop, four on mobile) so the height jump on resolve is far smaller in the common case.

3. Sanity images get lazy loading, async decode, and a load fade gated behind `html.js` (so no-JS users always see images):

```astro
<!-- src/components/SanityImage.astro — target -->
{
  image && (
    <img
      src={image.url()}
      alt={node.alt || ""}
      title={node.alt}
      width={width}
      loading="lazy"
      decoding="async"
      class="sanity-img"
      onload="this.classList.add('loaded')"
    />
  )
}

<style>
  html.js .sanity-img {
    opacity: 0;
    transition: opacity 200ms var(--ease-out-quint);
  }
  html.js .sanity-img.loaded {
    opacity: 1;
  }
</style>
```

Note: `width={width}` uses the component's existing `width` prop (default 960, `src/components/SanityImage.astro:9`) as the intrinsic width attribute. Height stays unset (Sanity aspect ratios vary); the card containers (`min-h-32`, `md:h-60` in `MenuItem.astro`) already bound layout, so this does not reintroduce meaningful CLS.

## Repo conventions to follow

- `html.js` is set by the inline script in `src/components/Head.astro` — added by plan 001. **If plan 001 has not landed, STOP**: this plan's image fade would permanently hide images for no-JS users without that gate.
- Astro scoped `<style>` blocks are the norm for component-local CSS — exemplar: `src/pages/404.astro:30`.
- Inline `onload` is used (rather than a script) because the images are server-island HTML — there is no island script context; the attribute also fires reliably for cache-hit images since it's present at parse time.

## Steps

1. **`src/components/menu/MenuListLoading.astro:9`** — change `Array.from({ length: 4 })` to `Array.from({ length: 8 })`.
2. **`src/components/menu/MenuList.astro`** — add the `menu-grid` class to the grid div (line 35) and append the `<style>` block from Target §1 at the end of the file.
3. **`src/components/SanityImage.astro`** — replace line 25 with the Target §3 markup and append its `<style>` block. Astro scoped styles won't match the `html.js` ancestor by default — mark those two rules `:global()`: `:global(html.js) .sanity-img { … }` (the `.sanity-img` part stays scoped).

## Boundaries

- Do NOT touch the Sanity query, `MenuItem.astro`, or the `server:defer` mechanism itself.
- Do NOT add a fixed height to the grid or skeleton to "prevent" the height jump — the skeleton-count change is the only mitigation; content height is content height.
- Do NOT touch `AddOnList.astro` — add-ons are static server HTML, not part of the island.
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds.
- **Feel check** (`pnpm dev`, `/menu/coffee`, DevTools → Network → throttle to "Slow 4G" so the island and images resolve visibly late):
  - The skeleton shows 8 pulsing blocks; when content arrives, the grid fades in over ~250ms instead of blinking into place.
  - Each card image fades in as it loads rather than popping.
  - Hard-reload with cache: images still appear (the `loaded` class arrives via `onload` even for cached images).
  - DevTools → disable JavaScript, reload: images are fully visible immediately (the `html.js` gate).
  - `prefers-reduced-motion: reduce`: content still fades (opacity only, short) — nothing moves.
- **Done when**: skeleton→content and image loads both read as one calm handoff at slow network speeds, and the no-JS check passes.
