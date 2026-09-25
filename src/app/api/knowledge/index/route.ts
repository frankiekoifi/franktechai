import { requireAdmin } from "@/server/auth/session";
import { handle } from "@/server/http";
import { reindexAll } from "@/server/knowledge/ingestion";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Rebuilds all retrieval chunks (and embeddings, if configured). */
export const POST = handle(async () => {
  await requireAdmin();
  const result = await reindexAll();
  return Response.json(result);
});
