"use client";

import { useRef } from "react";
import RevealText from "@/components/RevealText";
import Reveal from "@/components/Reveal";
import { gsap, hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { profile, type Project } from "@/data/profile";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLElement>(null);

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
        className="card-sheen glass group relative flex h-full flex-col rounded-2xl p-7 will-change-transform sm:p-9"
      >
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

        <p className="mt-3 flex-1 leading-relaxed text-muted">{project.tagline}</p>

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

        <div className="mt-7 flex gap-5 text-sm">
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
      </article>
    </Reveal>
  );
}

export default function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto max-w-site px-6 py-28 sm:px-10 sm:py-40"
    >
      <p className="mb-4 text-sm tracking-widest text-accent">03 — SELECTED WORK</p>
      <RevealText
        id="work-heading"
        className="max-w-3xl font-display text-[clamp(1.9rem,4.5vw,3.4rem)] font-medium leading-tight tracking-tight text-ink"
      >
        Things I&apos;ve built and shipped.
      </RevealText>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {profile.projects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
