"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * An authored seam between chapters of the page: a hairline that lights up
 * from its center as it enters the viewport, with a soft accent bloom — the
 * same violet the rest of the lighting system uses. Static under reduced
 * motion. Purely decorative.
 */
export default function SectionDivider() {
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleX: 0, autoAlpha: 0 },
        {
          scaleX: 1,
          autoAlpha: 1,
          duration: 1.3,
          ease: "power3.inOut",
          scrollTrigger: { trigger: line, start: "top 85%", once: true },
        },
      );
    }, line);
    return () => ctx.revert();
  }, []);

  return (
    <div aria-hidden="true" className="mx-auto max-w-site px-6 sm:px-10">
      <div className="relative mx-auto h-px max-w-3xl">
        <div
          ref={lineRef}
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
