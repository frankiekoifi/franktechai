import { requireAdmin } from "@/server/auth/session";
import { handle, jsonError, readJson } from "@/server/http";
import { createDocument, listDocuments, validateKnowledgeInput } from "@/server/knowledge/service";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  const documents = await listDocuments();
  return Response.json({ documents });
});

export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const input = validateKnowledgeInput(await readJson(req));
  if (typeof input === "string") return jsonError(input);
  const document = await createDocument(input);
  return Response.json({ document }, { status: 201 });
});
