import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { waitForImages } from "@/lib/waitForImages";

gsap.registerPlugin(ScrollTrigger);

export default function Portofilters() {
  const container = useRef<HTMLElement | null>(null);
  const bean = useRef<HTMLDivElement | null>(null);
  const butalsan = useRef<HTMLDivElement | null>(null);
  const latte = useRef<HTMLDivElement | null>(null);

  useGSAP(
    (_context, contextSafe) => {
      if (!contextSafe) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!bean.current || !butalsan.current || !latte.current) return;

        // Offsets are applied synchronously (before first paint) so the
        // images never flash at their final positions while the decode gate
        // below is pending.
        gsap.set(bean.current, {
          x: -200,
          y: 200,
          rotation: -45,
        });

        gsap.set(butalsan.current, {
          y: 200,
        });

        gsap.set(latte.current, {
          x: 200,
          y: 200,
          rotation: 45,
        });

        const animate = () => {
          // The convergence scrubs forward only: on first reaching the end
          // the trigger is retired, so scrolling back up never pulls the
          // filters apart again. self.animation (not the tl closure) because
          // onRefresh can fire during creation, before `tl` is assigned.
          let converged = false;
          const retireWhenDone = (self: ScrollTrigger) => {
            if (converged || self.progress < 1) return;
            converged = true;
            gsap.delayedCall(0, () => {
              self.animation?.progress(1);
              self.kill(false);
            });
          };

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container.current,
              start: "top 80%",
              end: "center 30%",
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: retireWhenDone,
              // page loaded/refreshed already past the section: settled state
              onRefresh: retireWhenDone,
            },
          });

          tl.to(
            bean.current,
            {
              x: 10,
              y: 0,
              rotation: 0,
              ease: "power2.out",
            },
            0,
          );
          tl.to(
            butalsan.current,
            {
              y: 0,
              ease: "power2.out",
            },
            0,
          );
          tl.to(
            latte.current,
            {
              x: -20,
              y: 0,
              rotation: 0,
              ease: "power2.out",
            },
            0,
          );
        };

        // Build the scroll timeline only after the portofilter images are
        // decoded, then refresh (debounced form) so trigger positions use
        // final layout heights.
        const startAnimation = contextSafe(() => {
          animate();
          ScrollTrigger.refresh(true);
        });
        const images = container.current
          ? Array.from(container.current.querySelectorAll("img"))
          : [];
        waitForImages(images).then(startAnimation);
      });
    },
    {
      scope: container,
    },
  );

  return (
    <section ref={container} className="relative">
      {/* Capped below md: the section sits at a fixed y on the motion path,
          so a full-width image at 640–767px grows tall enough to overlap the
          RoastedBeans section pinned below it. */}
      <div className="mx-auto flex w-fit max-w-md items-center justify-center md:hidden">
        <img
          src="/images/portofilters.webp"
          className="w-full"
          alt="Portofilters"
          width={1200}
          height={718}
        />
      </div>
      <div className="hidden w-full md:flex">
        <div ref={bean} className="size-fit">
          <img
            src="/images/bean-portofilter.webp"
            className="portofilter-bean mx-auto translate-x-10"
            alt="Beans inside a porto filter"
            width={264}
            height={460}
          />
        </div>
        <div ref={butalsan} className="size-fit">
          <img
            src="/images/butalsan-portofilter.webp"
            className="portofilter-butalsan"
            alt="Butalsan beans inside a porto filter"
            width={265}
            height={460}
          />
        </div>

        <div ref={latte} className="size-fit">
          <img
            src="/images/latte-portofilter.webp"
            className="portofilter-latte -translate-x-10"
            alt="Latte inside a porto filter"
            width={241}
            height={459}
          />
        </div>
      </div>
    </section>
  );
}
