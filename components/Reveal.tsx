"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger offset within a group, in seconds — shifts the scrub window. */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  /** Fire-and-forget tween on first entry instead of scrubbing with scroll. */
  once?: boolean;
}

/**
 * Fade-and-rise block reveal, scrubbed to scroll position by default: blocks
 * resolve at the reader's own pace and reverse on the way back up, which is
 * what keeps the page feeling scroll-authored rather than triggered. `once`
 * restores the old one-shot tween for contexts where a half-revealed state
 * would mislead. No-op under reduced motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 36,
  once = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (once) {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            delay,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
        return;
      }

      // A group's delays become slightly later scrub windows, so siblings
      // stagger against scroll the way they used to stagger against time.
      const shift = Math.min(delay * 40, 10);
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          ease: "power1.out",
          scrollTrigger: {
            trigger: el,
            start: `top ${96 - shift}%`,
            end: `top ${76 - shift}%`,
            scrub: 0.6,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
