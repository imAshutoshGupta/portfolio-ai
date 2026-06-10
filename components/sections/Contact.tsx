"use client";

import { useEffect, useRef, useState } from "react";
import RevealText from "@/components/RevealText";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import { profile } from "@/data/profile";

/** The closing CTA — big, warm, and impossible to miss. */
export default function Contact() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard unavailable (permissions / http) — fall back to mail client.
      window.location.href = `mailto:${profile.contact.email}`;
    }
  };

  const socials = [
    { label: "GitHub", href: profile.contact.github },
    { label: "LinkedIn", href: profile.contact.linkedin },
    { label: "X / Twitter", href: profile.contact.twitter },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative overflow-hidden"
    >
      {/* A quiet echo of the hero's warmth behind the closing statement. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(48rem 26rem at 50% 110%, rgba(226, 178, 90, 0.10), transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-site px-6 py-section-sm text-center sm:px-10 sm:py-section">
        <p className="mb-4 flex items-center justify-center gap-3 text-xs font-medium tracking-[0.2em] text-accent">
          <span className="text-muted">08</span>
          <span className="h-px w-6 bg-accent/40" aria-hidden="true" />
          CONTACT
        </p>

        <RevealText
          id="contact-heading"
          className="mx-auto max-w-4xl font-display text-[clamp(2.4rem,7vw,5.5rem)] font-medium leading-[1.02] tracking-tight text-ink"
        >
          Let's build something worth refreshing.
        </RevealText>

        <Reveal>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {profile.availability}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Magnetic strength={0.3}>
              <button
                onClick={copyEmail}
                className="rounded-full bg-accent px-8 py-4 font-medium text-base shadow-glow transition-all hover:brightness-110"
              >
                {copied ? "Copied to clipboard ✓" : profile.contact.email}
              </button>
            </Magnetic>
            <span aria-live="polite" className="sr-only">
              {copied ? "Email address copied to clipboard" : ""}
            </span>

            {socials.map((social) => (
              <Magnetic key={social.label} strength={0.3}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line bg-raise/60 px-6 py-4 text-ink/85 backdrop-blur-md transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {social.label}
                </a>
              </Magnetic>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
