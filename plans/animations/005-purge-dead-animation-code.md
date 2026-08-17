# 005 — Purge dead animation code

- **Status**: TODO
- **Commit**: a18fdfa
- **Severity**: LOW (trivial effort, high clarity payoff)
- **Category**: Cohesion & tokens
- **Estimated scope**: 7 files, ~250 lines deleted, 0 lines of behavior change

## Problem

The repo carries three parallel motion vocabularies, two of which are entirely dead, plus assorted never-wired hooks. Verified at commit a18fdfa (each claim re-checked by grep):

1. **`src/lib/animations.ts` (175 lines) has zero importers.** `grep -rn "lib/animations" src/` matches nothing outside the file itself. `easingCurves`, `durations`, `staggerDelays`, `animationConfigs`, `performanceUtils`, `cleanupUtils`, `prefersReducedMotion` — all unused.
2. **`src/components/AnimatedDroplet.tsx` (103 lines) has zero importers**, and is internally broken anyway: its ScrollTrigger targets `.hero-section`, a class that exists nowhere.
3. **`src/styles/global.css` dead blocks:**
   - `.animate-fade-in`, `.animate-slide-up`, `.animate-slide-down`, `.animate-scale-in` (lines 253-275) and `.animate-stagger-1` through `-5` (lines 277-291) — zero usages.
   - `@keyframes fade-in`, `slide-up`, `slide-down`, `scale-in` (lines 346-371) — referenced only by the dead classes above. (**Keep `@keyframes sprite`** — used by `.animate-sprite`, which Hero's smoke uses.)
   - `.hover-lift`, `.hover-scale`, `.hover-fade` and their `@media (hover: hover)` wrapper (lines 301-329) — zero usages.
   - `.will-change-transform`, `.will-change-opacity`, `.will-change-auto` (lines 331-342) — zero usages.
   - The commented-out vaul hack (lines 297-299).
   - In the reduced-motion block, the rules for `.animate-slide-up, .animate-slide-down, .animate-scale-in, .hover-lift, .hover-scale` (lines 393-400) and `.animate-fade-in` (lines 402-406) — they gate the dead classes above.
   - Of the 18 easing tokens (lines 141-164), only these are referenced by live code: `--ease-out-cubic` and `--ease-out-quint` (`.animate`, per plan 001), `--ease-in-out-cubic` and `--ease-in-out-quad` (`src/pages/404.astro:34,38`). The other 14 are unused.
4. **`src/components/about-us/AboutUsPage.astro`**: `parallax-container` (lines 23, 49, 70) and `parallax-img` + `origin-top` (lines 27, 74) have no CSS/JS definition anywhere — markup hooks for a parallax that was never built.
5. **`src/pages/404.astro`**: `@keyframes steam-rise` (lines 72-81) is referenced by nothing (there is no steam element in the markup), and `will-change: transform` (line 41) permanently holds a compositor layer that an infinite transform animation already gets for free.
6. **`src/components/home/MotionPath.tsx`**: `sectionRefs` (lines 28-33) is populated at lines 261-263 but never read; `cupWrapperClass` (lines 64, 100, 132) is configured in all three breakpoints but never rendered — `<Cup />` lives in `HomePage.tsx`, outside this component. Its type field is `src/types.ts:43`.

## Target

All of the above deleted; zero behavior change. Every kept animation still works: `.animate`/`.show`, `.animate-sprite` + `@keyframes sprite`, `#back-to-top` rules, the 404 wobble/rotate keyframes, `no-scrollbar`.

## Repo conventions to follow

- Token blocks in `global.css:141-168` keep their comment headers; delete only the unused token lines, not the comments structure (collapse a comment if its whole group is gone, e.g. the entire "Ease-in curves" group dies).

## Steps

1. Delete `src/lib/animations.ts`.
2. Delete `src/components/AnimatedDroplet.tsx`.
3. **`src/styles/global.css`** — delete, keeping everything between them intact:
   - The 14 unused easing tokens. Delete: all six `--ease-in-*` (lines 143-148); `--ease-out-quad`, `--ease-out-quart`, `--ease-out-expo`, `--ease-out-circ`; `--ease-in-out-quart`, `--ease-in-out-quint`, `--ease-in-out-expo`, `--ease-in-out-circ`. Keep exactly four: `--ease-out-cubic`, `--ease-out-quint`, `--ease-in-out-quad`, `--ease-in-out-cubic`.
   - Lines 253-291: the four `.animate-*` utility classes and five `.animate-stagger-*` classes (keep `.animate-sprite`, line 293-295).
   - Lines 297-299: the commented vaul block.
   - Lines 301-329: the whole `@media (hover: hover) and (pointer: fine)` block with `.hover-lift/.hover-scale/.hover-fade`.
   - Lines 331-342: the three `.will-change-*` classes and their "Performance Optimizations" comment.
   - Lines 346-371: `@keyframes fade-in`, `slide-up`, `slide-down`, `scale-in` (keep `@keyframes sprite`).
   - Lines 393-406: the two dead-class rules inside the reduced-motion block (`.animate-slide-up, …` and `.animate-fade-in`), with their comments.
4. **`src/components/about-us/AboutUsPage.astro`** — remove the class tokens `parallax-container` (lines 23, 49, 70), and `parallax-img` and `origin-top` (lines 27, 74). Keep all other classes on those elements.
5. **`src/pages/404.astro`** — delete `@keyframes steam-rise` (lines 72-81) and the `will-change: transform;` line (line 41).
6. **`src/components/home/MotionPath.tsx`** — delete the `sectionRefs` declaration (lines 28-33) and the `ref={(el) => { sectionRefs.current[section.key] = el; }}` prop (lines 261-263); delete the three `cupWrapperClass:` lines (64, 100, 132). Remove the now-unused `SectionKey` import only if TypeScript flags it (it is still used by `sectionYByKey`/`sectionContent` — it will not be flagged).
7. **`src/types.ts`** — delete the `cupWrapperClass: string;` field (line 43).

## Boundaries

- Do NOT delete `.animate`/`.show`, `.animate-sprite`, `@keyframes sprite`, the `#back-to-top` rules, `mux-player` rules, or `no-scrollbar`.
- Do NOT touch `src/components/home/HomePage.tsx` — its dead `MotionPathHelper` import is removed by plan 002; if plan 002 has not run, leave it anyway.
- Do NOT "improve" anything while deleting — this plan is deletions only.
- Line numbers assume plans 001/002 may have already shifted `global.css` — match on content, not line numbers, and re-verify each block is what this plan quotes before deleting. If a supposedly-dead symbol has gained a usage since commit a18fdfa, STOP and report.
- Do NOT add new dependencies.

## Verification

- **Mechanical**:
  - `pnpm build` succeeds with no TypeScript errors.
  - Each of these greps over `src/` returns nothing: `animate-slide`, `animate-scale-in`, `animate-stagger`, `animate-fade-in`, `hover-lift`, `hover-fade`, `steam-rise`, `parallax`, `cupWrapperClass`, `sectionRefs`, `AnimatedDroplet`, `lib/animations`.
  - `grep -c "cubic-bezier" src/styles/global.css` drops from 18 to 4.
- **Feel check** (`pnpm dev`): homepage smoke sprite still cycles; `.animate` reveals still run on about-us/contact; 404 cup still wobbles and rotates; back-to-top still fades in after scrolling. Nothing else visibly changes.
- **Done when**: build is green, all greps are clean, and the four feel checks pass.
