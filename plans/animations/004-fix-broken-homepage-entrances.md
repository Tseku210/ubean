# 004 — Fix the broken Discount reveal and the Portofilters mid-flight freeze

- **Status**: DONE
- **Commit**: a18fdfa
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Interruptibility
- **Estimated scope**: 2 files (Discount.tsx, Portofilters.tsx), ~15 lines changed

## Problem

**1. The Discount section's group entrance is broken — only the button animates.**

```tsx
// src/components/home/Discount.tsx:16-36 — current
<section
  ref={container}
  className="bg-secondary reveal mx-4 flex h-fit flex-col items-center gap-14 rounded-[50px] px-9 py-14 md:mx-10 md:px-10 md:py-20"
>
  <div className="flex flex-col items-center justify-center gap-5">
    <h3 className="text-h5 md:text-h3 font-bold text-white">
      {t("home.discount.title")}
    </h3>
    <a href={translatePath("/contact/")} className="reveal">
      <Button className="px-10 py-2">{t("home.discount.button")}</Button>
    </a>
  </div>
  <div className="flex w-full max-w-md justify-center">
    <img
      src="/images/loyalty-discount.webp"
      className="aspect-[4/2] w-full object-contain"
      alt="Loyalty discount"
    />
  </div>
</section>
```

`useReveal()` (from `src/hooks/useReveal.ts`) runs `gsap.set(".reveal", …)` scoped to `container` — and GSAP's scoped selector resolves via `querySelectorAll` on the scope element, which **never matches the scope element itself**. So the `reveal` class on the `<section>` (line 19) is dead: the section never animates. The `<h3>` and the image have no `reveal` at all. Net effect: the heading and image pop in instantly while the CTA button slides up alone — the opposite of a group entrance.

**2. Portofilters can freeze mid-flight.** `scrub: true` and `once: true` are contradictory:

```tsx
// src/components/home/Portofilters.tsx:32-54 — current
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: container.current,
    start: "top 80%",
    end: "center 30%",
    scrub: true,
    invalidateOnRefresh: true,
    once: true,
    // markers: true,
  },
});

tl.to(
  bean.current,
  {
    x: 10,
    y: 0,
    rotation: 0,
    ease: "power2.out",
    onComplete: () => console.log("moved"),
  },
  0,
);
```

`once: true` kills the ScrollTrigger on first `onLeave`, but with a scrub there is no guarantee the timeline has reached progress 1 at that instant (fast flick past the section, a resize, an `invalidateOnRefresh` recalc) — the three portafilters can be left permanently stuck at e.g. `x: -90, rotation: -20`. There is also a leftover `console.log` debug callback that, on a scrubbed timeline, can re-fire on every direction change across the end point.

## Target

1. Discount: `reveal` on the three children (heading, CTA, image wrapper), not on the scope section — they then get the standard batched entrance (autoAlpha 0→1, y 50→0, stagger 0.1) from `useReveal` like every other homepage section.
2. Portofilters: keep the scroll-scrubbed flight (it reverses coherently when scrolling back up) — remove `once: true` and the `console.log`.

## Repo conventions to follow

- `.reveal` on child elements with `useReveal()` on the section container is the established pattern — exemplar: `src/components/home/Hero.tsx:42-47` (three sibling `.reveal` children inside the `ref={container}` section).

## Steps

1. **`src/components/home/Discount.tsx`**
   - Line 19: remove `reveal` from the `<section>` className (keep `ref={container}` and all other classes).
   - Line 22: add `reveal` to the `<h3>` className: `className="reveal text-h5 md:text-h3 font-bold text-white"`.
   - Line 25: leave the `<a className="reveal">` as is.
   - Line 29: add `reveal` to the image wrapper div: `className="reveal flex w-full max-w-md justify-center"`.
2. **`src/components/home/Portofilters.tsx`**
   - Delete `once: true,` (line 39).
   - Delete `onComplete: () => console.log("moved"),` (line 51).
   - Delete the commented-out `// markers: true,` (line 40) and the commented-out `window.addEventListener` block (lines 77-80).

## Boundaries

- Do NOT change travel distances, eases, `start`/`end`, or `scrub` values.
- Do NOT touch `useReveal.ts` itself. (If plan 002 has landed first, these files' GSAP code lives inside `matchMedia` branches — make the same edits there.)
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds. `grep -n "console.log" src/components/home/Portofilters.tsx` returns nothing.
- **Feel check** (`pnpm dev`, homepage):
  - Scroll to the Discount section: heading, button, and loyalty image now rise in together as one staggered group (heading first, ~100ms apart). Nothing pops in without animating.
  - Scroll slowly through the portafilters (desktop width, ≥768px): the three filters fly in tied to scroll; scroll back up: they fly out again (reversal is now expected behavior).
  - Flick-scroll violently past the portafilters, then scroll back: none of them is frozen mid-flight at an angle.
  - Resize the window while the section is partially scrolled: filters land correctly after the refresh.
- **Done when**: all four checks pass and the console stays silent while scrolling.
