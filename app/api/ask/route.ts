import { NextRequest } from "next/server";
import { getProvider, type ChatMessage } from "@/lib/ai";

export const runtime = "nodejs";

const MAX_MESSAGES = 24;
const MAX_MESSAGE_LENGTH = 1000;

function isValidMessage(m: unknown): m is ChatMessage {
  return (
    typeof m === "object" &&
    m !== null &&
    ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
    typeof (m as ChatMessage).content === "string" &&
    (m as ChatMessage).content.length > 0 &&
    (m as ChatMessage).content.length <= MAX_MESSAGE_LENGTH
  );
}

/**
 * POST /api/ask — streams a plain-text answer to a question about the developer.
 * Body: { messages: { role: "user" | "assistant", content: string }[] }
 *
 * The provider (local demo engine or a real LLM) is chosen server-side from
 * environment variables; API keys never reach the client.
 */
export async function POST(req: NextRequest) {
  let messages: ChatMessage[];
  try {
    const body = await req.json();
    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      throw new Error("messages required");
    }
    messages = body.messages.slice(-MAX_MESSAGES);
    if (!messages.every(isValidMessage) || messages.at(-1)?.role !== "user") {
      throw new Error("invalid messages");
    }
  } catch {
    return Response.json(
      { error: "Send { messages: [{ role, content }] } ending with a user message." },
      { status: 400 },
    );
  }

  const provider = getProvider();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of provider.stream(messages)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error(`[ask] ${provider.name} provider error:`, err);
        controller.enqueue(
          encoder.encode(
            "Sorry — I hit a snag answering that. Please try again in a moment.",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-AI-Provider": provider.name,
    },
  });
}
