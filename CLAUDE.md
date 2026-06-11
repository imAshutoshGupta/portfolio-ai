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

- Branch: `claude/bold-thompson-qaab71` (ninth iteration: new hero — the crystallizing orb,
  scroll-morphed; Möbius kept as a one-flag fallback. A prior "midnight coder" silhouette
  pass was reverted — don't reintroduce corner figures).
- Builds clean; first-load JS for `/` ≈ **171 kB** (budget: stay ≈168–175 kB; all three.js is
  lazy-loaded outside this number).
- Site flow: Preloader → Hero (crystallizing orb 3D) → Stats → TechMarquee → About → NarrativeStatement
  (scroll-pinned beat) → Bento (capabilities) → Ask (AI chat) → divider "The proof" → Work
  (case studies + shard field 3D) → divider "The method" → Process → Experience (+ education)
  → divider "The next chapter" → FAQ → Contact (glass shader backdrop) → Footer.
- Scroll system (7th pass): one fixed Atmosphere evolves under the whole page via a single
  scrubbed timeline; Reveal/RevealText are scrubbed to scroll position by default (Reveal has
  a `once` opt-out); Parallax.tsx gives layered drift (section headers ~4, About rail 5,
  Work card columns 3/7, Process grid 10). Scrubbed extras and parallax are skipped under
  reduced motion AND on coarse/low-power devices (`isCoarseOrLowPower()` in lib/motion.ts) —
  those get static gradients and plain content. NarrativeStatement pins via CSS sticky
  (never hijacks scroll); its copy + the divider kickers live in `profile.narrative`.
- Density + color (8th pass): section rhythm tokens tightened (`section` 7rem,
  `section-sm` 4.5rem — keep them confident, not cavernous); the one pinned beat
  (NarrativeStatement) holds 160vh, don't grow it back; heading→content gaps are mt-10/12.
  The Contact color vocabulary now runs through the body: `.text-gradient` (static
  violet→blue type, AA at headline sizes both themes, solid-accent fallback) on key
  headlines (About/Ask/Work/FAQ via SectionHeading's `accent` prop — plain h2 + Reveal,
  since bg-clip can't paint through RevealText's split words), the narrative statement
  lines, and the Stats numbers; `.section-wash` (static token-based accent tint, lighting
  angles respected) under About/Bento/Ask/Process/Experience/FAQ; `.panel` borders/glow
  and `--panel-from/to` are accent-tinted per theme; Atmosphere holds more mid-page
  presence (×2.1 glow alphas). Contact's animated shimmer stays the crescendo.
- Hero (9th pass): `gl/MorphScene.tsx` — "the idea crystallizes": one abstract icosphere orb,
  FBM-displaced (molten) at the top of the page, that resolves as you scroll out of the hero
  (flow freezes, facets sharpen via screen-space-derivative normals, a violet→blue structure
  grid surfaces, roughness polishes). All morphing is shader uniforms over fixed topology
  (detail 5 ≈ 20k tris, lite 4) — CPU writes ~10 floats/frame, damped scroll progress, three
  eased keyframes in `stateAt()`. Staging: orb clearly right (viewport.width > 5 →
  x = width×0.27), the h1 is `max-w-[11ch]` so the name wraps two lines on the left;
  portrait/mobile centers + lifts the orb behind the headline. Cursor: damped sway +
  camera parallax PLUS surface excitation — uPointer (object-space, damped) drives a
  local swell + rim glow toward the cursor (fades as the form resolves); pointer comes
  from MorphScene's own window listener since its layer is pointer-events-none.
  Continuity/handoff: in full mode the canvas layer is viewport-FIXED — after the morph
  (p: 0→0.9 vh) a second damped progress h (0.95→1.7 vh) drifts the crystal up-right,
  shrinks it and fades material.opacity so it dissolves behind Stats/TechMarquee; the
  layer is `hidden` + frameloop "never" past 1.85 vh. Stats + TechMarquee sections are
  `relative` ON PURPOSE so their content paints above that fixed canvas — keep it.
  Reduced motion = still frame at p=0.62, absolute layer, no handoff; lite = fixed
  structured state, slow drift, absolute layer, no scroll/pointer work.
  `HERO_VARIANT` const in `gl/Hero3D.tsx` flips between "morph" and "mobius" (HeroScene.tsx
  kept intact as the safety valve; it keeps its original absolute, event-receiving layer).
  `.hero3d-fallback` retuned to gather the glow behind the orb; the page background remains
  the single Atmosphere system — no second backdrop.
- `data/profile.ts` contains `[PLACEHOLDER: …]` strings awaiting the owner's real content
  (incl. `narrative.statement[2]`). They render italicized on-site and are auto-excluded
  from the AI prompt via `isPlaceholder()`.

## File map

```
app/
  layout.tsx          Root layout: fonts, SEO/OG metadata, pre-paint theme script
  page.tsx            Section assembly: fixed Atmosphere + narrative arc + labeled dividers
  globals.css         Theme tokens (--c-*), lighting tokens (--shadow-elev, --glow-*-a),
                      .panel surfaces, .text-gradient + .section-wash (body accent
                      treatment), 21st.dev component styles, keyframes
  api/ask/route.ts    POST endpoint: streams AI answers, X-AI-Provider header
  opengraph-image.tsx Code-rendered OG image
data/
  profile.ts          SINGLE SOURCE OF TRUTH: all copy, projects (+caseStudy), experience
                      (+scope/tech), education, currentFocus, narrative (statement +
                      handoff kickers), stats, FAQ. Exports isPlaceholder(). Feeds both
                      the visible site AND the AI.
lib/
  ai/index.ts         Provider selection (env-driven), ai/types.ts AIProvider interface
  ai/local.ts         Zero-cost demo engine: intent matching over profile.ts, fake streaming
  ai/anthropic.ts     Claude provider | ai/openai.ts OpenAI provider
  ai/prompt.ts        System prompt built from profile.ts; filters [PLACEHOLDER strings
  motion.ts           gsap + ScrollTrigger registration, prefersReducedMotion,
                      hasFinePointer, isCoarseOrLowPower (drops parallax/scroll extras)
  scroll.ts           Lenis-aware scrollToSection | theme.ts useTheme() + applyTheme()
components/gl/        (all WebGL: dynamic import, ssr:false, frameloop frozen off-screen,
                       DPR capped, disposed on unmount, CSS fallback floor underneath)
  Hero3D.tsx          Device-aware mount for the hero (full/lite/reduced modes) +
                      HERO_VARIANT flag ("morph" | "mobius") selecting the scene chunk
  MorphScene.tsx      Crystallizing orb (CURRENT hero): FBM vertex displacement +
                      analytic normals, scroll-driven morph uniforms, facet/grid/rim
                      in fragment via onBeforeCompile on MeshPhysicalMaterial
  HeroScene.tsx       Möbius ribbon (FALLBACK hero, keep intact): procedural geometry,
                      Lightformer env (frames={1}), damped cursor swing + slow orbit
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
  Atmosphere.tsx      THE lighting-coherence primitive: ONE fixed page-wide backdrop
                      (violet upper-right, blue lower-left) whose layers drift/re-weight
                      across chapters via a single scrubbed timeline; static gradient on
                      reduced-motion/coarse/low-power. Mounted once in page.tsx.
  NarrativeStatement.tsx  The scroll-pinned beat (CSS sticky, no scroll hijack): bio
                      through-line as crossfading statements; static stack under
                      reduced motion. Copy from profile.narrative.statement.
  Parallax.tsx        Layered drift wrapper (yPercent ±speed, scrubbed); no-op under
                      reduced motion / coarse / low-power
  SectionDivider.tsx  Accent-lit hairline seam, scrub-drawn, optional narrative kicker
                      label (from profile.narrative.handoffs)
  Reveal.tsx          Scroll fade-rise, scrubbed by default (`once` opt-out) |
                      RevealText.tsx split-text headline reveal, scrubbed when scroll-
                      triggered, timed on mount (hero)
  Nav.tsx (tubelight scrollspy) · ThemeToggle · Preloader · SmoothScroll (Lenis) ·
  Cursor · Magnetic · SpotlightCard · GridPattern · TechMarquee · Telemetry · CountUp ·
  SectionHeading (header + slight parallax; `accent` prop → gradient headline) · Footer
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

- The crystallizing-orb hero concept (`gl/MorphScene.tsx`) — tune, don't replace — and
  `gl/HeroScene.tsx` (the Möbius), which stays intact as the `HERO_VARIANT` fallback.
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
