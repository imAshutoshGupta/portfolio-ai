"use client";

import { useId, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { ScrollTrigger } from "@/lib/motion";
import { profile } from "@/data/profile";

/** Accessible accordion: native buttons, aria-expanded, CSS grid-rows height animation. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  const toggle = (index: number, isOpen: boolean) => {
    setOpen(isOpen ? null : index);
    // Heights below shift; let downstream scrubbed triggers re-measure once
    // the grid-rows transition settles (same pattern as the Work cards).
    window.setTimeout(() => ScrollTrigger.refresh(), 500);
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mx-auto max-w-site px-6 py-section-sm sm:px-10 sm:py-section"
    >
      <SectionHeading
        index="07"
        eyebrow="FAQ"
        title="Questions, answered."
        support="The short versions — the assistant above has the long ones."
        headingId="faq-heading"
      />

      <Reveal delay={0.1} className="mt-14">
        <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
          {profile.faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={`${baseId}-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${baseId}-a-${i}`}
                    onClick={() => toggle(i, isOpen)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={`font-display text-lg font-medium transition-colors ${
                        isOpen ? "text-ink" : "text-ink/75 group-hover:text-ink"
                      }`}
                    >
                      {item.question}
                    </span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      className={`shrink-0 text-accent transition-transform duration-300 ease-out-expo motion-reduce:transition-none ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      <path
                        d="M10 4 V16 M4 10 H16"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </h3>
                <div
                  id={`${baseId}-a-${i}`}
                  role="region"
                  aria-labelledby={`${baseId}-q-${i}`}
                  data-open={isOpen}
                  className="faq-body"
                >
                  <div>
                    <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
