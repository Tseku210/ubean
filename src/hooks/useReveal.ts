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

      gsap.set(targets, { autoAlpha: 0, y: 50 });

      // Triggers are created after an await, outside useGSAP's synchronous
      // run — contextSafe keeps them owned by the context for cleanup.
      const createTriggers = contextSafe(() => {
        ScrollTrigger.batch(targets, {
          onEnter: (batch) => {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              stagger: 0.1,
              ease: "back.out",
            });
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
