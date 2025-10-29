import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function Portofilters() {
  const container = useRef<HTMLElement | null>(null);
  const bean = useRef<HTMLDivElement | null>(null);
  const butalsan = useRef<HTMLDivElement | null>(null);
  const latte = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const animate = () => {
        if (!bean.current || !butalsan.current || !latte.current) return;

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

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            end: "center 30%",
            scrub: true,
            invalidateOnRefresh: true,
            once: true,
            // markers: true,
          },
        });

        tl.to(
          bean.current,
          {
            x: 10,
            y: 0,
            rotation: 0,
            ease: "power2.out",
            onComplete: () => console.log("moved"),
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

      animate();

      // window.addEventListener("load", animate);
      // return () => {
      //   window.removeEventListener("load", animate);
      // };
    },
    {
      scope: container,
    },
  );

  return (
    <section ref={container} className="relative">
      <div className="flex w-fit items-center justify-center md:hidden">
        <img
          src="/images/portofilters.webp"
          className="w-full"
          alt="Portofilters"
        />
      </div>
      <div className="hidden w-full md:flex">
        <div ref={bean} className="size-fit">
          <img
            src="/images/bean-portofilter.webp"
            className="portofilter-bean mx-auto translate-x-10"
            alt="Beans inside a porto filter"
            width={264}
          />
        </div>
        <div ref={butalsan} className="size-fit">
          <img
            src="/images/butalsan-portofilter.webp"
            className="portofilter-butalsan"
            alt="Butalsan beans inside a porto filter"
            width={265}
          />
        </div>

        <div ref={latte} className="size-fit">
          <img
            src="/images/latte-portofilter.webp"
            className="portofilter-latte -translate-x-10"
            alt="Latte inside a porto filter"
            width={241}
          />
        </div>
      </div>
    </section>
  );
}
