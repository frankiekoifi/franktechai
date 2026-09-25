import { resolveWebOwner } from "@/server/auth/session";
import { createConversation, listConversations } from "@/server/chat/services/conversation-service";
import { handle } from "@/server/http";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const { ownerKey, user } = await resolveWebOwner();
  const conversations = await listConversations(ownerKey);
  return Response.json({ conversations, isGuest: !user });
});

export const POST = handle(async (req: Request) => {
  const { ownerKey } = await resolveWebOwner();
  let title: string | undefined;
  try {
    const body = (await req.json()) as { title?: string };
    title = typeof body.title === "string" ? body.title : undefined;
  } catch {}
  const conversation = await createConversation(ownerKey, "web", title);
  return Response.json({ conversation }, { status: 201 });
});
