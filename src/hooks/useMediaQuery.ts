import { useEffect, useState } from "react";

export const useMediaQuery = () => {
  const getMatches = () => ({
    isPhone: window.matchMedia("(max-width: 640px)").matches,
    isTablet: window.matchMedia("(min-width: 641px) and (max-width: 1024px)")
      .matches,
    isDesktop: window.matchMedia("(min-width: 1025px)").matches,
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

    const phone = window.matchMedia("(max-width: 640px)");
    const tablet = window.matchMedia(
      "(min-width: 641px) and (max-width: 1024px)",
    );
    const desktop = window.matchMedia("(min-width: 1025px)");

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
