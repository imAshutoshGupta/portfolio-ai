"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { profile, isPlaceholder } from "@/data/profile";

/**
 * The page's one scroll-pinned beat: between "who I am" and "what I can do",
 * the bio's through-line plays as statements that crossfade while the
 * viewport holds. Pinning is plain CSS sticky — native scroll is never
 * hijacked, the page just has room to breathe here. Under reduced motion it
 * collapses to a calm static stack with no extra scroll length. Copy lives
 * in profile.narrative (single source of truth); unfilled lines render as
 * italic placeholders.
 */
export default function NarrativeStatement() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const lines = section.querySelectorAll<HTMLElement>("[data-line]");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.7 },
      });
      // Opacity (not autoAlpha) so the copy stays in the accessibility tree.
      const seg = 1 / lines.length;
      lines.forEach((line, i) => {
        const at = i * seg;
        if (i > 0) {
          tl.fromTo(
            line,
            { opacity: 0, yPercent: 24 },
            { opacity: 1, yPercent: 0, duration: seg * 0.45 },
            at,
          );
        }
        if (i < lines.length - 1) {
          tl.to(line, { opacity: 0, yPercent: -24, duration: seg * 0.45 }, at + seg * 0.55);
        }
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="In short"
      className="relative h-[220vh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center motion-reduce:static motion-reduce:h-auto motion-reduce:py-section-sm">
        <p className="mb-10 text-xs font-medium tracking-[0.3em] text-muted">THE THROUGH-LINE</p>
        <div className="grid w-full max-w-4xl px-6 text-center sm:px-10 motion-reduce:flex motion-reduce:flex-col motion-reduce:gap-10">
          {profile.narrative.statement.map((line, i) => (
            <p
              key={i}
              data-line
              className={`self-center [grid-area:1/1] font-display text-[clamp(1.7rem,4vw,3.2rem)] font-medium leading-tight tracking-tight ${
                isPlaceholder(line) ? "italic text-muted" : "text-ink"
              } ${
                // Later beats start invisible so the overlapped stack never
                // flashes before hydration; GSAP takes over from there.
                // Reduced motion shows all beats as a plain stack instead.
                i > 0 ? "motion-safe:opacity-0" : ""
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
