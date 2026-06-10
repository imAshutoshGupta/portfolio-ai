import { profile, allSkills, type Project } from "@/data/profile";
import type { AIProvider, ChatMessage } from "./types";

/**
 * Local demo provider — answers questions about the developer with zero
 * external calls and no API key, by matching the visitor's question against
 * the structured data in data/profile.ts.
 *
 * It scores a set of intents on keyword/phrase evidence, extracts entities
 * (skill names, project titles) from the question, and composes a natural
 * answer from the profile data. Output is streamed word-by-word so the UI
 * behaves identically to a real LLM provider.
 */

type Intent =
  | "greeting"
  | "strongestProject"
  | "projectDetail"
  | "projectsOverview"
  | "skillCheck"
  | "skillsOverview"
  | "experienceSummary"
  | "currentRole"
  | "about"
  | "location"
  | "availability"
  | "contact"
  | "site"
  | "thanks";

const flagship: Project =
  profile.projects.find((p) => p.flagship) ?? profile.projects[0];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ").replace(/\s+/g, " ").trim();
}

/** Count how many of the given keywords/phrases appear in the question. */
function hits(q: string, keywords: string[]): number {
  return keywords.reduce((n, k) => (q.includes(k) ? n + 1 : n), 0);
}

function findSkill(q: string): string | undefined {
  // Longest match first so "next.js" wins over "js".
  const candidates = [...allSkills].sort((a, b) => b.length - a.length);
  return candidates.find((skill) => {
    const s = skill.toLowerCase();
    // Word-boundary check; skill names may contain dots (next.js) or symbols.
    const pattern = new RegExp(`(^| )${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($| |,|\\?)`);
    return pattern.test(q) || q.includes(` ${s} `) || q.endsWith(` ${s}`) || q.startsWith(`${s} `);
  });
}

function findProject(q: string): Project | undefined {
  return profile.projects.find((p) => q.includes(p.title.toLowerCase()));
}

/** Projects whose tech list mentions the given skill. */
function projectsUsing(skill: string): Project[] {
  const s = skill.toLowerCase();
  return profile.projects.filter((p) =>
    p.tech.some((t) => t.toLowerCase().includes(s) || s.includes(t.toLowerCase())),
  );
}

function detectIntent(q: string): Intent {
  const scores: Record<Intent, number> = {
    greeting: 0,
    strongestProject: 0,
    projectDetail: 0,
    projectsOverview: 0,
    skillCheck: 0,
    skillsOverview: 0,
    experienceSummary: 0,
    currentRole: 0,
    about: 0,
    location: 0,
    availability: 0,
    contact: 0,
    site: 0,
    thanks: 0,
  };

  if (/^(hi|hey|hello|yo|hola|namaste)\b/.test(q) || q === "sup") scores.greeting += 3;
  if (/\b(thanks|thank you|cheers|appreciated)\b/.test(q)) scores.thanks += 3;

  scores.strongestProject += hits(q, [
    "strongest", "best project", "most impressive", "proudest", "favorite project",
    "favourite project", "flagship", "top project", "best work", "standout",
  ]) * 2;

  if (findProject(q)) scores.projectDetail += 4;

  scores.projectsOverview += hits(q, [
    "projects", "portfolio", "what has he built", "what did he build", "built",
    "side projects", "his work", "show me", "worked on",
  ]);

  if (findSkill(q)) scores.skillCheck += 2;
  scores.skillCheck += hits(q, ["does he know", "is he good at", "can he", "familiar with", "experience with", "worked with", "used", "proficient"]);

  scores.skillsOverview += hits(q, [
    "skills", "tech stack", "stack", "technologies", "tools", "languages",
    "what does he know", "what can he do",
  ]);

  scores.experienceSummary += hits(q, [
    "experience", "summarize", "summary", "background", "career", "history",
    "how long", "years", "resume", "cv", "qualified",
  ]);

  scores.currentRole += hits(q, [
    "current role", "currently", "right now", "where does he work", "working now",
    "current job", "employer",
  ]) * 2;

  scores.about += hits(q, [
    "who is", "about him", "tell me about", "introduce", "bio", "person",
    "hobbies", "outside of work", "fun fact", "interests",
  ]);

  scores.location += hits(q, ["where is he", "based", "location", "city", "country", "timezone", "remote"]) * 2;

  scores.availability += hits(q, [
    "available", "availability", "hire", "hiring", "freelance", "open to",
    "looking for", "job offer", "recruit", "join our",
  ]) * 2;

  scores.contact += hits(q, [
    "contact", "email", "reach", "get in touch", "linkedin", "github", "twitter",
    "connect", "dm", "message him",
  ]) * 2;

  scores.site += hits(q, [
    "this site", "this website", "this portfolio", "how was this built",
    "made this", "what are you", "are you ai", "are you a bot", "who are you",
  ]) * 2;

  let best: Intent = "about";
  let bestScore = 0;
  for (const [intent, score] of Object.entries(scores) as [Intent, number][]) {
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  // Nothing matched meaningfully → fall through to a helpful overview.
  return bestScore === 0 ? "about" : best;
}

function describeProject(p: Project): string {
  const links = [
    p.repo ? `the repo is on GitHub (${p.repo})` : "",
    p.live ? `there's a live version at ${p.live}` : "",
  ].filter(Boolean).join(" and ");
  return `${p.title} (${p.year}) — ${p.tagline} ${p.description} It's built with ${formatList(p.tech)}${links ? `, and ${links}` : ""}.`;
}

function formatList(items: readonly string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function answer(question: string): string {
  const q = normalize(question);
  const intent = detectIntent(q);
  const { firstName } = profile;

  switch (intent) {
    case "greeting":
      return `Hey! I'm the assistant built into ${profile.name}'s portfolio. Ask me anything about his projects, skills, or experience — for example, "${profile.suggestedQuestions[0]}"`;

    case "thanks":
      return `Anytime! If you'd like to take it further, ${firstName} is easy to reach at ${profile.contact.email}.`;

    case "strongestProject":
      return `That would be ${describeProject(flagship)} It's the project that best shows how ${firstName} combines product thinking with solid full-stack engineering.`;

    case "projectDetail": {
      const p = findProject(q)!;
      return describeProject(p);
    }

    case "projectsOverview": {
      const lines = profile.projects
        .map((p) => `${p.title} — ${p.tagline}`)
        .join(" · ");
      return `${firstName} has ${profile.projects.length} selected projects on here: ${lines} If you want depth on any of them, just ask — ${flagship.title} is the standout.`;
    }

    case "skillCheck": {
      const skill = findSkill(q);
      if (skill) {
        const used = projectsUsing(skill);
        const proof = used.length
          ? ` He's used it in ${formatList(used.map((p) => p.title))}, so there's shipped work to back it up.`
          : ` It's a regular part of his toolkit.`;
        return `Yes — ${skill} is one of ${firstName}'s core skills.${proof}`;
      }
      // Asked about something not in the list — be honest, pivot to what's adjacent.
      return `That one isn't in ${firstName}'s listed stack, so I won't overclaim. His core strengths are ${formatList(profile.skills[0].items.slice(0, 3))} on the language side and ${formatList(profile.skills[1].items.slice(0, 3))} on the front end — and he picks up new tools quickly when a project calls for it. Best to ask him directly at ${profile.contact.email}.`;
    }

    case "skillsOverview": {
      const groups = profile.skills
        .map((g) => `${g.label.toLowerCase()}: ${formatList(g.items)}`)
        .join(". For ");
      return `${firstName} works across the full stack. For ${groups}. The common thread is TypeScript end to end, with a soft spot for AI-assisted features.`;
    }

    case "experienceSummary":
      return `${profile.summary} Most recently: ${profile.experience[0].role.toLowerCase()} (${profile.experience[0].period.toLowerCase()}) — ${profile.experience[0].summary.toLowerCase()}`;

    case "currentRole": {
      const cur = profile.experience[0];
      return `Right now ${firstName} is a ${cur.role} at ${cur.company} (${cur.period}). ${cur.summary} Recent highlights include: ${formatList(cur.highlights.map((h) => h.toLowerCase()))}.`;
    }

    case "location":
      return `${firstName} is based in ${profile.location}. He's comfortable working remotely and collaborating across time zones — he's a self-confessed night owl, which helps.`;

    case "availability":
      return `${profile.availability} The fastest way to start a conversation is email: ${profile.contact.email}. He typically replies within a day.`;

    case "contact":
      return `You can email ${firstName} at ${profile.contact.email} — that's the quickest route. He's also on GitHub (${profile.contact.github}), LinkedIn (${profile.contact.linkedin}) and X (${profile.contact.twitter}).`;

    case "site":
      return `I'm the AI assistant built into this portfolio — and yes, the site itself is one of ${firstName}'s projects: a custom WebGL glass-refraction shader, GSAP scroll choreography, and a model-agnostic AI layer (you're currently talking to its zero-cost local mode). Ask me about his other work!`;

    case "about":
    default:
      return `${profile.summary} Outside of code he's into fitness and does his best work after dark. Want specifics? Try "${profile.suggestedQuestions[0]}" or "${profile.suggestedQuestions[2]}".`;
  }
}

/** Streams the answer word-by-word to mimic LLM token streaming. */
export class LocalProvider implements AIProvider {
  readonly name = "local";

  async *stream(messages: ChatMessage[]): AsyncIterable<string> {
    const question = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
    const text = answer(question);
    const words = text.split(/(?<=\s)/);
    for (const word of words) {
      yield word;
      // Small jittered delay so the typing feels organic, not metronomic.
      await new Promise((r) => setTimeout(r, 14 + Math.random() * 26));
    }
  }
}
