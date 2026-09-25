import { createProvider } from "@/server/ai/providers";
import { getSettings } from "@/server/config/settings";
import { ensureSeeded, knowledgeStats } from "@/server/knowledge/service";
import { handle } from "@/server/http";

export const dynamic = "force-dynamic";

/** Public, non-sensitive assistant status for the chat UI. */
export const GET = handle(async () => {
  await ensureSeeded();
  const settings = await getSettings();
  const provider = createProvider(settings);
  const stats = await knowledgeStats();
  return Response.json({
    mode: provider ? "llm" : "retrieval-only",
    provider: provider?.id ?? null,
    model: provider?.model ?? null,
    knowledge: stats,
  });
});
