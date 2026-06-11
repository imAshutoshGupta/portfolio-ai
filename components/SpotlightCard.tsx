"use client";

import { useRef, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Adapted from 21st.dev — easemize/spotlight-card. Re-themed to our panel
 * tokens and ported off framer-motion: a pointer-tracked radial highlight on
 * the card surface and its 1px border (see .spotlight in globals.css).
 * Hover-only by design, so touch devices and reduced-motion users simply get
 * the plain panel.
 */
export default function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`);
    el.style.setProperty("--spot-y", `${(((e.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`spotlight ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
