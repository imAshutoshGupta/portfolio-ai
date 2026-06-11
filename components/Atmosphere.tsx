"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, isCoarseOrLowPower, prefersReducedMotion } from "@/lib/motion";

/**
 * The site-wide depth layer, now one continuous space: a single fixed
 * backdrop the entire page scrolls through, instead of per-section glow
 * patches. The two layers obey the lighting system — violet fill from the
 * upper right, blue from the lower left, the same angles as the hero's
 * Lightformers and the Contact glass — and one scrubbed timeline slowly
 * re-weights and drifts them across the page's chapters (who → capabilities
 * → proof → method → close), so sections read as places in one world rather
 * than stacked panels.
 *
 * Pure CSS radial gradients; the animation touches transform/opacity only.
 * Reduced motion or coarse/low-power devices get the same gradients,
 * static.
 */
export default function Atmosphere() {
  const violetRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const violet = violetRef.current;
    const blue = blueRef.current;
    if (!violet || !blue || prefersReducedMotion() || isCoarseOrLowPower()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // Positions are fractions of total page scroll — a light score, not
      // exact section bounds, so the drift never snaps at a seam.
      tl
        // Who: the hero's violet spills down the first chapter, then softens —
        // but never drops out; the middle of the page stays in the color world.
        .to(violet, { yPercent: 7, xPercent: -3, opacity: 0.7, duration: 0.3 }, 0)
        // Proof → method: violet recovers as the page turns reflective.
        .to(violet, { yPercent: 2, xPercent: -7, opacity: 0.85, duration: 0.4 }, 0.3)
        // Close: both lights converge on the contact chapter.
        .to(violet, { yPercent: 9, xPercent: -12, scale: 1.15, opacity: 1, duration: 0.3 }, 0.7)
        .fromTo(
          blue,
          { yPercent: 6, xPercent: 0, opacity: 0.5 },
          { yPercent: -6, opacity: 1, duration: 0.35 },
          0.05,
        )
        .to(blue, { yPercent: -2, xPercent: 5, opacity: 0.8, duration: 0.4 }, 0.4)
        .to(blue, { yPercent: -12, xPercent: 9, scale: 1.1, opacity: 0.9, duration: 0.2 }, 0.8);
    });
    return () => ctx.revert();
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        ref={violetRef}
        className="absolute -inset-[12%] will-change-transform"
        style={{
          background: `radial-gradient(48rem 34rem at 78% 12%, rgb(var(--c-accent) / calc(var(--glow-violet-a) * 2.1)), transparent 62%)`,
        }}
      />
      <div
        ref={blueRef}
        className="absolute -inset-[12%] will-change-transform"
        style={{
          opacity: 0.55,
          background: `radial-gradient(44rem 32rem at 16% 88%, rgb(var(--c-accent-b) / calc(var(--glow-blue-a) * 2.1)), transparent 60%)`,
        }}
      />
    </div>
  );
}
