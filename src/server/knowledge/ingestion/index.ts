import { db } from "@/db";
import { knowledgeChunks, knowledgeDocuments } from "@/db/schema";
import { appConfig } from "@/server/config";
import { eq } from "drizzle-orm";
import { getEmbedder } from "../embeddings";
import { chunkText } from "./chunker";

/** (Re)builds the retrieval chunks for one knowledge document. */
export async function indexDocument(documentId: string) {
  const [doc] = await db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.id, documentId))
    .limit(1);
  if (!doc) return { chunks: 0, embedded: false };

  const pieces = chunkText(
    doc.content,
    appConfig.retrieval.chunkSize,
    appConfig.retrieval.chunkOverlap,
  );

  let embeddings: (number[] | null)[] = pieces.map(() => null);
  let embedded = false;
  try {
    const embedder = await getEmbedder();
    if (embedder && pieces.length) {
      const vectors = await embedder.embed(pieces.map((p) => `${doc.title}\n${p}`));
      embeddings = vectors;
      embedded = true;
    }
  } catch (err) {
    console.warn("[knowledge] embedding failed, falling back to full-text only:", err);
  }

  await db.transaction(async (tx) => {
    await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, doc.id));
    if (pieces.length) {
      await tx.insert(knowledgeChunks).values(
        pieces.map((content, i) => ({
          documentId: doc.id,
          chunkIndex: i,
          content,
          embedding: embeddings[i],
          active: doc.status === "published",
        })),
      );
    }
    await tx
      .update(knowledgeDocuments)
      .set({ indexedAt: new Date() })
      .where(eq(knowledgeDocuments.id, doc.id));
  });

  return { chunks: pieces.length, embedded };
}

export async function reindexAll() {
  const docs = await db.select({ id: knowledgeDocuments.id }).from(knowledgeDocuments);
  let chunks = 0;
  let embedded = 0;
  for (const d of docs) {
    const r = await indexDocument(d.id);
    chunks += r.chunks;
    if (r.embedded) embedded++;
  }
  return { documents: docs.length, chunks, embeddedDocuments: embedded };
}
