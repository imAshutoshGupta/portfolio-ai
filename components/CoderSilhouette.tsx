"use client";

import { useEffect, useId, useRef } from "react";
import { hasFinePointer, isCoarseOrLowPower, prefersReducedMotion } from "@/lib/motion";

/**
 * The midnight coder: a minimal pictogram silhouette of a developer at a desk,
 * lit by the monitor — the page's recurring secondary character. Each section
 * mounts it in a different micro-pose so scrolling reads as a tiny wordless
 * late-night-building story. Pure inline SVG (no assets), figure and desk in
 * ink tokens, screen glow in the accent pair, so both themes get the right
 * read: monitor-in-a-dark-room at night, calm desk-lamp accent in light.
 *
 * Cursor play (fine pointer, motion allowed, not low-power): the head turns
 * toward the cursor, the body leans a degree, and the screen glow brightens
 * with proximity. One shared window listener feeds every instance through a
 * single rAF; an IntersectionObserver subscribes only the instance currently
 * near the viewport, so off-screen coders cost nothing. Transform/opacity
 * only — smoothing comes from CSS transitions, not a continuous loop.
 *
 * Decorative: always aria-hidden, pointer-events-none at the call site.
 */

export type CoderPose = "typing" | "coffee" | "glance" | "leanIn" | "debug" | "shipped";

interface PoseSpec {
  /** Solid stroke paths: torso from the desk line up to the shoulder. */
  torso: string;
  /** Shoulder → elbow → hand polylines. */
  arms: string[];
  head: [number, number];
  /** Resting gaze in degrees — also the still pose under reduced motion. */
  headBase: number;
  /** How far the head will turn to follow the cursor. */
  headMax: number;
  /** Code-line widths on the screen — the scene's only "content". */
  lines: number[];
  caret?: boolean;
  keyboard?: boolean;
  mug?: boolean;
  /** Resting glow strength: dim for the bug, bright for the breakthrough. */
  glow: number;
}

const POSES: Record<CoderPose, PoseSpec> = {
  typing: {
    torso: "M44 80 L49 53",
    arms: ["M49 56 L62 68 L74 75"],
    head: [53, 42],
    headBase: 7,
    headMax: 9,
    lines: [20, 13, 17],
    caret: true,
    keyboard: true,
    glow: 0.85,
  },
  coffee: {
    torso: "M46 80 L41 54",
    arms: ["M42 58 L56 70 L66 76", "M42 57 L52 57 L56 49"],
    head: [42, 42],
    headBase: -4,
    headMax: 9,
    lines: [16, 11],
    mug: true,
    glow: 0.7,
  },
  glance: {
    torso: "M44 80 L47 53",
    arms: ["M47 56 L59 70 L70 76"],
    head: [50, 42],
    headBase: -16,
    headMax: 18,
    lines: [18, 14, 9],
    glow: 0.8,
  },
  leanIn: {
    torso: "M44 80 L57 55",
    arms: ["M57 58 L67 69 L79 75"],
    head: [63, 45],
    headBase: 8,
    headMax: 6,
    lines: [21, 15, 18, 11],
    caret: true,
    keyboard: true,
    glow: 1,
  },
  debug: {
    torso: "M44 80 L55 57",
    arms: ["M55 60 L67 75 L63 53"],
    head: [61, 49],
    headBase: 24,
    headMax: 4,
    lines: [14, 8],
    glow: 0.45,
  },
  shipped: {
    torso: "M46 80 L40 54",
    arms: ["M41 57 L31 45", "M41 58 L52 69 L62 76"],
    head: [40, 41],
    headBase: -12,
    headMax: 9,
    lines: [12],
    glow: 0.75,
  },
};

const FIG = "rgb(var(--c-ink) / 0.55)";
const FIG_SOFT = "rgb(var(--c-ink) / 0.3)";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/* One window pointermove listener + one rAF for every coder on the page;
   instances subscribe only while near the viewport. */
type PointerListener = (x: number, y: number) => void;
const listeners = new Set<PointerListener>();
let lastX = 0;
let lastY = 0;
let frame = 0;

function flush() {
  frame = 0;
  listeners.forEach((listener) => listener(lastX, lastY));
}

function onWindowMove(e: PointerEvent) {
  lastX = e.clientX;
  lastY = e.clientY;
  if (!frame) frame = requestAnimationFrame(flush);
}

function subscribe(listener: PointerListener) {
  if (listeners.size === 0) {
    window.addEventListener("pointermove", onWindowMove, { passive: true });
  }
  listeners.add(listener);
}

function unsubscribe(listener: PointerListener) {
  listeners.delete(listener);
  if (listeners.size === 0) {
    window.removeEventListener("pointermove", onWindowMove);
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }
}

interface CoderSilhouetteProps {
  pose: CoderPose;
  /** Mirror the scene for right-edge placements (figure faces the content). */
  flip?: boolean;
  className?: string;
}

export default function CoderSilhouette({ pose, flip = false, className = "" }: CoderSilhouetteProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const spec = POSES[pose];

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || prefersReducedMotion() || isCoarseOrLowPower() || !hasFinePointer()) return;

    const head = svg.querySelector<SVGGElement>("[data-head]");
    const body = svg.querySelector<SVGGElement>("[data-body]");
    if (!head || !body) return;

    // Mirrored instances need the gaze math mirrored too.
    const dir = flip ? -1 : 1;

    const rest = () => {
      svg.style.setProperty("--coder-glow", "0");
      head.style.transform = `rotate(${spec.headBase}deg)`;
      body.style.transform = "rotate(0deg)";
    };

    const follow: PointerListener = (x, y) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const dx = x - (rect.left + rect.width / 2);
      const dy = y - (rect.top + rect.height / 2);
      // Proximity drives the screen glow: the room brightens as you approach.
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / 520);
      svg.style.setProperty("--coder-glow", near.toFixed(3));
      const turn =
        clamp(dx * dir * 0.045, -spec.headMax, spec.headMax) + clamp(dy * 0.02, -3, 5);
      head.style.transform = `rotate(${(spec.headBase + turn).toFixed(2)}deg)`;
      body.style.transform = `rotate(${clamp(dx * dir * 0.006, -1.6, 1.6).toFixed(2)}deg)`;
    };

    let active = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !active) {
          subscribe(follow);
          active = true;
        } else if (!entry.isIntersecting && active) {
          unsubscribe(follow);
          active = false;
          rest();
        }
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(svg);

    return () => {
      io.disconnect();
      if (active) unsubscribe(follow);
    };
  }, [flip, spec]);

  const lastLine = spec.lines.length - 1;
  const caretX = 101 + spec.lines[lastLine] + 2;
  const caretY = 42 + lastLine * 4.6 - 0.6;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 150 96"
      aria-hidden="true"
      focusable="false"
      className={`${flip ? "-scale-x-100 " : ""}${className}`}
      style={{ "--coder-glow": 0 } as React.CSSProperties}
    >
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            style={{ stopColor: "rgb(var(--c-accent) / calc(var(--glow-violet-a) * 6))" }}
          />
          <stop
            offset="55%"
            style={{ stopColor: "rgb(var(--c-accent-b) / calc(var(--glow-blue-a) * 3))" }}
          />
          <stop offset="100%" style={{ stopColor: "rgb(var(--c-accent-b) / 0)" }} />
        </radialGradient>
        <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "rgb(var(--c-accent) / 0.8)" }} />
          <stop offset="100%" style={{ stopColor: "rgb(var(--c-accent-b) / 0.7)" }} />
        </linearGradient>
      </defs>

      {/* The room's one light source. Pulse lives on the wrapper so the
          cursor-proximity opacity on the ellipse composes with it. */}
      <g className="coder-glow" opacity={spec.glow}>
        <ellipse
          cx="102"
          cy="50"
          rx="46"
          ry="32"
          fill={`url(#${id}-glow)`}
          style={{ opacity: "calc(0.72 + var(--coder-glow, 0) * 0.28)" }}
        />
      </g>

      {/* Desk */}
      <path d="M24 78 H140" stroke={FIG_SOFT} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Monitor */}
      <path d="M115 62 V76" stroke={FIG} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M105 76.5 H125" stroke={FIG} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect
        x="96"
        y="36"
        width="38"
        height="26"
        rx="2.5"
        fill={`url(#${id}-screen)`}
        style={{ opacity: "calc(0.7 + var(--coder-glow, 0) * 0.3)" }}
      />
      {spec.lines.map((width, i) => (
        <rect
          key={i}
          x="101"
          y={42 + i * 4.6}
          width={width}
          height="1.8"
          rx="0.9"
          fill="rgb(var(--c-base) / 0.55)"
        />
      ))}
      {spec.caret && (
        <rect
          className="coder-caret"
          x={caretX}
          y={caretY}
          width="1.8"
          height="3"
          fill="rgb(var(--c-base) / 0.8)"
        />
      )}

      {spec.keyboard && (
        <path d="M64 75.2 H88" stroke={FIG} strokeWidth="3" strokeLinecap="round" fill="none" />
      )}

      {/* The figure: thick round strokes read as a solid pictogram. */}
      <g
        data-body
        className="coder-body"
        style={{ transformBox: "fill-box", transformOrigin: "25% 100%" }}
      >
        <path d={spec.torso} stroke={FIG} strokeWidth="7" strokeLinecap="round" fill="none" />
        {spec.arms.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={FIG}
            strokeWidth={i === 0 ? 4.5 : 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
        {spec.mug && (
          <>
            <rect x="55" y="42" width="7.5" height="7" rx="1.4" fill={FIG} />
            <path
              d="M62.5 44.2 a2.4 2.4 0 0 1 0 4.6"
              stroke={FIG}
              strokeWidth="1.6"
              fill="none"
            />
            <path
              d="M58 38.5 q1.8 -2.4 0 -5"
              stroke={FIG_SOFT}
              strokeWidth="1.3"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
        {/* Outer g positions the head; inner g rotates about its own center,
            and the nose wedge makes the gaze direction legible. */}
        <g transform={`translate(${spec.head[0]} ${spec.head[1]})`}>
          <g
            data-head
            className="coder-head"
            style={{ transformOrigin: "0px 0px", transform: `rotate(${spec.headBase}deg)` }}
          >
            <circle r="6.4" fill={FIG} />
            <path d="M4.8 -1.8 L9 0.4 L4.6 2.6 Z" fill={FIG} />
          </g>
        </g>
      </g>
    </svg>
  );
}
