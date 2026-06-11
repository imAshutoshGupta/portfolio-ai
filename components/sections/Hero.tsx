"use client";

import { useEffect, useRef } from "react";
import Hero3D from "@/components/gl/Hero3D";
import RevealText from "@/components/RevealText";
import { gsap, prefersReducedMotion, introDelay } from "@/lib/motion";
import { scrollToSection } from "@/lib/scroll";
import { profile } from "@/data/profile";

export default function Hero() {
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = metaRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.children,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          delay: introDelay() + 0.5,
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      <Hero3D />

      <div className="relative z-10 mx-auto w-full max-w-site px-6 sm:px-10">
        <div ref={metaRef}>
          <p className="mb-5 flex items-center gap-3 text-sm tracking-widest text-muted opacity-0 motion-reduce:opacity-100">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {profile.role.toUpperCase()} · {profile.location.toUpperCase()}
          </p>
        </div>

        <RevealText
          as="h1"
          trigger="mount"
          delay={introDelay()}
          className="max-w-5xl font-display text-[clamp(2.8rem,9vw,7.5rem)] font-semibold leading-[0.98] tracking-tight text-ink"
        >
          {profile.name}
        </RevealText>

        <RevealText
          as="p"
          trigger="mount"
          delay={introDelay() + 0.25}
          className="mt-6 max-w-xl font-serif text-[clamp(1.15rem,2.4vw,1.6rem)] italic leading-snug text-ink/80"
        >
          {profile.tagline}
        </RevealText>
      </div>

      {/* Depth handoff: the hero's void fades into the page surface instead of
          ending at a hard section edge — the body continues the same world. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-36 bg-gradient-to-b from-transparent to-base"
      />

      <button
        onClick={() => scrollToSection("about")}
        className="group absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-widest text-muted transition-colors hover:text-ink"
        aria-label="Scroll to about section"
      >
        SCROLL
        <span className="block h-10 w-px overflow-hidden bg-line">
          <span className="block h-full w-full origin-top animate-scroll-cue bg-accent motion-reduce:animate-none" />
        </span>
      </button>
    </section>
  );
}
