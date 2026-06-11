# CLAUDE.md — project map

Read this first. Only open the specific files a task requires; consult others when needed.

## What this is

A single-page developer portfolio (Ashutosh Gupta) built as its own proof of skill: procedural
3D, a working AI assistant, strict performance budget. Deploys to Vercel with zero config.

**Stack:** Next.js 15 (App Router, static `/` + one dynamic API route) · React 19 · TypeScript ·
Tailwind 3 (token-based) · three.js + @react-three/fiber + drei (lazy chunks only) · GSAP +
ScrollTrigger · Lenis smooth scroll · @anthropic-ai/sdk (optional, env-gated).
`maath` (damped easing) comes transitively via drei — not a direct dep.

**Scripts:** `npm run dev` / `build` / `typecheck`.

## Current state

- Branch: `claude/nifty-mccarthy-4399ki`. Last commit: `2ad7f31` (sixth iteration).
- Builds clean; first-load JS for `/` ≈ **171 kB** (budget: stay ≈168–175 kB; all three.js is
  lazy-loaded outside this number).
- Site flow: Preloader → Hero (Möbius 3D) → Stats → TechMarquee → About → divider → Bento
  (capabilities) → Ask (AI chat) → Work (case studies + shard field 3D) → divider → Process →
  Experience (+ education) → divider → FAQ → Contact (glass shader backdrop) → Footer.
- `data/profile.ts` contains `[PLACEHOLDER: …]` strings awaiting the owner's real content.
  They render italicized on-site and are auto-excluded from the AI prompt via `isPlaceholder()`.

## File map

```
app/
  layout.tsx          Root layout: fonts, SEO/OG metadata, pre-paint theme script
  page.tsx            Section assembly + chapter Atmosphere wrap + SectionDividers
  globals.css         Theme tokens (--c-*), lighting tokens (--shadow-elev, --glow-*-a),
                      .panel surfaces, 21st.dev component styles, keyframes
  api/ask/route.ts    POST endpoint: streams AI answers, X-AI-Provider header
  opengraph-image.tsx Code-rendered OG image
data/
  profile.ts          SINGLE SOURCE OF TRUTH: all copy, projects (+caseStudy), experience
                      (+scope/tech), education, currentFocus, stats, FAQ. Exports
                      isPlaceholder(). Feeds both the visible site AND the AI.
lib/
  ai/index.ts         Provider selection (env-driven), ai/types.ts AIProvider interface
  ai/local.ts         Zero-cost demo engine: intent matching over profile.ts, fake streaming
  ai/anthropic.ts     Claude provider | ai/openai.ts OpenAI provider
  ai/prompt.ts        System prompt built from profile.ts; filters [PLACEHOLDER strings
  motion.ts           gsap + ScrollTrigger registration, prefersReducedMotion, hasFinePointer
  scroll.ts           Lenis-aware scrollToSection | theme.ts useTheme() + applyTheme()
components/gl/        (all WebGL: dynamic import, ssr:false, frameloop frozen off-screen,
                       DPR capped, disposed on unmount, CSS fallback floor underneath)
  Hero3D.tsx          Device-aware mount for the hero (full/lite/reduced modes)
  HeroScene.tsx       Möbius ribbon: procedural geometry, Lightformer env (frames={1}),
                      outer tilt group = damped cursor swing, inner group = slow orbit
  WorkField.tsx       Mount for the second 3D moment (Work section backdrop)
  FieldScene.tsx      Instanced octahedron shard field: 1 draw call, theme fog/lights,
                      scroll-parallax drift; decay={0} fills (physical falloff too dim)
  GlassBackdrop.tsx   Mount for Contact's glass shader | GlassScene.tsx Canvas + uniforms
  glassShader.ts      Custom GLSL refraction shader
components/sections/  One file per page section; all consume profile.ts
  Hero.tsx            Headline + Hero3D + bottom depth-handoff fade
  Work.tsx            Project cards + expandable case studies (aria-expanded disclosure)
                      + WorkField backdrop
  Experience.tsx      Timeline (+scope, tech chips) + education block
  Ask.tsx             AI chat window (fetch /api/ask, streamed)
  About / Bento / Stats / Process / Faq / Contact  as named
components/
  Atmosphere.tsx      Site-wide depth layer: violet glow upper-right, blue lower-left,
                      optional GSAP scroll parallax — THE lighting-coherence primitive
  SectionDivider.tsx  Accent-lit hairline seam between page chapters
  Reveal.tsx          Scroll fade-rise (once) | RevealText.tsx split-text headline reveal
  Nav.tsx (tubelight scrollspy) · ThemeToggle · Preloader · SmoothScroll (Lenis) ·
  Cursor · Magnetic · SpotlightCard · GridPattern · TechMarquee · Telemetry · CountUp ·
  SectionHeading · Footer
```

## Design invariants (do not violate)

- **Performance:** 60fps target; first-load ≈168–175 kB; all WebGL lazy (`next/dynamic`,
  `ssr:false`), frameloop `"never"` when off-screen/tab hidden, DPR ≤1.75 (hero) / ≤1.5
  (others), geometries+materials disposed on unmount.
- **Code-rendered only:** no .glb/.obj/.gltf/texture/HDR/image asset files — procedural
  geometry, code-defined lights, CSS/SVG visuals.
- **Lighting system:** one world — white key light above, violet fill upper-right, blue
  lower-left. New surfaces use `--shadow-elev` downward shadows and the Atmosphere angles.
- **Theming:** every color via tokens (`--c-*` in globals.css / Tailwind aliases). No
  hardcoded hex in components — exception: the gl/ LOOKS tables, which mirror token values
  per theme and must be kept in sync with globals.css.
- **Accessibility:** WCAG AA contrast in BOTH themes; prefers-reduced-motion → static
  fallbacks everywhere (no canvas for glass/field, static hero frame, no parallax);
  interactive widgets follow WAI-ARIA (tabs in Process, disclosures in Faq/Work).
- **Mobile/low-power:** pointer-coarse or ≤4 cores → lite scenes (fewer segments/instances,
  DPR 1); CSS gradient fallbacks are the no-WebGL experience.
- **Content honesty:** never invent metrics/clients/outcomes. Structure gaps get
  `[PLACEHOLDER: …]` strings in profile.ts (rendered italic, excluded from AI prompt).
- **profile.ts is the single source of truth** for all copy and AI knowledge.
- **SEO/OG:** metadata lives in app/layout.tsx + opengraph-image.tsx — keep intact.

## What not to touch (without explicit instruction)

- The Möbius hero concept (`gl/HeroScene.tsx` geometry/material) — tune, don't replace.
- The glass shader and its place as Contact's backdrop (`gl/Glass*`, `glassShader.ts`).
- The AI provider architecture (`lib/ai/*`, `app/api/ask/route.ts`) and its model-agnostic
  interface; the local demo engine must keep working with zero env vars.
- Theme token system / pre-paint theme script in layout.tsx.
- Section numbering scheme (01–08 in SectionHeading/Contact) — renumber if sections change.
- Lenis + GSAP integration (`SmoothScroll.tsx`, `lib/motion.ts`).
- package.json deps — adding any dependency needs a stated justification.

## Maintenance rule

End every pass by updating this file if structure, state, or invariants changed (fold the
changelog into "Current state"). Keep it a map, not a mirror.
