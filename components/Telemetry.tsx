"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Decorative "systems telemetry" panel — animated sparklines with gently
 * drifting values, themed to the site. The data is generated client-side and
 * the panel is explicitly labelled as illustrative; it exists to set a
 * systems-first tone, not to claim metrics.
 */

interface Channel {
  label: string;
  unit: string;
  base: number;
  jitter: number;
  decimals: number;
}

const CHANNELS: Channel[] = [
  { label: "Frame budget", unit: "ms", base: 9.2, jitter: 2.4, decimals: 1 },
  { label: "Stream latency", unit: "ms", base: 42, jitter: 14, decimals: 0 },
  { label: "Heap", unit: "MB", base: 38, jitter: 6, decimals: 0 },
];

const POINTS = 32;

/**
 * Deterministic PRNG (mulberry32). The initial series must be identical on
 * the server and the client or React reports a hydration mismatch — so the
 * seed values come from this, keyed per channel, and true randomness is only
 * used for the post-mount drift updates.
 */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function nextValue(channel: Channel, prev: number, rand: () => number = Math.random): number {
  const drift = (rand() - 0.5) * channel.jitter;
  const pull = (channel.base - prev) * 0.3; // mean-revert so lines stay calm
  return Math.max(0, prev + drift + pull);
}

function seedSeries(channel: Channel): number[] {
  const rand = mulberry32(
    channel.label.split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7),
  );
  const series: number[] = [channel.base];
  for (let i = 1; i < POINTS; i++) series.push(nextValue(channel, series[i - 1], rand));
  return series;
}

function toPolyline(series: number[], channel: Channel): string {
  const min = channel.base - channel.jitter * 1.6;
  const max = channel.base + channel.jitter * 1.6;
  return series
    .map((v, i) => {
      const x = (i / (POINTS - 1)) * 100;
      const y = 28 - ((v - min) / (max - min)) * 24;
      return `${x.toFixed(2)},${Math.min(Math.max(y, 2), 30).toFixed(2)}`;
    })
    .join(" ");
}

function Sparkline({ channel }: { channel: Channel }) {
  const [series, setSeries] = useState(() => seedSeries(channel));
  const frozen = useRef(false);

  useEffect(() => {
    frozen.current = prefersReducedMotion();
    if (frozen.current) return;
    const id = setInterval(() => {
      setSeries((prev) => [...prev.slice(1), nextValue(channel, prev[prev.length - 1])]);
    }, 1800);
    return () => clearInterval(id);
  }, [channel]);

  const current = series[series.length - 1];

  return (
    <div className="rounded-xl border border-line bg-base/60 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs tracking-widest text-muted">{channel.label.toUpperCase()}</p>
        <p className="font-display text-sm tabular-nums text-ink/90" aria-hidden="true">
          {current.toFixed(channel.decimals)}
          <span className="ml-0.5 text-muted">{channel.unit}</span>
        </p>
      </div>
      <svg
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        className="mt-3 h-12 w-full"
        aria-hidden="true"
      >
        <polyline
          points={toPolyline(series, channel)}
          fill="none"
          stroke="currentColor"
          className="text-accent"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.85"
          style={{ transition: "all 0.9s linear" }}
        />
        <line x1="0" y1="31" x2="100" y2="31" className="stroke-ink/10" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

export default function Telemetry() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <h3 className="font-display text-lg font-medium text-ink">Systems, not vibes</h3>
        </div>
        <span className="rounded-full border border-line px-3 py-1 text-[0.65rem] tracking-widest text-muted">
          DEMO VISUALIZATION · ILLUSTRATIVE DATA
        </span>
      </div>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
        Performance is monitored, not assumed — frame budgets, stream latency and
        memory are the dials I actually watch while building.
      </p>
      <div className="mt-6 grid flex-1 gap-3 sm:grid-cols-3">
        {CHANNELS.map((channel) => (
          <Sparkline key={channel.label} channel={channel} />
        ))}
      </div>
    </div>
  );
}
