import RevealText from "@/components/RevealText";
import Reveal from "@/components/Reveal";
import { profile } from "@/data/profile";

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-site px-6 py-28 sm:px-10 sm:py-40"
    >
      <p className="mb-4 text-sm tracking-widest text-accent">01 — ABOUT</p>
      <RevealText
        id="about-heading"
        className="max-w-3xl font-display text-[clamp(1.9rem,4.5vw,3.4rem)] font-medium leading-tight tracking-tight text-ink"
      >
        Engineering with curiosity, shipped with care.
      </RevealText>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div className="space-y-6">
          {profile.bio.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="text-lg leading-relaxed text-muted">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <div className="space-y-10">
          {profile.skills.map((group, gi) => (
            <Reveal key={group.label} delay={gi * 0.08}>
              <h3 className="mb-4 text-sm tracking-widest text-muted">
                {group.label.toUpperCase()}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-line bg-raise/60 px-4 py-1.5 text-sm text-ink/85 transition-colors duration-300 hover:border-accent/50 hover:text-accent"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
