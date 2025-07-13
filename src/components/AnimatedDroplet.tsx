import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const AnimatedDroplet = () => {
  const dropletRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !dropletRef.current) return;

    const droplet = dropletRef.current;
    const path = pathRef.current;

    if (!path) return;

    // Get the path length
    const pathLength = path.getTotalLength();

    // Create the scroll-triggered animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom center",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const point = path.getPointAtLength(progress * pathLength);

          gsap.set(droplet, {
            x: point.x,
            y: point.y,
            rotation: progress * 360,
          });
        },
      },
    });

    // Initial position
    const startPoint = path.getPointAtLength(0);
    gsap.set(droplet, {
      x: startPoint.x,
      y: startPoint.y,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Hidden SVG path for animation */}
      <svg
        className="absolute inset-0 h-full w-full opacity-0"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          ref={pathRef}
          d="M100 200 Q400 100 800 300 T1500 600 Q1700 800 1600 1000"
          fill="none"
          stroke="none"
        />
      </svg>

      {/* Animated droplet */}
      <div
        ref={dropletRef}
        className="absolute h-8 w-6 bg-[#97D5D0] opacity-80"
        style={{
          clipPath: "polygon(50% 0%, 80% 90%, 50% 100%, 20% 90%)",
          filter: "drop-shadow(0 4px 8px rgba(151, 213, 208, 0.3))",
        }}
      />

      {/* Additional droplets for effect */}
      <div
        className="absolute top-1/4 left-1/4 h-4 w-3 animate-bounce bg-[#97D5D0] opacity-60"
        style={{
          clipPath: "polygon(50% 0%, 80% 90%, 50% 100%, 20% 90%)",
          animationDelay: "1s",
        }}
      />

      <div
        className="absolute top-2/3 right-1/3 h-5 w-4 animate-bounce bg-[#97D5D0] opacity-50"
        style={{
          clipPath: "polygon(50% 0%, 80% 90%, 50% 100%, 20% 90%)",
          animationDelay: "2s",
        }}
      />
    </div>
  );
};

export default AnimatedDroplet;
