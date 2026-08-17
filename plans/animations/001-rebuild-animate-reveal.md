# 001 — Rebuild the `.animate` page-reveal system

- **Status**: DONE
- **Commit**: a18fdfa
- **Severity**: HIGH
- **Category**: Purpose & frequency / Performance / Accessibility
- **Estimated scope**: 4 files (global.css, Head.astro, MenuLayout.astro, ContactPage.astro), ~60 lines changed

## Problem

The site-wide `.animate`/`.show` reveal system has four compounding defects:

**1. It uses `transition: all`, and the transition silently breaks under Tailwind utilities.**

```css
/* src/styles/global.css:221-230 — current */
.animate {
  opacity: 0;
  transform: translateY(0.75rem);
  transition: all var(--duration-normal) var(--ease-out-cubic);
}

.animate.show {
  opacity: 1;
  transform: translateY(0);
}
```

`transition: all` is always a finding (it animates unintended properties off-GPU). Worse: this rule lives in `@layer base`, so any Tailwind transition utility on the same element overrides `transition-property` entirely. That happens today:

```html
<!-- src/components/contact/ContactPage.astro:20-22 — current -->
<div
  class="animate group order-2 w-full self-center overflow-hidden rounded-4xl transition-shadow hover:shadow-xl md:order-1 md:aspect-[4/5]"
>
```

`transition-shadow` (utilities layer) rewrites `transition-property` to `box-shadow`, so this element's reveal has **no transition at all** — the contact image snaps from invisible to visible.

**2. The reveal is not scroll-triggered — it's a page-load `setTimeout` ladder at 150ms per element.**

```js
// src/components/Head.astro:188-196 — current
function animate() {
  const animateElements = document.querySelectorAll(".animate");

  animateElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add("show");
    }, index * 150);
  });
}
```

On about-us there are 9 `.animate` elements — the last starts revealing ~1.2s after load. Below-the-fold elements "reveal" invisibly before the user scrolls to them, while above-the-fold content the user is actually looking at waits its turn in DOM order. 150ms is also 2–5× the 30–80ms stagger guideline.

**3. Content is invisible until JS runs.** `.animate { opacity: 0 }` applies unconditionally. If JS fails or is slow, the menu — the reason the site exists — never appears:

```html
<!-- src/components/menu/MenuLayout.astro:32 — current -->
<div class="animate w-full space-y-10 px-8 md:space-y-20">
```

**4. The highest-frequency surface replays the entrance on every interaction.** This is an MPA with no `<ClientRouter />`; every menu category tap is a full page load, so the category pills and the entire product grid fade in from `opacity: 0` on *every* category switch — a tens-of-times-per-visit element getting an entrance animation:

```html
<!-- src/components/menu/MenuLayout.astro:24-32 — current -->
<h1 class="animate text-h4 md:text-h2 uppercase">{t("menu.menu")}</h1>
<h2 class="animate text-b4 md:text-b2">
  {t("menu.desc")}
</h2>
...
<div class="animate relative mt-10 mb-8 w-full md:mt-20 md:mb-16 md:w-fit">
  <CategoryButtons lang={lang} category={category} />
</div>
<div class="animate w-full space-y-10 px-8 md:space-y-20">
```

## Target

1. `.animate` transitions **only** `opacity` and `transform`, gated behind an `html.js` class so no-JS users always see content, with a strong ease-out and a reduced-motion branch that keeps the opacity fade but drops movement:

```css
/* src/styles/global.css — target (replaces lines 221-230) */
html.js .animate {
  opacity: 0;
  transform: translateY(0.75rem);
  transition:
    opacity var(--duration-normal) var(--ease-out-quint),
    transform var(--duration-normal) var(--ease-out-quint);
}

html.js .animate.show {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  html.js .animate {
    transform: none;
    transition: opacity var(--duration-fast) ease-out;
  }
}
```

(`--ease-out-quint` is `cubic-bezier(0.23, 1, 0.32, 1)` — already defined at `src/styles/global.css:154`. It is the exact strong ease-out curve the animation guidelines prescribe for UI entrances. `--duration-normal` is `0.3s`, `--duration-fast` is `0.2s`, both at `global.css:167-168`.)

2. The reveal driver becomes an `IntersectionObserver`: elements reveal when they enter the viewport, staggered **60ms** within each intersection batch (not by global DOM index):

```js
// src/components/Head.astro — target (replaces the animate() function at lines 188-196)
function animate() {
  const animateElements = document.querySelectorAll(".animate:not(.show)");
  if (!("IntersectionObserver" in window)) {
    animateElements.forEach((el) => el.classList.add("show"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      let batchIndex = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        setTimeout(() => el.classList.add("show"), batchIndex * 60);
        batchIndex += 1;
        observer.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  animateElements.forEach((el) => observer.observe(el));
}
```

3. The `<html>` element gets a `js` class from an inline script **before** first paint, so the hidden state only ever exists when JS is running.

4. Menu pages lose the entrance entirely (frequency table: tens of times/visit → remove). Contact page loses the conflicting `transition-shadow hover:shadow-xl` (a decorative hover on a non-interactive image; deleting it also resolves the layer conflict).

## Repo conventions to follow

- Easing/duration tokens live in `:root` in `src/styles/global.css:141-168`; reference them with `var(--ease-out-quint)` / `var(--duration-normal)`. Do not invent new tokens.
- The reveal script lives in the `is:inline` script block in `src/components/Head.astro:174-216`, which re-runs `init()` on `DOMContentLoaded` and `astro:after-swap`. Keep the new code inside that same block and keep `animate()` called from `init()`.
- Exemplar of correct hover/touch gating in this repo: `src/styles/global.css:302` (`@media (hover: hover) and (pointer: fine)`).

## Steps

1. **`src/components/Head.astro`** — at the very top of the `is:inline` script (line 174, before `function init()`), add:
   ```js
   document.documentElement.classList.add("js");
   ```
2. **`src/components/Head.astro`** — replace the `animate()` function (lines 188-196) with the IntersectionObserver version from Target §2, verbatim.
3. **`src/styles/global.css`** — replace the `.animate` / `.animate.show` rules (lines 221-230) with the three rules from Target §1, verbatim. Note they move from bare `.animate` to `html.js .animate` — the reduced-motion block is a NEW addition placed with the other rules, not inside the existing `@media (prefers-reduced-motion: reduce)` block at line 383.
4. **`src/components/menu/MenuLayout.astro`** — remove the `animate` class (only that class, keep everything else) from all four elements at lines 24, 25, 29, and 32.
5. **`src/components/contact/ContactPage.astro:21`** — remove `transition-shadow hover:shadow-xl` from the class list. Also remove `transition-transform group-hover:scale-105` from the `<Image>` on line 26 (same decorative hover; without the shadow it's an orphaned zoom).

## Boundaries

- Do NOT touch `src/hooks/useReveal.ts` or any GSAP code — the GSAP `.reveal` system is a separate plan.
- Do NOT remove `.animate` usages on about-us or contact pages — only menu pages lose it.
- Do NOT touch `#back-to-top`, `.animate-sprite`, or the `scrolled` logic in the same files.
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` completes with no errors. `grep -n "transition: all" src/styles/global.css` returns nothing.
- **Feel check** (`pnpm dev`, then):
  - Load `/about-us`: content above the fold fades/slides in quickly (all visible well under 500ms); scrolling down reveals each section as it enters, not before.
  - Load `/menu/coffee` and click "Non-Coffee": the category pills and grid render **immediately solid** — no fade on category switch.
  - Load `/contact`: the photo now fades+slides in with the form (previously it snapped).
  - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: reveals still fade in (opacity) but nothing moves vertically.
  - DevTools → disable JavaScript, reload `/menu/coffee`: all content is visible.
- **Done when**: all five feel checks pass and no element anywhere renders with `transition: all`.
