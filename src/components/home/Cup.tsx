import logoUrl from "@assets/icons/logo.svg?url";
import spriteUrl from "@assets/images/smoke_sprite.png?url";

/**
 * Vector cup, drawn in a local 600-wide space with the rim center at
 * (300, 1935). MotionPath places it with translate/scale so the rim sits
 * directly under the droplet path's end point at every breakpoint.
 *
 * The art is split into two layers rendered on either side of the droplet
 * inside MotionPath's SVG: CupBack (rim, interior, coffee, splash stage)
 * paints behind the falling droplet, CupFront (body, handle, print, steam)
 * occludes it — so the droplet visually enters the cup.
 */

/** Local-space anchor constants shared with MotionPath's choreography. */
export const CUP_LOCAL = { cx: 300, rimY: 1935, surfaceY: 1928 } as const;

/** The brand smoke squiggle (from src/assets/icons/smoke.svg), printed dark. */
const SMOKE_D =
  "M7.45713 17C11.4592 11.6544 16.6693 3.04065 16.942 0C19.4647 2.69512 26.7258 7.70313 24.7146 15.3415C23.5572 19.7373 15.5679 20.084 18.7874 27.625C21.1689 33.2031 30.695 30.0156 35.1934 34.2656C43.7158 42.3175 39.2371 48.3049 34.5326 52.8659C31.7899 55.525 10.3207 66.6179 2.9572 68C7.04805 63.2317 29.1802 51.1205 26.5555 46.6463C22.0556 38.9756 7.94218 47.2683 0.783158 37.1098C-1.32019 34.1251 0.78317 25.9146 7.45713 17Z";

export function CupBack() {
  return (
    <g>
      <path
        d="M405 1972 C476 1979, 488 2052, 455 2094 C436 2119, 414 2125, 402 2121"
        fill="none"
        stroke="#97D5D0"
        strokeWidth={28}
        strokeLinecap="round"
      />
      <g className="cup-rim">
        <ellipse cx={300} cy={1935} rx={112} ry={34} fill="#97D5D0" />
        <ellipse
          cx={300}
          cy={1935}
          rx={112}
          ry={34}
          fill="none"
          stroke="#6FB5AF"
          strokeWidth={1.5}
        />
        <ellipse cx={300} cy={1936} rx={99} ry={27.5} fill="#447D77" />
        {/* visible by default so no-JS and reduced-motion show a full cup;
            the animated branch hides it until the droplet lands, then the
            surface rises bottom-up inside the interior clip */}
        <clipPath id="cup-interior-clip">
          <ellipse cx={300} cy={1936} rx={99} ry={27.5} />
        </clipPath>
        <g clipPath="url(#cup-interior-clip)">
          <g className="cup-coffee">
            {/* uniform 6-unit inset of the interior opening (99/27.5 @ 1936)
                so the dark wall ring reads even all around */}
            <ellipse cx={300} cy={1936} rx={93} ry={21.5} fill="#654321" />
          </g>
        </g>
        <ellipse
          className="cup-ripple-1"
          cx={300}
          cy={1936}
          rx={86}
          ry={19}
          fill="none"
          stroke="#D9B98A"
          strokeWidth={3}
          opacity={0}
        />
        <ellipse
          className="cup-ripple-2"
          cx={300}
          cy={1936}
          rx={86}
          ry={19}
          fill="none"
          stroke="#C9A06B"
          strokeWidth={2}
          opacity={0}
        />
      </g>
      {/* splash droplets are spawned here imperatively on impact */}
      <g className="cup-splash" />
    </g>
  );
}

export function CupFront() {
  return (
    <g>
      <path
        d="M188 1935
           C187 2020, 192 2110, 198 2178
           C199 2196, 220 2209, 300 2211
           C380 2209, 401 2196, 402 2178
           C408 2110, 413 2020, 412 1935
           A 112 34 0 0 1 188 1935 Z"
        fill="#97D5D0"
      />
      {/* print multiplies into the ceramic and fades toward the silhouette
          so it reads as wrapping the curve */}
      <defs>
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
      </defs>
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
    </g>
  );
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
