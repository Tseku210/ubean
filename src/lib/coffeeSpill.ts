import gsap from "gsap";

/** The cup transform the 404 page writes: translate, then rotate about the pivot. */
export interface CupPose {
  x: number;
  y: number;
  rot: number;
}

/**
 * Who is moving the cup decides how easily it spills. A gentle release never
 * drips, so only deliberate movement costs the cup any coffee.
 */
export type SpillPhase = "held" | "thrown" | "settling";

interface Drop {
  node: SVGCircleElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const COFFEE_COLOR = "#654321";
const SURFACE = { cx: 300, cy: 1936 };
const CUP_PIVOT = { x: 300, y: 2050 };

const SLOSH_STIFFNESS = 170;
const SLOSH_DAMPING = 5;
const MAX_LAG = 70;
const MAX_FRAME_SECONDS = 0.1;
const SIMULATION_STEP_SECONDS = 1 / 120;

const SPILL_THRESHOLD: Record<SpillPhase, number> = {
  held: 20,
  thrown: 50,
  settling: Number.POSITIVE_INFINITY,
};
const SPILL_COOLDOWN_SECONDS = 0.08;
const MAX_LIVE_DROPS = 24;
const DROP_GRAVITY = 1100;
const INHERITED_CUP_VELOCITY = 0.45;
const MAX_INHERITED_SPEED = 900;

const LEVEL_PER_DROP = 0.016;
const MIN_LEVEL = 0.5;
const REFILL_PER_SECOND = 0.4;

const { clamp, random } = gsap.utils;
const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Sloshes the coffee and throws drops off the lip while the cup moves.
 *
 * The liquid is a damped spring chasing the cup, so its lag behind the cup is
 * the slosh. That one signal covers dragging, flicks and the elastic return.
 * The ticker runs only while something is moving and removes itself at rest.
 */
export const createCoffeeSpill = (
  coffee: SVGEllipseElement,
  dropLayer: SVGGElement,
  pose: CupPose,
) => {
  const liquid = { x: pose.x, y: pose.y, vx: 0, vy: 0 };
  const drops: Drop[] = [];
  let phase: SpillPhase = "settling";
  let level = 1;
  let cooldown = 0;
  let lastX = pose.x;
  let lastY = pose.y;
  let ticking = false;

  const cupToWorld = (localX: number, localY: number) => {
    const angle = (pose.rot * Math.PI) / 180;
    const dx = localX - CUP_PIVOT.x;
    const dy = localY - CUP_PIVOT.y;
    return {
      x: CUP_PIVOT.x + pose.x + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: CUP_PIVOT.y + pose.y + dx * Math.sin(angle) + dy * Math.cos(angle),
    };
  };

  const spawnDrops = (
    side: number,
    strength: number,
    cupVx: number,
    cupVy: number,
  ) => {
    const count = 1 + Math.round(strength * 2);
    for (let i = 0; i < count; i++) {
      if (drops.length >= MAX_LIVE_DROPS || level <= MIN_LEVEL) return;
      const lip = cupToWorld(
        SURFACE.cx + side * random(96, 106),
        SURFACE.cy + random(-5, 3),
      );
      const node = document.createElementNS(SVG_NS, "circle");
      node.setAttribute("r", String(round(random(3, 6.5))));
      node.setAttribute("fill", COFFEE_COLOR);
      dropLayer.appendChild(node);
      const throwForce = 0.7 + strength;
      drops.push({
        node,
        ...lip,
        vx:
          clamp(-MAX_INHERITED_SPEED, MAX_INHERITED_SPEED, cupVx) *
            INHERITED_CUP_VELOCITY +
          side * random(50, 190) * throwForce,
        vy:
          clamp(-MAX_INHERITED_SPEED, MAX_INHERITED_SPEED, cupVy) *
            INHERITED_CUP_VELOCITY -
          random(90, 230) * throwForce,
        age: 0,
        life: random(0.55, 0.85),
      });
      level = Math.max(MIN_LEVEL, level - LEVEL_PER_DROP);
    }
  };

  const advanceDrops = (dt: number) => {
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      drop.age += dt;
      if (drop.age >= drop.life) {
        drop.node.remove();
        drops.splice(i, 1);
        continue;
      }
      drop.vy += DROP_GRAVITY * dt;
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;
      // Fast drops stretch along their path and fade over their last third.
      const stretch = 1 + Math.min(Math.hypot(drop.vx, drop.vy) / 900, 0.8);
      const angle = (Math.atan2(drop.vy, drop.vx) * 180) / Math.PI;
      const remaining = (drop.life - drop.age) / (drop.life / 3);
      drop.node.setAttribute(
        "transform",
        `translate(${round(drop.x)} ${round(drop.y)}) rotate(${round(angle)}) scale(${round(stretch)} ${round(1 / stretch)})`,
      );
      drop.node.setAttribute("opacity", String(round(Math.min(1, remaining))));
    }
  };

  const paintSurface = (lagX: number, lagY: number) => {
    const shiftX = clamp(-9, 9, lagX * 0.12);
    const shiftY = clamp(-5, 5, lagY * 0.12) + (1 - level) * 10;
    // The surface stays nearer level than the cup, and piles up on the lag side.
    const tilt = clamp(-11, 11, -lagX * 0.2 - pose.rot * 0.55);
    // Moving liquid swells to meet the walls, so tilting never leaves a thin band.
    const swell = Math.min(1, Math.abs(lagX) / 40);
    const fill = 0.88 + level * 0.12;
    const scaleX = fill * (1 + swell * 0.1);
    const scaleY = fill * (1 + swell * 0.24);
    coffee.setAttribute(
      "transform",
      `translate(${round(shiftX)} ${round(shiftY)}) rotate(${round(tilt)} ${SURFACE.cx} ${SURFACE.cy}) translate(${SURFACE.cx} ${SURFACE.cy}) scale(${round(scaleX)} ${round(scaleY)}) translate(${-SURFACE.cx} ${-SURFACE.cy})`,
    );
  };

  const sleep = () => {
    gsap.ticker.remove(tick);
    ticking = false;
  };

  const clearDrops = () => {
    drops.forEach((drop) => drop.node.remove());
    drops.length = 0;
  };

  const tick = (_time: number, deltaMs: number) => {
    if (!coffee.isConnected) {
      clearDrops();
      sleep();
      return;
    }
    const dt = Math.min(deltaMs / 1000, MAX_FRAME_SECONDS);
    if (dt <= 0) return;

    const cupVx = (pose.x - lastX) / dt;
    const cupVy = (pose.y - lastY) / dt;
    // Fixed substeps along the cup's path keep the slosh the same at any frame rate.
    const steps = Math.ceil(dt / SIMULATION_STEP_SECONDS);
    const stepSeconds = dt / steps;
    for (let step = 1; step <= steps; step++) {
      const cupX = lastX + (pose.x - lastX) * (step / steps);
      const cupY = lastY + (pose.y - lastY) * (step / steps);
      liquid.vx +=
        (-SLOSH_STIFFNESS * (liquid.x - cupX) -
          SLOSH_DAMPING * (liquid.vx - cupVx)) *
        stepSeconds;
      liquid.vy +=
        (-SLOSH_STIFFNESS * (liquid.y - cupY) -
          SLOSH_DAMPING * (liquid.vy - cupVy)) *
        stepSeconds;
      liquid.x += liquid.vx * stepSeconds;
      liquid.y += liquid.vy * stepSeconds;
    }
    lastX = pose.x;
    lastY = pose.y;

    const lagX = clamp(-MAX_LAG, MAX_LAG, liquid.x - pose.x);
    const lagY = clamp(-MAX_LAG, MAX_LAG, liquid.y - pose.y);
    liquid.x = pose.x + lagX;
    liquid.y = pose.y + lagY;

    // Liquid left above a falling cup also clears the rim, so it counts as surge.
    const surge = Math.max(Math.abs(lagX), -lagY * 0.8);
    // A lower level needs a bigger wave to reach the lip.
    const threshold = SPILL_THRESHOLD[phase] + (1 - level) * 36;
    cooldown -= dt;
    if (surge > threshold && cooldown <= 0) {
      const side = lagX === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(lagX);
      spawnDrops(side, clamp(0, 1, (surge - threshold) / 34), cupVx, cupVy);
      cooldown = SPILL_COOLDOWN_SECONDS;
    }
    advanceDrops(dt);

    const cupIsMoving = phase === "held" || gsap.isTweening(pose);
    if (!cupIsMoving) level = Math.min(1, level + REFILL_PER_SECOND * dt);

    const liquidIsStill =
      Math.abs(lagX) < 0.1 &&
      Math.abs(lagY) < 0.1 &&
      Math.abs(liquid.vx - cupVx) < 1 &&
      Math.abs(liquid.vy - cupVy) < 1;
    if (!cupIsMoving && liquidIsStill && !drops.length && level === 1) {
      coffee.removeAttribute("transform");
      sleep();
      return;
    }
    paintSurface(lagX, lagY);
  };

  const setPhase = (nextPhase: SpillPhase) => {
    phase = nextPhase;
    if (ticking) return;
    liquid.x = lastX = pose.x;
    liquid.y = lastY = pose.y;
    liquid.vx = liquid.vy = 0;
    ticking = true;
    gsap.ticker.add(tick);
  };

  return { setPhase };
};
