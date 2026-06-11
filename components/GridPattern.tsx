/**
 * Adapted from 21st.dev — magicui/animated-grid-pattern. Re-built as a pure
 * SVG + CSS background (no framer-motion): a fine line grid, radially masked,
 * with a handful of cells breathing softly on staggered delays. Positions are
 * fixed (not random) so server and client render identically. Purely
 * decorative — hidden from assistive tech, static under reduced motion.
 */

const CELL = 56;

/** Fixed [col, row, delaySeconds] for the breathing cells. */
const ACTIVE_CELLS: [number, number, number][] = [
  [3, 2, 0],
  [11, 5, 2.2],
  [6, 7, 4.1],
  [16, 3, 1.3],
  [9, 1, 3.2],
  [14, 8, 5.0],
];

export default function GridPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{
        maskImage: "radial-gradient(38rem 24rem at 50% 38%, black, transparent)",
        WebkitMaskImage: "radial-gradient(38rem 24rem at 50% 38%, black, transparent)",
      }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bg-grid" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <path
              d={`M ${CELL} 0 L 0 0 0 ${CELL}`}
              fill="none"
              stroke="rgba(237, 237, 239, 0.06)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-grid)" />
        <g className="motion-reduce:hidden">
          {ACTIVE_CELLS.map(([col, row, delay]) => (
            <rect
              key={`${col}-${row}`}
              x={col * CELL + 1}
              y={row * CELL + 1}
              width={CELL - 2}
              height={CELL - 2}
              fill="rgba(226, 178, 90, 0.05)"
              style={{
                animation: "grid-cell 7s ease-in-out infinite",
                animationDelay: `${delay}s`,
                opacity: 0,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
