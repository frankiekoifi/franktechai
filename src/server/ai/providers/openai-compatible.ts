import {
  type ChatMessage,
  type ChatOptions,
  type LLMProvider,
  ProviderError,
  readLines,
} from "./types";

/**
 * Works with any OpenAI-compatible Chat Completions API:
 * OpenAI, Ollama (/v1), LM Studio, Groq, OpenRouter, Together, vLLM, etc.
 */
export class OpenAICompatibleProvider implements LLMProvider {
  readonly id = "openai";

  constructor(
    private cfg: {
      baseUrl: string;
      apiKey?: string;
      model: string;
      embeddingModel?: string;
      temperature?: number;
    },
  ) {}

  get model() {
    return this.cfg.model;
  }

  private headers() {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.cfg.apiKey) h.Authorization = `Bearer ${this.cfg.apiKey}`;
    return h;
  }

  private toApiMessage(m: ChatMessage) {
    if (m.images?.length && m.role === "user") {
      return {
        role: m.role,
        content: [
          { type: "text", text: m.content },
          ...m.images.map((url) => ({ type: "image_url", image_url: { url } })),
        ],
      };
    }
    return { role: m.role, content: m.content };
  }

  async *streamChat(
    messages: ChatMessage[],
    options: ChatOptions = {
      maxTokens: 0,
    },
  ): AsyncGenerator<string> {
    const res = await fetch(
      `${this.cfg.baseUrl.replace(/\/+$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: this.headers(),
        signal: options.signal,
        body: JSON.stringify({
          model: options.model ?? this.cfg.model,
          temperature: options.temperature ?? this.cfg.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 1500,
          stream: true,
          messages: messages.map((m) => this.toApiMessage(m)),
        }),
      },
    );

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      throw new ProviderError(
        `AI provider error (${res.status}): ${text.slice(0, 400) || res.statusText}`,
        res.status,
      );
    }

    for await (const line of readLines(res.body)) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        if (json.error)
          throw new ProviderError(
            json.error.message ?? "Provider stream error",
          );
        const delta: string | undefined = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch (e) {
        if (e instanceof ProviderError) throw e;
        // ignore keep-alive / malformed lines
      }
    }
  }

  async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
    if (!this.cfg.embeddingModel)
      throw new ProviderError("No embedding model configured");
    const res = await fetch(
      `${this.cfg.baseUrl.replace(/\/+$/, "")}/embeddings`,
      {
        method: "POST",
        headers: this.headers(),
        signal,
        body: JSON.stringify({ model: this.cfg.embeddingModel, input: texts }),
      },
    );
    if (!res.ok) {
      throw new ProviderError(
        `Embedding error (${res.status}): ${(await res.text()).slice(0, 300)}`,
      );
    }
    const json = (await res.json()) as {
      data: { embedding: number[]; index: number }[];
    };
    return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  }
}
