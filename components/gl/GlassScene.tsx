"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { glassVertexShader, glassFragmentShader } from "./glassShader";
import type { Theme } from "@/lib/theme";

interface GlassSceneProps {
  /** Lower octave count + capped DPR for touch / low-power devices. */
  lite: boolean;
  /** When false the render loop is frozen (section off-screen, tab hidden). */
  active: boolean;
  theme: Theme;
}

/** Token palette → shader uniforms, per theme. */
const GLASS_LOOKS: Record<
  Theme,
  { base: THREE.Color; tintA: THREE.Color; tintB: THREE.Color; lightMode: number; amp: number }
> = {
  dark: {
    base: new THREE.Color(10 / 255, 10 / 255, 15 / 255),
    tintA: new THREE.Color(159 / 255, 143 / 255, 255 / 255),
    tintB: new THREE.Color(92 / 255, 168 / 255, 255 / 255),
    lightMode: 0,
    amp: 1,
  },
  light: {
    base: new THREE.Color(247 / 255, 247 / 255, 251 / 255),
    tintA: new THREE.Color(91 / 255, 71 / 255, 217 / 255),
    tintB: new THREE.Color(46 / 255, 107 / 255, 216 / 255),
    lightMode: 1,
    amp: 0.55,
  },
};

interface PointerState {
  target: THREE.Vector2;
  strengthTarget: number;
}

function GlassPlane({
  lite,
  theme,
  pointer,
}: {
  lite: boolean;
  theme: Theme;
  pointer: PointerState;
}) {
  const { viewport, size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const smoothedMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const smoothedStrength = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseStrength: { value: 0 },
      uOctaves: { value: lite ? 3 : 5 },
      uBase: { value: GLASS_LOOKS.dark.base.clone() },
      uTintA: { value: GLASS_LOOKS.dark.tintA.clone() },
      uTintB: { value: GLASS_LOOKS.dark.tintB.clone() },
      uLightMode: { value: 0 },
      uAmp: { value: 1 },
    }),
    // Created once per mount; theme/lite updates flow through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uOctaves.value = lite ? 3 : 5;
  }, [lite, uniforms]);

  useEffect(() => {
    const look = GLASS_LOOKS[theme];
    uniforms.uBase.value.copy(look.base);
    uniforms.uTintA.value.copy(look.tintA);
    uniforms.uTintB.value.copy(look.tintB);
    uniforms.uLightMode.value = look.lightMode;
    uniforms.uAmp.value = look.amp;
  }, [theme, uniforms]);

  // Explicit GPU resource cleanup on unmount.
  useEffect(() => {
    const material = materialRef.current;
    return () => {
      material?.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    const d = Math.min(delta, 1 / 20);

    mat.uniforms.uTime.value += d;
    mat.uniforms.uResolution.value.set(size.width, size.height);

    // Critically-damped chase keeps the ripple liquid rather than twitchy.
    smoothedMouse.current.lerp(pointer.target, 1 - Math.exp(-6 * d));
    mat.uniforms.uMouse.value.copy(smoothedMouse.current);

    pointer.strengthTarget *= Math.exp(-1.8 * d); // decay while pointer rests
    smoothedStrength.current +=
      (pointer.strengthTarget - smoothedStrength.current) * (1 - Math.exp(-5 * d));
    mat.uniforms.uMouseStrength.value = smoothedStrength.current;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={glassVertexShader}
        fragmentShader={glassFragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function GlassScene({ lite, active, theme }: GlassSceneProps) {
  const pointer = useRef<PointerState>({
    target: new THREE.Vector2(0.5, 0.5),
    strengthTarget: 0,
  });
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (lite) return; // touch devices: no pointer ripple, calmer baseline
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      pointer.current.target.set(x, y);
      if (lastPos.current) {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;
        const speed = Math.hypot(dx, dy) * 30;
        pointer.current.strengthTarget = Math.min(
          pointer.current.strengthTarget + speed,
          1,
        );
      }
      lastPos.current = { x, y };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [lite]);

  return (
    <Canvas
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
      }}
      dpr={lite ? 1 : [1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 1], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <GlassPlane lite={lite} theme={theme} pointer={pointer.current} />
    </Canvas>
  );
}
