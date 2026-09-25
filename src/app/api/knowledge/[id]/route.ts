import { requireAdmin } from "@/server/auth/session";
import { handle, jsonError, readJson } from "@/server/http";
import {
  deleteDocument,
  getDocument,
  updateDocument,
  validateKnowledgeInput,
} from "@/server/knowledge/service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const isUuid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const { id } = await params;
  const document = isUuid(id) ? await getDocument(id) : null;
  if (!document) return jsonError("Document not found", 404);
  return Response.json({ document });
});

export const PUT = handle(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) return jsonError("Document not found", 404);
  const input = validateKnowledgeInput(await readJson(req));
  if (typeof input === "string") return jsonError(input);
  const document = await updateDocument(id, input);
  if (!document) return jsonError("Document not found", 404);
  return Response.json({ document });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id) || !(await deleteDocument(id))) return jsonError("Document not found", 404);
  return Response.json({ ok: true });
});
