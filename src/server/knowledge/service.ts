import { db } from "@/db";
import { knowledgeChunks, knowledgeDocuments, settings } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { indexDocument } from "./ingestion";
import { SEED_DOCUMENTS } from "./seed";

export type KnowledgeInput = {
  title: string;
  category?: string;
  content: string;
  source?: string | null;
  sourceType?: string;
  status?: string;
};

const STATUSES = new Set(["published", "draft", "archived"]);

export function validateKnowledgeInput(body: unknown, partial = false): KnowledgeInput | string {
  if (!body || typeof body !== "object") return "Invalid body";
  const b = body as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const content = typeof b.content === "string" ? b.content.trim() : "";
  if (!partial || b.title !== undefined) if (!title) return "Title is required";
  if (!partial || b.content !== undefined) if (!content) return "Content is required";
  const status = typeof b.status === "string" ? b.status : "published";
  if (!STATUSES.has(status)) return "Invalid status";
  return {
    title,
    content,
    category: typeof b.category === "string" && b.category.trim() ? b.category.trim() : "General",
    source: typeof b.source === "string" && b.source.trim() ? b.source.trim() : null,
    sourceType: typeof b.sourceType === "string" ? b.sourceType : "manual",
    status,
  };
}

export async function listDocuments() {
  await ensureSeeded();
  return db
    .select({
      id: knowledgeDocuments.id,
      title: knowledgeDocuments.title,
      category: knowledgeDocuments.category,
      source: knowledgeDocuments.source,
      sourceType: knowledgeDocuments.sourceType,
      status: knowledgeDocuments.status,
      indexedAt: knowledgeDocuments.indexedAt,
      createdAt: knowledgeDocuments.createdAt,
      updatedAt: knowledgeDocuments.updatedAt,
      length: sql<number>`length(${knowledgeDocuments.content})`,
      chunkCount: sql<number>`(select count(*)::int from ${knowledgeChunks} where ${knowledgeChunks.documentId} = ${knowledgeDocuments.id})`,
    })
    .from(knowledgeDocuments)
    .orderBy(desc(knowledgeDocuments.updatedAt));
}

export async function getDocument(id: string) {
  const [doc] = await db.select().from(knowledgeDocuments).where(eq(knowledgeDocuments.id, id)).limit(1);
  return doc ?? null;
}

export async function createDocument(input: KnowledgeInput) {
  const [doc] = await db
    .insert(knowledgeDocuments)
    .values({
      title: input.title,
      category: input.category ?? "General",
      content: input.content,
      source: input.source ?? null,
      sourceType: input.sourceType ?? "manual",
      status: input.status ?? "published",
    })
    .returning();
  await indexDocument(doc.id);
  return (await getDocument(doc.id))!;
}

export async function updateDocument(id: string, input: KnowledgeInput) {
  const [doc] = await db
    .update(knowledgeDocuments)
    .set({
      title: input.title,
      category: input.category ?? "General",
      content: input.content,
      source: input.source ?? null,
      status: input.status ?? "published",
      updatedAt: new Date(),
    })
    .where(eq(knowledgeDocuments.id, id))
    .returning();
  if (!doc) return null;
  await indexDocument(doc.id);
  return getDocument(doc.id);
}

export async function deleteDocument(id: string) {
  const res = await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.id, id)).returning();
  return res.length > 0;
}

export async function knowledgeStats() {
  const [row] = await db
    .select({
      documents: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${knowledgeDocuments.status} = 'published')::int`,
    })
    .from(knowledgeDocuments);
  return row;
}

let seeding: Promise<void> | null = null;

/** Inserts the starter knowledge base once (tracked in settings). */
export async function ensureSeeded() {
  if (!seeding) {
    seeding = (async () => {
      const [flag] = await db.select().from(settings).where(eq(settings.key, "kb_seeded_v1")).limit(1);
      if (flag) return;
      await db
        .insert(settings)
        .values({ key: "kb_seeded_v1", value: { at: new Date().toISOString() } })
        .onConflictDoNothing();
      const [existing] = await db.select({ c: sql<number>`count(*)::int` }).from(knowledgeDocuments);
      if (existing.c > 0) return;
      for (const d of SEED_DOCUMENTS) {
        await createDocument({ ...d, sourceType: "seed" });
      }
    })().catch((e) => {
      seeding = null;
      console.error("[knowledge] seeding failed", e);
    });
  }
  return seeding;
}
