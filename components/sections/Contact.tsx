"use client";

import { useEffect, useRef, useState } from "react";
import RevealText from "@/components/RevealText";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import { profile } from "@/data/profile";

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
      className="mx-auto max-w-site px-6 py-28 sm:px-10 sm:py-44"
    >
      <p className="mb-4 text-sm tracking-widest text-accent">05 — CONTACT</p>
      <RevealText
        id="contact-heading"
        className="max-w-4xl font-display text-[clamp(2.2rem,6vw,4.8rem)] font-medium leading-[1.05] tracking-tight text-ink"
      >
        Let&apos;s build something worth refreshing.
      </RevealText>

      <Reveal>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {profile.availability}
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Magnetic strength={0.3}>
            <button
              onClick={copyEmail}
              className="group relative rounded-full bg-accent px-7 py-4 font-medium text-base transition-all hover:brightness-110"
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
    </section>
  );
}
