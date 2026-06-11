"use client";

import { useId, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import CoderSilhouette from "@/components/CoderSilhouette";
import WorkField from "@/components/gl/WorkField";
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { profile, isPlaceholder, type Project } from "@/data/profile";

/** Unfilled placeholders read as drafting notes, not finished copy. */
function CaseText({ text, className }: { text: string; className?: string }) {
  return (
    <p className={`${className ?? ""} ${isPlaceholder(text) ? "italic text-muted" : ""}`}>
      {text}
    </p>
  );
}

function CaseStudyPanel({ project, panelId, open }: { project: Project; panelId: string; open: boolean }) {
  const cs = project.caseStudy;
  return (
    <div id={panelId} data-open={open} className="expand-body" aria-hidden={!open}>
      <div>
        <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h4 className="text-xs tracking-[0.2em] text-accent">THE PROBLEM</h4>
            <CaseText text={cs.problem} className="mt-2 text-sm leading-relaxed text-muted" />
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] text-accent">MY ROLE</h4>
            <CaseText text={cs.role} className="mt-2 text-sm leading-relaxed text-muted" />
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] text-accent">OUTCOME</h4>
            <CaseText text={cs.outcome} className="mt-2 text-sm leading-relaxed text-muted" />
          </div>
          <div className="sm:col-span-2">
            <h4 className="text-xs tracking-[0.2em] text-accent">KEY DECISIONS</h4>
            <ul className="mt-2 space-y-2">
              {cs.decisions.map((decision) => (
                <li key={decision} className="flex gap-3 text-sm leading-relaxed">
                  <span
                    className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  <span className={isPlaceholder(decision) ? "italic text-muted" : "text-ink/80"}>
                    {decision}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const toggle = () => {
    setOpen((v) => !v);
    // The card's height changes; let downstream reveal triggers re-measure
    // once the grid-rows transition has finished.
    window.setTimeout(() => ScrollTrigger.refresh(), 500);
  };

  // Subtle 3D tilt + cursor-tracking sheen, desktop only.
  const onPointerMove = (e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    gsap.to(el, {
      rotateY: (px - 0.5) * 7,
      rotateX: (0.5 - py) * 7,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 900,
    });
    el.style.setProperty("--sheen-x", `${px * 100}%`);
    el.style.setProperty("--sheen-y", `${py * 100}%`);
  };

  const onPointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <Reveal delay={(index % 2) * 0.12}>
      <article
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="card-sheen panel group relative flex h-full flex-col rounded-card p-7 will-change-transform sm:p-9"
      >
        {/* Border beam (adapted from 21st.dev — magicui/border-beam) marks the flagship. */}
        {project.flagship && <div className="border-beam" aria-hidden="true" />}

        <div className="flex items-baseline justify-between">
          <span className="font-display text-sm text-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-sm text-muted">{project.year}</span>
        </div>

        <h3 className="mt-5 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          {project.title}
          {project.flagship && (
            <span className="ml-3 align-middle rounded-full border border-accent/40 bg-accent-dim px-2.5 py-0.5 text-[0.65rem] font-body tracking-widest text-accent">
              FLAGSHIP
            </span>
          )}
        </h3>

        <p className="mt-3 leading-relaxed text-muted">{project.tagline}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>

        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies used">
          {project.tech.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-line px-3 py-1 text-xs text-ink/70"
            >
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-5 text-sm">
          <button
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-ink/85 transition-colors hover:border-accent/50 hover:text-accent"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              aria-hidden="true"
              className={`transition-transform duration-300 ease-out-expo motion-reduce:transition-none ${open ? "rotate-45" : ""}`}
            >
              <path d="M6 1 V11 M1 6 H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Case study
          </button>
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="link-arrow text-ink/85 transition-colors hover:text-accent"
            >
              Repository
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="link-arrow text-ink/85 transition-colors hover:text-accent"
            >
              Live site
            </a>
          )}
        </div>

        <div className="mt-6">
          <CaseStudyPanel project={project} panelId={panelId} open={open} />
        </div>
      </article>
    </Reveal>
  );
}

export default function Work() {
  return (
    <section id="work" aria-labelledby="work-heading" className="relative overflow-hidden">
      {/* The site's second 3D moment: an ambient shard field drifting in real
          depth behind the cards — same lighting world as the hero, no focal
          object, so it deepens the section without competing for attention. */}
      <div className="pointer-events-none absolute inset-0">
        <WorkField />
      </div>

      <div className="relative mx-auto max-w-site px-6 py-section-sm sm:px-10 sm:py-section">
        <SectionHeading
          index="04"
          eyebrow="Selected work"
          title="Things I've built and shipped."
          support="Each project opens into a short case study — the problem, the role, the decisions, the result."
          headingId="work-heading"
          accent
        />

        <div className="mt-10 grid items-start gap-5 md:grid-cols-2">
          {/* The two columns drift at different rates — the staggered-scroll
              feel of a real plan chest, not a uniform grid. */}
          {profile.projects.map((project, i) => (
            <Parallax key={project.title} speed={i % 2 === 0 ? 3 : 7}>
              <ProjectCard project={project} index={i} />
            </Parallax>
          ))}
        </div>

        {/* Midnight coder, beat 4: leaning in, screen brightening — shipping. */}
        <CoderSilhouette
          pose="leanIn"
          flip
          className="pointer-events-none absolute bottom-3 right-0 hidden w-24 md:block lg:w-28"
        />
      </div>
    </section>
  );
}
