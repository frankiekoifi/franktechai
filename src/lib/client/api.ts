"use client";

export type Source = {
  documentId: string;
  title: string;
  category: string;
  source: string | null;
  score: number;
  index?: number;
  cited?: boolean;
};

export type Attachment = { id: string; name: string; mimeType: string; size: number };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[];
  attachments: Attachment[];
  model: string | null;
  status: string;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
};

export type User = { id: string; email: string; name: string; role: string };

export type AssistantStatus = {
  mode: "llm" | "retrieval-only";
  provider: string | null;
  model: string | null;
  knowledge: { documents: number; published: number };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers:
      init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json", ...(init?.headers ?? {}) }
        : init?.headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error || `Request failed (${res.status})`, res.status);
  return data as T;
}

export type StreamEvent =
  | {
      type: "start";
      conversationId: string;
      userMessage: ChatMessage | null;
      sources: Source[];
      model: string | null;
      mode: "llm" | "retrieval-only";
    }
  | { type: "title"; title: string }
  | { type: "token"; value: string }
  | { type: "done"; message: ChatMessage }
  | { type: "error"; error: string; message?: ChatMessage };

/** POSTs to /api/chat and yields NDJSON events as they stream in. */
export async function* streamChat(
  body: { conversationId?: string | null; message?: string; attachmentIds?: string[]; regenerate?: boolean },
  signal: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError((data as { error?: string }).error || `Request failed (${res.status})`, res.status);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line) yield JSON.parse(line) as StreamEvent;
    }
  }
  if (buffer.trim()) yield JSON.parse(buffer) as StreamEvent;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
