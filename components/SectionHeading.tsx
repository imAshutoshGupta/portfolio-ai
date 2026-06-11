import RevealText from "./RevealText";
import Reveal from "./Reveal";
import Parallax from "./Parallax";

interface SectionHeadingProps {
  /** Two-digit section index, e.g. "03". */
  index: string;
  eyebrow: string;
  title: string;
  support?: string;
  headingId: string;
}

/**
 * The shared section header: small uppercase eyebrow, confident headline,
 * optional supporting line. Every section uses this so the page keeps one
 * consistent rhythm.
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  support,
  headingId,
}: SectionHeadingProps) {
  return (
    <header className="max-w-3xl">
      {/* Headers ride a hair faster than the body — foreground plane. */}
      <Parallax speed={4}>
        <Reveal y={0}>
          <p className="mb-4 flex items-center gap-3 text-xs font-medium tracking-[0.2em] text-accent">
            <span className="text-muted">{index}</span>
            <span className="h-px w-6 bg-accent/40" aria-hidden="true" />
            {eyebrow.toUpperCase()}
          </p>
        </Reveal>
        <RevealText
          id={headingId}
          className="font-display text-[clamp(1.9rem,4.5vw,3.4rem)] font-medium leading-tight tracking-tight text-ink"
        >
          {title}
        </RevealText>
        {support && (
          <Reveal>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{support}</p>
          </Reveal>
        )}
      </Parallax>
    </header>
  );
}
