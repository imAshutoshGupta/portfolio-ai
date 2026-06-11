"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

interface SectionDividerProps {
  /** Optional narrative kicker over the seam (from profile.narrative.handoffs). */
  label?: string;
}

/**
 * An authored seam between chapters of the page: a hairline that draws
 * itself in step with scroll, with a soft accent bloom — the same violet the
 * rest of the lighting system uses — and an optional kicker line that hands
 * the story to the next chapter. Static under reduced motion. Purely
 * decorative.
 */
export default function SectionDivider({ label }: SectionDividerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const scrollTrigger = { trigger: root, start: "top 92%", end: "top 65%", scrub: 0.6 };
      gsap.fromTo(
        "[data-divider-line]",
        { scaleX: 0, autoAlpha: 0 },
        { scaleX: 1, autoAlpha: 1, ease: "power1.inOut", scrollTrigger },
      );
      if (label) {
        gsap.fromTo(
          "[data-divider-label]",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, ease: "power1.out", scrollTrigger: { ...scrollTrigger } },
        );
      }
    }, root);
    return () => ctx.revert();
  }, [label]);

  return (
    <div ref={rootRef} aria-hidden="true" className="mx-auto max-w-site px-6 py-8 sm:px-10">
      {label && (
        <p
          data-divider-label
          className="mb-6 text-center text-xs font-medium tracking-[0.3em] text-muted"
        >
          {label.toUpperCase()}
        </p>
      )}
      <div className="relative mx-auto h-px max-w-3xl">
        <div
          data-divider-line
          className="h-px w-full motion-reduce:!opacity-100 motion-reduce:!scale-x-100"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(var(--c-accent) / 0.45) 50%, transparent)",
          }}
        />
        <div
          className="absolute -inset-y-3 inset-x-0"
          style={{
            background:
              "radial-gradient(16rem 1.5rem at 50% 50%, rgb(var(--c-accent) / 0.16), transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
