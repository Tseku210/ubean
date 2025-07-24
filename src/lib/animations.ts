/**
 * Animation utilities and constants following the animation guidelines
 */

// Easing curves as JavaScript objects for GSAP
export const easingCurves = {
  // Ease-in curves (avoid unless necessary)
  easeInQuad: 'cubic-bezier(.55, .085, .68, .53)',
  easeInCubic: 'cubic-bezier(.550, .055, .675, .19)',
  easeInQuart: 'cubic-bezier(.895, .03, .685, .22)',
  easeInQuint: 'cubic-bezier(.755, .05, .855, .06)',
  easeInExpo: 'cubic-bezier(.95, .05, .795, .035)',
  easeInCirc: 'cubic-bezier(.6, .04, .98, .335)',

  // Ease-out curves (best for entrances and user interactions)
  easeOutQuad: 'cubic-bezier(.25, .46, .45, .94)',
  easeOutCubic: 'cubic-bezier(.215, .61, .355, 1)',
  easeOutQuart: 'cubic-bezier(.165, .84, .44, 1)',
  easeOutQuint: 'cubic-bezier(.23, 1, .32, 1)',
  easeOutExpo: 'cubic-bezier(.19, 1, .22, 1)',
  easeOutCirc: 'cubic-bezier(.075, .82, .165, 1)',

  // Ease-in-out curves (smooth for elements moving within screen)
  easeInOutQuad: 'cubic-bezier(.455, .03, .515, .955)',
  easeInOutCubic: 'cubic-bezier(.645, .045, .355, 1)',
  easeInOutQuart: 'cubic-bezier(.77, 0, .175, 1)',
  easeInOutQuint: 'cubic-bezier(.86, 0, .07, 1)',
  easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
  easeInOutCirc: 'cubic-bezier(.785, .135, .15, .86)',
} as const;

// Animation durations
export const durations = {
  fast: 0.2,
  normal: 0.3,
  hover: 0.2,
} as const;

// Stagger delays
export const staggerDelays = {
  tight: 0.05,
  normal: 0.1,
  loose: 0.15,
} as const;

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preferences
 */
export const getAnimationDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0.01 : duration;
};

/**
 * Common animation configurations
 */
export const animationConfigs = {
  // Entrance animations
  fadeIn: {
    duration: durations.normal,
    ease: easingCurves.easeOutCubic,
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  slideUp: {
    duration: durations.normal,
    ease: easingCurves.easeOutQuart,
    from: { opacity: 0, y: 32 },
    to: { opacity: 1, y: 0 },
  },

  slideDown: {
    duration: durations.normal,
    ease: easingCurves.easeOutQuart,
    from: { opacity: 0, y: -32 },
    to: { opacity: 1, y: 0 },
  },

  scaleIn: {
    duration: durations.normal,
    ease: easingCurves.easeOutCubic,
    from: { opacity: 0, scale: 0.95 },
    to: { opacity: 1, scale: 1 },
  },

  // Hover effects
  hoverLift: {
    duration: durations.hover,
    ease: 'power2.out',
    to: { y: -2, scale: 1.02 },
  },

  hoverScale: {
    duration: durations.hover,
    ease: 'power2.out',
    to: { scale: 1.05 },
  },

  // Exit animations
  slideOutLeft: {
    duration: durations.fast,
    ease: easingCurves.easeInQuad,
    to: { opacity: 0, x: -32 },
  },

  slideOutRight: {
    duration: durations.fast,
    ease: easingCurves.easeInQuad,
    to: { opacity: 0, x: 32 },
  },
} as const;

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Add will-change property for animation optimization
   */
  addWillChange: (element: HTMLElement, properties: string[]) => {
    element.style.willChange = properties.join(', ');
  },

  /**
   * Remove will-change property after animation
   */
  removeWillChange: (element: HTMLElement) => {
    element.style.willChange = 'auto';
  },

  /**
   * Optimize element for transform animations
   */
  optimizeForTransform: (element: HTMLElement) => {
    element.style.willChange = 'transform';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';
  },
} as const;

/**
 * Animation cleanup utilities
 */
export const cleanupUtils = {
  /**
   * Kill GSAP timeline and clean up
   */
  killTimeline: (timeline: any) => {
    if (timeline) {
      timeline.kill();
      timeline = null;
    }
  },

  /**
   * Remove event listeners
   */
  removeEventListeners: (element: HTMLElement, events: { [key: string]: EventListener }) => {
    Object.entries(events).forEach(([event, listener]) => {
      element.removeEventListener(event, listener);
    });
  },
} as const;