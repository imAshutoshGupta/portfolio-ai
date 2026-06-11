/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  PROFILE DATA — the single source of truth for the entire site.          ║
 * ║                                                                          ║
 * ║  Everything here feeds BOTH the visible portfolio sections AND the       ║
 * ║  "Ask My Portfolio" AI assistant (demo engine + LLM system prompt).      ║
 * ║  Edit this file and the whole site updates.                              ║
 * ║                                                                          ║
 * ║  Entries marked [PLACEHOLDER] are realistic examples — replace them      ║
 * ║  with your real projects and experience.                                 ║
 * ║                                                                          ║
 * ║  Strings of the form "[PLACEHOLDER: …]" are structural gaps for YOU to   ║
 * ║  fill (case studies, scope, education, current focus). They render       ║
 * ║  as-is on the site so they're easy to spot, and they are automatically   ║
 * ║  EXCLUDED from the AI assistant's knowledge until you replace them.      ║
 * ║  Search this file for "[PLACEHOLDER" to find every one.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

/** True when a profile string is an unfilled "[PLACEHOLDER: …]" marker. */
export function isPlaceholder(text: string): boolean {
  return text.includes("[PLACEHOLDER");
}

/**
 * The expandable mini case study behind each project card. Strings containing
 * "[PLACEHOLDER" are rendered as-is on the site AND excluded from the AI's
 * system prompt until you replace them — fill them in here and both update.
 */
export interface CaseStudy {
  /** The core problem the project solves, and for whom. 2–3 sentences. */
  problem: string;
  /** What you personally owned — e.g. "Sole developer" or "Built the API + editor". */
  role: string;
  /** 2–4 key technical decisions and why you made them. */
  decisions: string[];
  /** Real, verifiable results only — numbers, adoption, lessons. */
  outcome: string;
}

export interface Project {
  title: string;
  /** One-line description shown on the card and used by the AI. */
  tagline: string;
  /** A longer blurb the AI can draw on for detailed answers. */
  description: string;
  tech: string[];
  repo?: string;
  live?: string;
  /** Mark exactly one project as the flagship — the AI cites it as the strongest. */
  flagship?: boolean;
  year: string;
  caseStudy: CaseStudy;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  summary: string;
  /** Team size, reporting line, how much you owned end to end. */
  scope: string;
  /** Technologies actually used in this role — rendered as chips. */
  tech: string[];
  highlights: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  period: string;
  detail?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  /** Shown as a footnote marker when the number is an estimate, not a hard count. */
  approximate?: boolean;
}

export interface Strength {
  title: string;
  description: string;
  /** Picks the live visual rendered in the bento card — see components/sections/Bento.tsx */
  visual: "code" | "ai" | "performance" | "motion";
}

export interface ProcessStep {
  label: string;
  title: string;
  body: string;
  points: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const profile = {
  name: "Ashutosh Gupta",
  firstName: "Ashutosh",
  role: "Full-Stack Developer",
  tagline: "Full-stack developer building intelligent, fast web experiences.",
  location: "Mumbai, India",
  /** Short bio for the About section. The AI also uses this verbatim. */
  bio: [
    "I'm a full-stack developer based in Mumbai. Curiosity about AI is what pulled me into programming in the first place, and it still shapes how I build — I like products where smart engineering meets a genuinely useful idea.",
    "I work across the stack with TypeScript, React, and Node.js, and I care about the details: performance budgets, clean APIs, and interfaces that feel alive. Night owl, fitness enthusiast, perpetual side-project starter (and occasional finisher).",
  ],
  /** One-paragraph summary the AI uses for "summarize his experience" style questions. */
  summary:
    "Ashutosh Gupta is a full-stack developer from Mumbai, India who specializes in TypeScript, React/Next.js, and Node.js. He came to programming through an interest in AI, and his strongest work combines polished front-end engineering with practical machine-intelligence features. He has shipped production web apps end to end — from data models and APIs to animation-heavy interfaces — and is comfortable owning a feature from idea to deploy.",

  availability:
    "Open to full-time roles and select freelance projects — especially product teams shipping AI-assisted features.",

  contact: {
    email: "aguptaworkspace@gmail.com",
    github: "https://github.com/imAshutoshGupta",
    linkedin: "https://www.linkedin.com/in/imashutoshgupta", // [PLACEHOLDER] confirm handle
    twitter: "https://twitter.com/im_AshutoshG",
  },

  skills: [
    {
      label: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML & CSS"],
    },
    {
      label: "Front-end",
      items: ["React", "Next.js", "Tailwind CSS", "Three.js", "GSAP", "Redux"],
    },
    {
      label: "Back-end",
      items: ["Node.js", "Express", "REST APIs", "PostgreSQL", "MongoDB", "Prisma"],
    },
    {
      label: "Tools & Platforms",
      items: ["Git", "Docker", "Vercel", "AWS", "Figma", "CI/CD"],
    },
  ] satisfies SkillGroup[],

  projects: [
    {
      // [PLACEHOLDER]
      title: "Lumen Notes",
      tagline: "AI-assisted note-taking app with semantic search across everything you write.",
      description:
        "A full-stack note-taking product where notes are embedded on save and retrieved by meaning, not keywords. Built the editor, the embedding pipeline, and a streaming chat interface that answers questions grounded in the user's own notes. Handles optimistic updates and offline drafts.",
      tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "OpenAI API"],
      repo: "https://github.com/imAshutoshGupta",
      live: "https://example.com",
      flagship: true,
      year: "2025",
      caseStudy: {
        problem:
          "[PLACEHOLDER: The core problem Lumen Notes solves and for whom — 2–3 sentences.]",
        role: "[PLACEHOLDER: What you owned — e.g. sole developer, or which parts you built.]",
        decisions: [
          "[PLACEHOLDER: Key technical decision #1 — e.g. how you designed the embedding/retrieval pipeline and why.]",
          "[PLACEHOLDER: Key technical decision #2 — e.g. editor architecture, optimistic updates, offline drafts.]",
          "[PLACEHOLDER: Key technical decision #3 — e.g. how the streaming chat is grounded in the user's notes.]",
        ],
        outcome:
          "[PLACEHOLDER: Real outcome — users, performance numbers, what you learned. Verifiable results only.]",
      },
    },
    {
      // [PLACEHOLDER]
      title: "Pulsefit",
      tagline: "Workout tracker with progressive-overload analytics and a clean PWA experience.",
      description:
        "A progressive web app for logging strength training. Charts volume and intensity trends per muscle group, suggests next-session targets, and works fully offline with background sync. Born from his own training logbook frustrations.",
      tech: ["React", "Node.js", "Express", "MongoDB", "Chart.js"],
      repo: "https://github.com/imAshutoshGupta",
      year: "2024",
      caseStudy: {
        problem:
          "[PLACEHOLDER: The training-tracking problem Pulsefit solves and why existing apps didn't cut it.]",
        role: "[PLACEHOLDER: What you owned on Pulsefit.]",
        decisions: [
          "[PLACEHOLDER: Key technical decision #1 — e.g. why a PWA, how offline + background sync works.]",
          "[PLACEHOLDER: Key technical decision #2 — e.g. how the progressive-overload analytics are computed.]",
        ],
        outcome:
          "[PLACEHOLDER: Real outcome — usage, what shipped, what you'd do differently.]",
      },
    },
    {
      // [PLACEHOLDER]
      title: "Shipscan",
      tagline: "Real-time parcel tracking dashboard aggregating multiple courier APIs.",
      description:
        "Unified tracking across courier providers with webhook ingestion, status normalization, and a live dashboard. Includes a public status page generator for small e-commerce stores.",
      tech: ["Next.js", "TypeScript", "Redis", "PostgreSQL", "Docker"],
      repo: "https://github.com/imAshutoshGupta",
      year: "2024",
      caseStudy: {
        problem:
          "[PLACEHOLDER: The multi-courier tracking problem Shipscan solves and who it's for.]",
        role: "[PLACEHOLDER: What you owned on Shipscan.]",
        decisions: [
          "[PLACEHOLDER: Key technical decision #1 — e.g. webhook ingestion + status normalization across couriers.]",
          "[PLACEHOLDER: Key technical decision #2 — e.g. why Redis, how the live dashboard stays fresh.]",
        ],
        outcome:
          "[PLACEHOLDER: Real outcome — stores using it, volumes handled, lessons.]",
      },
    },
    {
      // [PLACEHOLDER]
      title: "Glasshouse",
      tagline: "This site — a procedural 3D portfolio with a built-in AI guide.",
      description:
        "The portfolio you're looking at: a procedurally built Möbius-ribbon 3D hero, a custom GLSL glass-refraction shader, light/dark theming, GSAP scroll choreography, and a model-agnostic AI assistant that answers questions about my work — with a zero-cost local demo mode.",
      tech: ["Next.js", "Three.js", "GLSL", "GSAP", "Anthropic API"],
      repo: "https://github.com/imAshutoshGupta/portfolio-ai",
      year: "2026",
      // This case study describes the actual codebase, so most of it is real;
      // only the measurable outcome is yours to confirm after deploy.
      caseStudy: {
        problem:
          "Developer portfolios tend to either look templated or hide the actual engineering behind screenshots. The goal here: a portfolio that is itself the proof — real-time 3D, a working AI product, and a strict performance budget, all in one zero-config deployable.",
        role: "Sole designer and developer — design system, procedural 3D scenes, AI layer, motion, and deployment.",
        decisions: [
          "Every 3D element is generated from code at runtime — no model, texture, or HDR files ship, which keeps the first-load budget intact and makes the scenes fully theme-aware.",
          "The AI assistant sits behind a provider interface: a zero-cost local engine answers from structured profile data, and a single environment variable swaps in Claude or another LLM with no UI changes.",
          "All WebGL is lazy-loaded, frozen off-screen, and capped on DPR, with static fallbacks for reduced motion and low-power devices.",
        ],
        outcome:
          "[PLACEHOLDER: Measured results once deployed — Lighthouse scores, first-load JS, anything verifiable.]",
      },
    },
  ] satisfies Project[],

  experience: [
    {
      // [PLACEHOLDER]
      role: "Full-Stack Developer",
      company: "Freelance & Contract",
      period: "2024 — Present",
      summary:
        "Building production web apps for startups and small businesses, end to end.",
      scope:
        "[PLACEHOLDER: Scope of this work — typical client/team size, whether you worked solo or with designers/PMs, how much you owned from spec to production.]",
      tech: ["[PLACEHOLDER: technologies you actually used across these engagements]"],
      highlights: [
        "Shipped 6+ client projects from spec to deploy on Vercel and AWS",
        "Cut a client dashboard's load time from 4.2s to 1.1s through query and bundle optimization",
        "Introduced typed API contracts (tRPC/zod) that eliminated a class of runtime bugs",
      ],
    },
    {
      // [PLACEHOLDER]
      role: "Software Developer Intern",
      company: "Tech Startup, Mumbai",
      period: "2023 — 2024",
      summary:
        "Worked on a customer-facing React dashboard and internal Node.js services.",
      scope:
        "[PLACEHOLDER: Team size, who you reported to, and which parts of the product you were responsible for.]",
      tech: ["[PLACEHOLDER: technologies you used in this role]"],
      highlights: [
        "Built reusable component library adopted across three internal products",
        "Wrote integration tests that caught regressions before two major releases",
      ],
    },
  ] satisfies ExperienceEntry[],

  /** Education / credentials — shown at the foot of the Experience section. */
  education: [
    {
      degree: "[PLACEHOLDER: degree, e.g. B.E. Computer Engineering]",
      institution: "[PLACEHOLDER: institution name, city]",
      period: "[PLACEHOLDER: years, e.g. 2019 — 2023]",
      detail: "[PLACEHOLDER: optional — focus area, notable coursework, or grade. Delete this line if not needed.]",
    },
  ] satisfies EducationEntry[],

  /**
   * "Currently" card in the About section — what you're learning or building
   * right now. Strong portfolios signal momentum, not just history.
   */
  currentFocus:
    "[PLACEHOLDER: 1–2 lines on what you're exploring right now — e.g. a technology you're going deep on, or a side project in progress.]",

  /**
   * Connective copy for the scroll narrative: the pinned statement between
   * About and Capabilities, and the small kicker lines on chapter seams.
   * Authorial voice only — the statement lines are derived from the bio
   * above and must never introduce new claims. The third beat is yours.
   */
  narrative: {
    /** Scroll-pinned statement — one line per beat, crossfading as you scroll. */
    statement: [
      "Curiosity about AI is what pulled me into programming.",
      "Performance budgets, clean APIs, and interfaces that feel alive are what keep me here.",
      "[PLACEHOLDER: closing beat in your own words — where you want to take the work next.]",
    ],
    /** Kicker lines on the seams hand the story to the next chapter. */
    handoffs: {
      work: "The proof",
      process: "The method",
      contact: "The next chapter",
    },
  },

  /** Clickable example questions shown in the chat UI. */
  suggestedQuestions: [
    "What's his strongest project?",
    "Does he know React?",
    "Summarize his experience",
    "How do I get in touch?",
  ],

  /** Bento grid — core strengths, each paired with a live code-rendered visual. */
  strengths: [
    {
      title: "Full-stack TypeScript",
      description:
        "One language, end to end. Typed API contracts from the database to the DOM mean whole categories of bugs never ship.",
      visual: "code",
    },
    {
      title: "AI-native features",
      description:
        "Streaming chat, retrieval, provider-agnostic adapters — AI as a product feature, engineered like one. You're looking at a live example below.",
      visual: "ai",
    },
    {
      title: "Performance as a feature",
      description:
        "Budgets, not vibes: lazy-loaded WebGL, frozen render loops off-screen, sub-second loads on mid-range phones.",
      visual: "performance",
    },
    {
      title: "Interfaces that feel alive",
      description:
        "Custom shaders, scroll choreography and micro-interactions — always in service of the content, never instead of it.",
      visual: "motion",
    },
  ] satisfies Strength[],

  /** "How I work" — the tabbed process section. */
  process: [
    {
      label: "Scope",
      title: "Understand the problem before the stack",
      body: "Every engagement starts with questions, not code. What does success look like? Who is this for? What's the smallest version that proves the idea?",
      points: [
        "Written brief with success criteria",
        "Honest feasibility and effort estimate",
        "Tech choices justified, not defaulted",
      ],
    },
    {
      label: "Prototype",
      title: "Make the risky part real first",
      body: "The hardest 10% gets built first — the shader, the AI integration, the data model. If something won't work, we find out in days, not weeks.",
      points: [
        "Clickable prototype of the core flow",
        "Spike the highest-risk technical unknown",
        "Early performance baseline on real devices",
      ],
    },
    {
      label: "Build",
      title: "Production quality from the first commit",
      body: "TypeScript end to end, accessible by default, tested where it counts. Small PRs, readable diffs, and a main branch that always deploys.",
      points: [
        "CI with type checks and preview deploys",
        "Accessibility and reduced-motion handled, not bolted on",
        "Progress you can click, every week",
      ],
    },
    {
      label: "Ship & iterate",
      title: "Launch is the midpoint, not the finish",
      body: "Deploys are boring by design. After launch: real-user metrics, fast iteration on what the data says, and documentation so the work outlives the engagement.",
      points: [
        "Zero-downtime deploys on Vercel/AWS",
        "Web-vitals monitoring from day one",
        "Handover docs your next hire will thank you for",
      ],
    },
  ] satisfies ProcessStep[],

  /** FAQ accordion. */
  faq: [
    {
      question: "Are you available for full-time roles?",
      answer:
        "Yes — I'm open to full-time positions as well as select freelance projects, especially with product teams shipping AI-assisted features. Remote-first works great; I'm based in Mumbai (IST) and comfortable overlapping with EU and US-East hours.",
    },
    {
      question: "What kind of projects are the best fit?",
      answer:
        "Product work where the front end matters: AI-powered web apps, dashboards, marketing sites that need real engineering, and anything involving streaming UIs or WebGL. If it's TypeScript end to end, even better.",
    },
    {
      question: "How does the AI assistant on this site work?",
      answer:
        "It's built model-agnostic: every question goes through a server-side API route to a provider interface. In demo mode it answers from structured profile data with zero external calls; with a single environment variable it switches to Claude or another LLM. The code is public — ask it for the repo.",
    },
    {
      question: "What does working together look like?",
      answer:
        "Short scoping conversation, written proposal with milestones, then weekly demos of clickable progress. You always know where things stand, and you own the code and infrastructure from day one.",
    },
    {
      question: "What's the fastest way to reach you?",
      answer:
        "Email — aguptaworkspace@gmail.com. I typically reply within a day. LinkedIn and X work too, just slower.",
    },
  ] satisfies FaqItem[],
} as const;

export type Profile = typeof profile;

/** Flat list of every skill, used for matching in the local AI engine. */
export const allSkills: string[] = profile.skills.flatMap((g) => [...g.items]);

/**
 * Stats strip under the hero. Keep these honest: `approximate: true` renders
 * a "~" prefix. "Technologies" is computed from the skills list above, so it
 * is always a real count.
 */
export const stats: Stat[] = [
  { label: "Years writing code", value: 4, suffix: "+", approximate: true },
  { label: "Projects shipped", value: 10, suffix: "+", approximate: true }, // [PLACEHOLDER]
  { label: "Public repositories", value: 27 }, // from github.com/imAshutoshGupta
  { label: "Technologies in the stack", value: allSkills.length },
];
