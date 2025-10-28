import gsap from "gsap";
import { useMemo, useRef, type ReactNode } from "react";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import ScrollTrigger from "gsap/ScrollTrigger";
import Beans from "./Beans";
import Portofilters from "./Portofilters";
import RoastedBeans from "./RoastedBeans";
import Since from "./Since";
import type { Language, MotionPathConfig, SectionKey } from "@/types";
import { MOBILE_SVG_PATH, DESKTOP_SVG_PATH } from "@/consts";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useGSAP } from "@gsap/react";
import { pathEase } from "@/lib/pathEaseHelper";
import { cn } from "@/lib/utils";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

interface Props {
  lang: Language;
}

export default function MotionPath({ lang }: Props) {
  const { isPhone, isTablet, isDesktop } = useMediaQuery();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dropletRef = useRef<SVGPathElement>(null);
  const sectionRefs = useRef<Record<SectionKey, HTMLDivElement | null>>({
    aroma: null,
    beans: null,
    products: null,
    tools: null,
  });

  // useGSAP(() => {
  //   if (!dropletRef.current || !pathRef.current) return;
  //
  //   gsap.to(dropletRef.current, {
  //     ease: "none",
  //     scrollTrigger: {
  //       trigger: pathRef.current,
  //       start: "top center",
  //       end: () => "+=" + pathRef.current?.getBoundingClientRect().height,
  //       scrub: 1,
  //       // markers: true,
  //     },
  //     immediateRender: true,
  //     motionPath: {
  //       path: pathRef.current!,
  //       align: pathRef.current!,
  //       alignOrigin: [0.5, 0.5],
  //       // autoRotate: 270,
  //     },
  //   });
  // });

  const config = useMemo<MotionPathConfig>(() => {
    if (isDesktop) {
      return {
        width: "1021px",
        height: "3018px",
        containerClass: "relative mx-auto h-[calc(100%+320px)] max-w-6xl",
        svgClass: "overflow-visible",
        viewBox: "0 0 1021 3018",
        pathData: DESKTOP_SVG_PATH,
        dropletPathData:
          "M23 20.3755C23 26.7955 17.8513 32 11.5 32C5.14872 32 0 26.7955 0 20.3755C0 13.9555 11.5 0 11.5 0C11.5 0 23 13.9555 23 20.3755Z",
        sections: [
          {
            key: "beans",
            progress: 0.11,
            className: "absolute mx-auto w-full flex justify-center",
          },
          {
            key: "aroma",
            progress: 0.3,
            className: "absolute mx-auto flex w-full justify-center",
          },
          { key: "tools", progress: 0.5, className: "absolute w-full" },
          {
            key: "products",
            progress: 0.82,
            className: "absolute mx-auto w-full flex justify-center",
          },
        ],
        cupWrapperClass: "mt-8 w-full",
        scrollStart: "top center",
      };
    }
    if (isTablet) {
      return {
        width: "1021px",
        height: "3018px",
        containerClass: "relative mx-auto h-[calc(100%+320px)] max-w-6xl",
        svgClass: "overflow-visible",
        viewBox: "0 0 1021 3018",
        pathData: DESKTOP_SVG_PATH,
        dropletPathData:
          "M23 20.3755C23 26.7955 17.8513 32 11.5 32C5.14872 32 0 26.7955 0 20.3755C0 13.9555 11.5 0 11.5 0C11.5 0 23 13.9555 23 20.3755Z",
        sections: [
          {
            key: "beans",
            progress: 0.11,
            className: "absolute left-10",
          },
          {
            key: "aroma",
            progress: 0.3,
            className: "absolute mx-auto flex w-full justify-center inset-x-0",
          },
          {
            key: "tools",
            progress: 0.5,
            className: "absolute w-full left-0",
          },
          {
            key: "products",
            progress: 0.82,
            className: "absolute left-10",
          },
        ],
        cupWrapperClass: "mt-8 w-full",
        scrollStart: "top center",
      };
    }
    // mobile
    return {
      width: "361px",
      height: "2276px",
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
          className: "absolute mx-auto w-full px-4 flex justify-center",
        },
        {
          key: "aroma",
          progress: 0.33,
          className: "absolute mx-auto flex w-full justify-center",
        },
        { key: "tools", progress: 0.49, className: "absolute w-full" },
        {
          key: "products",
          progress: 0.8,
          className: "absolute mx-auto w-full px-4 flex justify-center",
        },
      ],
      cupWrapperClass: "mx-auto mt-5 w-[200px]",
      scrollStart: "top 60%",
    };
  }, [isDesktop, isTablet, isPhone]);

  const rawPath = useMemo(() => {
    return MotionPathPlugin.stringToRawPath(config.pathData);
  }, [config.pathData]);

  const sectionYByKey = useMemo(() => {
    const map = new Map<SectionKey, number>();
    if (rawPath) {
      for (const { key, progress } of config.sections) {
        const { y } = MotionPathPlugin.getPositionOnPath(rawPath, progress);
        map.set(key, y);
      }
    }
    return map;
  }, [rawPath, config.sections]);

  const sectionContent: Record<SectionKey, ReactNode> = useMemo(
    () => ({
      beans: <Beans lang={lang} />,
      aroma: <Portofilters />,
      tools: <RoastedBeans />,
      products: <Since lang={lang} />,
    }),
    [lang],
  );

  const px = (v: string) => parseInt(v, 10);

  return (
    <div
      id="wrapper"
      style={{ height: config.height }}
      className="relative w-full overflow-hidden px-0 md:px-10"
    >
      <svg
        ref={svgRef}
        width={px(config.width)}
        height={px(config.height)}
        viewBox={config.viewBox}
        fill="none"
        className={cn(`absolute top-0 left-1/2 -translate-x-1/2`)}
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
        {/* <g ref={dropletRef}> */}
        {/*   <path d={config.dropletPathData} fill="#97D5d0" /> */}
        {/* </g> */}
      </svg>

      {config.sections.map((section) => {
        const y = sectionYByKey.get(section.key) ?? 0;
        return (
          <div
            key={section.key}
            ref={(el) => {
              sectionRefs.current[section.key] = el;
            }}
            className={section.className}
            style={{ transform: `translateY(${y}px)` }}
          >
            {sectionContent[section.key]}
          </div>
        );
      })}
    </div>
  );
}
