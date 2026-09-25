import { resolveWebOwner } from "@/server/auth/session";
import {
  deleteConversation,
  getMessages,
  getOwnedConversation,
  renameConversation,
} from "@/server/chat/services/conversation-service";
import { handle, jsonError, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const { id } = await params;
  const { ownerKey } = await resolveWebOwner();
  const conversation = await getOwnedConversation(id, ownerKey);
  if (!conversation) return jsonError("Conversation not found", 404);
  const messages = await getMessages(id);
  return Response.json({ conversation, messages });
});

export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const { id } = await params;
  const { ownerKey } = await resolveWebOwner();
  const body = await readJson<{ title?: string }>(req);
  if (!body.title?.trim()) return jsonError("Title is required");
  const conversation = await renameConversation(id, ownerKey, body.title);
  if (!conversation) return jsonError("Conversation not found", 404);
  return Response.json({ conversation });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const { id } = await params;
  const { ownerKey } = await resolveWebOwner();
  const ok = await deleteConversation(id, ownerKey);
  if (!ok) return jsonError("Conversation not found", 404);
  return Response.json({ ok: true });
});
