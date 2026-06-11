"use client";

import { useId, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import GridPattern from "@/components/GridPattern";
import Reveal from "@/components/Reveal";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { profile } from "@/data/profile";

/**
 * "How I work" — an accessible tabbed panel. Tabs follow the WAI-ARIA
 * pattern (arrow keys move focus + selection); panel swaps get a soft
 * fade/rise unless reduced motion is set.
 */
export default function Process() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number, focus = false) => {
    const next = (index + profile.process.length) % profile.process.length;
    setActive(next);
    if (focus) tabRefs.current[next]?.focus();
    if (panelRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
      );
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select(active + 1, true);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      select(active - 1, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      select(profile.process.length - 1, true);
    }
  };

  const step = profile.process[active];

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="relative mx-auto max-w-site px-6 py-section-sm sm:px-10 sm:py-section"
    >
      <GridPattern />
      <div className="relative">
      <SectionHeading
        index="05"
        eyebrow="Process"
        title="How the work gets done."
        support="The same four moves on every project — sized to fit, never skipped."
        headingId="process-heading"
      />

      <Reveal delay={0.1} className="mt-14">
        <div className="panel overflow-hidden rounded-card">
          <div
            role="tablist"
            aria-label="Process steps"
            onKeyDown={onKeyDown}
            className="flex overflow-x-auto border-b border-line"
          >
            {profile.process.map((s, i) => (
              <button
                key={s.label}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${baseId}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => select(i)}
                className={`relative shrink-0 px-5 py-4 text-sm transition-colors sm:px-8 ${
                  i === active ? "text-ink" : "text-muted hover:text-ink/80"
                }`}
              >
                <span className="mr-2 font-mono text-xs text-accent/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-accent transition-all duration-300 ease-out-expo ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>

          <div
            ref={panelRef}
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${active}`}
            tabIndex={0}
            className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr]"
          >
            <div>
              <h3 className="font-display text-2xl font-medium tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">{step.body}</p>
            </div>
            <ul className="space-y-3 self-center">
              {step.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-ink/80">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-accent"
                  >
                    <path
                      d="M3 8.5 L6.5 12 L13 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
      </div>
    </section>
  );
}
