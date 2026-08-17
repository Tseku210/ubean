import MuxPlayer from "@mux/mux-player-react";
import { useTranslations } from "@/i18n/utils";
import type { Language } from "@/types";
import { useReveal } from "@/hooks/useReveal";

interface Props {
  lang: Language;
}

export default function Since({ lang }: Props) {
  const t = useTranslations(lang);
  const { container } = useReveal();

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
            className="block h-full w-full"
            playbackId="kfJo02Ax7pE6bO5T6wz024WPeoAJa6qPKhfKdDQ00lvbfk"
            metadata={{
              video_id: "DCV4LzrdWzjB7Q1OtxfOnoragZfxRh3taaIrcMulJNU",
              video_title: "teaching",
            }}
            poster="https://image.mux.com/kfJo02Ax7pE6bO5T6wz024WPeoAJa6qPKhfKdDQ00lvbfk/thumbnail.webp?width=800&time=3&fit_mode=preserve"
            streamType="on-demand"
            preload="auto"
            loop
            muted
            autoPlay
            playsInline
          />
        </div>
      </div>
    </section>
  );
}
