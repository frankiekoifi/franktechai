import { requireAdmin } from "@/server/auth/session";
import { handle, jsonError } from "@/server/http";
import { searchKnowledge } from "@/server/knowledge/retrieval/search";

export const dynamic = "force-dynamic";

/** Admin retrieval tester: shows which chunks the agent would receive. */
export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return jsonError("Query is required");
  const results = await searchKnowledge(q, { topK: 8 });
  return Response.json({ results });
});
