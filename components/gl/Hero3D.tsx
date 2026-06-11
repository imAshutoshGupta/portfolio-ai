"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";

// three.js loads client-side only, after device capability is known.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type Mode = "pending" | "full" | "lite";

/**
 * Device-aware mount for the 3D hero:
 *  - desktop, fine pointer  → full mesh, AA, DPR ≤ 1.75, cursor + parallax
 *  - touch / low-power      → lighter mesh, DPR 1, no pointer nudge
 *  - prefers-reduced-motion → same scene, statically framed, single render
 * The render loop freezes when the hero is off-screen or the tab is hidden,
 * and a CSS void underpaints everything (and is the no-WebGL experience).
 */
export default function Hero3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>("pending");
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
      <div className="hero3d-fallback" />
      {mode !== "pending" && (
        <HeroScene
          theme={theme}
          lite={mode === "lite"}
          reduced={reduced}
          active={inView && tabVisible}
        />
      )}
    </div>
  );
}
