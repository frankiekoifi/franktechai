/**
 * Static application configuration derived from environment variables.
 * Runtime-editable values (system prompt, provider overrides) live in
 * `settings.ts` and are stored in the database.
 */
export type ProviderKind = "openai" | "ollama" | "none";

export const appConfig = {
  appName: "FrankTechSpace AI",
  sessionCookie: "fts_session",
  guestCookie: "fts_guest",
  sessionDays: 30,
  adminEmail: process.env.ADMIN_EMAIL?.toLowerCase() || null,
  maxUploadBytes: 15 * 1024 * 1024,
  maxFileContextChars: 14000,
  maxHistoryMessages: 24,
  maxHistoryChars: 24000,
  retrieval: {
    topK: 5,
    minScore: 0.08,
    chunkSize: 1200,
    chunkOverlap: 150,
  },
};

function envProvider(): ProviderKind {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "openai" || explicit === "ollama" || explicit === "none") return explicit;
  if (process.env.AI_API_KEY || process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OLLAMA_BASE_URL) return "ollama";
  return "none";
}

/** Default provider configuration from env; the admin can override in Settings. */
export function envProviderDefaults() {
  const provider = envProvider();
  return {
    provider,
    baseUrl:
      process.env.AI_BASE_URL ||
      (provider === "ollama"
        ? process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434"
        : "https://api.openai.com/v1"),
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "",
    model: process.env.AI_MODEL || (provider === "ollama" ? "llama3.1" : "gpt-4o-mini"),
    embeddingModel: process.env.AI_EMBEDDING_MODEL || "",
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.3),
  };
}
