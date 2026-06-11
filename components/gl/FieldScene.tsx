"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Theme } from "@/lib/theme";

/**
 * The page's second (and last) genuine 3D moment: a sparse field of faceted
 * shards drifting slowly in real depth behind the Selected Work section.
 * Deliberately quieter than the hero — no pointer interaction, no focal
 * object, one instanced draw call — it extends the hero's "objects in a lit
 * void" world into the body instead of competing with it. Lit by the same
 * system as everything else: white key light above, violet from the upper
 * right, blue from the lower left. Fog fades distant shards into the page
 * background, which is the depth cue doing most of the work.
 */

/** Mirrors the LOOKS tables in HeroScene/GlassScene — one lighting world. */
const FIELD_LOOKS = {
  dark: {
    body: "#161624",
    fog: "#0a0a0f",
    key: 1.1,
    violet: "#9F8FFF",
    blue: "#5CA8FF",
    fill: 1.4,
  },
  light: {
    body: "#ffffff",
    fog: "#f7f7fb",
    key: 1.6,
    violet: "#5B47D9",
    blue: "#2E6BD8",
    fill: 1.0,
  },
} as const;

/** Deterministic PRNG so server/client and remounts agree on the layout. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ShardSpec {
  x: number;
  y: number;
  z: number;
  scale: number;
  spinX: number;
  spinY: number;
  bobPhase: number;
  bobAmp: number;
}

interface ShardsProps {
  theme: Theme;
  lite: boolean;
  /** Section scroll progress (-1 below viewport … 1 above), set by the mount. */
  progress: { value: number };
}

function Shards({ theme, lite, progress }: ShardsProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const groupY = useRef(0);
  const { viewport } = useThree();
  const look = FIELD_LOOKS[theme];
  const count = lite ? 12 : 22;

  const specs = useMemo<ShardSpec[]>(() => {
    const rand = mulberry32(20260611);
    return Array.from({ length: count }, () => {
      const depth = rand(); // 0 = near, 1 = far
      return {
        x: (rand() - 0.5) * 13,
        y: (rand() - 0.5) * 7,
        z: -1.2 - depth * 6,
        scale: 0.34 - depth * 0.22 + rand() * 0.08,
        spinX: (rand() - 0.5) * 0.3,
        spinY: (rand() - 0.5) * 0.4,
        bobPhase: rand() * Math.PI * 2,
        bobAmp: 0.1 + rand() * 0.15,
      };
    });
  }, [count]);

  const geometry = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const m = mesh.current;
    return () => {
      (m?.material as THREE.Material | undefined)?.dispose();
      m?.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const d = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;

    // Whole field drifts gently against scroll — a depth layer behind the
    // cards, exponentially smoothed so it never feels bolted to the scrollbar.
    groupY.current += (progress.value * 0.9 - groupY.current) * (1 - Math.exp(-3 * d));

    const widthScale = Math.min(viewport.width / 12, 1.15);
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      dummy.position.set(
        s.x * widthScale,
        s.y + Math.sin(t * 0.25 + s.bobPhase) * s.bobAmp + groupY.current * (1 + s.z * 0.12),
        s.z,
      );
      dummy.rotation.set(t * s.spinX + s.bobPhase, t * s.spinY, 0);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <fog attach="fog" args={[look.fog, 4, 11]} />
      <directionalLight position={[1, 6, 4]} intensity={look.key} color="#ffffff" />
      {/* decay=0 keeps the colored fills readable across the field's depth
          (physical falloff would extinguish them by z=-7). */}
      <pointLight position={[7, 4, 1]} intensity={look.fill} decay={0} color={look.violet} />
      <pointLight position={[-7, -4, 0]} intensity={look.fill} decay={0} color={look.blue} />
      <instancedMesh ref={mesh} args={[geometry, undefined, count]} key={`${theme}-${count}`}>
        <meshStandardMaterial color={look.body} metalness={0.45} roughness={0.32} flatShading />
      </instancedMesh>
    </>
  );
}

interface FieldSceneProps {
  theme: Theme;
  lite: boolean;
  active: boolean;
  progress: { value: number };
}

export default function FieldScene({ theme, lite, active, progress }: FieldSceneProps) {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: true }}
      dpr={lite ? 1 : [1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 7], fov: 42 }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <Shards theme={theme} lite={lite} progress={progress} />
    </Canvas>
  );
}
