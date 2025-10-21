import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useReveal() {
  const container = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      gsap.set(".reveal", { autoAlpha: 0, y: 50 });
      ScrollTrigger.batch(".reveal", {
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.1,
            ease: "back.out",
            markers: true,
          });
        },
        start: "top 80%",
        once: true,
      });
    },
    {
      scope: container,
    },
  );

  return {
    container: container,
  };
}
