"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { damp } from "maath/easing";
import * as THREE from "three";
import type { Theme } from "@/lib/theme";

/**
 * The hero subject: a Möbius ribbon — one continuous surface with no front or
 * back, swept procedurally (no model files). A rounded-rectangle cross-section
 * travels a circle while turning 180°, so the half-twist catches the rim
 * lights differently at every degree of the slow orbit.
 */
function buildMobius(uSeg: number, vSeg: number): THREE.BufferGeometry {
  const R = 1.5; // ring radius
  const W = 0.55; // band half-width
  const T = 0.07; // band half-thickness
  const P = 0.35; // superellipse exponent → softly rounded edges

  const positions = new Float32Array((uSeg + 1) * (vSeg + 1) * 3);
  const indices: number[] = [];
  let ptr = 0;

  for (let i = 0; i <= uSeg; i++) {
    const u = (i / uSeg) * Math.PI * 2;
    const cu = Math.cos(u);
    const su = Math.sin(u);
    // Half-twist over the full loop = Möbius. The cross-section is symmetric
    // under 180°, so the seam closes onto itself.
    const phi = u / 2;
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);

    for (let j = 0; j <= vSeg; j++) {
      const v = (j / vSeg) * Math.PI * 2;
      const cv = Math.cos(v);
      const sv = Math.sin(v);
      const x = W * Math.sign(cv) * Math.pow(Math.abs(cv), P);
      const y = T * Math.sign(sv) * Math.pow(Math.abs(sv), P);
      const rx = x * cp - y * sp;
      const ry = x * sp + y * cp;
      positions[ptr++] = (R + rx) * cu;
      positions[ptr++] = ry;
      positions[ptr++] = (R + rx) * su;
    }
  }

  for (let i = 0; i < uSeg; i++) {
    for (let j = 0; j < vSeg; j++) {
      const a = i * (vSeg + 1) + j;
      const b = a + vSeg + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Lighting + material recipes per theme — the object must belong in both voids. */
const LOOKS = {
  dark: {
    body: "#10101c",
    metalness: 0.5,
    roughness: 0.26,
    iridescence: 1,
    envTop: "#c9ccff",
    envViolet: "#9F8FFF",
    envBlue: "#5CA8FF",
    envIntensity: 1.1,
  },
  light: {
    body: "#e7e7f3",
    metalness: 0.3,
    roughness: 0.38,
    iridescence: 0.6,
    envTop: "#ffffff",
    envViolet: "#5B47D9",
    envBlue: "#2E6BD8",
    envIntensity: 1.3,
  },
} as const;

interface SceneProps {
  theme: Theme;
  lite: boolean;
  reduced: boolean;
}

function Ribbon({ theme, lite, reduced }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshPhysicalMaterial>(null);
  const scrollRef = useRef(0);
  const { viewport } = useThree();
  const look = LOOKS[theme];

  const geometry = useMemo(() => buildMobius(lite ? 160 : 288, lite ? 28 : 48), [lite]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const mat = material.current;
    return () => {
      mat?.dispose();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(window.scrollY / window.innerHeight, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || reduced) return;
    const d = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;
    const px = lite ? 0 : state.pointer.x;
    const py = lite ? 0 : state.pointer.y;

    // Slow orbit with weight; the cursor nudges, damping settles it back.
    g.rotation.y += d * 0.16;
    damp(g.rotation, "x", 0.5 + py * 0.16 + scrollRef.current * 0.55, 0.6, d);
    damp(g.rotation, "z", -0.16 + px * 0.12, 0.8, d);
    g.position.y = Math.sin(t * 0.55) * 0.07 + scrollRef.current * 0.6;

    // Camera parallax: a few degrees of true Z-depth drift, also damped.
    damp(state.camera.position, "x", px * 0.35, 1.2, d);
    damp(state.camera.position, "y", -py * 0.22, 1.2, d);
    state.camera.lookAt(0, 0.1, 0);
  });

  // The subject sits right-of-center on wide viewports, centered on small.
  const offsetX = viewport.width > 7 ? viewport.width * 0.16 : 0;
  const scale = THREE.MathUtils.clamp(viewport.width / 8.5, 0.55, 1.05);

  return (
    <group position={[offsetX, 0.1, 0]} scale={scale}>
      <group ref={group} rotation={[0.5, 0.9, -0.16]}>
        <mesh geometry={geometry}>
          <meshPhysicalMaterial
            ref={material}
            key={theme}
            color={look.body}
            metalness={look.metalness}
            roughness={look.roughness}
            clearcoat={1}
            clearcoatRoughness={0.3}
            iridescence={look.iridescence}
            iridescenceIOR={1.6}
            envMapIntensity={look.envIntensity}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

interface HeroSceneProps extends SceneProps {
  active: boolean;
}

export default function HeroScene({ theme, lite, reduced, active }: HeroSceneProps) {
  return (
    <Canvas
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance", stencil: false }}
      dpr={lite ? 1 : [1, 1.75]}
      frameloop={reduced ? "demand" : active ? "always" : "never"}
      camera={{ position: [0, 0, 5.4], fov: 38 }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <Ribbon theme={theme} lite={lite} reduced={reduced} />
      {/* Code-defined studio lighting — no external HDR files. Re-baked when
          the theme flips (key) since frames={1} renders the env once. */}
      <Environment frames={1} resolution={lite ? 128 : 256} key={theme}>
        <Lightformer
          form="rect"
          intensity={theme === "dark" ? 2.4 : 3.2}
          color={LOOKS[theme].envTop}
          position={[0, 4, 2]}
          rotation={[-Math.PI / 2.4, 0, 0]}
          scale={[8, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={theme === "dark" ? 3.2 : 1.8}
          color={LOOKS[theme].envViolet}
          position={[-4.5, 0.5, 1]}
          rotation={[0, Math.PI / 2.6, 0]}
          scale={[5, 1.6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={theme === "dark" ? 3.0 : 1.8}
          color={LOOKS[theme].envBlue}
          position={[4.5, -0.6, -0.5]}
          rotation={[0, -Math.PI / 2.6, 0]}
          scale={[5, 1.4, 1]}
        />
        <Lightformer
          form="circle"
          intensity={theme === "dark" ? 1.2 : 2.2}
          color={LOOKS[theme].envTop}
          position={[0, -3.5, 1.5]}
          rotation={[Math.PI / 2.3, 0, 0]}
          scale={[6, 6, 1]}
        />
      </Environment>
    </Canvas>
  );
}
