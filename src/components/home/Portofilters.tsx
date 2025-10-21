import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function Portofilters() {
  const container = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(container);

      gsap.set(q(".portofilter-bean"), {
        x: -200,
        y: 200,
        rotation: -45,
      });

      gsap.set(q(".portofilter-butalsan"), {
        y: 200,
      });

      gsap.set(q(".portofilter-latte"), {
        x: 200,
        y: 200,
        rotation: 45,
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            end: "center 30%",
            scrub: true,
          },
        })
        .to(
          q(".portofilter-bean"),
          {
            x: 10,
            y: 0,
            rotation: 0,
            ease: "power2.out",
          },
          0,
        )
        .to(
          q(".portofilter-butalsan"),
          {
            y: 0,
            ease: "power2.out",
          },
          0,
        )
        .to(
          q(".portofilter-latte"),
          {
            x: -20,
            y: 0,
            rotation: 0,
            ease: "power2.out",
          },
          0,
        );
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
        <img
          src="/images/bean-portofilter.webp"
          className="portofilter-bean mx-auto translate-x-10"
          alt="Beans inside a porto filter"
          width={264}
        />
        <img
          src="/images/butalsan-portofilter.webp"
          className="portofilter-butalsan"
          alt="Butalsan beans inside a porto filter"
          width={265}
        />
        <img
          src="/images/latte-portofilter.webp"
          className="portofilter-latte -translate-x-10"
          alt="Latte inside a porto filter"
          width={241}
        />
      </div>
    </section>
  );
}
