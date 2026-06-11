# Ashutosh Gupta — Portfolio

A dark, high-contrast personal portfolio built around two signatures:

- **Fluid glass** — a custom GLSL refraction shader in the hero. A procedural light field sits behind a virtual glass surface whose fractal height field bends the sampling rays, with chromatic aberration along the distortion edges. It reacts to cursor movement and settles as you scroll.
- **Ask My Portfolio** — a native AI assistant that answers questions about the developer ("What's his strongest project?", "Does he know React?") with streaming responses. It works out of the box with **no API key** via a local demo engine, and switches to a real LLM with a single environment variable.

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS · react-three-fiber + drei · GSAP + ScrollTrigger · Lenis.

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

- The WebGL scene is **lazy-loaded client-side** (`next/dynamic`, `ssr: false`) and never blocks first paint; a static gradient renders instantly underneath it.
- The render loop **freezes when the hero is off-screen or the tab is hidden** (IntersectionObserver + visibilitychange), so the shader costs nothing while reading the page.
- Device-aware quality: touch/low-power devices get a lighter shader (3 fbm octaves, DPR 1, no pointer ripple); desktop gets the full version (5 octaves, DPR ≤ 1.75). GPU resources are disposed on unmount.
- `prefers-reduced-motion` disables the shader (static gradient instead), Lenis smooth scrolling, the preloader, the custom cursor, and all GSAP reveals.
- Semantic landmarks throughout, skip-to-content link, visible focus rings, keyboard-operable chat with `role="log"` + `aria-live="polite"`, and screen-reader-friendly split-text headings (the animated copy is `aria-hidden`, the plain string is read).

## Project structure

```
app/
  layout.tsx            Fonts, metadata (OG/Twitter), skip link
  page.tsx              Section composition
  globals.css           Design tokens, panel surface, marquee/accordion, keyframes
  opengraph-image.tsx   Generated link-preview card
  api/ask/route.ts      Streaming chat endpoint (provider-agnostic)
components/
  gl/                   Glass shader, r3f scene, device-aware wrapper
  sections/             Hero, Stats, About, Bento, Ask, Work, Process,
                        Experience, Faq, Contact
  SectionHeading        Shared eyebrow/headline/support rhythm
  CountUp               Scroll-triggered count-up (static under reduced motion)
  TechMarquee           Infinite tech-chip strip (wraps statically under reduced motion)
  Telemetry             Labelled demo dashboard with live SVG sparklines
  Preloader, Cursor, Magnetic, RevealText, Reveal, SmoothScroll, Nav, Footer
lib/
  ai/                   Provider interface, local engine, Anthropic/OpenAI adapters
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
