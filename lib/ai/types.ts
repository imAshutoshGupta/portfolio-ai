/**
 * Provider abstraction for the "Ask My Portfolio" assistant.
 *
 * Every provider — including the zero-dependency local demo engine — implements
 * this one interface. The API route only ever talks to an AIProvider, so adding
 * a new backend (Anthropic, OpenAI, Mistral, a local model…) is a small adapter
 * file plus one case in lib/ai/index.ts. No UI or route changes required.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIProvider {
  /** Identifier surfaced in the X-AI-Provider response header (handy for debugging). */
  readonly name: string;

  /**
   * Answer the conversation, yielding the reply as text chunks.
   * The last message in `messages` is the question being asked.
   */
  stream(messages: ChatMessage[]): AsyncIterable<string>;
}
