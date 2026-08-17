import MuxPlayer from "@mux/mux-player-react";
import { useTranslations } from "@/i18n/utils";
import SmokeSprite from "@assets/images/smoke_sprite.png?url";
import type { Language } from "@/types";
import { useReveal } from "@/hooks/useReveal";
import { HERO_POSTER } from "@/consts";

interface Props {
  lang: Language;
}

export default function Hero({ lang }: Props) {
  const t = useTranslations(lang);
  const { container } = useReveal();

  return (
    <section
      ref={container}
      className="relative z-10 mx-4 aspect-[4/3] overflow-hidden rounded-[50px] md:mx-10 lg:aspect-[1290/550]"
    >
      <MuxPlayer
        className="block h-full w-full"
        playbackId="Gtmx5sme3IckVw2u5vXesfT02xXA62QAfqfDIAN02VSz00"
        metadata={{
          video_id: "bAdLgCCx72xWn7epwLpPy00ln5N3l3RIzaXmcGirqe1g",
          video_title: "hero",
        }}
        poster={HERO_POSTER}
        streamType="on-demand"
        preload="true"
        loop
        muted
        autoPlay
        playsInline
      />
      <div className="absolute inset-0 z-10 rounded-[50px] bg-black/65" />

      <div className="absolute inset-0 z-20 mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 text-center text-white">
        <img
          src={SmokeSprite}
          loading="eager"
          alt=""
          className="reveal animate-sprite mb-6 size-12 object-cover md:mb-16 md:size-20"
        />
        <h1 className="reveal text-h5 md:text-h1 uppercase">
          {t("home.hero.title")}
        </h1>
        <p className="reveal text-b4 md:text-b1 mt-4 md:font-normal">
          {t("home.hero.desc")}
        </p>
      </div>
    </section>
  );
}
