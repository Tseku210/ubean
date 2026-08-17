import { useReveal } from "@/hooks/useReveal";
import { useTranslations } from "@/i18n/utils";
import type { Language } from "@/types";

interface Props {
  lang: Language;
}

export default function Beans({ lang }: Props) {
  const t = useTranslations(lang);
  const { container } = useReveal();

  return (
    <section ref={container} className="w-fit">
      <div className="flex w-full flex-col-reverse items-center justify-between gap-10 md:flex-row md:gap-32">
        <div className="order-2 max-w-3xs md:order-1 md:max-w-70 md:text-left">
          <img
            src="/fire.webp"
            className="reveal mb-8 size-14 rounded-full md:size-[76px]"
            alt="Fire icon"
            loading="lazy"
          />
          <h3 className="reveal text-secondary text-h5 mb-4 font-bold md:text-2xl">
            {t("home.beans.title")}
          </h3>
          <p className="reveal text-b3 md:text-gray1 leading-relaxed">
            {t("home.beans.desc")}
          </p>
        </div>
        <div className="reveal order-1 md:order-2">
          <img
            src="/images/where-the-aroma-begins.webp"
            className="aspect-[5/3] h-[200px] w-full object-contain md:h-[330px] md:object-cover md:object-left md:px-0 lg:object-contain"
            alt="Where the aroma begins"
            width={1100}
            height={638}
          />
        </div>
      </div>
    </section>
  );
}
