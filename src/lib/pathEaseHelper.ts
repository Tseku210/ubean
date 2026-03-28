import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { gsap } from "gsap";

/**
 * Helper function that returns an ease that bends time to ensure the target moves on the y axis in a relatively steady fashion
 * @param path - The path to ease
 * @param config - The configuration for the ease
 * @returns The ease function
 */
export function pathEase(
  path: any,
  config: {
    axis?: string;
    precision?: number;
    smooth?: boolean | number;
  } = {},
) {
  let axis = config.axis || "y",
    precision = config.precision || 1,
    rawPath = MotionPathPlugin.cacheRawPathMeasurements(
      MotionPathPlugin.getRawPath(gsap.utils.toArray(path)[0] as any),
      Math.round(precision * 12),
    ),
    useX = axis === "x",
    start = (rawPath[0] as any)[useX ? 0 : 1],
    end = (rawPath[rawPath.length - 1] as any)[
      (rawPath[rawPath.length - 1] as any).length - (useX ? 2 : 1)
    ],
    range = end - start,
    l = Math.round(precision * 200),
    inc = 1 / l,
    positions = [0],
    a = [0],
    minIndex = 0,
    smooth = [0],
    minChange = (1 / l) * 0.6,
    smoothRange =
      config.smooth === true ? 7 : Math.round(config.smooth as number) || 0,
    fullSmoothRange = smoothRange * 2,
    getClosest = (p: number) => {
      while (positions[minIndex] <= p && minIndex++ < l) {}
      a.push(
        ((p - positions[minIndex - 1]) /
          (positions[minIndex] - positions[minIndex - 1])) *
          inc +
          minIndex * inc,
      );
      smoothRange &&
        a.length > smoothRange &&
        a[a.length - 1] - a[a.length - 2] < minChange &&
        smooth.push(a.length - smoothRange);
    },
    i = 1;

  for (; i < l; i++) {
    positions[i] =
      ((MotionPathPlugin.getPositionOnPath(rawPath, i / l) as any)[axis] -
        start) /
      range;
  }
  positions[l] = 1;
  for (i = 0; i < l; i++) {
    getClosest(i / l);
  }
  a.push(1); // must end at 1.

  if (smoothRange) {
    smooth.push(l - fullSmoothRange + 1);
    smooth.forEach((i) => {
      let start = a[i],
        j = Math.min(i + fullSmoothRange, l),
        inc = (a[j] - start) / (j - i),
        c = 1;
      i++;
      for (; i < j; i++) {
        a[i] = start + inc * c++;
      }
    });
  }
  l = a.length - 1;
  return (p: number) => {
    let i = p * l,
      s = a[i | 0];
    return i ? s + (a[Math.ceil(i)] - s) * (i % 1) : 0;
  };
}
