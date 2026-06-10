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

function nextValue(channel: Channel, prev: number): number {
  const drift = (Math.random() - 0.5) * channel.jitter;
  const pull = (channel.base - prev) * 0.3; // mean-revert so lines stay calm
  return Math.max(0, prev + drift + pull);
}

function seedSeries(channel: Channel): number[] {
  const series: number[] = [channel.base];
  for (let i = 1; i < POINTS; i++) series.push(nextValue(channel, series[i - 1]));
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
          stroke="#E2B25A"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.85"
          style={{ transition: "all 0.9s linear" }}
        />
        <line x1="0" y1="31" x2="100" y2="31" stroke="rgba(237,237,239,0.1)" strokeWidth="0.5" />
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
