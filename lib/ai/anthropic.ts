import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ChatMessage } from "./types";
import { buildSystemPrompt } from "./prompt";

/**
 * Anthropic adapter. Activated by setting ANTHROPIC_API_KEY (and optionally
 * AI_PROVIDER=anthropic) — see .env.example. Runs server-side only.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
    this.model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
  }

  async *stream(messages: ChatMessage[]): AsyncIterable<string> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 1024,
      system: buildSystemPrompt(),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }
}
