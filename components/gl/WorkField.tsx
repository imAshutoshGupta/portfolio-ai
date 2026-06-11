"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";

// The shard field's three.js chunk loads client-side only, on demand.
const FieldScene = dynamic(() => import("./FieldScene"), { ssr: false });

type Mode = "pending" | "full" | "lite" | "static";

/**
 * Device-aware mount for the Selected Work shard field — same policy as the
 * hero and the Contact glass backdrop:
 *  - desktop, fine pointer   → full field (22 shards, DPR ≤ 1.5, parallax)
 *  - touch / low-power       → lite field (12 shards, DPR 1)
 *  - prefers-reduced-motion  → static CSS glows, no WebGL at all
 * The render loop freezes off-screen / tab hidden; the CSS fallback is also
 * the no-WebGL experience.
 */
export default function WorkField() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>("pending");
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const progress = useRef({ value: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode("static");
      return;
    }
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lowPower =
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) < 4;
    setMode(coarse || lowPower ? "lite" : "full");
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Section scroll progress (-1 entering from below … 1 leaving above) feeds
  // the field's damped parallax drift.
  useEffect(() => {
    if (mode === "static" || mode === "pending") return;
    const el = wrapperRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      progress.current.value = Math.max(
        -1,
        Math.min(1, (window.innerHeight / 2 - mid) / window.innerHeight),
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Static glows paint immediately and stay as the floor under the canvas. */}
      <div className="field-fallback" />
      {(mode === "full" || mode === "lite") && (
        <FieldScene
          theme={theme}
          lite={mode === "lite"}
          active={inView && tabVisible}
          progress={progress.current}
        />
      )}
    </div>
  );
}
