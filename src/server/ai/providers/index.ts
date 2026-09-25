import type { AssistantSettings } from "@/server/config/settings";
import { OllamaProvider } from "./ollama";
import { OpenAICompatibleProvider } from "./openai-compatible";
import type { LLMProvider } from "./types";

export * from "./types";

/**
 * Provider factory. Returns null when no model is configured so the agent can
 * fall back to honest retrieval-only answers instead of faking AI output.
 * To add a provider (Anthropic, Gemini…), implement LLMProvider and add a case.
 */
export function createProvider(s: AssistantSettings): LLMProvider | null {
  switch (s.provider) {
    case "openai":
      if (!s.baseUrl || !s.model) return null;
      return new OpenAICompatibleProvider({
        baseUrl: s.baseUrl,
        apiKey: s.apiKey,
        model: s.model,
        embeddingModel: s.embeddingModel,
        temperature: s.temperature,
      });
    case "ollama":
      if (!s.baseUrl || !s.model) return null;
      return new OllamaProvider({
        baseUrl: s.baseUrl,
        model: s.model,
        embeddingModel: s.embeddingModel,
        temperature: s.temperature,
      });
    default:
      return null;
  }
}
