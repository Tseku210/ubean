import gsap from "gsap";
import { useMemo, useRef, type ReactNode } from "react";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import ScrollTrigger from "gsap/ScrollTrigger";
import Physics2DPlugin from "gsap/Physics2DPlugin";
import Beans from "./Beans";
import { CupBack, CupFront, CupSteam, CUP_LOCAL } from "./Cup";
import Portofilters from "./Portofilters";
import RoastedBeans from "./RoastedBeans";
import Since from "./Since";
import type { Language, MotionPathConfig, SectionKey } from "@/types";
import { MOBILE_SVG_PATH, DESKTOP_SVG_PATH } from "@/consts";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useGSAP } from "@gsap/react";
import { pathEase } from "@/lib/pathEaseHelper";
import { cn } from "@/lib/utils";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger, Physics2DPlugin);

interface Props {
  lang: Language;
}

export default function MotionPath({ lang }: Props) {
  const { isPhone, isTablet, isDesktop } = useMediaQuery();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const landingWrapRef = useRef<SVGGElement>(null);
  const dropletWrapperRef = useRef<SVGPathElement>(null);
  const dropletRef = useRef<SVGPathElement>(null);

  const config = useMemo<MotionPathConfig>(() => {
    if (isDesktop) {
      return {
        width: "1021px",
        height: "3520px",
        containerClass: "relative mx-auto h-[calc(100%+320px)] max-w-6xl",
        svgClass: "overflow-visible",
        viewBox: "0 0 1021 3520",
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
        scrollStart: "top center",
        // rim center 130 units under the path end (536, 3017); fall lands the
        // droplet on the coffee surface (local y 1928, i.e. cy - 7 * scale)
        cup: { scale: 1.25, cx: 536, cy: 3147, fall: 121 },
      };
    }
    if (isTablet) {
      return {
        width: "1021px",
        height: "3520px",
        containerClass: "relative mx-auto h-[calc(100%+320px)] max-w-6xl",
        svgClass: "overflow-visible",
        viewBox: "0 0 1021 3520",
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
        scrollStart: "top center",
        cup: { scale: 1.25, cx: 536, cy: 3147, fall: 121 },
      };
    }
    // mobile
    return {
      width: "361px",
      height: "2640px",
      containerClass: "relative mx-auto h-[calc(100%+320px)] max-w-6xl",
      svgClass: "h-full w-full overflow-visible px-4",
      viewBox: "0 0 361 2640",
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
      scrollStart: "top 20%",
      // rim center 105 units under the path end (180.5, 2276)
      cup: { scale: 0.8, cx: 180.5, cy: 2381, fall: 99 },
    };
  }, [isDesktop, isTablet, isPhone]);

  const rawPath = useMemo(() => {
    return MotionPathPlugin.stringToRawPath(config.pathData);
  }, [config.pathData, isTablet, isPhone, isDesktop]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (
          !dropletWrapperRef.current ||
          !dropletRef.current ||
          !pathRef.current
        )
          return;

        const rotateTo = gsap.quickTo(dropletRef.current, "rotation");
        const scaleYTo = gsap.quickTo(dropletRef.current, "scaleY", {
          duration: 0.4,
          ease: "back.out",
        });
        const setFill = gsap.quickSetter(dropletRef.current, "fill");
        const interpolateFill = gsap.utils.interpolate("#97D5D0", "#654321");
        let prevDirection = 0;

        gsap.set(dropletRef.current, {
          transformOrigin: "50% 65%",
        });

        // cup starts empty; the landing fills it
        gsap.set(".cup-coffee", { autoAlpha: 0 });

        const steamLoop = gsap.to(".cup-steam-drift", {
          y: -12,
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        });

        // the hero smoke's 7-frame sprite sheet, stepped at its 1s cadence
        const spriteLoop = gsap.timeline({ repeat: -1, paused: true });
        for (let i = 0; i < 7; i++) {
          spriteLoop.set(".cup-steam-sprite", { attr: { x: 225 - 150 * i } }, i / 7);
        }
        spriteLoop.to({}, { duration: 1 / 7 }, 6 / 7);

        const spawnSplash = () => {
          const layer = svgRef.current?.querySelector(".cup-splash");
          if (!layer) return;
          for (let i = 0; i < 4; i++) {
            const c = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle",
            );
            c.setAttribute("cx", String(CUP_LOCAL.cx));
            c.setAttribute("cy", String(CUP_LOCAL.surfaceY - 2));
            c.setAttribute("r", String(gsap.utils.random(2.5, 4.5)));
            c.setAttribute("fill", "#654321");
            layer.appendChild(c);
            gsap.to(c, {
              physics2D: {
                velocity: gsap.utils.random(110, 190),
                angle: gsap.utils.random(-115, -65),
                gravity: 900,
              },
              autoAlpha: 0,
              duration: 0.7,
              ease: "none",
              onComplete: () => c.remove(),
            });
          }
        };

        // time-based landing: the fall obeys gravity, not scroll speed
        const landing = gsap.timeline({
          paused: true,
          onReverseComplete: () => {
            steamLoop.pause(0);
            spriteLoop.pause(0);
          },
        });
        landing
          .to(landingWrapRef.current, {
            y: config.cup.fall,
            duration: 0.42,
            ease: "power2.in",
          })
          .to(
            dropletRef.current,
            { scaleY: 1.35, scaleX: 0.9, duration: 0.42, ease: "power1.in" },
            "<",
          )
          .to(
            ".cup-rim",
            {
              scaleY: 1.09,
              transformOrigin: "50% 50%",
              duration: 0.35,
              ease: "power1.out",
            },
            "<",
          )
          .addLabel("impact")
          .to(
            dropletRef.current,
            { scaleY: 0.5, scaleX: 1.45, duration: 0.1, ease: "power2.out" },
            "impact",
          )
          .to(
            landingWrapRef.current,
            { autoAlpha: 0, duration: 0.14 },
            "impact+=0.05",
          )
          .fromTo(
            ".cup-coffee",
            { autoAlpha: 0, scale: 0.5, transformOrigin: "50% 50%" },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.45,
              ease: "power2.out",
              immediateRender: false,
            },
            "impact",
          )
          .fromTo(
            ".cup-ripple-1",
            { scale: 0.25, autoAlpha: 0.8, transformOrigin: "50% 50%" },
            {
              scale: 1,
              autoAlpha: 0,
              duration: 0.8,
              ease: "power2.out",
              immediateRender: false,
            },
            "impact",
          )
          .fromTo(
            ".cup-ripple-2",
            { scale: 0.25, autoAlpha: 0.6, transformOrigin: "50% 50%" },
            {
              scale: 1.15,
              autoAlpha: 0,
              duration: 0.9,
              ease: "power2.out",
              immediateRender: false,
            },
            "impact+=0.15",
          )
          .add(() => {
            if (!landing.reversed()) spawnSplash();
          }, "impact")
          .to(
            ".cup-rim",
            { scaleY: 1, duration: 0.5, ease: "power2.out" },
            "impact+=0.1",
          )
          .fromTo(
            ".cup-steam",
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 0.55,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              immediateRender: false,
            },
            "impact+=0.45",
          )
          .add(() => {
            if (!landing.reversed()) {
              steamLoop.play();
              spriteLoop.play();
            }
          }, "impact+=0.45");

        const maybeLand = (instant: boolean) => {
          if (landing.isActive() || landing.progress() > 0) return;
          if (instant) {
            landing.progress(1);
            steamLoop.play();
            spriteLoop.play();
          } else {
            landing.play();
          }
        };

        gsap.to(dropletWrapperRef.current, {
          ease: pathEase(rawPath, { smooth: isPhone ? 50 : 20 }),
          scrollTrigger: {
            trigger: pathRef.current,
            start: config.scrollStart,
            end: () => "+=" + pathRef.current?.getBoundingClientRect().height,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const v = gsap.utils.clamp(0, 200, Math.abs(self.getVelocity()));
              scaleYTo(gsap.utils.mapRange(0, 200, 1, 1.5, v));
              setFill(interpolateFill(self.progress));

              if (prevDirection !== self.direction) {
                rotateTo(self.direction === 1 ? 0 : -180);
                prevDirection = self.direction;
              }
            },
            // fire the landing only once the scrub has visually caught up,
            // so the droplet is exactly at the path's end when it detaches
            onScrubComplete: (self) => {
              if (self.progress === 1) maybeLand(false);
            },
            // page loaded/refreshed already past the end: coffee is simply there
            onRefresh: (self) => {
              if (self.progress === 1) maybeLand(true);
            },
            onEnterBack: () => {
              if (landing.progress() > 0) landing.reverse();
            },
          },
          immediateRender: true,
          motionPath: {
            path: pathRef.current!,
            align: pathRef.current!,
            alignOrigin: [0.5, 0.5],
            autoRotate: 270,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(dropletWrapperRef.current, { autoAlpha: 0 });
        // static payoff: the cup is simply full, steam shown without motion
        gsap.set(".cup-steam", { autoAlpha: 0.55 });
      });
    },
    {
      dependencies: [rawPath, isPhone],
      revertOnUpdate: true,
      scope: svgRef,
    },
  );

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
      className="relative mb-10 w-full px-0 md:px-10"
    >
      <svg
        ref={svgRef}
        width={px(config.width)}
        height={px(config.height)}
        viewBox={config.viewBox}
        fill="transparent"
        className={cn(
          `absolute top-0 left-1/2 -translate-x-1/2 overflow-visible`,
        )}
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
        <g
          transform={`translate(${config.cup.cx} ${config.cup.cy}) scale(${config.cup.scale})`}
        >
          <g transform={`translate(${-CUP_LOCAL.cx} ${-CUP_LOCAL.rimY})`}>
            <CupBack />
          </g>
        </g>
        <g ref={landingWrapRef}>
          <g ref={dropletWrapperRef}>
            <g>
              <path
                ref={dropletRef}
                className="origin-[50%_65%]"
                d={config.dropletPathData}
                fill="#97D5d0"
              />
            </g>
          </g>
        </g>
        <g
          transform={`translate(${config.cup.cx} ${config.cup.cy}) scale(${config.cup.scale})`}
        >
          <g transform={`translate(${-CUP_LOCAL.cx} ${-CUP_LOCAL.rimY})`}>
            <CupFront />
            <CupSteam />
          </g>
        </g>
      </svg>

      {config.sections.map((section) => {
        const y = sectionYByKey.get(section.key) ?? 0;
        return (
          <div
            key={section.key}
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
