# 003 — Stop the per-frame tween storm in the droplet ScrollTrigger

- **Status**: TODO
- **Commit**: a18fdfa
- **Severity**: HIGH
- **Category**: Performance / Easing & duration
- **Estimated scope**: 1 file (MotionPath.tsx), ~25 lines changed

## Problem

The droplet's `ScrollTrigger.onUpdate` fires **every frame while scrolling** and, per frame: allocates a fresh interpolator closure, spawns a brand-new 1-second `gsap.to` tween that `overwrite: "auto"` must then hunt down and kill, and tweens `fill` — an SVG paint property that forces a repaint every frame and can never be composited:

```tsx
// src/components/home/MotionPath.tsx:153-179 — current
gsap.to(dropletWrapperRef.current, {
  ease: pathEase(rawPath, { smooth: isPhone ? 50 : 20 }),
  scrollTrigger: {
    trigger: pathRef.current,
    start: config.scrollStart,
    end: () => "+=" + pathRef.current?.getBoundingClientRect().height,
    scrub: 2,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const interpolate = gsap.utils.interpolate("#97D5D0", "#654321");
      const v = gsap.utils.clamp(0, 200, Math.abs(self.getVelocity()));
      const scaleY = gsap.utils.mapRange(0, 200, 1, 1.5, v);

      gsap.to(dropletRef.current, {
        scaleY: scaleY,
        duration: 1,
        ease: "back.out",
        overwrite: "auto",
        fill: interpolate(self.progress),
      });

      if (prevDirection !== self.direction) {
        rotateTo(self.direction === 1 ? 0 : -180);
        prevDirection = self.direction;
      }
    },
  },
  ...
```

This is dozens of tween create/kill cycles per second on the main thread, during scroll, on the page's heaviest section. The file already demonstrates the right pattern for exactly this situation — `gsap.quickTo` for `rotation` at line 146 — but doesn't use it for `scaleY` or `fill`.

Additionally, `scrub: 2` gives the droplet up to two full seconds of catch-up lag, stacked on top of ScrollSmoother's own 1s smoothing (`HomePage.tsx`) — ~3s of compounded trailing that reads as broken rather than smooth.

## Target

```tsx
// src/components/home/MotionPath.tsx — target (inside the useGSAP callback)
const rotateTo = gsap.quickTo(dropletRef.current, "rotation");
const scaleYTo = gsap.quickTo(dropletRef.current, "scaleY", {
  duration: 0.4,
  ease: "back.out",
});
const setFill = gsap.quickSetter(dropletRef.current, "fill");
const interpolateFill = gsap.utils.interpolate("#97D5D0", "#654321");
let prevDirection = 0;
```

```tsx
    scrub: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const v = gsap.utils.clamp(0, 200, Math.abs(self.getVelocity()));
      scaleYTo(gsap.utils.mapRange(0, 200, 1, 1.5, v));
      setFill(interpolateFill(self.progress));

      if (prevDirection !== self.direction) {
        rotateTo(self.direction === 1 ? 0 : -180);
        prevDirection = self.direction;
      }
    },
```

- `quickTo` re-targets one persistent tween instead of creating/killing tweens (interruptible by construction).
- `quickSetter` writes `fill` directly with zero tween allocation; the color still tracks scroll progress exactly.
- `duration: 0.4` keeps the squash-and-stretch character (`back.out` overshoot) without a 1s tail.
- `scrub: 1` halves the lag; combined smoothing (ScrollSmoother 1s + scrub 1) stays ≤2s.

## Repo conventions to follow

- The existing `rotateTo` quickTo at `src/components/home/MotionPath.tsx:146` is the exemplar — declare the new quickTo/quickSetter/interpolator alongside it, same style (`const`, not `let`, except `prevDirection`).
- Keep the brand hexes exactly as written (`"#97D5D0"`, `"#654321"`) — tokenizing them is out of scope.

## Steps

1. **`src/components/home/MotionPath.tsx`** — after line 146 (`let rotateTo = gsap.quickTo(dropletRef.current, "rotation");`), add the `scaleYTo`, `setFill`, and `interpolateFill` declarations from Target, verbatim. (Change `let rotateTo` to `const rotateTo` while there.)
2. Same file — change `scrub: 2,` (line 159) to `scrub: 1,`.
3. Same file — replace the entire `onUpdate` body (lines 161-178) with the Target version: no `gsap.utils.interpolate` call, no inner `gsap.to`, calls to `scaleYTo(...)` and `setFill(...)` instead.

## Boundaries

- Do NOT touch the outer motion-path tween's `ease` (`pathEase(...)`), `motionPath` config, `start`/`end`, or `immediateRender`.
- Do NOT touch the section-positioning logic (`sectionYByKey`, `config`) or any JSX.
- Do NOT touch other files. (If plan 002 has already wrapped this callback in `gsap.matchMedia`, make these edits inside its `no-preference` branch.)
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds. `grep -n "gsap.to(dropletRef" src/components/home/MotionPath.tsx` returns nothing.
- **Feel check** (`pnpm dev`, homepage):
  - Scroll at varying speeds: the droplet still stretches (`scaleY` up to 1.5) on fast scroll and relaxes at rest, and its fill still shifts teal → brown across the journey.
  - Flip scroll direction rapidly: the droplet rotation flips without stutter, and the stretch retargets smoothly mid-motion (never restarts from 1).
  - DevTools → Performance: record a 5s scroll through the droplet section. Compare against a pre-change recording: scripting time per frame during scroll should visibly drop, and there should be no long chains of tween instantiation.
  - The droplet tracks the scroll position with noticeably less lag than before (≤~1s behind, not ~2-3s).
- **Done when**: visual character (stretch, color shift, rotation flip) is preserved, no per-frame `gsap.to` allocations remain, and scroll-frame scripting time is reduced.
