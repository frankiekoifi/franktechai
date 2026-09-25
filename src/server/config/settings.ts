import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { envProviderDefaults, type ProviderKind } from "./index";
import { DEFAULT_SYSTEM_PROMPT } from "@/server/ai/prompts/system";

export type AssistantSettings = {
  systemPrompt: string;
  provider: ProviderKind;
  baseUrl: string;
  apiKey: string;
  model: string;
  embeddingModel: string;
  temperature: number;
};

const KEY = "assistant";

type StoredSettings = Partial<AssistantSettings>;

async function readStored(): Promise<StoredSettings> {
  const rows = await db.select().from(settings).where(eq(settings.key, KEY)).limit(1);
  return (rows[0]?.value as StoredSettings) ?? {};
}

export async function getSettings(): Promise<AssistantSettings> {
  const env = envProviderDefaults();
  const stored = await readStored();
  return {
    systemPrompt: stored.systemPrompt?.trim() ? stored.systemPrompt : DEFAULT_SYSTEM_PROMPT,
    provider: stored.provider ?? env.provider,
    baseUrl: stored.baseUrl || env.baseUrl,
    apiKey: stored.apiKey || env.apiKey,
    model: stored.model || env.model,
    embeddingModel: stored.embeddingModel ?? env.embeddingModel,
    temperature:
      typeof stored.temperature === "number" && !Number.isNaN(stored.temperature)
        ? stored.temperature
        : env.temperature,
  };
}

export async function updateSettings(patch: StoredSettings & { clearApiKey?: boolean }) {
  const stored = await readStored();
  const next: StoredSettings = { ...stored };
  if (patch.systemPrompt !== undefined) next.systemPrompt = patch.systemPrompt;
  if (patch.provider !== undefined) next.provider = patch.provider;
  if (patch.baseUrl !== undefined) next.baseUrl = patch.baseUrl.trim().replace(/\/+$/, "");
  if (patch.model !== undefined) next.model = patch.model.trim();
  if (patch.embeddingModel !== undefined) next.embeddingModel = patch.embeddingModel.trim();
  if (patch.temperature !== undefined) next.temperature = Number(patch.temperature);
  if (patch.clearApiKey) next.apiKey = "";
  else if (patch.apiKey) next.apiKey = patch.apiKey.trim();

  await db
    .insert(settings)
    .values({ key: KEY, value: next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: next, updatedAt: new Date() } });
  return getSettings();
}

/** Settings safe to return to admin clients (API key masked). */
export function publicSettings(s: AssistantSettings) {
  return {
    ...s,
    apiKey: undefined,
    hasApiKey: Boolean(s.apiKey),
    apiKeyPreview: s.apiKey ? `${s.apiKey.slice(0, 4)}…${s.apiKey.slice(-4)}` : null,
    defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT,
  };
}
