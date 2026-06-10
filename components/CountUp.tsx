"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface CountUpProps {
  value: number;
  /** e.g. "+" — rendered after the number. */
  suffix?: string;
  /** Renders a "~" before the number for honest, estimated figures. */
  approximate?: boolean;
  durationMs?: number;
  className?: string;
}

/**
 * Counts from 0 to `value` when scrolled into view, easing out so the last
 * digits land softly. Under reduced motion it simply renders the final value.
 */
export default function CountUp({
  value,
  suffix = "",
  approximate = false,
  durationMs = 1600,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      setDisplay(value);
      setSettled(true);
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          setDisplay(Math.round(value * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
          else setSettled(true);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className} aria-label={`${approximate ? "about " : ""}${value}${suffix}`}>
      <span aria-hidden="true" className={settled ? "" : "tabular-nums"}>
        {approximate && "~"}
        {display}
        {suffix}
      </span>
    </span>
  );
}
