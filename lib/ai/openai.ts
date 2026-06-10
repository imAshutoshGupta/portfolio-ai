import type { AIProvider, ChatMessage } from "./types";
import { buildSystemPrompt } from "./prompt";

/**
 * OpenAI adapter. Activated by setting OPENAI_API_KEY and AI_PROVIDER=openai.
 * Uses the Chat Completions SSE wire format directly, so no extra dependency
 * is needed. Runs server-side only.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.model = process.env.OPENAI_MODEL ?? "gpt-4o";
  }

  async *stream(messages: ChatMessage[]): AsyncIterable<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        stream: true,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`OpenAI request failed: ${res.status} ${await res.text()}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const data = line.replace(/^data: /, "").trim();
        if (!data || data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const delta: string | undefined = json.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // Partial frame split across chunks — ignored; the remainder stays in buffer.
        }
      }
    }
  }
}
