import { requireAdmin } from "@/server/auth/session";
import { getSettings, publicSettings, updateSettings } from "@/server/config/settings";
import { handle, jsonError, readJson } from "@/server/http";
import { listTools } from "@/server/ai/tools";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return Response.json({ settings: publicSettings(await getSettings()), tools: listTools() });
});

export const PUT = handle(async (req: Request) => {
  await requireAdmin();
  const b = await readJson<Record<string, unknown>>(req);
  if (b.provider !== undefined && !["openai", "ollama", "none"].includes(String(b.provider))) {
    return jsonError("Invalid provider");
  }
  if (b.temperature !== undefined) {
    const t = Number(b.temperature);
    if (Number.isNaN(t) || t < 0 || t > 2) return jsonError("Temperature must be between 0 and 2");
  }
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const s = await updateSettings({
    systemPrompt: str(b.systemPrompt),
    provider: b.provider as "openai" | "ollama" | "none" | undefined,
    baseUrl: str(b.baseUrl),
    apiKey: str(b.apiKey),
    model: str(b.model),
    embeddingModel: str(b.embeddingModel),
    temperature: b.temperature !== undefined ? Number(b.temperature) : undefined,
    clearApiKey: Boolean(b.clearApiKey),
  });
  return Response.json({ settings: publicSettings(s) });
});
