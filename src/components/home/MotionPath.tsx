import gsap from "gsap";
import { useMemo, useRef, type ReactNode } from "react";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import ScrollTrigger from "gsap/ScrollTrigger";
import Beans from "./Beans";
import {
  CupBack,
  CupFront,
  CupSteam,
  CUP_FLUID_VISIBLE_D,
  CUP_LOCAL,
  createCupPainter,
} from "./Cup";
import Portofilters from "./Portofilters";
import RoastedBeans from "./RoastedBeans";
import Since from "./Since";
import type { Language, MotionPathConfig, SectionKey } from "@/types";
import { MOBILE_SVG_PATH, DESKTOP_SVG_PATH } from "@/consts";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useGSAP } from "@gsap/react";
import { pathEase } from "@/lib/pathEaseHelper";
import { cn } from "@/lib/utils";
import {
  CUP_SEQUENCE_SECONDS,
  CUP_SETTLED,
  CUP_STEAM,
  cupFrameAt,
} from "@/lib/cupImpact";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

interface Props {
  lang: Language;
}

// the droplet steps one roast darker each time it passes a station
// (STAGE_COLORS[i] applies once sections[i - 1] is behind it); the last
// entry must match the cup coffee (#654321) so the landing reads seamless
const STAGE_COLORS = ["#97D5D0", "#C08552", "#8B5E3C", "#6F4E37", "#654321"];

export default function MotionPath({ lang }: Props) {
  const { isPhone, isTablet, isDesktop } = useMediaQuery();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const landingClipRef = useRef<SVGGElement>(null);
  const landingWrapRef = useRef<SVGGElement>(null);
  const dropletWrapperRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGGElement>(null);
  const dropletRef = useRef<SVGPathElement>(null);
  const satelliteRef = useRef<SVGPathElement>(null);

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
        // droplet's center of mass just inside the opening (local y 1956)
        cup: { scale: 1.1, cx: 536, cy: 3147, fall: 148 },
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
        cup: { scale: 1.1, cx: 536, cy: 3147, fall: 148 },
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
      cup: { scale: 0.72, cx: 180.5, cy: 2381, fall: 116 },
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
          !satelliteRef.current ||
          !landingWrapRef.current ||
          !landingClipRef.current ||
          !svgRef.current ||
          !pathRef.current ||
          !pulseRef.current
        )
          return;

        const dropletEl = dropletRef.current;
        const satelliteEl = satelliteRef.current;
        const landingClip = landingClipRef.current;
        const rotateTo = gsap.quickTo(dropletEl, "rotation", {
          duration: 0.45,
          ease: "power3.out",
        });
        const scaleYTo = gsap.quickTo(dropletEl, "scaleY", {
          duration: 0.4,
          ease: "back.out",
        });
        const scaleXTo = gsap.quickTo(dropletEl, "scaleX", {
          duration: 0.4,
          ease: "back.out",
        });
        let prevDirection = 0;

        // whenever scrolling pauses, the droplet eases back to its resting
        // teardrop instead of freezing mid-stretch (back.out gives the
        // return a soft jelly settle)
        const settle = gsap
          .delayedCall(0.18, () => {
            if (!landed) {
              scaleYTo(1);
              scaleXTo(1);
            }
          })
          .pause();

        gsap.set([dropletEl, satelliteEl], {
          transformOrigin: "50% 65%",
        });
        gsap.set(landingWrapRef.current, { y: 0 });
        gsap.set(pulseRef.current, { transformOrigin: "50% 50%" });

        // cup starts empty; every fluid frame comes from cupFrameAt
        const paintCup = createCupPainter(svgRef.current);
        paintCup(cupFrameAt(0));

        const steamLoop = gsap.fromTo(
          ".cup-steam-drift",
          { x: -2.5 },
          {
            x: 2.5,
            duration: 1.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true,
          },
        );

        // the hero smoke's 7-frame sprite sheet, stepped at its 1s cadence
        const spriteLoop = gsap.timeline({ repeat: -1, paused: true });
        for (let i = 0; i < 7; i++) {
          spriteLoop.set(".cup-steam-sprite", { attr: { x: 225 - 150 * i } }, i / 7);
        }
        spriteLoop.to({}, { duration: 1 / 7 }, 6 / 7);

        const stageStops = config.sections.map((s) => s.progress);
        let stage = 0;
        const setStage = (next: number) => {
          if (next === stage) return;
          stage = next;
          gsap.to(dropletEl, {
            fill: STAGE_COLORS[next],
            duration: 0.25,
            overwrite: "auto",
          });
          gsap.fromTo(
            pulseRef.current,
            { scale: 1 },
            {
              scale: 1.16,
              duration: 0.14,
              yoyo: true,
              repeat: 1,
              ease: "sine.out",
              overwrite: true,
            },
          );
        };

        const trail = { p: 0 };

        let steaming = false;
        const startSteam = () => {
          if (steaming) return;
          steaming = true;
          // enter the sway at its midpoint so the steam doesn't jump sideways
          steamLoop.time(0.8).play();
          spriteLoop.play();
        };

        const setWrapY = gsap.quickSetter(landingWrapRef.current, "y", "px");
        const setDropScaleX = gsap.quickSetter(dropletEl, "scaleX");
        const setDropScaleY = gsap.quickSetter(dropletEl, "scaleY");
        const setDropOpacity = gsap.quickSetter(dropletEl, "opacity");
        const setSatelliteY = gsap.quickSetter(satelliteEl, "y", "px");
        const setSatelliteScaleX = gsap.quickSetter(satelliteEl, "scaleX");
        const setSatelliteScaleY = gsap.quickSetter(satelliteEl, "scaleY");
        const setSatelliteOpacity = gsap.quickSetter(satelliteEl, "opacity");

        const sequence = { t: 0 };
        const paintSequence = () => {
          const frame = cupFrameAt(sequence.t);
          paintCup(frame);
          setWrapY(frame.drop.travel * config.cup.fall);
          setDropScaleX(frame.drop.scaleX);
          setDropScaleY(frame.drop.scaleY);
          setDropOpacity(frame.drop.opacity);
          if (frame.satellite) {
            // the satellite rides inside the drop's wrapper, so its offset is
            // relative to the drop
            setSatelliteY(
              (frame.satellite.travel - frame.drop.travel) * config.cup.fall,
            );
            setSatelliteScaleX(frame.satellite.scaleX);
            setSatelliteScaleY(frame.satellite.scaleY);
          }
          setSatelliteOpacity(frame.satellite ? 1 : 0);
        };

        // one-shot sequence: hang, free fall, impact, fill, splash, steam
        const impactTl = gsap.timeline({ paused: true });
        impactTl
          .to(
            sequence,
            {
              t: CUP_SEQUENCE_SECONDS,
              duration: CUP_SEQUENCE_SECONDS,
              ease: "none",
              onUpdate: paintSequence,
            },
            0,
          )
          .fromTo(
            ".cup-steam",
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 0.55,
              y: 0,
              duration: CUP_STEAM.duration,
              ease: "power2.out",
              immediateRender: false,
            },
            CUP_STEAM.at,
          )
          .add(startSteam, CUP_STEAM.at);

        // the drop plays exactly once; once released the scrub is retired so
        // scrolling back up never rewinds the droplet
        let landed = false;
        const finishJourney = () => {
          journey.progress(1);
          journey.scrollTrigger?.kill(false);
        };

        // page loaded/refreshed already past the end: coffee is simply there
        const landInstantly = () => {
          if (landed) return;
          landed = true;
          finishJourney();
          impactTl.progress(1);
          paintSequence();
          startSteam();
        };

        // nearing the path's end the scrub hands off to a one-shot sequence:
        // glide to the endpoint (eased out, no dead stop), relax to the
        // resting teardrop, then hand over to the impact timeline
        const releaseOnce = () => {
          if (landed) return;
          landed = true;
          gsap.delayedCall(0, () => {
            journey.scrollTrigger?.kill(false);
            settle.kill();
            gsap.killTweensOf(journey);
            gsap.killTweensOf(dropletEl, "scaleX,scaleY");
            landingClip.setAttribute("clip-path", "url(#cup-drop-clip)");
            gsap
              .timeline()
              .to(journey, { progress: 1, duration: 0.35, ease: "power1.out" }, 0)
              .to(
                dropletEl,
                { scaleX: 1, scaleY: 1, duration: 0.3, ease: "power2.out" },
                0,
              )
              .add(() => impactTl.play(), 0.35);
          });
        };

        const pathUnitsH = pathRef.current.getBBox().height;
        const journeyEase = pathEase(rawPath, { smooth: isPhone ? 50 : 20 });
        const journey = gsap.timeline({
          scrollTrigger: {
            trigger: pathRef.current,
            start: config.scrollStart,
            end: () =>
              "+=" +
              Math.round(pathRef.current?.getBoundingClientRect().height ?? 0),
            scrub: isPhone ? 0.5 : 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (landed) return;
              // close enough to the end: hand the last stretch to the release
              // sequence so the droplet never idles just short of the payoff
              if (self.progress > 0.985) {
                releaseOnce();
                return;
              }
              const v = gsap.utils.clamp(0, 200, Math.abs(self.getVelocity()));
              // volume-conserving stretch: what scaleY gains, scaleX gives back
              const sy = gsap.utils.mapRange(0, 200, 1, 1.5, v);
              scaleYTo(sy);
              scaleXTo(1 / Math.sqrt(sy));
              settle.restart(true);
              // flip only on a deliberate reversal; scroll jitter is ignored
              if (prevDirection !== self.direction && v > 25) {
                rotateTo(self.direction === 1 ? 0 : -180);
                prevDirection = self.direction;
              }
            },
            onRefresh: (self) => {
              if (self.progress === 1) landInstantly();
            },
          },
        });
        journey
          .to(
            dropletWrapperRef.current,
            {
              ease: journeyEase,
              immediateRender: true,
              motionPath: {
                path: pathRef.current!,
                align: pathRef.current!,
                alignOrigin: [0.5, 0.5],
                autoRotate: 270,
              },
              duration: pathUnitsH,
            },
            0,
          )
          // same ease + duration as the motionPath tween, so trail.p is the
          // droplet's exact fraction of path length: it drives the station
          // color steps and the pendant-drop hang
          .to(
            trail,
            {
              p: 1,
              ease: journeyEase,
              duration: pathUnitsH,
              onUpdate: () => {
                let s = 0;
                while (s < stageStops.length && trail.p >= stageStops[s]) s++;
                setStage(s);
              },
            },
            0,
          )
          .call(releaseOnce);

        // raw attributes aren't part of GSAP's revert: restore the full cup
        // so a switch to reduced motion never leaves it empty
        return () => {
          paintCup(CUP_SETTLED);
          landingClip.removeAttribute("clip-path");
        };
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
      tools: <RoastedBeans lang={lang} />,
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
        <clipPath id="cup-drop-clip">
          <path
            d={CUP_FLUID_VISIBLE_D}
            transform={`translate(${config.cup.cx} ${config.cup.cy}) scale(${config.cup.scale}) translate(${-CUP_LOCAL.cx} ${-CUP_LOCAL.rimY})`}
          />
        </clipPath>
        <g ref={landingClipRef}>
          <g ref={landingWrapRef}>
            <g ref={dropletWrapperRef}>
              <g ref={pulseRef}>
                <path
                  ref={dropletRef}
                  className="origin-[50%_65%]"
                  d={config.dropletPathData}
                  fill="#97D5d0"
                />
                {/* the neck's leftover bead, following the drop a beat later */}
                <path
                  ref={satelliteRef}
                  d={config.dropletPathData}
                  fill="#654321"
                  opacity={0}
                />
              </g>
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
