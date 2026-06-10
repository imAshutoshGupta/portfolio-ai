"use client";

import { useLayoutEffect, useRef, createElement, type ElementType } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

interface RevealTextProps {
  children: string;
  as?: ElementType;
  className?: string;
  /** Seconds to wait once triggered (used by the hero to follow the intro). */
  delay?: number;
  /** "scroll" reveals when the element enters the viewport; "mount" plays immediately. */
  trigger?: "scroll" | "mount";
  id?: string;
}

/**
 * Splits a string into words that rise out of clipped containers — the
 * site-wide heading reveal. Screen readers get the plain string; the
 * animated copy is aria-hidden.
 */
export default function RevealText({
  children,
  as = "h2",
  className,
  delay = 0,
  trigger = "scroll",
  id,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const words = el.querySelectorAll("[data-word]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: "power4.out",
          delay,
          ...(trigger === "scroll"
            ? {
                scrollTrigger: {
                  trigger: el,
                  start: "top 88%",
                  once: true,
                },
              }
            : {}),
        },
      );
    }, el);

    return () => ctx.revert();
  }, [children, delay, trigger]);

  return createElement(
    as,
    { ref, className, id },
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {children.split(" ").map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
            <span data-word className="inline-block will-change-transform motion-reduce:transform-none">
              {word}
            </span>
            {i < children.split(" ").length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>,
  );
}
