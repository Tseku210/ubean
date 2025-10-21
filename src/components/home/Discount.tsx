import { useTranslations, useTranslatedPath } from "@/i18n/utils";
import { Button } from "../ui/button";
import type { Language } from "@/types";
import { useReveal } from "@/hooks/useReveal";

interface Props {
  lang: Language;
}

export default function Discount({ lang }: Props) {
  const t = useTranslations(lang);
  const translatePath = useTranslatedPath(lang);

  const { container } = useReveal();

  return (
    <section
      ref={container}
      className="bg-secondary mx-4 flex h-fit flex-col items-center gap-14 rounded-[50px] px-9 py-14 md:mx-10 md:px-10 md:py-20"
    >
      <div className="flex flex-col items-center justify-center gap-5">
        <h3 className="reveal text-h5 md:text-h3 font-bold text-white">
          {t("home.discount.title")}
        </h3>
        <a href={translatePath("/contact/")} className="reveal">
          <Button className="px-10 py-2">{t("home.discount.button")}</Button>
        </a>
      </div>
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-16">
        <img
          src="/images/loyalty-discount.webp"
          className="reveal aspect-[4/2] w-full object-contain"
          alt="Loyalty discount"
        />
        <img
          src="/images/company-discount.webp"
          className="reveal aspect-[4/2] w-full object-contain"
          alt="Company discount"
        />
      </div>
    </section>
  );
}
