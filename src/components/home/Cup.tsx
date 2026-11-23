import logoUrl from "@assets/icons/logo.svg?url";
import spriteUrl from "@assets/images/smoke_sprite.png?url";
import {
  CUP_BEAD_COUNT,
  CUP_FULL_SURFACE,
  CUP_OPENING,
  CUP_RIPPLE_COLORS,
  seededRandom,
  type CupFrame,
  type CupJet,
} from "@/lib/cupImpact";

/**
 * Vector cup, drawn in a local 600-wide space with the rim center at
 * (300, 1935). MotionPath places it with translate/scale so the rim sits
 * directly under the droplet path's end point at every breakpoint.
 *
 * The art is split into two layers rendered on either side of the droplet
 * inside MotionPath's SVG: CupBack (handle, rim, interior, coffee, splash)
 * paints behind the falling droplet, CupFront (body, print, glaze details)
 * occludes it — so the droplet visually enters the cup.
 */

/** Local-space anchor constants shared with MotionPath's choreography. */
export const CUP_LOCAL = { cx: 300, rimY: 1935 } as const;

/** The brand smoke squiggle (from src/assets/icons/smoke.svg), printed dark.
 *  Also reused by the 404 page's static cup. */
export const SMOKE_D =
  "M7.45713 17C11.4592 11.6544 16.6693 3.04065 16.942 0C19.4647 2.69512 26.7258 7.70313 24.7146 15.3415C23.5572 19.7373 15.5679 20.084 18.7874 27.625C21.1689 33.2031 30.695 30.0156 35.1934 34.2656C43.7158 42.3175 39.2371 48.3049 34.5326 52.8659C31.7899 55.525 10.3207 66.6179 2.9572 68C7.04805 63.2317 29.1802 51.1205 26.5555 46.6463C22.0556 38.9756 7.94218 47.2683 0.783158 37.1098C-1.32019 34.1251 0.78317 25.9146 7.45713 17Z";

const STONE_BODY =
  "M188 1935 C186 2010, 190 2100, 200 2168 C204 2196, 236 2212, 300 2213 C364 2212, 396 2196, 400 2168 C410 2100, 414 2010, 412 1935 A 112 34 0 0 1 188 1935 Z";
const STONE_FOOT =
  "M176 2176 C204 2169, 222 2183, 246 2177 C268 2171, 286 2185, 308 2178 C330 2171, 350 2184, 372 2177 C392 2171, 408 2180, 424 2174 L424 2228 L176 2228 Z";

/** Deterministic glaze speckles as one path, so 210 dots cost one DOM node. */
function speckles(seed: number, count: number, minR: number, maxR: number) {
  const random = seededRandom(seed);
  const fixed = (value: number) => value.toFixed(1);
  return Array.from({ length: count }, () => {
    const x = 190 + random() * 220;
    const y = 1944 + random() * 236;
    const r = minR + random() * (maxR - minR);
    return `M${fixed(x - r)} ${fixed(y)} a${fixed(r)} ${fixed(r)} 0 1 0 ${fixed(2 * r)} 0 a${fixed(r)} ${fixed(r)} 0 1 0 ${fixed(-2 * r)} 0`;
  }).join(" ");
}

const DARK_SPECKLES = speckles(0x5eed, 150, 0.6, 1.5);
const LIGHT_SPECKLES = speckles(0xbea7, 60, 0.5, 1.1);

/** Everything above the rim plane, plus the opening below it: where fluid can
 *  be seen. Both subpaths wind clockwise so they union. */
export const CUP_FLUID_VISIBLE_D = `M-5000 -5000 H5000 V${CUP_LOCAL.rimY} H-5000 Z M${CUP_OPENING.cx - CUP_OPENING.rx} ${CUP_OPENING.cy} A${CUP_OPENING.rx} ${CUP_OPENING.ry} 0 1 1 ${CUP_OPENING.cx + CUP_OPENING.rx} ${CUP_OPENING.cy} A${CUP_OPENING.rx} ${CUP_OPENING.ry} 0 1 1 ${CUP_OPENING.cx - CUP_OPENING.rx} ${CUP_OPENING.cy} Z`;

const surfaceProps = {
  cx: CUP_FULL_SURFACE.cx,
  cy: CUP_FULL_SURFACE.cy,
  rx: CUP_FULL_SURFACE.rx,
  ry: CUP_FULL_SURFACE.ry,
};

export function CupBack() {
  return (
    <g>
      <ellipse cx={300} cy={2212} rx={108} ry={8} fill="#1E1512" fillOpacity={0.14} />
      <g fill="none" strokeLinecap="round">
        <path
          d="M404 1975 C468 1970, 490 2040, 468 2090 C454 2120, 426 2128, 400 2122"
          stroke="#88C9C3"
          strokeWidth={26}
        />
        <path
          d="M408 1968 C462 1966, 482 2016, 478 2052"
          stroke="#fff"
          strokeOpacity={0.32}
          strokeWidth={4}
        />
      </g>
      <ellipse cx={300} cy={1935} rx={112} ry={34} fill="#97D5D0" stroke="#6FB5AF" strokeWidth={1.5} />
      <ellipse {...CUP_OPENING} fill="#3F766F" />
      <defs>
        <clipPath id="cup-interior-clip">
          <ellipse {...CUP_OPENING} />
        </clipPath>
        <clipPath id="cup-surface-clip">
          <ellipse className="cup-surface-shape" {...surfaceProps} />
        </clipPath>
        <clipPath id="cup-fluid-clip">
          <path d={CUP_FLUID_VISIBLE_D} />
        </clipPath>
        <radialGradient
          id="cup-crema-glow"
          gradientUnits="userSpaceOnUse"
          cx={CUP_FULL_SURFACE.cx - CUP_FULL_SURFACE.rx * 0.25}
          cy={CUP_FULL_SURFACE.cy - CUP_FULL_SURFACE.ry * 0.35}
          r={CUP_FULL_SURFACE.rx * 0.65}
        >
          <stop offset="0" stopColor="#C9A06B" />
          <stop offset="1" stopColor="#C9A06B" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* full by default so no-JS and reduced-motion show a filled cup; the
          animated branch empties it and paints each frame */}
      <g clipPath="url(#cup-interior-clip)">
        <g className="cup-coffee">
          <ellipse className="cup-surface-shape" {...surfaceProps} fill="#654321" />
          <g clipPath="url(#cup-surface-clip)">
            <g className="cup-crema">
              <ellipse
                className="cup-meniscus"
                cx={CUP_FULL_SURFACE.cx}
                cy={CUP_FULL_SURFACE.cy}
                rx={CUP_FULL_SURFACE.rx - 2.4}
                ry={CUP_FULL_SURFACE.ry - 1.1}
                fill="none"
                stroke="#D9B98A"
                strokeOpacity={0.9}
                strokeWidth={2.2}
              />
              <ellipse
                className="cup-surface-shape"
                {...surfaceProps}
                fill="url(#cup-crema-glow)"
                opacity={0.35}
              />
            </g>
            {CUP_RIPPLE_COLORS.map((color, index) => (
              <ellipse
                key={index}
                className="cup-ripple"
                {...surfaceProps}
                fill="none"
                stroke={color}
                opacity={0}
              />
            ))}
          </g>
        </g>
      </g>
      <g clipPath="url(#cup-fluid-clip)" fill="#654321">
        <path className="cup-jet" />
        {Array.from({ length: CUP_BEAD_COUNT }, (_, index) => (
          <circle key={index} className="cup-bead" r={0} opacity={0} />
        ))}
      </g>
    </g>
  );
}

export function CupFront() {
  return (
    <g>
      <defs>
        <clipPath id="cup-body-clip">
          <path d={STONE_BODY} />
        </clipPath>
        {/* print multiplies into the ceramic and fades toward the silhouette
            so it reads as wrapping the curve */}
        <linearGradient
          id="cup-print-wrap"
          gradientUnits="userSpaceOnUse"
          x1={188}
          y1={0}
          x2={412}
          y2={0}
        >
          <stop offset="0" stopColor="#fff" stopOpacity={0.35} />
          <stop offset="0.22" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.78" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.35} />
        </linearGradient>
        <mask id="cup-print-mask">
          <rect x={188} y={1990} width={224} height={130} fill="url(#cup-print-wrap)" />
        </mask>
        <linearGradient
          id="cup-side-light"
          gradientUnits="userSpaceOnUse"
          x1={188}
          y1={0}
          x2={412}
          y2={0}
        >
          <stop offset="0" stopColor="#fff" stopOpacity={0.24} />
          <stop offset="0.16" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.58" stopColor="#1C5651" stopOpacity={0} />
          <stop offset="1" stopColor="#1C5651" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <path d={STONE_BODY} fill="#97D5D0" />
      <g clipPath="url(#cup-body-clip)">
        <g
          fill="#1E1512"
          mask="url(#cup-print-mask)"
          opacity={0.88}
          style={{ mixBlendMode: "multiply" }}
        >
          {/* centered over the mug glyph of the logo (mug spans x 225–263 here) */}
          <path d={SMOKE_D} transform="translate(235 2008) scale(0.45)" />
          <image href={logoUrl} x={225} y={2048} width={155.4} height={44.1} />
        </g>
        <path d={DARK_SPECKLES} fill="#346863" fillOpacity={0.55} />
        <path d={LIGHT_SPECKLES} fill="#ECFAF8" fillOpacity={0.7} />
        <path d={STONE_FOOT} fill="#E9DECB" />
        <rect x={176} y={1930} width={248} height={298} fill="url(#cup-side-light)" />
        <path
          d="M188 1935 A 112 34 0 0 0 412 1935"
          fill="none"
          stroke="#fff"
          strokeOpacity={0.5}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

/** Returns a painter that writes one choreography frame onto the cup's SVG. */
export function createCupPainter(root: Element) {
  const all = (selector: string) => Array.from(root.querySelectorAll<SVGElement>(selector));
  const coffee = root.querySelector(".cup-coffee");
  const crema = root.querySelector(".cup-crema");
  const meniscus = root.querySelector(".cup-meniscus");
  const glow = root.querySelector("#cup-crema-glow");
  const jet = root.querySelector(".cup-jet");
  const shapes = all(".cup-surface-shape");
  const ripples = all(".cup-ripple");
  const beads = all(".cup-bead");

  return ({ surface, ripples: rippleStates, beads: beadStates, jet: jetState }: CupFrame) => {
    const tilt = `rotate(${surface.tilt} ${surface.cx} ${surface.cy})`;
    coffee?.setAttribute("opacity", String(surface.opacity));
    crema?.setAttribute("opacity", String(surface.crema));
    for (const shape of shapes) {
      setAttributes(shape, { cx: surface.cx, cy: surface.cy, rx: surface.rx, ry: surface.ry, transform: tilt });
    }
    if (meniscus) {
      setAttributes(meniscus, {
        cx: surface.cx,
        cy: surface.cy,
        rx: surface.rx - 2.4,
        ry: surface.ry - 1.1,
        transform: tilt,
      });
    }
    if (glow) {
      setAttributes(glow, {
        cx: surface.cx - surface.rx * 0.25,
        cy: surface.cy - surface.ry * 0.35,
        r: surface.rx * 0.65,
      });
    }
    ripples.forEach((element, index) => {
      const ripple = rippleStates[index];
      if (!ripple) {
        element.setAttribute("opacity", "0");
        return;
      }
      setAttributes(element, {
        cx: ripple.cx,
        cy: ripple.cy,
        rx: ripple.rx,
        ry: ripple.ry,
        opacity: ripple.opacity,
        "stroke-width": ripple.strokeWidth,
      });
    });
    beads.forEach((element, index) => {
      const bead = beadStates[index];
      if (!bead) {
        element.setAttribute("opacity", "0");
        return;
      }
      setAttributes(element, { cx: bead.x, cy: bead.y, r: bead.r, opacity: 1 });
    });
    jet?.setAttribute("d", jetState && jetState.height > 0 ? jetPath(jetState) : "");
  };
}

function setAttributes(element: Element, attributes: Record<string, string | number>) {
  for (const name in attributes) element.setAttribute(name, String(attributes[name]));
}

/** A round-topped column rising from the surface. */
function jetPath({ x, baseY, height, width }: CupJet) {
  const half = width / 2;
  const top = baseY - Math.max(height, half);
  return `M${x - half} ${baseY} V${top + half} A${half} ${half} 0 0 1 ${x + half} ${top + half} V${baseY} Z`;
}

export function CupSteam() {
  return (
    <g className="cup-steam" opacity={0}>
      <defs>
        <clipPath id="cup-steam-clip">
          <rect x={225} y={1735} width={150} height={150} />
        </clipPath>
        <filter id="cup-steam-tint">
          <feFlood floodColor="#97D5D0" />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      <g className="cup-steam-drift">
        <g clipPath="url(#cup-steam-clip)">
          {/* the hero's 7-frame smoke sprite, tinted to brand teal */}
          <image
            className="cup-steam-sprite"
            href={spriteUrl}
            x={225}
            y={1735}
            width={1050}
            height={150}
            filter="url(#cup-steam-tint)"
          />
        </g>
      </g>
    </g>
  );
}
