import gsap from "gsap";
import { useMemo, useRef, type ReactNode } from "react";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import ScrollTrigger from "gsap/ScrollTrigger";
import Beans from "./Beans";
import Portofilters from "./Portofilters";
import RoastedBeans from "./RoastedBeans";
import Since from "./Since";
import Cup from "./Cup";
import type { Language, MotionPathConfig, SectionKey } from "@/types";
import { MOBILE_SVG_PATH, DESKTOP_SVG_PATH } from "@/consts";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

interface Props {
  lang: Language;
}

export default function MotionPath({ lang }: Props) {
  const isDesktop = useIsDesktop();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dropletWrapRef = useRef<SVGGElement>(null);
  const dropletRef = useRef<SVGPathElement>(null);
  const sectionRefs = useRef<Record<SectionKey, HTMLDivElement | null>>({
    aroma: null,
    beans: null,
    products: null,
    tools: null,
  });

  const config = useMemo<MotionPathConfig>(() => {
    if (isDesktop) {
      return {
        containerClass: "relative mx-auto h-[calc(100%+320px)] max-w-6xl",
        svgClass: "overflow-visible",
        viewBox: "0 0 1021 3018",
        pathData: DESKTOP_SVG_PATH,
        dropletPathData:
          "M23 20.3755C23 26.7955 17.8513 32 11.5 32C5.14872 32 -3.34002e-06 26.7955 -3.34002e-06 20.3755C-3.34002e-06 13.9555 11.5 0 11.5 0C11.5 0 23 13.9555 23 20.3755Z",
        sections: [
          {
            key: "beans",
            progress: 0.12,
            className: "absolute right-0 mx-auto w-fit",
          },
          {
            key: "aroma",
            progress: 0.32,
            className: "absolute mx-auto flex w-full justify-center",
          },
          {
            key: "tools",
            progress: 0.54,
            className: "absolute w-full",
          },
          {
            key: "products",
            progress: 0.89,
            className: "absolute right-0 mx-auto w-fit",
          },
        ],
        cupWrapperClass: "mt-8 w-full",
        scrollStart: "top center",
      };
    }

    return {
      containerClass: "relative mx-auto h-[calc(100%+320px)] max-w-6xl",
      svgClass: "h-full w-full overflow-visible px-4",
      viewBox: "0 0 361 2276",
      pathData: MOBILE_SVG_PATH,
      dropletPathData:
        "M191 20.8286C191 26.4461 186.523 31 181 31C175.477 31 171 26.4461 171 20.8286C171 15.211 181 3 181 3C181 3 191 15.211 191 20.8286Z",
      sections: [
        {
          key: "beans",
          progress: 0.09,
          className: "absolute right-0 mx-auto w-fit px-4",
        },
        {
          key: "aroma",
          progress: 0.33,
          className: "absolute mx-auto flex w-full justify-center",
        },
        {
          key: "tools",
          progress: 0.49,
          className: "absolute w-full",
        },
        {
          key: "products",
          progress: 0.8,
          className: "absolute right-0 mx-auto w-full px-4",
        },
      ],
      cupWrapperClass: "mx-auto mt-5 w-[200px]",
      scrollStart: "top 60%",
    };
  }, [isDesktop]);

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const pathEl = pathRef.current;
      // const droplet = dropletRef.current;
      // const dropletWrapper = dropletWrapRef.current;

      if (!wrapper || !pathEl || !dropletWrapRef) return;

      // let rotateTo = gsap.quickTo(droplet, "rotation");
      // let prevDirection = 0;

      const repositionSections = () => {
        const rawPath = MotionPathPlugin.getRawPath(pathEl);
        MotionPathPlugin.cacheRawPathMeasurements(rawPath); // useful for performance but not sure for responsive design.

        config.sections.forEach(({ key, progress }) => {
          const element = sectionRefs.current[key];
          if (!element) return;

          const point = MotionPathPlugin.getPositionOnPath(rawPath, progress);
          gsap.set(element, { top: point.y });
        });
      };

      repositionSections();
      ScrollTrigger.refresh();
    },
    {
      scope: wrapperRef,
      dependencies: [config],
    },
  );

  const sectionContent: Record<SectionKey, ReactNode> = useMemo(
    () => ({
      beans: <Beans lang={lang} />,
      aroma: <Portofilters />,
      tools: <RoastedBeans />,
      products: <Since lang={lang} />,
    }),
    [lang],
  );

  return (
    <div id="wrapper" ref={wrapperRef} className={config.containerClass}>
      <svg
        width="100%"
        height="100%"
        viewBox={config.viewBox}
        fill="none"
        className={config.svgClass}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          id="pathEl"
          d={config.pathData}
          stroke="#97D5D0"
          strokeWidth={2}
          strokeDasharray="4 7"
        />
        {/* <g ref={dropletWrapRef} id="droplet-wrapper"> */}
        {/* <path ref={dropletRef} d={config.dropletPathData} fill="#97D5D0" /> */}
        {/* </g> */}
      </svg>

      {config.sections.map((section) => (
        <div
          key={section.key}
          ref={(element) => {
            sectionRefs.current[section.key] = element;
          }}
          className={section.className}
        >
          {sectionContent[section.key]}
        </div>
      ))}

      <div className={config.cupWrapperClass}>
        <Cup />
      </div>
    </div>
  );
}
