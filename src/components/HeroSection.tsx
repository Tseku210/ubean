import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Zap } from "lucide-react";

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tl = gsap.timeline();

    // Animate elements on load
    tl.from(iconRef.current, {
      scale: 0,
      rotation: 180,
      duration: 1,
      ease: "back.out(1.7)",
    })
      .from(
        titleRef.current,
        {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.5",
      )
      .from(
        subtitleRef.current,
        {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.7",
      );

    // Floating animation for the icon
    gsap.to(iconRef.current, {
      y: -10,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="hero-section relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 17, 0.7), rgba(0, 0, 17, 0.7)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="%23000011"/><circle cx="200" cy="200" r="3" fill="%23484848" opacity="0.3"/><circle cx="800" cy="150" r="2" fill="%23484848" opacity="0.2"/><circle cx="1500" cy="300" r="4" fill="%23484848" opacity="0.3"/><circle cx="400" cy="600" r="2" fill="%23484848" opacity="0.2"/><circle cx="1200" cy="800" r="3" fill="%23484848" opacity="0.3"/></svg>')`,
        }}
      />

      {/* Coffee beans pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 h-12 w-8 rotate-12 transform rounded-full bg-amber-600"></div>
        <div className="absolute top-40 right-32 h-10 w-6 -rotate-45 transform rounded-full bg-amber-700"></div>
        <div className="absolute bottom-32 left-1/4 h-14 w-10 rotate-12 transform rounded-full bg-amber-800"></div>
        <div className="absolute right-20 bottom-20 h-11 w-7 -rotate-30 transform rounded-full bg-amber-600"></div>
        <div className="absolute top-1/2 left-16 h-8 w-5 rotate-45 transform rounded-full bg-amber-700"></div>
        <div className="absolute top-1/3 right-16 h-13 w-9 -rotate-12 transform rounded-full bg-amber-800"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-4xl px-4 text-center text-white sm:px-6 lg:px-8">
        {/* Animated Icon */}
        <div ref={iconRef} className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#97D5D0]">
            <Zap size={32} className="text-white" />
          </div>
        </div>

        {/* Main Title */}
        <h1
          ref={titleRef}
          className="font-roboto mb-6 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl"
        >
          UNBLEMISHED BEANS
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-200 sm:text-xl lg:text-2xl"
        >
          Enjoy your coffee-caffeine experience with exceptional quality,
          unwavering excellence, integrity, and meaningful connections.
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-bounce">
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-[#97D5D0]">
            <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-[#97D5D0]"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
