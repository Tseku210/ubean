/**
 * The cup's drop and fill as a pure function of time, in the cup's local art
 * space (600 wide, rim center at 300, 1935). Tuned in the Toolcraft lab with
 * the Splash style: hang 0.2s, fall 0.3s, splash 0.7, slosh 0.4, no overshoot.
 */

export const CUP_OPENING = { cx: 300, cy: 1936, rx: 99, ry: 27.5 } as const;

/** The settled surface spans the opening wall to wall, a hair below it, so
 *  only a sliver of back wall shows. */
export const CUP_FULL_SURFACE = { cx: 300, cy: 1938, rx: 99, ry: 27.5 } as const;

export const CUP_RIPPLE_COLORS = [
  "#D9B98A",
  "#C9A06B",
  "#C9A06B",
  "#D9B98A",
  "#D9B98A",
] as const;

export const CUP_BEAD_COUNT = 14;

const HANG = 0.2;
const FALL = 0.3;
const SPLASH = 0.7;
const SLOSH = 0.4;

const DROP_REST_Y = 1824;
const IMPACT_Y = 1956;
const SAG = 4;
const FALL_START_Y = DROP_REST_Y + SAG;
const GRAVITY = (2 * (IMPACT_Y - FALL_START_Y)) / (FALL * FALL);

/** How far below the full surface the coffee starts. */
const EMPTY_DEPTH = 44;
const EMPTY_SCALE = 0.92;
const FILL_OMEGA = 6.5;

const SATELLITE_DELAY = 0.045;
const SATELLITE_FLIGHT = Math.sqrt((2 * (IMPACT_Y - FALL_START_Y + 6)) / GRAVITY);

const BEAD_GRAVITY = 1150;
const CROWN_START = 0.02;
const JET_START = 0.11;
const JET_LIFE = 0.3;
const JET_PEAK = 30 * (0.5 + 0.5 * SPLASH);
const PINCH_AT = JET_START + JET_LIFE * 0.5;
const PINCH_VELOCITY = -170 * (0.6 + 0.4 * SPLASH);
const PINCH_FLIGHT = (-2 * PINCH_VELOCITY) / BEAD_GRAVITY;

const IMPACT_AT = HANG + FALL;

export const CUP_STEAM = { at: IMPACT_AT + 0.85, duration: 1.1 } as const;
export const CUP_SEQUENCE_SECONDS = CUP_STEAM.at + CUP_STEAM.duration;

/** `travel` is 0 at the path's end and 1 where the drop meets the coffee, so
 *  each breakpoint can map it onto its own fall distance. */
export interface CupDrop {
  travel: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

export interface CupSurface {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  tilt: number;
  opacity: number;
  crema: number;
}

export interface CupRipple {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity: number;
  strokeWidth: number;
}

export interface CupBead {
  x: number;
  y: number;
  r: number;
}

export interface CupJet {
  x: number;
  baseY: number;
  height: number;
  width: number;
}

export interface CupFrame {
  drop: CupDrop;
  satellite: CupDrop | null;
  surface: CupSurface;
  ripples: ReadonlyArray<CupRipple | null>;
  beads: ReadonlyArray<CupBead | null>;
  jet: CupJet | null;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, k: number) => from + (to - from) * k;
const progressThrough = (t: number, start: number, duration: number) =>
  clamp01((t - start) / duration);
const easeOutCubic = (k: number) => 1 - (1 - k) ** 3;
const easeInOutSine = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;
const travelOf = (y: number) => (y - DROP_REST_Y) / (IMPACT_Y - DROP_REST_Y);

/** Critically damped rise from 0 to 1. */
const fillLevel = (t: number) =>
  t <= 0 ? 0 : 1 - Math.exp(-FILL_OMEGA * t) * (1 + FILL_OMEGA * t);

/** Damped oscillation that starts at zero. */
const ring = (t: number, period: number, decay: number) =>
  t <= 0 ? 0 : Math.exp(-t / decay) * Math.sin((2 * Math.PI * t) / period);

const surfaceYAt = (sinceImpact: number) =>
  CUP_FULL_SURFACE.cy + EMPTY_DEPTH * (1 - fillLevel(sinceImpact));

/** Mulberry32: the same seed always yields the same art and splash. */
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const CROWN = (() => {
  const random = seededRandom(11);
  const count = CUP_BEAD_COUNT - 1;
  return Array.from({ length: count }, (_, index) => {
    const theta = (index / count) * Math.PI * 2 + random() * 0.4;
    const radius = 16 + random() * 8;
    const out = lerp(55, 120, random()) * (0.6 + 0.4 * SPLASH);
    return {
      x0: Math.cos(theta) * radius,
      y0: Math.sin(theta) * radius * (CUP_FULL_SURFACE.ry / CUP_FULL_SURFACE.rx),
      vx: Math.cos(theta) * out,
      vy: -lerp(300, 420, random()) * (0.55 + 0.45 * SPLASH) + Math.sin(theta) * out * 0.25,
      r: lerp(2.4, 4.4, random()),
    };
  });
})();

const RIPPLES = [
  { start: 0.04, duration: 0.85, peak: 0.75, reach: 0.95, width: 2.6 },
  { start: 0.2, duration: 0.95, peak: 0.55, reach: 1.02, width: 2 },
  { start: 0.4, duration: 1, peak: 0.35, reach: 1.05, width: 1.6 },
  { start: PINCH_AT + PINCH_FLIGHT, duration: 0.7, peak: 0.4, reach: 0.7, width: 1.6 },
  {
    start: SATELLITE_DELAY + SATELLITE_FLIGHT - FALL,
    duration: 0.6,
    peak: 0.3,
    reach: 0.5,
    width: 1.4,
  },
] as const;

const NO_RIPPLES: ReadonlyArray<null> = RIPPLES.map(() => null);
const NO_BEADS: ReadonlyArray<null> = Array.from({ length: CUP_BEAD_COUNT }, () => null);

const EMPTY_SURFACE: CupSurface = {
  cx: CUP_FULL_SURFACE.cx,
  cy: CUP_FULL_SURFACE.cy + EMPTY_DEPTH,
  rx: CUP_FULL_SURFACE.rx * EMPTY_SCALE,
  ry: CUP_FULL_SURFACE.ry * EMPTY_SCALE,
  tilt: 0,
  opacity: 0,
  crema: 0,
};

/** The full cup: also what the markup shows without JS or with reduced motion. */
export const CUP_SETTLED: CupFrame = {
  drop: { travel: travelOf(IMPACT_Y + SAG), scaleX: 1.4, scaleY: 0.55, opacity: 0 },
  satellite: null,
  surface: { ...CUP_FULL_SURFACE, tilt: 0, opacity: 1, crema: 1 },
  ripples: NO_RIPPLES,
  beads: NO_BEADS,
  jet: null,
};

function dropAt(t: number): CupDrop {
  const sinceRelease = t - HANG;
  if (sinceRelease <= 0) {
    // pendant hang: the drop gathers weight, sags and necks before pinch-off
    const gather = easeInOutSine(progressThrough(t, HANG * 0.35, HANG * 0.65));
    return {
      travel: travelOf(DROP_REST_Y + SAG * gather),
      scaleX: lerp(1, 0.9, gather),
      scaleY: lerp(1, 1.24, gather),
      opacity: 1,
    };
  }
  const sinceImpact = t - IMPACT_AT;
  if (sinceImpact >= 0) {
    const merge = progressThrough(sinceImpact, 0, 0.06);
    const squash = easeOutCubic(merge);
    return {
      travel: travelOf(IMPACT_Y + SAG * merge),
      scaleX: lerp(1 / Math.sqrt(1.32), 1.4, squash),
      scaleY: lerp(1.32, 0.55, squash),
      opacity: 1 - progressThrough(sinceImpact, 0.03, 0.05),
    };
  }
  // constant gravity; speed stretches the drop while the pinch-off recoil
  // rings out the neck it just snapped
  const recoil =
    0.24 * Math.exp(-sinceRelease / 0.05) * Math.cos((2 * Math.PI * sinceRelease) / 0.11);
  const stretch = 1 + 0.32 * (sinceRelease / FALL) + recoil;
  return {
    travel: travelOf(FALL_START_Y + 0.5 * GRAVITY * sinceRelease * sinceRelease),
    scaleX: 1 / Math.sqrt(stretch),
    scaleY: stretch,
    opacity: 1,
  };
}

function satelliteAt(t: number): CupDrop | null {
  const flight = t - HANG - SATELLITE_DELAY;
  if (flight <= 0 || flight >= SATELLITE_FLIGHT) return null;
  const size = 0.6 + 0.4 * SPLASH;
  return {
    travel: travelOf(FALL_START_Y - 6 + 0.5 * GRAVITY * flight * flight),
    scaleX: 0.28 * size,
    scaleY: 0.32 * size,
    opacity: 1,
  };
}

function rippleAt(sinceImpact: number, index: number, surface: CupSurface): CupRipple | null {
  const { start, duration, peak, reach, width } = RIPPLES[index];
  const k = progressThrough(sinceImpact, start, duration);
  if (k <= 0 || k >= 1) return null;
  const grow = lerp(0.12, reach, easeOutCubic(k));
  return {
    cx: surface.cx,
    cy: surface.cy,
    rx: surface.rx * grow,
    ry: surface.ry * grow,
    opacity: peak * (1 - k) ** 1.6,
    strokeWidth: width * (1 - 0.5 * k),
  };
}

function crownBeadAt(index: number, sinceImpact: number, surfaceX: number): CupBead | null {
  const flight = sinceImpact - CROWN_START;
  if (flight <= 0) return null;
  const bead = CROWN[index];
  const rise = bead.y0 + bead.vy * flight + 0.5 * BEAD_GRAVITY * flight * flight;
  // gone once it falls back through its launch height
  if (rise > bead.y0 + 2) return null;
  return {
    x: surfaceX + bead.x0 + bead.vx * flight,
    y: surfaceYAt(CROWN_START) + rise,
    r: bead.r * (1 - 0.35 * clamp01(flight / 0.45)),
  };
}

function pinchedBeadAt(sinceImpact: number, surfaceX: number): CupBead | null {
  const flight = sinceImpact - PINCH_AT;
  if (flight <= 0 || flight >= PINCH_FLIGHT) return null;
  return {
    x: surfaceX,
    y:
      surfaceYAt(PINCH_AT) -
      JET_PEAK +
      PINCH_VELOCITY * flight +
      0.5 * BEAD_GRAVITY * flight * flight,
    r: 3.2,
  };
}

export function cupFrameAt(t: number): CupFrame {
  if (t >= CUP_SEQUENCE_SECONDS) return CUP_SETTLED;
  const drop = dropAt(t);
  const satellite = satelliteAt(t);
  const sinceImpact = t - IMPACT_AT;
  if (sinceImpact < 0) {
    return { drop, satellite, surface: EMPTY_SURFACE, ripples: NO_RIPPLES, beads: NO_BEADS, jet: null };
  }

  const level = fillLevel(sinceImpact);
  const scale = lerp(EMPTY_SCALE, 1, level);
  const surface: CupSurface = {
    cx: CUP_FULL_SURFACE.cx + 3.2 * SLOSH * ring(sinceImpact - 0.05, 0.5, 0.5),
    cy: surfaceYAt(sinceImpact),
    rx: CUP_FULL_SURFACE.rx * scale,
    ry: CUP_FULL_SURFACE.ry * scale,
    tilt: 4.2 * SLOSH * ring(sinceImpact - 0.08, 0.46, 0.42),
    opacity: progressThrough(sinceImpact, 0, 0.04),
    crema: easeOutCubic(progressThrough(sinceImpact, 0.55, 0.9)),
  };

  const jetProgress = progressThrough(sinceImpact, JET_START, JET_LIFE);
  const jet =
    jetProgress > 0 && jetProgress < 1
      ? {
          x: surface.cx,
          baseY: surface.cy,
          height: JET_PEAK * Math.sin(Math.PI * jetProgress),
          width: 7 * (1 - 0.35 * jetProgress),
        }
      : null;

  return {
    drop,
    satellite,
    surface,
    ripples: RIPPLES.map((_, index) => rippleAt(sinceImpact, index, surface)),
    beads: [
      ...CROWN.map((_, index) => crownBeadAt(index, sinceImpact, surface.cx)),
      pinchedBeadAt(sinceImpact, surface.cx),
    ],
    jet,
  };
}
