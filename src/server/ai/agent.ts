import type {
  Message,
  MessageAttachment,
  MessageSource,
  StoredFile,
} from "@/db/schema";
import {
  addMessage,
  createConversation,
  deleteMessage,
  getMessages,
  getOwnedConversation,
  setTitleIfDefault,
} from "@/server/chat/services/conversation-service";
import { appConfig } from "@/server/config";
import { getSettings } from "@/server/config/settings";
import { getOwnedFiles } from "@/server/files/file-service";
import { ensureSeeded } from "@/server/knowledge/service";
import type { RetrievedChunk } from "@/server/knowledge/retrieval/search";
import {
  buildConversationContext,
  buildRetrievalQuery,
} from "./memory/conversation-memory";
import { buildSystemPrompt, type PromptSource } from "./prompts/system";
import { createProvider, type ChatMessage } from "./providers";
import { knowledgeSearchTool } from "./tools";

/**
 * FrankTechSpace AI agent — the single entry point used by every channel
 * (web today, WhatsApp and other apps later). It knows nothing about HTTP,
 * cookies or UI; channels pass an ownerKey and receive events.
 */

export type AgentEvent =
  | {
      type: "start";
      conversationId: string;
      userMessage: Message | null;
      sources: MessageSource[];
      model: string | null;
      mode: "llm" | "retrieval-only";
    }
  | { type: "title"; title: string }
  | { type: "token"; value: string }
  | { type: "done"; message: Message }
  | { type: "error"; error: string; message?: Message };

export type AgentRequest = {
  ownerKey: string;
  channel: string;
  conversationId?: string | null;
  text?: string;
  attachmentIds?: string[];
  regenerate?: boolean;
  signal?: AbortSignal;
  onEvent: (e: AgentEvent) => void;
};

export class AgentInputError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

type GroupedSource = MessageSource & { index: number; content: string };

/** Max number of knowledge documents attached to a single prompt. */
const MAX_SOURCES = 3;
/** Max characters of content per knowledge document (keeps token usage low). */
const MAX_SOURCE_CHARS = 2000;
/** Output token ceiling sent to the provider — protects the free-tier TPM budget. */
const MAX_OUTPUT_TOKENS = 1500;

function groupSources(chunks: RetrievedChunk[]): GroupedSource[] {
  const byDoc = new Map<
    string,
    { meta: RetrievedChunk; score: number; parts: RetrievedChunk[] }
  >();
  for (const c of chunks) {
    const g = byDoc.get(c.documentId);
    if (g) {
      g.parts.push(c);
      g.score = Math.max(g.score, c.score);
    } else {
      byDoc.set(c.documentId, { meta: c, score: c.score, parts: [c] });
    }
  }
  return Array.from(byDoc.values())
    .slice(0, MAX_SOURCES)
    .map((g, i) => {
      // keep the document's chunks in reading order, capped in size
      const ordered = g.parts.sort((a, b) => a.chunkIndex - b.chunkIndex);
      let content = "";
      for (const p of ordered) {
        if (content.length > MAX_SOURCE_CHARS) break;
        content += (content ? "\n...\n" : "") + p.content;
      }
      return {
        index: i + 1,
        documentId: g.meta.documentId,
        title: g.meta.title,
        category: g.meta.category,
        source: g.meta.source,
        score: g.score,
        content,
      };
    });
}

function markCited(sources: GroupedSource[], answer: string): MessageSource[] {
  const cited = new Set<number>();
  for (const m of answer.matchAll(/\[(\d{1,2})\]/g)) cited.add(Number(m[1]));
  const lower = answer.toLowerCase();
  return sources.map((s) => ({
    documentId: s.documentId,
    title: s.title,
    category: s.category,
    source: s.source,
    score: Math.round(s.score * 1000) / 1000,
    index: s.index,
    cited: cited.has(s.index) || lower.includes(s.title.toLowerCase()),
  }));
}

function retrievalOnlyAnswer(sources: GroupedSource[]) {
  if (!sources.length) {
    return (
      "I couldn't find anything about that in the FrankTechSpace knowledge base, and **no AI model is connected yet**, so I can't generate an answer from general knowledge.\n\n" +
      "An administrator can connect a model (OpenAI-compatible API or Ollama) under **Admin → AI Settings**, or add a guide on this topic to the knowledge base."
    );
  }
  const body = sources
    .map((s) => {
      const excerpt =
        s.content.length > 1800 ? s.content.slice(0, 1800) + "…" : s.content;
      return `### [${s.index}] ${s.title}\n\n${excerpt}`;
    })
    .join("\n\n---\n\n");
  return (
    "> **Knowledge-base mode:** no AI model is connected yet, so I'm showing the most relevant FrankTechSpace knowledge base excerpts instead of a tailored answer.\n\n" +
    body +
    "\n\n_An administrator can connect an AI model under **Admin → AI Settings** for conversational answers._"
  );
}

function fileContext(files: StoredFile[]) {
  let budget = appConfig.maxFileContextChars * 2;
  return files.map((f) => {
    let text = f.extractedText;
    if (text) {
      const limit = Math.min(
        appConfig.maxFileContextChars,
        Math.max(budget, 0),
      );
      if (text.length > limit) text = text.slice(0, limit) + "\n[...truncated]";
      budget -= text.length;
    }
    return { name: f.name, mimeType: f.mimeType, text };
  });
}

/** Turn a raw provider error into a user-friendly message. */
function friendlyProviderError(err: unknown, baseUrl: string): string {
  if (!(err instanceof Error)) return "AI provider error";
  const msg = err.message;

  if (msg.includes("fetch failed")) {
    return `Could not reach the AI provider at ${baseUrl}. Check AI Settings.`;
  }
  if (msg.includes("429") || /rate[_ ]?limit/i.test(msg)) {
    return "I'm receiving too many requests right now. Please wait 10–15 seconds and try again.";
  }
  if (msg.includes("401") || /unauthorized/i.test(msg)) {
    return "The AI provider rejected the API key. Check AI Settings.";
  }
  if (msg.includes("404") || /model[_ ]?not[_ ]?found/i.test(msg)) {
    return "The configured AI model is not available. Check the model name in AI Settings.";
  }
  return msg;
}

export async function runAgentTurn(req: AgentRequest): Promise<void> {
  const { ownerKey, channel, signal, onEvent } = req;
  await ensureSeeded();

  // 1. Conversation
  let conversation = req.conversationId
    ? await getOwnedConversation(req.conversationId, ownerKey)
    : null;
  if (req.conversationId && !conversation)
    throw new AgentInputError("Conversation not found", 404);
  if (!conversation) conversation = await createConversation(ownerKey, channel);
  const conversationId = conversation.id;

  let history = await getMessages(conversationId);
  let userMessage: Message | null = null;
  let text: string;
  let currentAttachments: MessageAttachment[];

  // 2. Record the user turn (or rewind for regenerate)
  if (req.regenerate) {
    const last = history[history.length - 1];
    if (last?.role === "assistant") {
      await deleteMessage(last.id);
      history = history.slice(0, -1);
    }
    const lastUser = history[history.length - 1];
    if (!lastUser || lastUser.role !== "user")
      throw new AgentInputError("Nothing to regenerate");
    text = lastUser.content;
    currentAttachments = lastUser.attachments ?? [];
  } else {
    text = (req.text ?? "").trim();
    const found = await getOwnedFiles(ownerKey, req.attachmentIds ?? []);
    currentAttachments = found.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size,
    }));
    if (!text && !currentAttachments.length)
      throw new AgentInputError("Message is empty");
    if (text.length > 16000) throw new AgentInputError("Message is too long");
    if (!text)
      text =
        "Please review the attached file(s) and summarise the important information.";
    userMessage = await addMessage({
      conversationId,
      role: "user",
      content: text,
      attachments: currentAttachments,
    });
    history = [...history, userMessage];
  }

  // 3. Files referenced anywhere in this conversation
  const allAttachmentIds = Array.from(
    new Set(history.flatMap((m) => (m.attachments ?? []).map((a) => a.id))),
  );
  const storedFiles = await getOwnedFiles(ownerKey, allAttachmentIds);
  const currentIds = new Set(currentAttachments.map((a) => a.id));
  const currentImages = storedFiles
    .filter((f) => currentIds.has(f.id) && f.dataUrl)
    .map((f) => f.dataUrl!);

  // 4. Retrieval (RAG)
  const priorHistory = history.slice(0, -1);
  const query = buildRetrievalQuery(priorHistory, text);
  const chunks = await knowledgeSearchTool.execute(
    { query },
    { ownerKey, channel, signal },
  );
  const sources = groupSources(chunks);

  const settings = await getSettings();
  const provider = createProvider(settings);

  onEvent({
    type: "start",
    conversationId,
    userMessage,
    sources: markCited(sources, "").map((s) => ({ ...s, cited: false })),
    model: provider?.model ?? null,
    mode: provider ? "llm" : "retrieval-only",
  });

  if (!req.regenerate) {
    const title = await setTitleIfDefault(conversationId, text);
    if (title) onEvent({ type: "title", title });
  }

  // 5. Generate
  let answer = "";
  let status: "complete" | "stopped" | "error" = "complete";
  let errorMessage: string | null = null;

  if (!provider) {
    const full = retrievalOnlyAnswer(sources);
    for (let i = 0; i < full.length; i += 48) {
      if (signal?.aborted) {
        status = "stopped";
        break;
      }
      const piece = full.slice(i, i + 48);
      answer += piece;
      onEvent({ type: "token", value: piece });
    }
  } else {
    const promptSources: PromptSource[] = sources.map((s) => ({
      index: s.index,
      title: s.title,
      category: s.category,
      content: s.content,
    }));
    const system = buildSystemPrompt({
      basePrompt: settings.systemPrompt,
      sources: promptSources,
      files: fileContext(storedFiles),
      channel,
    });
    const context = buildConversationContext(history);
    const messages: ChatMessage[] = [
      { role: "system", content: system },
      ...context,
    ];
    const lastMsg = messages[messages.length - 1];
    if (currentImages.length && lastMsg?.role === "user")
      lastMsg.images = currentImages;

    try {
      for await (const delta of provider.streamChat(messages, {
        signal,
        maxTokens: MAX_OUTPUT_TOKENS,
      })) {
        answer += delta;
        onEvent({ type: "token", value: delta });
      }
      if (!answer.trim()) {
        status = "error";
        errorMessage = "The AI model returned an empty response.";
      }
    } catch (err) {
      if (signal?.aborted || (err as Error)?.name === "AbortError") {
        status = "stopped";
      } else {
        status = "error";
        errorMessage = friendlyProviderError(err, settings.baseUrl);
        console.error("[agent] provider error", err);
      }
    }
  }

  const content =
    status === "error"
      ? (answer ? answer + "\n\n" : "") + `⚠️ ${errorMessage}`
      : answer || (status === "stopped" ? "_Generation stopped._" : "");

  const saved = await addMessage({
    conversationId,
    role: "assistant",
    content,
    sources: markCited(sources, answer),
    model: provider?.model ?? "knowledge-base",
    status,
  });

  if (status === "error")
    onEvent({ type: "error", error: errorMessage ?? "Error", message: saved });
  else onEvent({ type: "done", message: saved });
}
