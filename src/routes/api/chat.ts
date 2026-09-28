import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { runAgentChat } from "@/lib/ai";

type ChatRequestBody = {
  messages?: unknown;
  tier?: string;
  isThinking?: boolean;
  id?: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as ChatRequestBody;
          const messages = body.messages;
          const tier = body.tier;
          const isThinking = body.isThinking;
          const threadId = body.id;

          if (!Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Messages array is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Execute real LLM Tool-Calling Agent Loop
          return await runAgentChat({
            messages: messages as UIMessage[],
            tier,
            isThinking,
            threadId,
          });
        } catch (err: any) {
          console.error("Error in /api/chat:", err);
          return new Response(
            JSON.stringify({
              error:
                err?.message ||
                "Karudi encountered an unexpected issue while processing your request. Please try again.",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
