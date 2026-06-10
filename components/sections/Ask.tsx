"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RevealText from "@/components/RevealText";
import Reveal from "@/components/Reveal";
import { profile } from "@/data/profile";
import type { ChatMessage } from "@/lib/ai/types";

const MAX_INPUT = 500;

export default function Ask() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
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
      className="mx-auto max-w-site px-6 py-28 sm:px-10 sm:py-40"
    >
      <p className="mb-4 text-sm tracking-widest text-accent">02 — ASK MY PORTFOLIO</p>
      <RevealText
        id="ask-heading"
        className="max-w-3xl font-display text-[clamp(1.9rem,4.5vw,3.4rem)] font-medium leading-tight tracking-tight text-ink"
      >
        Don&apos;t scroll. Just ask.
      </RevealText>
      <Reveal>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          A built-in assistant that knows {profile.firstName}&apos;s work inside out.
          Ask about projects, skills, or experience — like you would in an interview.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <div className="glass mx-auto flex h-[30rem] max-w-3xl flex-col overflow-hidden rounded-2xl">
          {/* Message log */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation with the portfolio assistant"
            className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7"
          >
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <p className="max-w-sm text-muted">
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
                className="shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-medium text-base transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {streaming ? "Thinking…" : "Ask"}
              </button>
            </div>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
