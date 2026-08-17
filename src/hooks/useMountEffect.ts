import { useEffect } from "react";

/** One-time external sync on mount — the explicit escape hatch for effects. */
export function useMountEffect(effect: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
