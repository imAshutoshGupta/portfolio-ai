"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// The WebGL scene (and three.js with it) only loads on the client, after we
// know the device can afford it — it never blocks first paint.
const GlassScene = dynamic(() => import("./GlassScene"), { ssr: false });

type Mode = "pending" | "full" | "lite" | "static";

/**
 * Decides how the hero background renders:
 *  - desktop, fine pointer        → full shader
 *  - touch / low-power            → lite shader (fewer octaves, DPR 1)
 *  - prefers-reduced-motion       → static gradient (no WebGL at all)
 * Also freezes the render loop whenever the hero is off-screen or the tab
 * is hidden, so the shader costs nothing while you read the rest of the page.
 */
export default function HeroCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [inView, setInView] = useState(true);
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
      // deviceMemory is non-standard but a useful hint where present
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
      <div className={`hero-fallback ${mode === "static" ? "" : "hero-fallback-animated"}`} />
      {(mode === "full" || mode === "lite") && (
        <GlassScene lite={mode === "lite"} active={inView && tabVisible} />
      )}
    </div>
  );
}
