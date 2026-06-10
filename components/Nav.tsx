"use client";

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

export default function Nav() {
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

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <Magnetic strength={0.3}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </button>
              </Magnetic>
            </li>
          ))}
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
