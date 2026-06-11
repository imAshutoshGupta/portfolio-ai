# Ashutosh Gupta — Portfolio

A high-contrast personal portfolio (dark by default, with a first-class light
mode) built around two signatures:

- **The Möbius hero** — a single procedurally built 3D object floating in a
  void: a Möbius ribbon (one continuous surface, no front or back — the
  full-stack metaphor) swept in code from a rounded-rectangle cross-section
  with a half-twist, lit by code-defined Lightformer studio lighting and an
  iridescent physical material that shifts violet→blue as it slowly orbits.
  Cursor input nudges it with damped, weighted motion; scroll eases it away.
- **Ask My Portfolio** — a native AI assistant that answers questions about
  the developer ("What's his strongest project?", "Does he know React?") with
  streaming responses. It works out of the box with **no API key** via a local
  demo engine, and switches to a real LLM with a single environment variable.

The original GLSL **glass refraction shader** (the previous hero) lives on as
the restrained backdrop of the closing Contact section — the page opens on the
Möbius and closes on the glass.

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS · react-three-fiber + drei · GSAP + ScrollTrigger · Lenis.

## Theming

Design tokens are CSS variables on `:root[data-theme]` (see `app/globals.css`),
consumed by Tailwind as `rgb(var(--token) / alpha)`. Dark (near-black, violet
`#9F8FFF` → blue `#5CA8FF`) is the identity and default; light (cool off-white,
violet `#5B47D9` → blue `#2E6BD8`) is tuned separately for WCAG AA contrast.
An inline script in `app/layout.tsx` applies the theme before first paint:
stored choice (`localStorage.theme`) → `prefers-color-scheme` → dark. The nav
toggle (`components/ThemeToggle.tsx`) persists the choice and crossfades the
switch; both WebGL scenes re-light themselves per theme via `useTheme()`.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no environment variables are required for local development. The AI assistant runs in demo mode automatically.

### Production build

```bash
npm run build
npm start
```

---

## Editing your content

**Everything lives in one file: [`data/profile.ts`](data/profile.ts).**

Name, tagline, bio, skills, projects, experience, contact links, the chat's suggested questions, the stats strip, the bento-grid strengths, the process tabs, and the FAQ are all defined there — and the same data feeds both the visible sections *and* the AI assistant (the local engine's answers and the LLM system prompt). Edit once, and the whole site plus the assistant update together.

Entries marked `[PLACEHOLDER]` are realistic examples; replace them with your real projects and experience. Mark exactly one project with `flagship: true` — the assistant cites it as the strongest. Stats with `approximate: true` render with a "~" prefix; the technologies count is computed from your skills list so it's always real. The telemetry panel in the capabilities grid is explicitly labelled as an illustrative demo visualization.

---

## The AI assistant

### How demo mode works (no key required)

All chat requests go to a server-side API route, `app/api/ask/route.ts`. When no provider key is configured, the route uses the **local engine** (`lib/ai/local.ts`):

1. The visitor's question is normalized and scored against a set of intents (strongest project, skill check, experience summary, contact, availability, …) using keyword and phrase evidence.
2. Entities are extracted from the question — skill names and project titles are matched against `data/profile.ts`.
3. A natural-language answer is composed from the structured data (e.g. a skill check cites the actual projects that used that skill), then **streamed word-by-word** so the UI behaves identically to a real LLM.

It answers honestly: if a skill isn't in the data it says so rather than overclaiming, and questions it can't classify get a useful overview with suggested follow-ups.

### Switching to a real LLM (zero code changes)

The route talks to an `AIProvider` interface (`lib/ai/types.ts`); the concrete provider is chosen from environment variables at request time (`lib/ai/index.ts`):

| Variables | Provider |
|---|---|
| *(none)* | Local demo engine |
| `ANTHROPIC_API_KEY` | Anthropic (Claude) — `claude-opus-4-8` by default, override with `ANTHROPIC_MODEL` |
| `OPENAI_API_KEY` + `AI_PROVIDER=openai` | OpenAI — `gpt-4o` by default, override with `OPENAI_MODEL` |

Copy `.env.example` to `.env.local` and uncomment what you need. Keys are read **only on the server** — they are never exposed to the browser.

### Adding another provider

Each provider is a small adapter implementing one interface:

```ts
interface AIProvider {
  readonly name: string;
  stream(messages: ChatMessage[]): AsyncIterable<string>;
}
```

1. Create `lib/ai/yourprovider.ts` implementing `AIProvider` (yield text chunks; use `buildSystemPrompt()` from `lib/ai/prompt.ts` so it knows the profile data).
2. Add one case to `getProvider()` in `lib/ai/index.ts`.

No UI or route changes needed — the chat consumes a plain text stream regardless of backend.

---

## Deploying to Vercel

Zero configuration required:

1. Push this repository to GitHub.
2. [Import it on Vercel](https://vercel.com/new) — the Next.js preset is detected automatically.
3. (Optional) Add environment variables in **Project → Settings → Environment Variables**:
   - `NEXT_PUBLIC_SITE_URL` — your production URL, for correct Open Graph / Twitter previews.
   - `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY` + `AI_PROVIDER=openai`) to upgrade the assistant from demo mode to a real LLM.

Redeploy after changing env vars. Without any of them the site is fully functional in demo mode.

---

## Performance & accessibility notes

- Both WebGL scenes (Möbius hero, glass Contact backdrop) are **lazy-loaded client-side** (`next/dynamic`, `ssr: false`) and never block first paint; static gradient voids render instantly underneath them.
- Render loops **freeze when their section is off-screen or the tab is hidden** (IntersectionObserver + visibilitychange), so neither scene costs anything while reading the rest of the page.
- Device-aware quality: touch/low-power devices get a lighter Möbius mesh (160×28 vs 288×48 segments), DPR 1, no AA, and no cursor nudge; desktop gets the full mesh at DPR ≤ 1.75. The glass backdrop drops to 3 fbm octaves on the same devices. Geometries and materials are disposed on unmount.
- `prefers-reduced-motion`: the hero renders a single calm static frame (no auto-orbit, no cursor/parallax motion), the glass backdrop becomes a static gradient, and Lenis, the preloader, the custom cursor, count-ups, the marquee, and all GSAP reveals are disabled.
- Name + tagline are real HTML text layered over the canvas — never baked into the 3D. The theme toggle is a labelled button (`aria-label="Switch to … theme"`).
- Semantic landmarks throughout, skip-to-content link, visible focus rings, keyboard-operable chat with `role="log"` + `aria-live="polite"`, and screen-reader-friendly split-text headings (the animated copy is `aria-hidden`, the plain string is read).

## Project structure

```
app/
  layout.tsx            Fonts, metadata (OG/Twitter), theme init script, skip link
  page.tsx              Section composition
  globals.css           Theme token sets (dark/light), panel surface, keyframes
  opengraph-image.tsx   Generated link-preview card
  api/ask/route.ts      Streaming chat endpoint (provider-agnostic)
components/
  gl/
    HeroScene, Hero3D   Procedural Möbius hero (mesh, lights, damped motion)
    glassShader,
    GlassScene,
    GlassBackdrop       Relocated refraction shader (Contact backdrop)
  sections/             Hero, Stats, About, Bento, Ask, Work, Process,
                        Experience, Faq, Contact
  ThemeToggle           Accessible light/dark switch (persists to localStorage)
  SectionHeading        Shared eyebrow/headline/support rhythm
  CountUp               Scroll-triggered count-up (static under reduced motion)
  TechMarquee           Infinite tech-chip strip (wraps statically under reduced motion)
  Telemetry             Labelled demo dashboard with live SVG sparklines
  Preloader, Cursor, Magnetic, RevealText, Reveal, SmoothScroll, Nav, Footer
lib/
  ai/                   Provider interface, local engine, Anthropic/OpenAI adapters
  theme.ts              useTheme() hook + applyTheme() (data-theme on <html>)
  motion.ts             GSAP + ScrollTrigger setup, reduced-motion helpers
  scroll.ts             Lenis handle for anchor navigation
data/
  profile.ts            ★ All content — edit this file
```

Every visual on the page is code-rendered — gradients, SVG, canvas/WebGL and
styled DOM. There are no photos, stock images, or external image assets.

## Component provenance

A few interaction patterns are adapted from open community components on
[21st.dev](https://21st.dev/community/components). Each was copied in as owned
code, ported off framer-motion to CSS/GSAP (no new dependencies), and re-themed
to this site's tokens:

| Pattern | Adapted from | Used in |
|---|---|---|
| Tubelight navbar (scrollspy lamp) | [ayushmxxn/tubelight-navbar](https://21st.dev/community/components/ayushmxxn/tubelight-navbar/default) | Primary nav |
| Spotlight card | [easemize/spotlight-card](https://21st.dev/community/components/easemize/spotlight-card/default) | Capabilities bento cards |
| Border beam | [magicui/border-beam](https://21st.dev/community/components/s/border) | Flagship project card |
| Shimmer button | [dillionverma/shimmer-button](https://21st.dev/community/components/dillionverma/shimmer-button) | Contact email CTA |
| Text shimmer | [ibelick/text-shimmer](https://21st.dev/community/components/ibelick/text-shimmer) | Contact headline |
| Animated grid pattern | [magicui/animated-grid-pattern](https://21st.dev/community/components/magicui/animated-grid-pattern/default) | Process section backdrop |
