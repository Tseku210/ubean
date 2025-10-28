import { useState, useEffect } from "react";

export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 501px)");
    const handler = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mediaQuery.addEventListener("change", handler);
    setIsDesktop(mediaQuery.matches);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isDesktop;
};
