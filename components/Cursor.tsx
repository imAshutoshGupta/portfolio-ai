"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "@/lib/motion";

/**
 * Custom cursor: a crisp dot with a trailing ring. Desktop (fine pointer)
 * only, skipped under reduced motion. The ring expands over interactive
 * elements; the native cursor stays visible so nothing breaks if JS dies.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasFinePointer() && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25 });
        visible = true;
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      const interactive = (e.target as Element | null)?.closest(
        "a, button, [role='button'], input, textarea, [data-cursor]",
      );
      gsap.to(ring, {
        scale: interactive ? 2.1 : 1,
        opacity: interactive ? 0.5 : 1,
        duration: 0.3,
        ease: "power3.out",
      });
    };

    const onLeave = () => {
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25 });
      visible = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={dotRef}
        className="invisible absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-accent opacity-0"
      />
      <div
        ref={ringRef}
        className="invisible absolute -left-4 -top-4 h-8 w-8 rounded-full border border-ink/30 opacity-0"
      />
    </div>
  );
}
