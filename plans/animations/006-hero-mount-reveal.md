# 006 — Reveal the Hero on mount, not via ScrollTrigger

- **Status**: DONE
- **Commit**: a18fdfa
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Accessibility
- **Estimated scope**: 1 file (Hero.tsx), ~30 lines changed

## Problem

The homepage renders `client:only="react"` (`src/pages/index.astro:12`) — no server HTML at all. After hydration, `useReveal()` immediately hides the LCP headline again:

```tsx
// src/components/home/Hero.tsx:11-13, 42-49 — current
export default function Hero({ lang }: Props) {
  const t = useTranslations(lang);
  const { container } = useReveal();
  ...
        <img
          src={SmokeSprite}
          loading="eager"
          alt=""
          className="reveal animate-sprite mb-6 size-12 object-cover md:mb-16 md:size-20"
        />
        <h1 className="reveal text-h5 md:text-h1 uppercase">
          {t("home.hero.title")}
        </h1>
        <p className="reveal text-b4 md:text-b1 mt-4 md:font-normal">
          {t("home.hero.desc")}
        </p>
```

`useReveal` (`src/hooks/useReveal.ts`) runs `gsap.set(".reveal", { autoAlpha: 0, y: 50 })` and reveals via `ScrollTrigger.batch(..., start: "top 80%")`. Using a *scroll* trigger to reveal content that is already above the fold is the wrong mechanism: the page's primary text sits at `visibility: hidden` until hydration completes **and** ScrollTrigger initializes/refreshes. It also couples the hero's first impression to scroll infrastructure it doesn't need.

## Target

Hero gets its own mount-time staggered timeline — no ScrollTrigger — and drops `useReveal`. Under reduced motion, an opacity-only fade.

```tsx
// src/components/home/Hero.tsx — target (replaces the useReveal usage)
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function Hero({ lang }: Props) {
  const t = useTranslations(lang);
  const container = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".reveal", {
          autoAlpha: 0,
          y: 24,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.1,
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(".reveal", { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
      });
    },
    { scope: container },
  );
  ...
```

The JSX (including the three `reveal` classes and `ref={container}` on the `<section>`) stays exactly as is. Values: `y: 24` (subtler than the scroll-reveal's 50px — the hero is the first thing seen, not a scroll payoff), `duration: 0.5`, `ease: "power2.out"`, `stagger: 0.1` — within the 200–500ms budget for large entrances.

## Repo conventions to follow

- `useGSAP` with a `scope` ref is the house pattern — exemplar: `src/components/home/RoastedBeans.tsx:10-40`.
- The `gsap.matchMedia()` reduced-motion split is the pattern established by plan 002 (`src/hooks/useReveal.ts` after that plan lands). If plan 002 has NOT landed yet, still write the `matchMedia` form above — it is self-contained.
- Keep the `.reveal` class names so the section stays visually consistent with the rest of the homepage's motion vocabulary.

## Steps

1. **`src/components/home/Hero.tsx`** — remove the `useReveal` import (line 5) and the `const { container } = useReveal();` call (line 13).
2. Same file — add imports for `gsap`, `useGSAP`, and `useRef`, declare `const container = useRef<HTMLElement | null>(null);`, and add the `useGSAP` block from Target, verbatim, before the `return`.
3. No JSX changes.

## Boundaries

- Do NOT touch `src/hooks/useReveal.ts` or any other component using it (Discount, Since).
- Do NOT change the smoke sprite's `animate-sprite` loop.
- Do NOT attempt to fix the `client:only` hydration architecture (server-rendering the hero) — that is a separate, larger decision tracked in the repo's main plans backlog.
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds. `grep -n "useReveal" src/components/home/Hero.tsx` returns nothing.
- **Feel check** (`pnpm dev`, homepage, throttle CPU 4× to make timing visible):
  - On load, smoke → headline → subtitle rise in sequence (~100ms apart), starting as soon as React hydrates — no wait for scroll infrastructure.
  - Scrolling immediately after load does not re-trigger or interrupt the hero entrance.
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: hero text fades in with zero vertical movement.
  - Below-the-fold sections (Beans, Since, Discount) still reveal on scroll exactly as before.
- **Done when**: hero content never waits on ScrollTrigger, and both motion modes pass.
