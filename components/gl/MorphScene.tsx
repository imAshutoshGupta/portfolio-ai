"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { damp, damp3 } from "maath/easing";
import * as THREE from "three";
import type { Theme } from "@/lib/theme";

/**
 * The hero subject: "the idea crystallizes". One abstract orb whose surface is
 * displaced by flowing FBM noise — molten, undecided — and which resolves as
 * the visitor scrolls: the flow freezes, facets sharpen out of the fluid, and
 * a fine violet→blue structure grid surfaces. Idea → structure → product, told
 * by one object instead of words.
 *
 * Everything morph-related lives in shader uniforms (MeshPhysicalMaterial
 * extended via onBeforeCompile): per frame the CPU only damps a scroll
 * progress value and writes ~8 floats. The displacement, the analytic
 * normals, the facet blend (screen-space derivative normals) and the grid
 * are GPU work on a fixed-topology icosphere — no geometry rebuilds, ever.
 */

/** Lighting + material recipes per theme — kept in sync with globals.css tokens. */
const LOOKS = {
  dark: {
    body: "#12101e",
    metalness: 0.45,
    iridescence: 0.9,
    envTop: "#c9ccff",
    envViolet: "#9F8FFF", // --c-accent
    envBlue: "#5CA8FF", // --c-accent-b
    envIntensity: 1.15,
    rimGain: 1,
  },
  light: {
    body: "#e8e7f4",
    metalness: 0.3,
    iridescence: 0.55,
    envTop: "#ffffff",
    envViolet: "#5B47D9", // --c-accent
    envBlue: "#2E6BD8", // --c-accent-b
    envIntensity: 1.3,
    rimGain: 0.45,
  },
} as const;

/* Compact 3D simplex noise (Ashima/IQ public-domain pattern) + 3-octave FBM. */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float n = snoise(p);
  n += 0.32 * snoise(p * 2.1 + 17.0);
  n += 0.1 * snoise(p * 4.3 + 31.0);
  return n * 0.62;
}
`;

const VERT_HEAD = /* glsl */ `
uniform float uAmp;
uniform float uFreq;
uniform float uFlow;
uniform vec3 uPointer;
uniform float uPoke;
varying vec3 vDir;
varying float vCrest;
varying float vPoke;
${NOISE_GLSL}
vec3 morphed(vec3 dir, out float crest){
  crest = fbm(dir * uFreq + vec3(0.0, uFlow * 0.35, uFlow));
  // The cursor physically excites the surface: a local swell on the side of
  // the orb facing the pointer (uPointer is the damped pointer direction in
  // object space; uPoke fades as the form resolves).
  float poke = smoothstep(0.55, 0.95, dot(dir, uPointer));
  return dir * (1.0 + crest * uAmp + poke * uPoke);
}
`;

/* Displace radially along the unit sphere and rebuild the normal analytically
   from two tangent-plane neighbours — three FBM taps per vertex, fixed cost. */
const VERT_NORMAL = /* glsl */ `
vec3 dirN = normalize(position);
float crest;
vec3 dPos = morphed(dirN, crest);
vec3 tA = normalize(abs(dirN.y) < 0.99 ? cross(dirN, vec3(0.0, 1.0, 0.0)) : vec3(1.0, 0.0, 0.0));
vec3 tB = normalize(cross(dirN, tA));
float crestA; float crestB;
vec3 p1 = morphed(normalize(dirN + tA * 0.06), crestA);
vec3 p2 = morphed(normalize(dirN + tB * 0.06), crestB);
vec3 objectNormal = normalize(cross(p1 - dPos, p2 - dPos));
objectNormal *= sign(dot(objectNormal, dirN));
vDir = dirN;
vCrest = crest;
vPoke = smoothstep(0.55, 0.95, dot(dirN, uPointer));
`;

const FRAG_HEAD = /* glsl */ `
uniform float uFacet;
uniform float uGrid;
uniform float uRim;
uniform float uGridDensity;
uniform vec3 uViolet;
uniform vec3 uBlue;
varying vec3 vDir;
varying float vCrest;
varying float vPoke;
`;

/* Crystallize: blend the smooth analytic normal toward the true per-facet
   normal of the displaced surface (screen-space derivatives — free). */
const FRAG_FACET = /* glsl */ `
vec3 faceN = normalize(cross(dFdx(-vViewPosition), dFdy(-vViewPosition)));
faceN *= sign(dot(faceN, normal));
normal = normalize(mix(normal, faceN, uFacet));
`;

/* The accent character: a violet→blue fresnel rim keyed to the noise crests,
   plus the structure grid that surfaces as the form resolves. */
const FRAG_EMISSIVE = /* glsl */ `
float fres = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 2.6);
vec3 duo = mix(uBlue, uViolet, clamp(vCrest * 0.5 + 0.5, 0.0, 1.0));
totalEmissiveRadiance += duo * fres * uRim * (1.0 + vPoke * 1.1);
float lon = atan(vDir.z, vDir.x) / 6.2831853 + 0.5;
float lat = acos(clamp(vDir.y, -1.0, 1.0)) / 3.14159265;
float lonD = fwidth(lon);
float gx = abs(fract(lon * uGridDensity - 0.5) - 0.5) / max(lonD * uGridDensity, 1e-4);
float gy = abs(fract(lat * uGridDensity * 0.5 - 0.5) - 0.5) / max(fwidth(lat) * uGridDensity * 0.5, 1e-4);
float seamGuard = step(lonD, 0.2); // hide the atan wrap column
float gridLine = max((1.0 - min(gx, 1.0)) * seamGuard, 1.0 - min(gy, 1.0));
float poleFade = smoothstep(0.03, 0.2, lat) * smoothstep(0.03, 0.2, 1.0 - lat);
totalEmissiveRadiance += duo * gridLine * poleFade * uGrid * 0.4;
`;

/**
 * The three eased morph keyframes: fluid (idea) → structured (in progress) →
 * resolved (shipped). Scroll maps to p; everything else derives from it.
 */
function stateAt(p: number, rimGain: number) {
  const s1 = THREE.MathUtils.smoothstep(p, 0, 0.55);
  const s2 = THREE.MathUtils.smoothstep(p, 0.55, 1);
  const lerp = THREE.MathUtils.lerp;
  return {
    amp: lerp(lerp(0.34, 0.16, s1), 0.05, s2),
    freq: lerp(0.95, 1.55, s1),
    facet: lerp(lerp(0.0, 0.55, s1), 1.0, s2),
    grid: lerp(lerp(0.0, 0.3, s1), 1.0, s2),
    rim: lerp(lerp(0.85, 0.65, s1), 0.5, s2) * rimGain,
    flowSpeed: lerp(0.5, 0.04, p),
    roughness: lerp(lerp(0.36, 0.22, s1), 0.12, s2),
  };
}

interface SceneProps {
  theme: Theme;
  lite: boolean;
  reduced: boolean;
}

function CrystallizingOrb({ theme, lite, reduced }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const scrollRef = useRef(0); // page scroll in viewport-heights
  const pointerRef = useRef({ x: 0, y: 0 }); // own NDC tracking — the canvas is pointer-events-none
  const progress = useRef({ p: 0, h: 0 }); // p = morph, h = handoff into the page
  const flowTime = useRef(2.7); // non-zero start so frame one isn't a bald sphere
  const tmp = useRef({ q: new THREE.Quaternion(), v: new THREE.Vector3() });
  const { viewport } = useThree();
  const look = LOOKS[theme];

  // Fixed topology: detail 5 ≈ 20k tris (smooth silhouette, fine facets),
  // detail 4 ≈ 5k for lite. The morph never touches the buffer again.
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, lite ? 4 : 5), [lite]);

  const uniforms = useMemo(
    () => ({
      uAmp: { value: 0.42 },
      uFreq: { value: 1.15 },
      uFlow: { value: flowTime.current },
      uFacet: { value: 0 },
      uGrid: { value: 0 },
      uRim: { value: 0.85 },
      uGridDensity: { value: 18 },
      uPointer: { value: new THREE.Vector3(0, 0, 1) },
      uPoke: { value: 0 },
      uViolet: { value: new THREE.Color(look.envViolet) },
      uBlue: { value: new THREE.Color(look.envBlue) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: look.body,
      metalness: look.metalness,
      roughness: 0.36,
      transparent: true, // the handoff dissolve (convex form, back faces culled)
      clearcoat: 1,
      clearcoatRoughness: 0.3,
      iridescence: look.iridescence,
      iridescenceIOR: 1.6,
      envMapIntensity: look.envIntensity,
    });
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${VERT_HEAD}`)
        .replace("#include <beginnormal_vertex>", VERT_NORMAL)
        .replace("#include <begin_vertex>", "vec3 transformed = dPos;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${FRAG_HEAD}`)
        .replace(
          "#include <normal_fragment_begin>",
          `#include <normal_fragment_begin>\n${FRAG_FACET}`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>\n${FRAG_EMISSIVE}`,
        );
    };
    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  // Theme flip re-creates the material; restore the violet/blue uniforms it shares.
  useEffect(() => {
    uniforms.uViolet.value.set(look.envViolet);
    uniforms.uBlue.value.set(look.envBlue);
  }, [look, uniforms]);

  // Reduced motion / lite hold one beautiful state instead of morphing.
  // Reduced: structured-becoming-resolved, statically framed (single render).
  // Lite: the structured midpoint with a slow drift, no scroll work.
  useEffect(() => {
    if (!reduced && !lite) return;
    const s = stateAt(reduced ? 0.62 : 0.5, look.rimGain);
    uniforms.uAmp.value = s.amp;
    uniforms.uFreq.value = s.freq;
    uniforms.uFacet.value = s.facet;
    uniforms.uGrid.value = s.grid;
    uniforms.uRim.value = s.rim;
    material.roughness = s.roughness;
  }, [reduced, lite, look, uniforms, material]);

  useEffect(() => {
    if (reduced || lite) return;
    const onScroll = () => {
      scrollRef.current = window.scrollY / window.innerHeight;
    };
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced, lite]);

  useFrame((state, delta) => {
    const g = group.current;
    const tl = tilt.current;
    if (!g || !tl || reduced) return;
    const d = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;
    const px = lite ? 0 : pointerRef.current.x;
    const py = lite ? 0 : pointerRef.current.y;

    if (lite) {
      // Single cheap state: gentle drift, slow flow, nothing scroll-bound.
      flowTime.current += d * 0.14;
      uniforms.uFlow.value = flowTime.current;
      g.rotation.y += d * 0.1;
      return;
    }

    // Weighted progress, critically damped so a flick reads as one smooth
    // resolve, not a scrubbed jitter. p drives the morph over the hero;
    // h drives the handoff — the resolved crystal drifts up-right, shrinks
    // and dissolves behind the incoming sections (the canvas is fixed).
    const sy = scrollRef.current;
    damp(progress.current, "p", Math.min(sy / 0.9, 1), 0.35, d);
    damp(progress.current, "h", THREE.MathUtils.clamp((sy - 0.95) / 0.75, 0, 1), 0.3, d);
    const p = progress.current.p;
    const h = progress.current.h;
    const s = stateAt(p, look.rimGain);
    uniforms.uAmp.value = s.amp;
    uniforms.uFreq.value = s.freq;
    uniforms.uFacet.value = s.facet;
    uniforms.uGrid.value = s.grid;
    uniforms.uRim.value = s.rim;
    material.roughness = s.roughness;
    material.opacity = 1 - THREE.MathUtils.smoothstep(h, 0.45, 1);
    // The fluid flows; the crystal is still.
    flowTime.current += d * s.flowSpeed;
    uniforms.uFlow.value = flowTime.current;

    // Cursor excitation: pointer direction into object space (the surface
    // swell must stick to the side facing the cursor while the orb turns).
    const { q, v } = tmp.current;
    v.set(px * 1.2, py * 0.9, 0.9).normalize();
    g.getWorldQuaternion(q);
    v.applyQuaternion(q.invert());
    damp3(uniforms.uPointer.value, v, 0.25, d);
    uniforms.uPointer.value.normalize();
    uniforms.uPoke.value = THREE.MathUtils.lerp(0.18, 0.05, p) * (1 - h);

    // Slow autonomous turn + a settle as it resolves; the handoff carries it
    // up and right out of the content's way.
    g.rotation.y += d * (0.14 - p * 0.08);
    damp(g.rotation, "x", 0.15 + p * 0.3, 0.6, d);
    g.position.y = Math.sin(t * 0.5) * 0.06 * (1 - p * 0.7) + p * 0.4 + h * 1.5;
    g.position.x = h * 0.9;
    g.scale.setScalar(1 - h * 0.4);

    // Cursor sway on the outer group, slower camera parallax behind it.
    damp(tl.rotation, "y", px * 0.5, 0.5, d);
    damp(tl.rotation, "x", py * 0.32, 0.42, d);
    damp(tl.rotation, "z", -0.1 + px * 0.14, 0.7, d);
    damp(state.camera.position, "x", px * 0.5, 1.1, d);
    damp(state.camera.position, "y", -py * 0.3, 1.1, d);
    state.camera.lookAt(0, 0.1, 0);
  });

  // Staging: clearly right-of-center wherever the viewport is landscape-ish
  // (the name owns the left half); centered and lifted behind the headline
  // on portrait/mobile, where it also scales down a touch.
  const wide = viewport.width > 5;
  const offsetX = wide ? viewport.width * 0.27 : 0;
  const offsetY = wide ? 0.1 : 0.85;
  const scale = THREE.MathUtils.clamp(viewport.width / 8.5, 0.48, 1.05) * 1.45;

  return (
    <group position={[offsetX, offsetY, 0]} scale={scale}>
      <group ref={tilt} rotation={[0, 0, -0.1]}>
        <group ref={group} rotation={[0.15, 0.6, 0]}>
          <mesh geometry={geometry} material={material} />
        </group>
      </group>
    </group>
  );
}

interface MorphSceneProps extends SceneProps {
  active: boolean;
}

export default function MorphScene({ theme, lite, reduced, active }: MorphSceneProps) {
  return (
    <Canvas
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance", stencil: false }}
      dpr={lite ? 1 : [1, 1.75]}
      frameloop={reduced ? "demand" : active ? "always" : "never"}
      camera={{ position: [0, 0, 5.4], fov: 38 }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <CrystallizingOrb theme={theme} lite={lite} reduced={reduced} />
      {/* The same code-defined studio as the rest of the site: white key above,
          violet upper-right, blue lower-left. Re-baked on theme flip. */}
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
