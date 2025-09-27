"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { languages } from "@/i18n/ui";

gsap.registerPlugin(useGSAP);

interface Props {
  lang: keyof typeof languages;
}

function MotionPathDesktop({ lang }: Props) {
  return (
    <div className="motion-path relative mx-auto hidden h-[calc(100%+320px)] max-w-6xl md:block">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1021 3018"
        fill="none"
        className="relative hidden overflow-visible md:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="path"
          d="M535 1V1C535 50.9818 494.482 91.5 444.5 91.5H154.5C79.9416 91.5 19.5 151.942 19.5 226.5V526C19.5 600.558 79.9416 661 154.5 661H400C474.558 661 535 721.442 535 796V1346C535 1420.56 595.442 1481 670 1481H884.5C959.058 1481 1019.5 1541.44 1019.5 1616V2223.5C1019.5 2298.06 959.058 2358.5 884.5 2358.5H136C61.4416 2358.5 1 2418.94 1 2493.5V2793C1 2867.56 61.4416 2928 136 2928H447C496.153 2928 536 2967.85 536 3017V3017"
          stroke="#97D5D0"
          stroke-width="2"
          stroke-dasharray="4 7"
        ></path>
        <path
          id="droplet"
          className="hidden"
          d="M23 20.3755C23 26.7955 17.8513 32 11.5 32C5.14872 32 -3.34002e-06 26.7955 -3.34002e-06 20.3755C-3.34002e-06 13.9555 11.5 0 11.5 0C11.5 0 23 13.9555 23 20.3755Z"
          fill="#97D5D0"
        ></path>
      </svg>
    </div>
  );
}

export default MotionPathDesktop;
