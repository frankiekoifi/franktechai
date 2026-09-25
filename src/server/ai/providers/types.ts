export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Image data URLs (data:image/png;base64,...) for vision-capable models. */
  images?: string[];
}

export interface ChatOptions {
  maxTokens?: number;
  model?: string;
  temperature?: number;
  signal?: AbortSignal;
}
/**
 * Every LLM backend implements this interface. The agent never talks to a
 * specific vendor API directly, so adding a provider = adding one file.
 */
export interface LLMProvider {
  readonly id: string;
  readonly model: string;
  /** Streams text deltas. Must honour `signal` for stop-generation. */
  streamChat(
    messages: ChatMessage[],
    options?: ChatOptions,
  ): AsyncGenerator<string>;
  /** Optional embeddings support for semantic retrieval. */
  embed?(texts: string[], signal?: AbortSignal): Promise<number[][]>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

/** Reads a fetch body stream line by line. */
export async function* readLines(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (line) yield line;
      }
    }
    if (buffer.trim()) yield buffer.trim();
  } finally {
    reader.releaseLock();
  }
}
