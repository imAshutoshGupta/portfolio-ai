import { allSkills } from "@/data/profile";

function ChipRow({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-3 pr-3 motion-reduce:flex-wrap motion-reduce:justify-center"
    >
      {allSkills.map((skill) => (
        <li
          key={skill}
          className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-raise/60 px-4 py-2 text-sm text-ink/70"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" className="text-accent/70">
            <circle cx="4" cy="4" r="3" fill="currentColor" />
          </svg>
          {skill}
        </li>
      ))}
    </ul>
  );
}

/**
 * Infinite horizontal strip of the tech stack, rendered as styled chips —
 * no logo files. Pauses on hover; under reduced motion it becomes a static
 * wrapped list (the duplicate row is hidden by the same media query that
 * stops the animation).
 */
export default function TechMarquee() {
  return (
    <section aria-label="Technologies" className="overflow-hidden py-14">
      <div className="marquee-mask">
        <div className="marquee-track">
          <ChipRow />
          <div className="motion-reduce:hidden flex shrink-0">
            <ChipRow hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
