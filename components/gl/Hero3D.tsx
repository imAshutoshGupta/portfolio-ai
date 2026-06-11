"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

/**
 * Safety valve: which hero subject to mount.
 *  - "morph"  → MorphScene, the crystallizing orb (current)
 *  - "mobius" → HeroScene, the previous Möbius ribbon (kept intact)
 * Flip this one constant to revert the hero; only the chosen chunk loads.
 */
const HERO_VARIANT = "morph" as "morph" | "mobius";

// three.js loads client-side only, after device capability is known.
const HeroScene = dynamic(
  () => (HERO_VARIANT === "mobius" ? import("./HeroScene") : import("./MorphScene")),
  { ssr: false },
);

type Mode = "pending" | "full" | "lite";

/**
 * Device-aware mount for the 3D hero:
 *  - desktop, fine pointer  → full mesh, AA, DPR ≤ 1.75, cursor + parallax
 *  - touch / low-power      → lighter mesh, DPR 1, no pointer nudge
 *  - prefers-reduced-motion → same scene, statically framed, single render
 * In full morph mode the canvas layer is viewport-FIXED so the orb can hand
 * off into the page: the resolved crystal drifts up-right, shrinks and
 * dissolves behind the first sections as they scroll over it. The layer is
 * hidden and the loop frozen once the handoff completes (~1.85 viewports),
 * off-screen, or when the tab hides. A CSS void underpaints the hero itself
 * (and is the no-WebGL experience).
 */
export default function Hero3D() {
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>("pending");
  const [reduced, setReduced] = useState(false);
  const [past, setPast] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  // Only full-power morph gets the fixed handoff layer; lite/reduced (and
  // the Möbius) stay confined to the hero section as before.
  const fixedHandoff = HERO_VARIANT === "morph" && mode === "full" && !reduced;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lowPower =
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) < 4;
    setMode(coarse || lowPower ? "lite" : "full");
  }, []);

  useEffect(() => {
    if (mode === "pending") return;
    const onScroll = () => {
      // The hero sits at the page top, so a scroll threshold is the
      // visibility test; the fixed layer lives a bit longer for the handoff.
      setPast(window.scrollY > window.innerHeight * (fixedHandoff ? 1.85 : 1.2));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mode, fixedHandoff]);

  // MorphScene tracks the pointer via its own window listener, so its layer
  // never intercepts events; HeroScene still reads pointer from its canvas.
  const sceneLayer = fixedHandoff
    ? "pointer-events-none fixed inset-0"
    : HERO_VARIANT === "morph"
      ? "pointer-events-none absolute inset-0 overflow-hidden"
      : "absolute inset-0 overflow-hidden";

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero3d-fallback" />
      {mode !== "pending" && (
        <div className={`${sceneLayer}${past ? " hidden" : ""}`}>
          <HeroScene
            theme={theme}
            lite={mode === "lite"}
            reduced={reduced}
            active={!past && tabVisible}
          />
        </div>
      )}
    </div>
  );
}
