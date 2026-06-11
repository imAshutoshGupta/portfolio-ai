/**
 * Custom "liquid glass" refraction shader — formerly the hero, now relocated
 * as the restrained backdrop of the closing Contact section (the new 3D hero
 * owns the opening; this bookends the page with the established craft).
 *
 * A procedural background (two soft tinted glows and a faint light shaft) is
 * rendered behind a virtual glass surface. The glass is a fractal height
 * field whose gradient bends the sampling rays (refraction), with per-channel
 * offsets producing chromatic aberration along the distortion edges. The
 * cursor presses a soft ripple into the surface.
 *
 * All colors arrive as uniforms so both themes drive it from the same token
 * palette. uLightMode switches the glow math: additive light on a dark base,
 * subtractive tinting on a light base (additive washes out on near-white).
 */

export const glassVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glassFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;          // pointer position in uv space (smoothed)
  uniform float uMouseStrength;  // 0..1, follows pointer velocity, decays
  uniform float uOctaves;        // fbm octaves: 3 on low-power, 5 on desktop
  uniform vec3  uBase;           // void color (theme base)
  uniform vec3  uTintA;          // accent (violet)
  uniform vec3  uTintB;          // accent-b (blue)
  uniform float uLightMode;      // 0 = dark (additive), 1 = light (subtractive)
  uniform float uAmp;            // overall glow amplitude

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      if (float(i) >= uOctaves) break;
      value += amplitude * noise(p);
      p = rot * p * 2.05 + 11.5;
      amplitude *= 0.5;
    }
    return value;
  }

  // Adds light on a dark base; pulls toward the tint on a light base.
  vec3 glow(vec3 col, vec3 tint, float g) {
    vec3 additive = col + tint * g;
    vec3 subtractive = col - (vec3(1.0) - tint) * g * 1.1;
    return mix(additive, subtractive, uLightMode);
  }

  // The scene "behind the glass": calm gradients, never busy.
  vec3 background(vec2 uv) {
    vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

    vec3 col = uBase;

    // Violet glow drifting top-right.
    vec2 g1 = vec2(0.34 + 0.10 * sin(uTime * 0.050), 0.16 + 0.08 * cos(uTime * 0.041));
    float d1 = length(p - g1);
    col = glow(col, uTintA, 0.150 * uAmp * exp(-d1 * d1 * 3.2));

    // Blue counter-glow bottom-left for depth.
    vec2 g2 = vec2(-0.46 + 0.08 * cos(uTime * 0.036), -0.24 + 0.08 * sin(uTime * 0.047));
    float d2 = length(p - g2);
    col = glow(col, uTintB, 0.110 * uAmp * exp(-d2 * d2 * 2.6));

    // A faint diagonal shaft of light, slowly swaying.
    float axis = p.x + p.y * 0.65 - 0.12 + 0.08 * sin(uTime * 0.03);
    col = glow(col, uTintA, 0.045 * uAmp * exp(-axis * axis * 7.0));

    return col;
  }

  // Glass surface height: slow fractal swell + cursor ripple.
  float surfaceHeight(vec2 uv) {
    vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0);

    float h = fbm(p * 2.6 + vec2(uTime * 0.045, -uTime * 0.03));
    h += 0.5 * fbm(p * 5.2 - vec2(uTime * 0.02, uTime * 0.035));

    // Cursor: a soft gaussian press with one delicate trailing ring.
    vec2 m = (uv - uMouse) * vec2(uResolution.x / uResolution.y, 1.0);
    float md = length(m);
    float press = exp(-md * md * 26.0);
    float ring  = sin(md * 24.0 - uTime * 2.4) * exp(-md * 5.5) * 0.22;
    h += (press * 0.85 + ring) * uMouseStrength;

    return h;
  }

  void main() {
    vec2 uv = vUv;

    // Surface normal from finite differences of the height field.
    float eps = 0.004;
    float h  = surfaceHeight(uv);
    float hx = surfaceHeight(uv + vec2(eps, 0.0)) - h;
    float hy = surfaceHeight(uv + vec2(0.0, eps)) - h;
    vec2 grad = vec2(hx, hy) / eps;

    // Refraction strength breathes slightly; backdrop duty means it stays calm.
    float strength = (0.022 + 0.009 * sin(uTime * 0.2)) + 0.024 * uMouseStrength;
    vec2 offset = grad * strength;

    // Chromatic aberration: each channel bends a touch differently.
    vec3 col;
    col.r = background(uv + offset * 1.07).r;
    col.g = background(uv + offset).g;
    col.b = background(uv + offset * 0.93).b;

    // Specular sheen along steep glass edges — light catching the bevel.
    float edge = smoothstep(0.55, 1.6, length(grad));
    col = glow(col, uTintA, pow(edge, 2.0) * 0.13 * uAmp);

    // Cold inner reflection on the opposing slope keeps the glass dimensional.
    float backEdge = smoothstep(0.55, 1.6, length(-grad + vec2(0.4)));
    col = glow(col, uTintB, pow(backEdge, 2.4) * 0.045 * uAmp);

    // Gentle vignette to seat the type (lighter touch on the light theme).
    vec2 vp = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    float vig = smoothstep(1.15, 0.30, length(vp));
    col *= mix(mix(0.78, 1.0, vig), mix(0.94, 1.0, vig), uLightMode);

    // Fine film grain defeats gradient banding.
    col += (hash(uv * uResolution.xy + fract(uTime) * 113.0) - 0.5) * 0.02;

    gl_FragColor = vec4(col, 1.0);
  }
`;
