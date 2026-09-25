import { db } from "@/db";
import { knowledgeChunks, knowledgeDocuments } from "@/db/schema";
import { appConfig } from "@/server/config";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { cosineSimilarity, getEmbedder } from "../embeddings";

export type RetrievedChunk = {
  chunkId: string;
  documentId: string;
  title: string;
  category: string;
  source: string | null;
  content: string;
  chunkIndex: number;
  score: number;
};

const STOPWORDS = new Set(
  "a an the and or but if then so to of in on at for with by from as is are was were be been being do does did how what when where which who whom why can could should would will i me my we our you your it its this that these those there here please help need want about into out up down not no yes hi hello hey thanks thank just get got also any some".split(
    " ",
  ),
);

export function queryTerms(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  return Array.from(new Set(words)).slice(0, 24);
}

async function fullTextSearch(query: string, limit: number): Promise<RetrievedChunk[]> {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const tsQuery = terms.map((t) => `${t}:*`).join(" | ");

  const vector = sql`(setweight(to_tsvector('english', ${knowledgeDocuments.title} || ' ' || ${knowledgeDocuments.category}), 'A') || setweight(to_tsvector('english', ${knowledgeChunks.content}), 'B'))`;
  const q = sql`to_tsquery('english', ${tsQuery})`;
  const rank = sql<number>`ts_rank_cd(${vector}, ${q}, 32)`;

  const rows = await db
    .select({
      chunkId: knowledgeChunks.id,
      documentId: knowledgeDocuments.id,
      title: knowledgeDocuments.title,
      category: knowledgeDocuments.category,
      source: knowledgeDocuments.source,
      content: knowledgeChunks.content,
      chunkIndex: knowledgeChunks.chunkIndex,
      score: rank,
    })
    .from(knowledgeChunks)
    .innerJoin(knowledgeDocuments, eq(knowledgeChunks.documentId, knowledgeDocuments.id))
    .where(
      and(
        eq(knowledgeChunks.active, true),
        eq(knowledgeDocuments.status, "published"),
        sql`${vector} @@ ${q}`,
      ),
    )
    .orderBy(sql`${rank} desc`)
    .limit(limit);

  return rows.map((r) => ({ ...r, score: Number(r.score) }));
}

async function semanticSearch(query: string, limit: number): Promise<RetrievedChunk[]> {
  const embedder = await getEmbedder().catch(() => null);
  if (!embedder) return [];
  const rows = await db
    .select({
      chunkId: knowledgeChunks.id,
      documentId: knowledgeDocuments.id,
      title: knowledgeDocuments.title,
      category: knowledgeDocuments.category,
      source: knowledgeDocuments.source,
      content: knowledgeChunks.content,
      chunkIndex: knowledgeChunks.chunkIndex,
      embedding: knowledgeChunks.embedding,
    })
    .from(knowledgeChunks)
    .innerJoin(knowledgeDocuments, eq(knowledgeChunks.documentId, knowledgeDocuments.id))
    .where(
      and(
        eq(knowledgeChunks.active, true),
        eq(knowledgeDocuments.status, "published"),
        isNotNull(knowledgeChunks.embedding),
      ),
    );
  if (!rows.length) return [];
  let qv: number[];
  try {
    [qv] = await embedder.embed([query]);
  } catch {
    return [];
  }
  return rows
    .map(({ embedding, ...r }) => ({ ...r, score: cosineSimilarity(qv, embedding ?? []) }))
    .filter((r) => r.score > 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Hybrid retrieval: PostgreSQL full-text search (always) merged with
 * embedding similarity (when an embedding model is configured).
 */
export async function searchKnowledge(
  query: string,
  opts: { topK?: number; minScore?: number } = {},
): Promise<RetrievedChunk[]> {
  const topK = opts.topK ?? appConfig.retrieval.topK;
  const minScore = opts.minScore ?? appConfig.retrieval.minScore;

  const [fts, sem] = await Promise.all([
    fullTextSearch(query, topK * 2).catch((e) => {
      console.error("[retrieval] FTS failed", e);
      return [] as RetrievedChunk[];
    }),
    semanticSearch(query, topK * 2),
  ]);

  const merged = new Map<string, RetrievedChunk>();
  for (const r of fts.filter((r) => r.score >= minScore)) merged.set(r.chunkId, r);
  for (const r of sem) {
    const existing = merged.get(r.chunkId);
    // normalise cosine (0.35–1) into the same rough range and boost overlaps
    const s = (r.score - 0.3) * 1.2;
    if (existing) existing.score = existing.score + s;
    else merged.set(r.chunkId, { ...r, score: s });
  }

  const ranked = Array.from(merged.values()).sort((a, b) => b.score - a.score);
  if (!ranked.length) return [];
  // Drop weak matches relative to the best hit to avoid off-topic context.
  const cutoff = ranked[0].score * 0.55;
  return ranked.filter((r) => r.score >= cutoff).slice(0, topK);
}
