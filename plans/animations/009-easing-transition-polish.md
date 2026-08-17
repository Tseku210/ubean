# 009 — Easing & transition polish sweep

- **Status**: DONE
- **Commit**: a18fdfa
- **Severity**: LOW–MEDIUM
- **Category**: Easing & duration / Performance
- **Estimated scope**: 5 files, ~10 lines changed (class-string edits only)

## Problem

A sweep of small, mechanical easing/transition defects. Individually minor; together they're the difference between "fine" and "crisp". (Note: touch-stickiness is NOT among them — Tailwind v4 already wraps all `hover:`/`group-hover:` utilities in `@media (hover: hover)`; verified in the built CSS.)

**1. `transition-all` on every button in the app:**

```tsx
// src/components/ui/button.tsx:9 — current (excerpt)
"inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-full text-b2 text-sm font-medium transition-all disabled:pointer-events-none ... active:scale-[0.97]",
```

`transition: all` animates unintended properties off-GPU and is always a finding. The `active:scale-[0.97]` press feedback itself is correct — keep it.

**2. BackToTop rides an *implicit* `transition: all`.** Bare `duration-300 ease-in-out` utilities set duration/easing without `transition-property`, so the CSS-initial `transition-property: all` applies. Its show/hide fade (driven by `html.scrolled #back-to-top` opacity rules in `global.css:245-251`) and hover color both depend on this accident. The hover arrow parts also use `ease-in-out` at 300ms — hovers should be ease-out at ≤200ms:

```astro
<!-- src/components/BackToTop.astro:9-28 — current (excerpts) -->
<button
  id="back-to-top"
  class="group relative z-10 flex w-fit cursor-pointer flex-nowrap rounded py-1.5 pr-3 pl-8 duration-300 ease-in-out hover:text-black"
>
  ...
    <line
      ...
      class="translate-x-2 scale-x-0 transition-transform duration-300 ease-in-out group-hover:translate-x-0 group-hover:scale-x-100"
    ></line>
    <polyline
      ...
      class="translate-x-1 transition-transform duration-300 ease-in-out group-hover:translate-x-0"
    ></polyline>
```

**3. `ease-in-out` on hover lifts** (starts slow at the exact moment the user is watching):

```astro
<!-- src/components/Footer.astro:25 and :31 — current (both social links) -->
class="transition-transform ease-in-out hover:-translate-y-1"
```

```tsx
// src/components/home/RoastedBeans.tsx:55 — current
<div className="bean-image-container transition-transform ease-in-out group-hover:-translate-y-2 group-hover:-rotate-2">
```

**4. The 404 page's two infinite loops run at 3s and 8s** — never in phase, so the composite drifts for 24s instead of breathing rhythmically:

```css
/* src/pages/404.astro:32-40 — current */
.coffee-cup-container {
  position: relative;
  animation: gentle-wobble 3s var(--ease-in-out-cubic) infinite;
}

.coffee-cup {
  animation: rotate-cup 8s var(--ease-in-out-quad) infinite;
  ...
}
```

## Target

| Location | Current | Target |
| --- | --- | --- |
| `button.tsx:9` | `transition-all` | `transition-[color,background-color,border-color,box-shadow,opacity,transform]` |
| `BackToTop.astro:11` (button) | `duration-300 ease-in-out` | `transition-[opacity,color] duration-200 ease-out` |
| `BackToTop.astro:23` (line) | `transition-transform duration-300 ease-in-out` | `transition-transform duration-200 ease-out` |
| `BackToTop.astro:27` (polyline) | `transition-transform duration-300 ease-in-out` | `transition-transform duration-200 ease-out` |
| `Footer.astro:25` and `:31` | `transition-transform ease-in-out` | `transition-transform duration-200 ease-out` |
| `RoastedBeans.tsx:55` | `transition-transform ease-in-out` | `transition-transform duration-200 ease-out` |
| `404.astro:34` | `gentle-wobble 3s` | `gentle-wobble 4s` |

Rationale: entrances/hovers get `ease-out` (Tailwind's `ease-out` = `cubic-bezier(0, 0, 0.2, 1)`); 200ms is the hover budget; the button keeps Tailwind's default 150ms/ease for press feedback (within the 100–160ms press budget). 4s/8s puts the 404 loops in a 2:1 phase lock so the composite repeats cleanly every 8s.

## Repo conventions to follow

- All edits are Tailwind class-string substitutions — change only the listed tokens, preserve every other class and their order.
- `--duration-hover: 200ms` exists as a token (`src/styles/global.css:169`) but Tailwind utilities can't reference it without config; `duration-200` encodes the same value and matches how these files already write durations.

## Steps

1. **`src/components/ui/button.tsx:9`** — replace `transition-all` with `transition-[color,background-color,border-color,box-shadow,opacity,transform]`.
2. **`src/components/BackToTop.astro`** — apply the three substitutions from the Target table (lines 11, 23, 27).
3. **`src/components/Footer.astro`** — apply the substitution on both social links (lines 25, 31).
4. **`src/components/home/RoastedBeans.tsx:55`** — apply the substitution.
5. **`src/pages/404.astro:34`** — change `3s` to `4s`.

## Boundaries

- Do NOT touch `active:scale-[0.97]` or any variant/size definitions in `button.tsx`.
- Do NOT change the `#back-to-top` show/hide rules in `global.css` — the explicit `transition-[opacity,color]` on the button covers the fade.
- Do NOT touch the 404 keyframe definitions or `rotate-cup`'s 8s (only the wobble period changes). The `will-change` and `steam-rise` deletions on the same page belong to plan 005 — skip them here.
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds. `grep -rn "transition-all\|ease-in-out" src/components src/pages/404.astro` returns no hits in the five edited files (the `--ease-in-out-*` tokens in `global.css` and 404's keyframe easings are expected to remain).
- **Feel check** (`pnpm dev`):
  - Hover the footer social icons and a roasted-beans card: the lift starts immediately (no slow-start), settles in ~200ms.
  - Scroll down on any page, hover "back to top": arrow slides in crisply; the button still fades in/out when crossing the scroll threshold.
  - Press and hold any button: the 0.97 press scale still works; release snaps back.
  - Open `/does-not-exist`: watch the cup for ~10s — wobble and rotation now breathe together (composite repeats every 8s) instead of drifting.
- **Done when**: all greps are clean and the four feel checks pass.
