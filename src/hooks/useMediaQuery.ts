import { useEffect, useState } from "react";

export const useMediaQuery = () => {
  // Aligned with Tailwind's md (768px) and lg (1024px) breakpoints: the
  // MotionPath config and the components' md:/lg: classes must switch
  // together, or path layout and section layout disagree (e.g. 641–767px
  // used to pair the desktop path with mobile section markup).
  const getMatches = () => ({
    isPhone: window.matchMedia("(max-width: 767px)").matches,
    isTablet: window.matchMedia("(min-width: 768px) and (max-width: 1023px)")
      .matches,
    isDesktop: window.matchMedia("(min-width: 1024px)").matches,
  });

  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return { isPhone: false, isTablet: false, isDesktop: true };
    }
    return getMatches();
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleChange = () => setMatches(getMatches());

    const phone = window.matchMedia("(max-width: 767px)");
    const tablet = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)",
    );
    const desktop = window.matchMedia("(min-width: 1024px)");

    phone.addEventListener("change", handleChange);
    tablet.addEventListener("change", handleChange);
    desktop.addEventListener("change", handleChange);

    return () => {
      phone.removeEventListener("change", handleChange);
      tablet.removeEventListener("change", handleChange);
      desktop.removeEventListener("change", handleChange);
    };
  }, []);

  return matches;
};
