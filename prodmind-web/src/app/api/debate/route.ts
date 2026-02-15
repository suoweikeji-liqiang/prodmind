import { processDebateAction } from "@/lib/engine/debate";
import type { DebateAction, SSEEvent } from "@/types";

export async function POST(request: Request) {
  const action: DebateAction = await request.json();

  if (!action.sessionId || !action.type) {
    return new Response(JSON.stringify({ error: "sessionId and type are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const write = (event: SSEEvent) => {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        await processDebateAction(action, write);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        write({ type: "error", content: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
