import type { AIProvider } from "./types";
import { LocalProvider } from "./local";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";

/**
 * Provider selection — entirely environment-driven, resolved server-side.
 *
 *   AI_PROVIDER=anthropic + ANTHROPIC_API_KEY → Claude
 *   AI_PROVIDER=openai    + OPENAI_API_KEY    → OpenAI
 *   anything else                              → local demo engine
 *
 * If AI_PROVIDER is unset but exactly one key is present, that provider is
 * used — so adding a single env var is enough to go live with a real LLM.
 */
export function getProvider(): AIProvider {
  const requested = process.env.AI_PROVIDER?.toLowerCase();
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (requested === "anthropic" && anthropicKey) return new AnthropicProvider(anthropicKey);
  if (requested === "openai" && openaiKey) return new OpenAIProvider(openaiKey);

  if (!requested || requested === "local") {
    if (!requested && anthropicKey) return new AnthropicProvider(anthropicKey);
    if (!requested && openaiKey) return new OpenAIProvider(openaiKey);
  }

  return new LocalProvider();
}

export type { AIProvider, ChatMessage } from "./types";
