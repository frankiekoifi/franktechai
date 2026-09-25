import { createProvider } from "@/server/ai/providers";
import { requireAdmin } from "@/server/auth/session";
import { getSettings } from "@/server/config/settings";
import { handle } from "@/server/http";

export const dynamic = "force-dynamic";

/** Sends a tiny prompt to the configured provider to verify connectivity. */
export const POST = handle(async () => {
  await requireAdmin();
  const settings = await getSettings();
  const provider = createProvider(settings);
  if (!provider) return Response.json({ ok: false, error: "No AI provider configured." });
  const started = Date.now();
  try {
    let reply = "";
    for await (const d of provider.streamChat(
      [{ role: "user", content: "Reply with exactly: FrankTechSpace AI online" }],
      { signal: AbortSignal.timeout(30000), temperature: 0 },
    )) {
      reply += d;
      if (reply.length > 200) break;
    }
    let embedding: string | null = null;
    if (settings.embeddingModel && provider.embed) {
      try {
        const [v] = await provider.embed(["test"]);
        embedding = `OK (${v.length} dimensions)`;
      } catch (e) {
        embedding = `Failed: ${(e as Error).message}`;
      }
    }
    return Response.json({ ok: true, reply, model: provider.model, ms: Date.now() - started, embedding });
  } catch (e) {
    const msg = (e as Error).message;
    return Response.json({
      ok: false,
      error: msg.includes("fetch failed") ? `Could not reach ${settings.baseUrl}` : msg,
    });
  }
});
