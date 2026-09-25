import { db } from "@/db";
import {
  conversations,
  messages,
  type MessageAttachment,
  type MessageSource,
} from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

export class NotFoundError extends Error {}

export async function listConversations(ownerKey: string) {
  return db
    .select({
      id: conversations.id,
      title: conversations.title,
      channel: conversations.channel,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .where(eq(conversations.ownerKey, ownerKey))
    .orderBy(desc(conversations.updatedAt))
    .limit(200);
}

export async function createConversation(ownerKey: string, channel: string, title?: string) {
  const [c] = await db
    .insert(conversations)
    .values({ ownerKey, channel, title: title?.trim() || "New conversation" })
    .returning();
  return c;
}

export async function getOwnedConversation(id: string, ownerKey: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [c] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.ownerKey, ownerKey)))
    .limit(1);
  return c ?? null;
}

export async function getMessages(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function renameConversation(id: string, ownerKey: string, title: string) {
  const [c] = await db
    .update(conversations)
    .set({ title: title.trim().slice(0, 120) || "Untitled" })
    .where(and(eq(conversations.id, id), eq(conversations.ownerKey, ownerKey)))
    .returning();
  return c ?? null;
}

export async function deleteConversation(id: string, ownerKey: string) {
  const res = await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.ownerKey, ownerKey)))
    .returning();
  return res.length > 0;
}

export async function clearConversation(id: string) {
  await db.delete(messages).where(eq(messages.conversationId, id));
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id));
}

export async function addMessage(input: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  sources?: MessageSource[];
  attachments?: MessageAttachment[];
  model?: string | null;
  status?: string;
}) {
  const [m] = await db
    .insert(messages)
    .values({
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      sources: input.sources ?? [],
      attachments: input.attachments ?? [],
      model: input.model ?? null,
      status: input.status ?? "complete",
    })
    .returning();
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, input.conversationId));
  return m;
}

export async function deleteMessage(id: string) {
  await db.delete(messages).where(eq(messages.id, id));
}

export async function setTitleIfDefault(conversationId: string, firstMessage: string) {
  const [c] = await db
    .select({ title: conversations.title })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (!c || c.title !== "New conversation") return null;
  const title = deriveTitle(firstMessage);
  await db.update(conversations).set({ title }).where(eq(conversations.id, conversationId));
  return title;
}

export function deriveTitle(text: string) {
  const clean = text
    .replace(/[`*_#>\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(hi|hello|hey|please|can you|could you|help me)[,!\s]+/i, "");
  if (!clean) return "New conversation";
  const t = clean.length > 48 ? clean.slice(0, 48).replace(/\s+\S*$/, "") + "…" : clean;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
