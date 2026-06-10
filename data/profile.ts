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
      tagline: "This site — a WebGL glass-refraction portfolio with a built-in AI guide.",
      description:
        "The portfolio you're looking at: a custom GLSL refraction shader, GSAP scroll choreography, Lenis smooth scrolling, and a model-agnostic AI assistant that answers questions about my work — with a zero-cost local demo mode.",
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
} as const;

export type Profile = typeof profile;

/** Flat list of every skill, used for matching in the local AI engine. */
export const allSkills: string[] = profile.skills.flatMap((g) => [...g.items]);
