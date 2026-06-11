"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";

// The glass shader (and its three.js chunk) loads client-side only, after we
// know the device can afford it — it never blocks first paint.
const GlassScene = dynamic(() => import("./GlassScene"), { ssr: false });

type Mode = "pending" | "full" | "lite" | "static";

/**
 * The relocated glass refraction shader, now serving as the Contact section's
 * quiet backdrop (the 3D Möbius owns the hero). Same device policy as before:
 *  - desktop, fine pointer        → full shader
 *  - touch / low-power            → lite shader (fewer octaves, DPR 1)
 *  - prefers-reduced-motion       → static gradient (no WebGL at all)
 * The render loop freezes whenever the section is off-screen or the tab is
 * hidden, so it costs nothing until the visitor reaches the closing CTA.
 */
export default function GlassBackdrop() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>("pending");
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
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

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Static fallback paints immediately and stays as the floor under the canvas. */}
      <div className="glass-fallback" />
      {(mode === "full" || mode === "lite") && (
        <GlassScene lite={mode === "lite"} active={inView && tabVisible} theme={theme} />
      )}
    </div>
  );
}
