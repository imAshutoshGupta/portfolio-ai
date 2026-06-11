import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import { stats } from "@/data/profile";

/** Slim count-up strip directly under the hero — the "numbers at a glance" row. */
export default function Stats() {
  return (
    // relative: must paint above the hero's fixed handoff canvas.
    <section aria-label="Key numbers" className="relative border-y border-line">
      <div className="mx-auto grid max-w-site grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 0.08}
            y={20}
            className={`px-6 py-10 sm:px-10 ${i > 0 ? "border-l border-line max-lg:[&:nth-child(odd)]:border-l-0" : ""} ${i >= 2 ? "max-lg:border-t max-lg:border-line" : ""}`}
          >
            <CountUp
              value={stat.value}
              suffix={stat.suffix}
              approximate={stat.approximate}
              className="text-gradient font-display text-4xl font-semibold tracking-tight sm:text-5xl"
            />
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
