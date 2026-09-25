import { resolveWebOwner } from "@/server/auth/session";
import { clearConversation, getOwnedConversation } from "@/server/chat/services/conversation-service";
import { handle, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** Clears all messages in a conversation (keeps the conversation itself). */
export const DELETE = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { ownerKey } = await resolveWebOwner();
  const conversation = await getOwnedConversation(id, ownerKey);
  if (!conversation) return jsonError("Conversation not found", 404);
  await clearConversation(id);
  return Response.json({ ok: true });
});
