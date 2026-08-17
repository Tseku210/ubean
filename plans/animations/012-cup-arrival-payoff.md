# 012 — Land the droplet's journey: cup arrival reveal

- **Status**: TODO
- **Commit**: a18fdfa
- **Severity**: LOW (missed opportunity — the homepage's one earned delight moment)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (Cup.tsx), ~35 lines changed

## Problem

The droplet travels a 3018px SVG path down the homepage and simply stops. The cup below it — the narrative payoff of the whole journey — is completely static, even though its animation hooks (`cup-section`, `cup-image`) were wired in markup and never used:

```tsx
// src/components/home/Cup.tsx — current (entire file)
export default function Cup() {
  return (
    <section className="cup-section flex items-center justify-center md:translate-x-6">
      <img
        className="cup-image"
        src="/images/cup.webp"
        alt="Ubean Cup"
        width={370}
        // height={370}
      />
    </section>
  );
}
```

`<Cup />` renders in `src/components/home/HomePage.tsx:37`, directly after `<MotionPath />`.

## Target

A one-time, scroll-gated "fill" reveal: the cup wipes in bottom-to-top via `clip-path: inset()` (the liquid-arriving metaphor — top inset 100% → 0 grows the visible band upward from the bottom), with a slight rise. Reduced-motion users see the cup statically.

```tsx
// src/components/home/Cup.tsx — target (entire file)
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function Cup() {
  const container = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".cup-image", {
          clipPath: "inset(100% 0% 0% 0%)",
          y: 16,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            once: true,
          },
        });
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="cup-section flex items-center justify-center md:translate-x-6"
    >
      <img
        className="cup-image"
        src="/images/cup.webp"
        alt="Ubean Cup"
        width={370}
      />
    </section>
  );
}
```

Values: `duration: 0.8` (marketing moment — allowed past the 300ms UI budget), `ease: "power2.out"`, `once: true` (a payoff plays once; replaying on every scroll-past would cheapen it). No `reduce` branch is needed: `gsap.from` only hides the image inside the `no-preference` branch, so reduced-motion users simply see the static cup.

## Repo conventions to follow

- `useGSAP` + `scope` ref + `gsap.matchMedia` is the established pattern (plans 002/006); nearest exemplar: `src/components/home/RoastedBeans.tsx:10-40`.
- `gsap.registerPlugin(ScrollTrigger)` is idempotent — registering locally (as `src/components/home/MotionPath.tsx:16` does) keeps the component self-contained rather than relying on `HomePage.tsx`'s registration order.
- The commented-out `// height={370}` line may be deleted while rewriting the file.

## Steps

1. Replace **`src/components/home/Cup.tsx`** with the Target file, verbatim.

## Boundaries

- Do NOT touch `MotionPath.tsx` — the reveal keys off the cup's own viewport entry (`top 80%`), not the droplet tween's callbacks, so it works at every breakpoint and stays decoupled from the scrub.
- Do NOT animate the section wrapper (`md:translate-x-6` is layout, not motion — leave it).
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds.
- **Feel check** (`pnpm dev`, homepage):
  - Scroll to the end of the droplet path: as the cup enters the lower viewport, it fills in bottom-to-top over ~0.8s with a subtle rise — reading as the droplet's journey completing.
  - Scroll past, scroll back: the cup does NOT re-animate (`once: true`).
  - Check at mobile width (droplet path differs): the reveal still triggers correctly since it's tied to the cup's own position.
  - DevTools Animations panel at 10%: the wipe is a clean bottom-up reveal — no scaling from zero, no clipping glitch at the rounded image edges.
  - `prefers-reduced-motion: reduce`, reload: the cup is simply visible; no wipe, no movement.
- **Done when**: the arrival beat plays once per visit, at all breakpoints, and reduced-motion shows a static cup.
