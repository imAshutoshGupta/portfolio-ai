"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "@/lib/motion";

interface AtmosphereProps {
  className?: string;
  /** "soft" for feature sections, "faint" for quieter stretches. */
  intensity?: "soft" | "faint";
  /** Scroll-linked drift of the glow layers (desktop, motion-safe only). */
  parallax?: boolean;
}

/**
 * The site-wide depth layer: two soft glows that obey the lighting system —
 * violet fill from the upper right, blue from the lower left, the same angles
 * the hero's Lightformers and the Contact glass backdrop use. Dropped behind
 * a section it keeps the body in the hero's world instead of on a flat
 * background. Pure CSS gradients (no GPU cost); optional parallax separates
 * the layers from the content plane as you scroll.
 */
export default function Atmosphere({
  className,
  intensity = "soft",
  parallax = false,
}: AtmosphereProps) {
  const violetRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const violet = violetRef.current;
    const blue = blueRef.current;
    if (!parallax || !violet || !blue || prefersReducedMotion() || !hasFinePointer()) return;

    // The two glows drift at different rates — that disagreement is what
    // reads as depth rather than decoration.
    const ctx = gsap.context(() => {
      const trigger = {
        trigger: violet.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      };
      gsap.fromTo(violet, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(blue, { yPercent: 10 }, { yPercent: -10, ease: "none", scrollTrigger: { ...trigger } });
    }, violet.parentElement ?? undefined);
    return () => ctx.revert();
  }, [parallax]);

  const scale = intensity === "soft" ? 1 : 0.6;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <div
        ref={violetRef}
        className="absolute -inset-y-[12%] inset-x-0"
        style={{
          background: `radial-gradient(46rem 32rem at 80% 14%, rgb(var(--c-accent) / calc(var(--glow-violet-a) * ${scale})), transparent 62%)`,
        }}
      />
      <div
        ref={blueRef}
        className="absolute -inset-y-[12%] inset-x-0"
        style={{
          background: `radial-gradient(42rem 30rem at 14% 86%, rgb(var(--c-accent-b) / calc(var(--glow-blue-a) * ${scale})), transparent 60%)`,
        }}
      />
    </div>
  );
}
