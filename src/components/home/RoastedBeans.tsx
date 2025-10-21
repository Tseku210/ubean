import gsap from "gsap";
import { BEANS } from "@/consts";
import { formatPrice } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function RoastedBeans() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(container);
      const cards = q(".bean-card");

      gsap.set(cards, {
        y: 50,
        autoAlpha: 0,
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            // markers: true,
            once: true,
          },
        })
        .to(cards, {
          y: 0,
          autoAlpha: 1,
          ease: "back.out",
          stagger: 0.1,
        });
    },
    {
      scope: container,
    },
  );

  return (
    <section className="relative w-full space-y-15 overflow-visible text-center">
      <h2 className="text-h5 md:text-h2">FRESHLY ROASTED BEANS</h2>
      <div
        ref={container}
        className="no-scrollbar flex snap-x gap-8 overflow-x-auto overflow-y-hidden md:mx-auto md:grid md:w-full md:grid-cols-5 md:gap-8"
      >
        {BEANS.map((bean, index) => (
          <div
            key={bean.name}
            className={`animate bean-card group relative min-w-[210px] snap-start space-y-4 bean-item-${index}`}
          >
            <div className="shadow-card absolute bottom-0 -z-10 m-0 h-3/5 w-full rounded-4xl bg-white" />
            <div className="bean-image-container transition-transform ease-in-out group-hover:-translate-y-2 group-hover:-rotate-2">
              <img
                src={`/images/${bean.image}`}
                alt={`${bean.name} coffee beans`}
                width={264}
                height={264}
              />
            </div>

            <div className="space-y-2 px-6 pb-7 text-left">
              <h3 className="text-h6">{bean.name}</h3>
              <p className="text-b3">{bean.description}</p>

              <div className="mt-4 space-y-1">
                <div className="price-row flex items-center gap-2">
                  <span className="text-h6">{formatPrice(bean.price250)}</span>
                  <span className="text-b4 text-gray1">250g</span>
                </div>
                <div className="price-row flex items-center gap-2">
                  <span className="text-h6">{formatPrice(bean.price500)}</span>
                  <span className="text-b4 text-gray1">500g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
