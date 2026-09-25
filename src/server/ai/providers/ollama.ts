import {
  type ChatMessage,
  type ChatOptions,
  type LLMProvider,
  ProviderError,
  readLines,
} from "./types";

/** Native Ollama API provider (http://host:11434/api/chat). */
export class OllamaProvider implements LLMProvider {
  readonly id = "ollama";

  constructor(
    private cfg: { baseUrl: string; model: string; embeddingModel?: string; temperature?: number },
  ) {}

  get model() {
    return this.cfg.model;
  }

  private base() {
    return this.cfg.baseUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
  }

  async *streamChat(messages: ChatMessage[], options: ChatOptions = {}): AsyncGenerator<string> {
    const res = await fetch(`${this.base()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: options.signal,
      body: JSON.stringify({
        model: options.model ?? this.cfg.model,
        stream: true,
        options: { temperature: options.temperature ?? this.cfg.temperature ?? 0.3 },
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.images?.length
            ? { images: m.images.map((d) => d.replace(/^data:[^;]+;base64,/, "")) }
            : {}),
        })),
      }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      throw new ProviderError(`Ollama error (${res.status}): ${text.slice(0, 400)}`, res.status);
    }

    for await (const line of readLines(res.body)) {
      try {
        const json = JSON.parse(line);
        if (json.error) throw new ProviderError(json.error);
        if (json.message?.content) yield json.message.content as string;
        if (json.done) return;
      } catch (e) {
        if (e instanceof ProviderError) throw e;
      }
    }
  }

  async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
    if (!this.cfg.embeddingModel) throw new ProviderError("No embedding model configured");
    const res = await fetch(`${this.base()}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({ model: this.cfg.embeddingModel, input: texts }),
    });
    if (!res.ok) throw new ProviderError(`Ollama embed error (${res.status})`);
    const json = (await res.json()) as { embeddings: number[][] };
    return json.embeddings;
  }
}
