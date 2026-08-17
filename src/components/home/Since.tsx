import MuxPlayer, {
  type MuxPlayerRefAttributes,
} from "@mux/mux-player-react";
import { useTranslations } from "@/i18n/utils";
import type { Language } from "@/types";
import { useReveal } from "@/hooks/useReveal";
import { useRef, useState } from "react";

interface Props {
  lang: Language;
}

const POSTER =
  "https://image.mux.com/kfJo02Ax7pE6bO5T6wz024WPeoAJa6qPKhfKdDQ00lvbfk/thumbnail.png?width=1280&time=3&fit_mode=preserve";

export default function Since({ lang }: Props) {
  const t = useTranslations(lang);
  const { container } = useReveal();
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section ref={container}>
      <div className="flex w-full flex-col-reverse items-center justify-between gap-10 md:flex-row md:gap-32">
        <div className="order-2 max-w-70 text-center md:order-1 md:text-left">
          <div className="flex flex-col gap-6 text-left">
            <h4 className="reveal text-h5 md:text-h2">
              {t("home.since.title")}
            </h4>
            <span className="reveal text-b3 md:text-b1 font-normal">
              {t("home.since.desc")}
            </span>
          </div>
        </div>
        <div className="reveal relative order-1 h-[190px] w-[343px] overflow-hidden rounded-[40px] md:order-2 md:aspect-[5/3] md:h-[330px] md:w-[800px] lg:w-auto">
          <MuxPlayer
            ref={playerRef}
            className="block h-full w-full"
            playbackId="kfJo02Ax7pE6bO5T6wz024WPeoAJa6qPKhfKdDQ00lvbfk"
            metadata={{
              video_id: "DCV4LzrdWzjB7Q1OtxfOnoragZfxRh3taaIrcMulJNU",
              video_title: "teaching",
            }}
            poster={POSTER}
            // 'playing' fires while the surface can still be black (first HLS
            // frame not yet painted); wait until the clock has actually advanced
            onTimeUpdate={() => {
              if ((playerRef.current?.currentTime ?? 0) > 0.05)
                setIsPlaying(true);
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
        </div>
      </div>
    </section>
  );
}
