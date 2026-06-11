"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { profile, allSkills } from "@/data/profile";
import type { ChatMessage } from "@/lib/ai/types";

const MAX_INPUT = 500;

/** Maps the X-AI-Provider response header to a human label for the frame UI. */
const PROVIDER_LABELS: Record<string, string> = {
  local: "Local demo engine",
  anthropic: "Claude (Anthropic)",
  openai: "OpenAI",
};

function WindowSidebar({ provider }: { provider: string }) {
  return (
    <aside
      className="hidden w-56 shrink-0 flex-col border-r border-line bg-base/50 p-4 lg:flex"
      aria-label="Assistant details"
    >
      <p className="px-2 text-[0.65rem] tracking-widest text-muted">SESSION</p>
      <div className="mt-2 rounded-lg border border-accent/25 bg-accent-dim px-3 py-2.5">
        <p className="text-sm text-ink">Visitor chat</p>
        <p className="mt-0.5 text-xs text-muted">ephemeral · nothing stored</p>
      </div>

      <p className="mt-6 px-2 text-[0.65rem] tracking-widest text-muted">CONTEXT</p>
      <ul className="mt-2 space-y-1">
        {[
          "profile.ts",
          `projects (${profile.projects.length})`,
          `experience (${profile.experience.length})`,
          `skills (${allSkills.length})`,
        ].map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs text-ink/65"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="text-accent/60">
              <rect x="1" y="1" width="8" height="8" rx="2" fill="none" stroke="currentColor" />
            </svg>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto rounded-lg border border-line bg-raise/60 px-3 py-2.5">
        <p className="text-[0.65rem] tracking-widest text-muted">PROVIDER</p>
        <p className="mt-1 flex items-center gap-2 text-xs text-ink/85">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          {PROVIDER_LABELS[provider] ?? provider}
        </p>
      </div>
    </aside>
  );
}

export default function Ask() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [provider, setProvider] = useState("local");
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Keep the latest message in view without hijacking page scroll.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim().slice(0, MAX_INPUT);
      if (!trimmed || streaming) return;

      const history: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);

        const providerHeader = res.headers.get("X-AI-Provider");
        if (providerHeader) setProvider(providerHeader);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += decoder.decode(value, { stream: true });
          const snapshot = answer;
          setMessages([...history, { role: "assistant", content: snapshot }]);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setMessages([
            ...history,
            {
              role: "assistant",
              content: "Something went wrong on my end — please try that again.",
            },
          ]);
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming],
  );

  return (
    <section
      id="ask"
      aria-labelledby="ask-heading"
      className="mx-auto max-w-site px-6 py-section-sm sm:px-10 sm:py-section"
    >
      <SectionHeading
        index="03"
        eyebrow="Ask my portfolio"
        title="Don't scroll. Just ask."
        support={`A shipped AI product, embedded in the portfolio it describes. Ask about ${profile.firstName}'s projects, skills, or experience — like you would in an interview.`}
        headingId="ask-heading"
      />

      <Reveal delay={0.1} className="mt-14">
        {/* Faux app window: chrome + sidebar + the real, working chat. */}
        <div className="panel mx-auto max-w-5xl overflow-hidden rounded-card shadow-lift">
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-line bg-base/60 px-4 py-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
            </div>
            <p className="flex-1 text-center font-mono text-xs text-muted">
              ask — {profile.firstName.toLowerCase()}.portfolio
            </p>
            <p className="hidden items-center gap-1.5 text-[0.65rem] tracking-widest text-muted sm:flex">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" aria-hidden="true" />
              LIVE
            </p>
          </div>

          <div className="flex h-[32rem]">
            <WindowSidebar provider={provider} />

            {/* Chat pane */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div
                ref={logRef}
                role="log"
                aria-live="polite"
                aria-label="Conversation with the portfolio assistant"
                className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7"
              >
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                    <p className="max-w-sm text-sm text-muted">
                      Try one of these, or type your own question:
                    </p>
                    <ul className="flex flex-wrap justify-center gap-2.5">
                      {profile.suggestedQuestions.map((q) => (
                        <li key={q}>
                          <button
                            onClick={() => send(q)}
                            className="rounded-full border border-line bg-raise/80 px-4 py-2 text-sm text-ink/85 transition-colors hover:border-accent/50 hover:text-accent"
                          >
                            {q}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {messages.map((message, i) => {
                  const isLast = i === messages.length - 1;
                  const showCaret = isLast && message.role === "assistant" && streaming;
                  return (
                    <div
                      key={i}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={
                          message.role === "user"
                            ? "max-w-[85%] rounded-2xl rounded-br-md bg-accent-dim px-4 py-2.5 text-ink"
                            : "max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-raise/80 px-4 py-2.5 text-ink/90"
                        }
                      >
                        <span className="sr-only">
                          {message.role === "user" ? "You: " : "Assistant: "}
                        </span>
                        <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">
                          {message.content}
                          {showCaret && (
                            <span
                              aria-hidden="true"
                              className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-accent"
                            />
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="border-t border-line p-3 sm:p-4"
              >
                <div className="flex items-center gap-3">
                  <label htmlFor="ask-input" className="sr-only">
                    Ask a question about {profile.name}
                  </label>
                  <input
                    id="ask-input"
                    type="text"
                    value={input}
                    maxLength={MAX_INPUT}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask anything about ${profile.firstName}…`}
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-full border border-line bg-base/70 px-5 py-3 text-[0.95rem] text-ink placeholder:text-muted/70 focus:border-accent/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={streaming || !input.trim()}
                    className="shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-medium text-onaccent transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {streaming ? "Thinking…" : "Ask"}
                  </button>
                </div>
              </form>

              {/* Status bar */}
              <div className="flex items-center justify-between border-t border-line bg-base/60 px-4 py-2 font-mono text-[0.65rem] text-muted">
                <span>model-agnostic · streaming</span>
                <span aria-live="polite">
                  {streaming ? "streaming…" : `ready · ${PROVIDER_LABELS[provider] ?? provider}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
