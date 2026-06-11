"use client";

import { useEffect, useState } from "react";
import Magnetic from "./Magnetic";
import { scrollToSection } from "@/lib/scroll";
import { profile } from "@/data/profile";

const LINKS = [
  { id: "about", label: "About" },
  { id: "capabilities", label: "Capabilities" },
  { id: "ask", label: "Ask" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" },
];

/**
 * Primary nav, upgraded with the "tubelight" treatment adapted from
 * 21st.dev — ayushmxxn/tubelight-navbar (ported off framer-motion: each link
 * owns a glow lamp that cross-fades via CSS, driven by an IntersectionObserver
 * scrollspy). The link pill gains a border + blur once you scroll past the hero.
 */
export default function Nav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy: whichever watched section occupies the middle band of the
  // viewport owns the lamp.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-site items-center justify-between px-6 py-5 sm:px-10"
      >
        <Magnetic strength={0.25}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-display text-lg font-semibold tracking-tight text-ink transition-colors hover:text-accent"
            aria-label="Back to top"
          >
            {profile.firstName.charAt(0)}
            {profile.name.split(" ")[1]?.charAt(0)}
            <span className="text-accent">.</span>
          </button>
        </Magnetic>

        <ul
          className={`hidden items-center gap-1 rounded-full px-1.5 py-1 transition-all duration-500 md:flex ${
            scrolled
              ? "border border-line bg-base/70 shadow-lift backdrop-blur-md"
              : "border border-transparent"
          }`}
        >
          {LINKS.map((link) => {
            const active = activeId === link.id;
            return (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  aria-current={active || undefined}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                    active ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <span className="tubelight" aria-hidden="true" />
                  {link.label}
                </button>
              </li>
            );
          })}
        </ul>

        <Magnetic strength={0.3} className="md:hidden">
          <button
            onClick={() => scrollToSection("contact")}
            className="rounded-full border border-line bg-raise/60 px-4 py-2 text-sm text-ink backdrop-blur-md transition-colors hover:border-accent/40"
          >
            Contact
          </button>
        </Magnetic>
      </nav>
    </header>
  );
}
