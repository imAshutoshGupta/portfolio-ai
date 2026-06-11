import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/**
 * Touch devices and low-core machines get the calm version of the scroll
 * system: no parallax, no scroll-evolving backdrop — same cue the gl/
 * mounts use to pick their lite scenes.
 */
export function isCoarseOrLowPower(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4
  );
}

/** How long the intro preloader holds the screen (seconds). 0 with reduced motion. */
export const INTRO_DURATION = 1.4;

export function introDelay(): number {
  return prefersReducedMotion() ? 0 : INTRO_DURATION * 0.75;
}
