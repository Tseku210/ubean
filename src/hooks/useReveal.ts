import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waitForImages, collectImages } from "@/lib/waitForImages";

gsap.registerPlugin(ScrollTrigger);

export function useReveal() {
  const container = useRef<HTMLElement | null>(null);

  useGSAP(
    (_context, contextSafe) => {
      if (!container.current || !contextSafe) return;
      // Scoped explicitly: ScrollTrigger.batch(".reveal") would match every
      // .reveal in the document, duplicating triggers across components.
      const targets = gsap.utils.toArray<HTMLElement>(
        ".reveal",
        container.current,
      );
      if (targets.length === 0) return;

      // Checked once at mount; the reveal runs once, so live media-query
      // switching buys nothing here.
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(
        targets,
        prefersReduced ? { autoAlpha: 0 } : { autoAlpha: 0, y: 14 },
      );

      // Triggers are created after an await, outside useGSAP's synchronous
      // run — contextSafe keeps them owned by the context for cleanup.
      const createTriggers = contextSafe(() => {
        ScrollTrigger.batch(targets, {
          onEnter: (batch) => {
            gsap.to(
              batch,
              prefersReduced
                ? { autoAlpha: 1, duration: 0.3, ease: "power2.out" }
                : {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power3.out",
                  },
            );
          },
          start: "top 80%",
          once: true,
        });
        // Debounced form: the decode-gated callbacks across components would
        // otherwise each trigger a full refresh within the same ~1.5s window.
        ScrollTrigger.refresh(true);
      });

      // Reveal only once the images inside are decoded, so the entrance
      // never fades in an empty box.
      waitForImages(collectImages(targets)).then(createTriggers);
    },
    {
      scope: container,
    },
  );

  return {
    container: container,
  };
}
