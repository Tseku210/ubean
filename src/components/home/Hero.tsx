import MuxPlayer, {
  type MuxPlayerRefAttributes,
} from "@mux/mux-player-react";
import { useTranslations } from "@/i18n/utils";
import SmokeSprite from "@assets/images/smoke_sprite.png?url";
import type { Language } from "@/types";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
// Shared with HomeLayout's <link rel="preload"> so the poster download starts
// with the HTML (WebP: ~77KB vs ~989KB for the PNG variant of the same frame).
import { HERO_POSTER as POSTER } from "@/consts";

interface Props {
  lang: Language;
}

export default function Hero({ lang }: Props) {
  const t = useTranslations(lang);
  const container = useRef<HTMLElement | null>(null);
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
        gsap.from(".reveal", {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="relative z-10 mx-4 aspect-[4/3] overflow-hidden rounded-[50px] md:mx-10 lg:aspect-[1290/550]"
    >
      <MuxPlayer
        ref={playerRef}
        className="block h-full w-full"
        playbackId="Gtmx5sme3IckVw2u5vXesfT02xXA62QAfqfDIAN02VSz00"
        metadata={{
          video_id: "bAdLgCCx72xWn7epwLpPy00ln5N3l3RIzaXmcGirqe1g",
          video_title: "hero",
        }}
        poster={POSTER}
        // 'playing' fires while the surface can still be black (first HLS
        // frame not yet painted); wait until the clock has actually advanced
        onTimeUpdate={() => {
          if ((playerRef.current?.currentTime ?? 0) > 0.05) setIsPlaying(true);
        }}
        streamType="on-demand"
        preload="auto"
        loop
        muted
        autoPlay
        playsInline
      />
      <img
        src={POSTER}
        alt=""
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-[5] h-full w-full object-cover transition-opacity duration-300 ease-out ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
      />
      <div className="absolute inset-0 z-10 rounded-[50px] bg-black/65" />

      <div className="absolute inset-0 z-20 mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 text-center text-white">
        <img
          src={SmokeSprite}
          loading="eager"
          alt=""
          className="reveal animate-sprite mb-6 size-12 object-cover md:mb-16 md:size-20"
        />
        <h1 className="reveal text-h5 sm:text-h2 md:text-h1 uppercase">
          {t("home.hero.title")}
        </h1>
        <p className="reveal text-b4 sm:text-b1 mt-4 md:font-normal">
          {t("home.hero.desc")}
        </p>
      </div>
    </section>
  );
}
