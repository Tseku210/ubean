# 002 — Gate all GSAP motion behind reduced-motion and fix ScrollSmoother lifecycle

- **Status**: TODO
- **Commit**: a18fdfa
- **Severity**: HIGH
- **Category**: Accessibility / Interruptibility
- **Estimated scope**: 6 files (HomePage.tsx, useReveal.ts, MotionPath.tsx, Portofilters.tsx, RoastedBeans.tsx, global.css), ~80 lines changed

## Problem

**1. `ScrollSmoother` is created at module scope, never killed, and never gated.**

```tsx
// src/components/home/HomePage.tsx:14-24 — current
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  MotionPathPlugin,
  MotionPathHelper,
);

ScrollSmoother.create({
  smooth: 1,
});
```

It runs on import — before React mounts and before `#smooth-wrapper`/`#smooth-content` (defined in `src/layouts/HomeLayout.astro`) are guaranteed to exist — is never `.kill()`ed, and replaces native scrolling with rAF-driven transforms for **every** visitor. `MotionPathHelper` is a development-only path editor shipped to production and never invoked.

**2. No GSAP code anywhere respects `prefers-reduced-motion`.** The CSS block at `src/styles/global.css:408-424` pretends to handle it, but targets classes (`.gsap-animation`, `.scroll-trigger`, `.motion-path`) that exist nowhere in the repo — and CSS `!important` cannot override GSAP's inline styles or its rAF loop anyway:

```css
/* src/styles/global.css:408-424 — current (all three selectors match nothing) */
  /* Disable GSAP animations */
  .gsap-animation {
    transform: none !important;
    opacity: 1 !important;
    transition: none !important;
  }

  /* Disable motion path animations */
  .motion-path svg path {
    animation: none !important;
  }

  /* Disable scroll-triggered animations */
  .scroll-trigger {
    transform: none !important;
    opacity: 1 !important;
  }
```

So a reduced-motion user gets, at full strength: rAF smooth-scrolling, 50px `back.out` overshoot slides on every reveal (`src/hooks/useReveal.ts:11-24`), portafilters flying in from ±200px with 45° rotation (`src/components/home/Portofilters.tsx:16-30`), and a droplet scrubbed along a 3018px SVG path (`src/components/home/MotionPath.tsx:153-187`).

**3. The blanket CSS nuke kills comprehension-aiding fades too.** `global.css:383-391` sets `transition-duration: 0.01ms !important` on everything — reduced motion should mean *fewer and gentler* animations (keep opacity/color feedback), not zero.

## Target

One idiom, used in every GSAP-animated component: `gsap.matchMedia()` with a `(prefers-reduced-motion: no-preference)` branch for full motion and (where content would otherwise stay hidden) a `reduce` branch that makes content visible without movement. `useGSAP` reverts `matchMedia` automatically on unmount — no manual cleanup needed beyond what's shown.

```tsx
// pattern — full motion only when the user allows it
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    /* existing tweens, verbatim */
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    /* ensure anything the full branch hides is visible: gsap.set(..., { autoAlpha: 1, y: 0 }) */
  });
});
```

## Repo conventions to follow

- All homepage components already use `useGSAP` from `@gsap/react` with a `scope` ref — keep that wrapper; only the body changes. Exemplar: `src/components/home/RoastedBeans.tsx:10-40`.
- GSAP ease strings (`"back.out"`, `"power2.out"`) stay as they are — easing changes are out of scope here.

## Steps

1. **`src/components/home/HomePage.tsx`**
   - Delete the `MotionPathHelper` import (line 11) and its entry in `gsap.registerPlugin` (line 19).
   - Delete the module-scope `ScrollSmoother.create({ smooth: 1 });` (lines 22-24).
   - Inside the `HomePage` component body (after `const t = useTranslations(lang);`), add:
     ```tsx
     useGSAP(() => {
       const mm = gsap.matchMedia();
       mm.add("(prefers-reduced-motion: no-preference)", () => {
         const smoother = ScrollSmoother.create({ smooth: 1 });
         return () => smoother.kill();
       });
     });
     ```
2. **`src/hooks/useReveal.ts`** — replace the `useGSAP` callback body (currently `gsap.set(".reveal", …)` + `ScrollTrigger.batch(".reveal", …)`, lines 10-25) with:
   ```ts
   const mm = gsap.matchMedia();
   mm.add("(prefers-reduced-motion: no-preference)", () => {
     gsap.set(".reveal", { autoAlpha: 0, y: 50 });
     ScrollTrigger.batch(".reveal", {
       onEnter: (batch) => {
         gsap.to(batch, {
           autoAlpha: 1,
           y: 0,
           stagger: 0.1,
           ease: "back.out",
         });
       },
       start: "top 80%",
       once: true,
     });
   });
   mm.add("(prefers-reduced-motion: reduce)", () => {
     gsap.set(".reveal", { autoAlpha: 0 });
     ScrollTrigger.batch(".reveal", {
       onEnter: (batch) => {
         gsap.to(batch, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
       },
       start: "top 80%",
       once: true,
     });
   });
   ```
   (Reduced branch keeps the opacity fade — comprehension feedback — but no vertical movement, no overshoot, no stagger.)
3. **`src/components/home/Portofilters.tsx`** — inside the `useGSAP` callback, wrap the existing `animate()` definition + call (lines 13-75) in `mm.add("(prefers-reduced-motion: no-preference)", () => { … })`. No `reduce` branch is needed: the elements are visible in their final layout position before `gsap.set` runs, so under `reduce` nothing is hidden.
4. **`src/components/home/RoastedBeans.tsx`** — wrap the existing `gsap.set(cards, …)` + timeline (lines 12-35) in `mm.add("(prefers-reduced-motion: no-preference)", () => { … })`. Add a `reduce` branch mirroring step 2's: `gsap.set` cards to `autoAlpha: 0` (no `y`), then the same `once: true` ScrollTrigger timeline tweening only `autoAlpha: 1, duration: 0.3`.
5. **`src/components/home/MotionPath.tsx`** — wrap the entire `useGSAP` callback body (lines 143-187: the guard clause, `quickTo`, `gsap.set`, and the motion-path tween) in `mm.add("(prefers-reduced-motion: no-preference)", () => { … })`. Add a `reduce` branch:
   ```ts
   mm.add("(prefers-reduced-motion: reduce)", () => {
     gsap.set(dropletWrapperRef.current, { autoAlpha: 0 });
   });
   ```
   (The dotted path remains as static decoration; the droplet — pure motion — is hidden.)
6. **`src/styles/global.css`** — in the `@media (prefers-reduced-motion: reduce)` block (lines 383-425):
   - Delete the three dead selector rules quoted in Problem §2 (`.gsap-animation`, `.motion-path svg path`, `.scroll-trigger`), including their comments.
   - In the `*, *::before, *::after` rule (lines 384-391), delete the line `transition-duration: 0.01ms !important;` — keyframe animations stay nuked (`animation-duration: 0.01ms`), transitions (opacity/color feedback) survive; movement suppression is handled per-system (plan 001 handles `.animate`; the rules at lines 394-406 already zero the transforms of the utility classes).

## Boundaries

- Do NOT change any easing, duration, stagger, or travel-distance values in the `no-preference` branches — motion must be byte-identical for users without the preference.
- Do NOT touch `src/components/Head.astro` or the `.animate` CSS system (plan 001).
- Do NOT restructure `MotionPath.tsx`'s config/memo logic — only the `useGSAP` callback body.
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds. `grep -rn "MotionPathHelper" src/` returns nothing. `grep -rn "matchMedia" src/components/home src/hooks/useReveal.ts` shows a hit in each edited file.
- **Feel check** (`pnpm dev`):
  - Default (no preference): homepage is pixel-identical to before — smooth scroll, reveals with overshoot, droplet, portafilters all unchanged.
  - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, reload `/`:
    - Scrolling is native (no smoothing lag; the scrollbar tracks your finger/wheel 1:1).
    - Sections fade in as you scroll — opacity only, nothing slides up, nothing overshoots.
    - The droplet never appears; the dotted path is static.
    - Portafilters sit in their final positions, fully visible.
  - Toggle the emulation back and forth without reload: both modes behave correctly (matchMedia re-runs live).
- **Done when**: all reduced-motion checks pass and the no-preference experience is visually unchanged.
