"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, isCoarseOrLowPower, prefersReducedMotion } from "@/lib/motion";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /**
   * Drift amplitude as a percentage of the element's own height: it travels
   * from +speed to -speed across its trip through the viewport. Keep small
   * (3–12) — disagreement between layers reads as depth; big numbers read
   * as gimmick.
   */
  speed?: number;
}

/**
 * Layered scroll parallax: the wrapped element drifts vertically at a rate
 * slightly different from the page, separating it from the content plane.
 * Transform-only, scrubbed. Skipped entirely under reduced motion and on
 * coarse/low-power devices, where everything sits on one calm plane.
 */
export default function Parallax({ children, className, speed = 8 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isCoarseOrLowPower()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: speed },
        {
          yPercent: -speed,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
