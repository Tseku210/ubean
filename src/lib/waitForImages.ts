/**
 * Resolves once every given image is decoded (or after `timeoutMs`, so a slow
 * network can only delay a reveal, never suppress it). Decode failures are
 * swallowed — a broken image should not block an entrance animation. Lazy
 * images are excluded: decode() never settles for a lazy image outside the
 * browser's load threshold, so gating on one would always hit the timeout.
 */
export function waitForImages(
  images: HTMLImageElement[],
  timeoutMs = 1500,
): Promise<void> {
  const pendingDecodes = images
    .filter((img) => !img.complete && img.loading !== "lazy")
    .map((img) => img.decode().catch(() => {}));

  if (pendingDecodes.length === 0) return Promise.resolve();

  return Promise.race([
    Promise.all(pendingDecodes).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

/** All <img> elements inside (or being) the given elements. */
export function collectImages(elements: Element[]): HTMLImageElement[] {
  return elements.flatMap((element) => [
    ...(element instanceof HTMLImageElement ? [element] : []),
    ...Array.from(element.querySelectorAll("img")),
  ]);
}
