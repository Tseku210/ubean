import { useTranslations } from "@/i18n/utils";
import Hero from "./Hero";
import MotionPath from "./MotionPath";
import Discount from "./Discount";
import type { Language } from "@/types";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, MotionPathPlugin);

interface Props {
  lang: Language;
}

export default function HomePage({ lang }: Props) {
  const t = useTranslations(lang);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const smoother = ScrollSmoother.create({ smooth: 1 });
      return () => smoother.kill();
    });
  });

  return (
    <main className="relative overflow-hidden">
      <Hero lang={lang} />
      <MotionPath lang={lang} />
      <h2 className="text-h5 md:text-h2 mx-auto my-8 max-w-4xl px-6 text-center uppercase md:my-30 md:px-0">
        {t("home.title2")}
      </h2>
      <Discount lang={lang} />
    </main>
  );
}
