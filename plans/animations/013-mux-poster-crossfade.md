# 013 — Crossfade the Mux poster → stream hard cut

- **Status**: TODO
- **Commit**: a18fdfa
- **Severity**: LOW (missed opportunity — first-impression seam)
- **Category**: Missed opportunities
- **Estimated scope**: 2 files (Hero.tsx, Since.tsx), ~30 lines changed

## Problem

Both autoplaying Mux players show a poster still, then hard-cut to the HLS stream the moment playback starts — a visible state swap, on the hero's first impression. The posters are also requested at 214px wide and upscaled to fill containers hundreds of pixels wide, so the pre-cut frame is visibly blurry. Hero additionally passes an invalid `preload` value (the attribute takes `none`/`metadata`/`auto`):

```tsx
// src/components/home/Hero.tsx:20-34 — current
<MuxPlayer
  className="block h-full w-full"
  playbackId="Gtmx5sme3IckVw2u5vXesfT02xXA62QAfqfDIAN02VSz00"
  metadata={{
    video_id: "bAdLgCCx72xWn7epwLpPy00ln5N3l3RIzaXmcGirqe1g",
    video_title: "hero",
  }}
  poster="https://image.mux.com/Gtmx5sme3IckVw2u5vXesfT02xXA62QAfqfDIAN02VSz00/thumbnail.png?width=214&height=121&time=5&fit_mode=preserve"
  streamType="on-demand"
  preload="true"
  loop
  muted
  autoPlay
  playsInline
/>
```

```tsx
// src/components/home/Since.tsx:27-42 — current (same pattern; preload="auto" is already valid here)
<div className="reveal relative order-1 h-[190px] w-[343px] overflow-hidden rounded-[40px] md:order-2 md:aspect-[5/3] md:h-[330px] md:w-[800px] lg:w-auto">
  <MuxPlayer
    className="block h-full w-full"
    playbackId="kfJo02Ax7pE6bO5T6wz024WPeoAJa6qPKhfKdDQ00lvbfk"
    ...
    poster="https://image.mux.com/kfJo02Ax7pE6bO5T6wz024WPeoAJa6qPKhfKdDQ00lvbfk/thumbnail.png?width=214&height=121&time=3&fit_mode=preserve"
    streamType="on-demand"
    preload="auto"
    loop
    muted
    autoPlay
    playsInline
  />
</div>
```

## Target

Overlay our own high-resolution poster `<img>` on top of the player and fade it out over 300ms when the player reports `playing`. The cut disappears under an opacity crossfade (compositor-only). Pattern, applied identically in both files:

```tsx
// pattern — inside the component
import { useState } from "react";

const POSTER =
  "https://image.mux.com/<PLAYBACK_ID>/thumbnail.png?width=1280&time=<T>&fit_mode=preserve";

const [isPlaying, setIsPlaying] = useState(false);
```

```tsx
// pattern — JSX: MuxPlayer gains onPlaying + the sharper poster; overlay img follows it
<MuxPlayer
  ...
  poster={POSTER}
  onPlaying={() => setIsPlaying(true)}
  ...
/>
<img
  src={POSTER}
  alt=""
  aria-hidden="true"
  className={`pointer-events-none absolute inset-0 z-[5] h-full w-full object-cover transition-opacity duration-300 ease-out ${
    isPlaying ? "opacity-0" : "opacity-100"
  }`}
/>
```

Per file:

- **Hero.tsx**: `<PLAYBACK_ID>` = `Gtmx5sme3IckVw2u5vXesfT02xXA62QAfqfDIAN02VSz00`, `time=5`. The overlay `<img>` goes directly after `<MuxPlayer>`, before the existing `bg-black/65` div — `z-[5]` places it above the player (mux-player is `position: absolute; inset: 0; z-index: 0` via `global.css:232-239`) and below the `z-10` scrim, so the dark overlay and text never flicker. Also change `preload="true"` to `preload="auto"`.
- **Since.tsx**: `<PLAYBACK_ID>` = `kfJo02Ax7pE6bO5T6wz024WPeoAJa6qPKhfKdDQ00lvbfk`, `time=3`. The wrapper div (line 27) is already `relative overflow-hidden rounded-[40px]` — the overlay inherits the rounding via the clip.
- Both: drop `height=121&` from the poster URL and use `width=1280` — a single sharper rendition for both the player's internal poster and the overlay (same URL = one network fetch).

The fade is opacity-only, so it stays under `prefers-reduced-motion` (an opacity crossfade that *prevents* a jarring change is exactly what reduced motion keeps).

## Repo conventions to follow

- `useState` for tiny view state is the house pattern — exemplar: `src/components/ui/MobileMenu.tsx:17`.
- Hoist the `POSTER` string to a module-level `const` above the component in each file (both files already declare module-level constants/interfaces above the component).

## Steps

1. **`src/components/home/Hero.tsx`** — add the `useState` import, the module-level `POSTER` const, the `isPlaying` state, `poster={POSTER}` + `onPlaying` on the player, `preload="auto"`, and the overlay `<img>` after the player as specified above.
2. **`src/components/home/Since.tsx`** — same changes with its own playback ID and `time=3`; `preload` stays `"auto"`.

## Boundaries

- Do NOT touch playback IDs, `metadata`, `streamType`, `loop/muted/autoPlay/playsInline`.
- Do NOT switch to `mux-player`'s lazy-loading or viewport strategies — the repo's main plans backlog owns preload strategy; this plan only corrects the invalid `"true"` value.
- Do NOT touch the `useReveal`/`.reveal` wiring in either component.
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds. `grep -n 'preload="true"' src/` returns nothing.
- **Feel check** (`pnpm dev`, DevTools → Network throttle "Fast 4G" so playback start is perceptibly delayed):
  - Homepage hero: a sharp poster is visible immediately; when the video starts, it dissolves over ~300ms — no hard cut, no flash of the player's blurry internal poster, and the dark scrim + headline never flicker.
  - Scroll to the Since section: same dissolve inside the rounded container (corners stay clipped during the fade).
  - Kill the network before playback starts: the poster simply stays — no broken state.
  - `prefers-reduced-motion: reduce`: the crossfade still occurs (near-instant if the global duration nuke applies) — at no point do both poster and a mid-play frame show doubled.
- **Done when**: both videos start under a dissolve at throttled speeds and the posters are sharp at desktop sizes.
