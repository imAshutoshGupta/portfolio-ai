import { profile, isPlaceholder } from "@/data/profile";

/**
 * System prompt shared by every real-LLM provider. Built from data/profile.ts,
 * so editing the profile automatically updates the assistant's knowledge.
 * Unfilled "[PLACEHOLDER: …]" strings are excluded so the model never quotes
 * scaffolding back to a visitor.
 */
export function buildSystemPrompt(): string {
  const projects = profile.projects
    .map((p) => {
      const cs = p.caseStudy;
      const caseStudy = [
        !isPlaceholder(cs.problem) ? `Problem: ${cs.problem}` : "",
        !isPlaceholder(cs.role) ? `His role: ${cs.role}` : "",
        cs.decisions.some((d) => !isPlaceholder(d))
          ? `Key decisions: ${cs.decisions.filter((d) => !isPlaceholder(d)).join("; ")}`
          : "",
        !isPlaceholder(cs.outcome) ? `Outcome: ${cs.outcome}` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `- ${p.title}${p.flagship ? " (flagship — his strongest project)" : ""} (${p.year}): ${p.tagline} ${p.description} Tech: ${p.tech.join(", ")}.${caseStudy ? ` ${caseStudy}` : ""}${p.repo ? ` Repo: ${p.repo}.` : ""}${p.live ? ` Live: ${p.live}.` : ""}`;
    })
    .join("\n");

  const experience = profile.experience
    .map((e) => {
      const scope = !isPlaceholder(e.scope) ? ` Scope: ${e.scope}` : "";
      const tech = e.tech.some((t) => !isPlaceholder(t))
        ? ` Tech: ${e.tech.filter((t) => !isPlaceholder(t)).join(", ")}.`
        : "";
      return `- ${e.role} at ${e.company} (${e.period}): ${e.summary}${scope}${tech} Highlights: ${e.highlights.join("; ")}.`;
    })
    .join("\n");

  const education = profile.education
    .filter((e) => !isPlaceholder(e.degree) && !isPlaceholder(e.institution))
    .map((e) => `- ${e.degree}, ${e.institution} (${e.period})${e.detail && !isPlaceholder(e.detail) ? `: ${e.detail}` : ""}`)
    .join("\n");

  const skills = profile.skills
    .map((g) => `${g.label}: ${g.items.join(", ")}`)
    .join("\n");

  return `You are the built-in AI assistant on the portfolio website of ${profile.name}, a ${profile.role} based in ${profile.location}. Visitors (often recruiters or potential collaborators) ask you questions about him.

Answer in a warm, concise, professional voice. Refer to ${profile.firstName} in the third person. Keep answers to a short paragraph or two — no headers, no bullet walls. If asked something unrelated to ${profile.firstName} or his work, politely steer back to the portfolio. Never invent projects, employers, or skills that aren't listed below.

ABOUT
${profile.bio.join(" ")}

SUMMARY
${profile.summary}

AVAILABILITY
${profile.availability}

SKILLS
${skills}

PROJECTS
${projects}

EXPERIENCE
${experience}
${education ? `\nEDUCATION\n${education}\n` : ""}
CONTACT
Email: ${profile.contact.email}
GitHub: ${profile.contact.github}
LinkedIn: ${profile.contact.linkedin}
Twitter/X: ${profile.contact.twitter}`;
}
