import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function Cup() {
  const container = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".cup-image", {
          clipPath: "inset(100% 0% 0% 0%)",
          y: 16,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            once: true,
          },
        });
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="cup-section flex items-center justify-center md:translate-x-6"
    >
      <img
        className="cup-image"
        src="/images/cup.webp"
        alt="Ubean Cup"
        width={370}
      />
    </section>
  );
}
