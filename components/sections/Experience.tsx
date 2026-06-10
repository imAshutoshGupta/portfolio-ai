"use client";

import { useLayoutEffect, useRef } from "react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { profile } from "@/data/profile";

export default function Experience() {
  const lineRef = useRef<HTMLDivElement>(null);

  // The timeline's spine draws itself as you scroll through the section.
  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: line.parentElement,
            start: "top 75%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        },
      );
    }, line);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-site px-6 py-section-sm sm:px-10 sm:py-section"
    >
      <SectionHeading
        index="06"
        eyebrow="Experience"
        title="Where the work happened."
        headingId="experience-heading"
      />

      <div className="relative mt-16 max-w-3xl">
        <div
          className="absolute bottom-0 left-[5px] top-0 w-px bg-line"
          aria-hidden="true"
        >
          <div
            ref={lineRef}
            className="h-full w-full origin-top bg-accent/60 motion-reduce:scale-y-100"
          />
        </div>

        <ol className="space-y-16">
          {profile.experience.map((entry, i) => (
            <li key={`${entry.company}-${entry.period}`} className="relative pl-10">
              <span
                className="absolute left-0 top-2 block h-[11px] w-[11px] rounded-full border-2 border-accent bg-base"
                aria-hidden="true"
              />
              <Reveal delay={i * 0.08} y={24}>
                <p className="text-sm tracking-widest text-muted">{entry.period.toUpperCase()}</p>
                <h3 className="mt-2 font-display text-xl font-medium text-ink sm:text-2xl">
                  {entry.role}
                  <span className="text-muted"> · {entry.company}</span>
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{entry.summary}</p>
                <ul className="mt-4 space-y-2">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-[0.95rem] text-ink/75">
                      <span className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
