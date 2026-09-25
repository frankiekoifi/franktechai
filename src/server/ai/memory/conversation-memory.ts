import type { Message } from "@/db/schema";
import { appConfig } from "@/server/config";
import type { ChatMessage } from "../providers/types";

/**
 * Short-term conversation memory: turns stored messages into model context,
 * keeping the most recent turns within a character budget.
 *
 * Long-term memory is intentionally NOT derived from conversations — only
 * documents explicitly added to the knowledge base persist as org knowledge.
 */
export function buildConversationContext(
  history: Message[],
  opts: { maxMessages?: number; maxChars?: number } = {},
): ChatMessage[] {
  const maxMessages = opts.maxMessages ?? appConfig.maxHistoryMessages;
  const maxChars = opts.maxChars ?? appConfig.maxHistoryChars;

  const usable = history.filter(
    (m) => (m.role === "user" || m.role === "assistant") && m.content.trim() && m.status !== "error",
  );
  const recent = usable.slice(-maxMessages);

  const out: ChatMessage[] = [];
  let total = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    const m = recent[i];
    let content = m.content;
    if (m.attachments?.length) {
      content += `\n\n[Attached: ${m.attachments.map((a) => a.name).join(", ")}]`;
    }
    if (total + content.length > maxChars && out.length > 0) break;
    total += content.length;
    out.unshift({ role: m.role as "user" | "assistant", content });
  }
  // Providers expect the conversation to start with a user turn.
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

/**
 * Builds the retrieval query. Short follow-ups ("Epson L3110") are combined
 * with the previous user turn so the search keeps the topic.
 */
export function buildRetrievalQuery(history: Message[], current: string) {
  const previousUser = [...history].reverse().filter((m) => m.role === "user" && m.content !== current);
  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
  const words = current.trim().split(/\s+/).length;
  if (words >= 12 || previousUser.length === 0) return current;
  const parts = [current, previousUser[0]?.content ?? ""];
  if (words < 5 && lastAssistant) parts.push(lastAssistant.content.slice(0, 300));
  return parts.join(" \n ");
}
