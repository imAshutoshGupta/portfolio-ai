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
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

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
}

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  summary: string;
  highlights: string[];
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
      highlights: [
        "Built reusable component library adopted across three internal products",
        "Wrote integration tests that caught regressions before two major releases",
      ],
    },
  ] satisfies ExperienceEntry[],

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
