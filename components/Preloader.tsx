"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, INTRO_DURATION } from "@/lib/motion";
import { profile } from "@/data/profile";

/**
 * Brief page-load intro (~1.4s): the name rises in letter by letter, then the
 * curtain lifts to reveal the hero. Skipped instantly under reduced motion,
 * and hard-capped so it can never trap the page.
 */
export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDone(true);
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) return;
    const letters = overlay.querySelectorAll("[data-letter]");

    const tl = gsap.timeline({ onComplete: () => setDone(true) });
    tl.fromTo(
      letters,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.55, stagger: 0.035, ease: "power4.out" },
    )
      .to(letters, {
        yPercent: -110,
        duration: 0.4,
        stagger: 0.02,
        ease: "power3.in",
        delay: 0.25,
      })
      .to(overlay, { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "-=0.15");

    // Safety net: never hold the page hostage.
    const failsafe = setTimeout(() => setDone(true), (INTRO_DURATION + 1.5) * 1000);
    return () => {
      clearTimeout(failsafe);
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-base"
    >
      <p className="flex overflow-hidden font-display text-2xl font-medium tracking-tight text-ink sm:text-4xl">
        {profile.name.split("").map((char, i) => (
          <span key={i} data-letter className="inline-block will-change-transform">
            {char === " " ? " " : char}
          </span>
        ))}
      </p>
    </div>
  );
}
