import { AgentInputError, runAgentTurn, type AgentEvent } from "@/server/ai/agent";
import { resolveWebOwner } from "@/server/auth/session";
import { handle, jsonError, readJson } from "@/server/http";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ChatBody = {
  conversationId?: string | null;
  message?: string;
  attachmentIds?: string[];
  regenerate?: boolean;
};

/**
 * Web channel adapter: resolves the caller's identity, then streams agent
 * events as NDJSON. A WhatsApp adapter would call runAgentTurn the same way.
 */
export const POST = handle(async (req: Request) => {
  const body = await readJson<ChatBody>(req);
  const { ownerKey } = await resolveWebOwner();

  if (!body.regenerate && !body.message?.trim() && !body.attachmentIds?.length) {
    return jsonError("Message is empty");
  }

  const encoder = new TextEncoder();
  const abort = new AbortController();
  req.signal.addEventListener("abort", () => abort.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (e: AgentEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {
          closed = true;
        }
      };
      try {
        await runAgentTurn({
          ownerKey,
          channel: "web",
          conversationId: body.conversationId ?? null,
          text: body.message ?? "",
          attachmentIds: Array.isArray(body.attachmentIds) ? body.attachmentIds.slice(0, 5) : [],
          regenerate: Boolean(body.regenerate),
          signal: abort.signal,
          onEvent: send,
        });
      } catch (err) {
        const message =
          err instanceof AgentInputError ? err.message : "The assistant failed to respond. Please try again.";
        if (!(err instanceof AgentInputError)) console.error("[chat] agent failure", err);
        send({ type: "error", error: message });
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {}
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
});
