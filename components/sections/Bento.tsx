import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Telemetry from "@/components/Telemetry";
import { profile, type Strength } from "@/data/profile";

/* ── Live visuals (pure CSS/SVG, no images) ─────────────────────────────── */

/** Mini editor rendering the site's actual provider interface. */
function CodeVisual() {
  return (
    <div className="rounded-xl border border-line bg-base/70 p-4 font-mono text-[0.72rem] leading-relaxed">
      <div className="mb-3 flex gap-1.5" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-ink/15" />
        <span className="h-2 w-2 rounded-full bg-ink/15" />
        <span className="h-2 w-2 rounded-full bg-accent/50" />
      </div>
      <pre aria-label="TypeScript code sample" className="overflow-x-auto">
        <code>
          <span className="text-[#8a8a93]">{"// every AI backend is one small adapter"}</span>
          {"\n"}
          <span className="text-accent">interface</span>
          <span className="text-ink/90"> AIProvider </span>
          <span className="text-ink/60">{"{"}</span>
          {"\n  "}
          <span className="text-ink/90">name</span>
          <span className="text-ink/60">: </span>
          <span className="text-[#9bb8a3]">string</span>
          <span className="text-ink/60">;</span>
          {"\n  "}
          <span className="text-ink/90">stream</span>
          <span className="text-ink/60">(msgs: </span>
          <span className="text-[#9bb8a3]">ChatMessage</span>
          <span className="text-ink/60">[]):</span>
          {"\n    "}
          <span className="text-[#9bb8a3]">AsyncIterable</span>
          <span className="text-ink/60">{"<"}</span>
          <span className="text-[#9bb8a3]">string</span>
          <span className="text-ink/60">{">;"}</span>
          {"\n"}
          <span className="text-ink/60">{"}"}</span>
        </code>
      </pre>
    </div>
  );
}

/** Chat bubbles with a typing indicator — the AI strength, in miniature. */
function AIVisual() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="ml-auto w-fit max-w-[80%] rounded-xl rounded-br-sm bg-accent-dim px-3 py-1.5 text-xs text-ink/90">
        Does he know React?
      </div>
      <div className="w-fit max-w-[85%] rounded-xl rounded-bl-sm border border-line bg-base/70 px-3 py-1.5 text-xs text-ink/75">
        Yes — with shipped work to back it up…
      </div>
      <div className="flex w-fit gap-1 rounded-xl rounded-bl-sm border border-line bg-base/70 px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/80 motion-reduce:animate-none"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
          />
        ))}
      </div>
    </div>
  );
}

/** A 60fps dial: arc that fills via stroke-dashoffset. */
function PerformanceVisual() {
  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 120 70" className="h-24 w-auto">
        <path
          d="M 12 64 A 48 48 0 0 1 108 64"
          fill="none"
          stroke="rgba(237,237,239,0.1)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 12 64 A 48 48 0 0 1 108 64"
          fill="none"
          stroke="#E2B25A"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset="8"
          className="perf-arc"
        />
        <text
          x="60"
          y="56"
          textAnchor="middle"
          fill="#EDEDEF"
          fontSize="20"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          60
        </text>
        <text x="60" y="68" textAnchor="middle" fill="#8A8A93" fontSize="8" letterSpacing="2">
          FPS TARGET
        </text>
      </svg>
    </div>
  );
}

/** An easing curve with a dot riding it — motion craft, drawn not described. */
function MotionVisual() {
  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 140 70" className="h-24 w-auto overflow-visible">
        <path
          d="M 10 60 C 40 60, 50 10, 130 10"
          fill="none"
          stroke="rgba(237,237,239,0.18)"
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
        <circle r="4" fill="#E2B25A" className="motion-dot">
          <animateMotion
            dur="2.6s"
            repeatCount="indefinite"
            keyPoints="0;1;1"
            keyTimes="0;0.65;1"
            calcMode="spline"
            keySplines="0.16 1 0.3 1; 0 0 1 1"
            path="M 10 60 C 40 60, 50 10, 130 10"
          />
        </circle>
        <text x="10" y="69" fill="#8A8A93" fontSize="7" letterSpacing="1.5">
          cubic-bezier(0.16, 1, 0.3, 1)
        </text>
      </svg>
    </div>
  );
}

const VISUALS: Record<Strength["visual"], () => React.ReactNode> = {
  code: CodeVisual,
  ai: AIVisual,
  performance: PerformanceVisual,
  motion: MotionVisual,
};

/* ── Grid ───────────────────────────────────────────────────────────────── */

function StrengthCard({
  strength,
  className,
  delay,
}: {
  strength: Strength;
  className?: string;
  delay: number;
}) {
  const Visual = VISUALS[strength.visual];
  return (
    <Reveal delay={delay} className={className}>
      <article className="panel panel-hover flex h-full flex-col justify-between gap-6 rounded-card p-7">
        <div>
          <h3 className="font-display text-xl font-medium text-ink">{strength.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{strength.description}</p>
        </div>
        <Visual />
      </article>
    </Reveal>
  );
}

export default function Bento() {
  const [code, ai, performance, motion] = profile.strengths;

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="mx-auto max-w-site px-6 py-section-sm sm:px-10 sm:py-section"
    >
      <SectionHeading
        index="02"
        eyebrow="Capabilities"
        title="Built like a product, not a page."
        support="The things I optimize for on every engagement — each one demonstrated somewhere on this site."
        headingId="capabilities-heading"
      />

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        <StrengthCard strength={code} className="md:col-span-2" delay={0} />
        <StrengthCard strength={ai} delay={0.08} />
        <StrengthCard strength={performance} delay={0.05} />
        <StrengthCard strength={motion} delay={0.1} />

        {/* Availability — small, real, current. */}
        <Reveal delay={0.15}>
          <article className="panel panel-hover flex h-full flex-col justify-between gap-6 rounded-card p-7">
            <div>
              <h3 className="font-display text-xl font-medium text-ink">Where & when</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{profile.availability}</p>
            </div>
            <p className="flex items-center gap-2.5 text-sm text-ink/80">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" aria-hidden="true" />
              {profile.location} · Remote-first · IST
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.12} className="md:col-span-3">
          <article className="panel rounded-card p-7">
            <Telemetry />
          </article>
        </Reveal>
      </div>
    </section>
  );
}
