import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import { profile, isPlaceholder } from "@/data/profile";

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-site px-6 py-section-sm sm:px-10 sm:py-section"
    >
      <SectionHeading
        index="01"
        eyebrow="About"
        title="Engineering with curiosity, shipped with care."
        headingId="about-heading"
      />

      <div className="mt-14 grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div className="space-y-6">
          {profile.bio.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="text-lg leading-relaxed text-muted">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        {/* The side rail drifts a touch slower than the bio — mid-ground depth. */}
        <Parallax speed={5} className="space-y-10">
          {/* Currently — signals momentum, not just history. */}
          <Reveal>
            <div className="panel rounded-card p-6">
              <h3 className="flex items-center gap-2.5 text-xs tracking-[0.2em] text-muted">
                <span
                  className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none"
                  aria-hidden="true"
                />
                CURRENTLY
              </h3>
              <p
                className={`mt-3 text-sm leading-relaxed ${
                  isPlaceholder(profile.currentFocus) ? "italic text-muted" : "text-ink/85"
                }`}
              >
                {profile.currentFocus}
              </p>
            </div>
          </Reveal>

          {profile.skills.map((group, gi) => (
            <Reveal key={group.label} delay={gi * 0.08}>
              <h3 className="mb-4 text-xs tracking-[0.2em] text-muted">
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
        </Parallax>
      </div>
    </section>
  );
}
