/**
 * FrankTechSpace AI — Knowledge base seeder
 *
 * Usage:
 *   npx tsx scripts/seed-knowledge.ts             # add articles (skips existing titles)
 *   npx tsx scripts/seed-knowledge.ts --wipe      # delete all knowledge first, then insert
 *
 * Reads DATABASE_URL from .env (via dotenv).
 * Chunks content using the same chunker as the live app (1200 chars, 150 overlap).
 */

import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { db } from "../src/db";
import { knowledgeChunks, knowledgeDocuments, settings } from "../src/db/schema";
import { chunkText } from "../src/server/knowledge/ingestion/chunker";
import { PROCEDURE_ARTICLES } from "./seed-data/articles-procedures";
import { REFERENCE_ARTICLES } from "./seed-data/articles-reference";
import { EXISTING_ARTICLES } from "./seed-data/articles-existing";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;
const SOURCE_TAG = "FrankTechSpace seed v2";

const ALL_ARTICLES = [...PROCEDURE_ARTICLES, ...REFERENCE_ARTICLES, ...EXISTING_ARTICLES];

async function main() {
  const wipe = process.argv.includes("--wipe");

  console.log("─".repeat(60));
  console.log("FrankTechSpace AI — knowledge seeder");
  console.log("─".repeat(60));

  if (!process.env.DATABASE_URL) {
    console.error("✗ DATABASE_URL is not set. Check your .env file.");
    process.exit(1);
  }
  console.log(`Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@")}`);
  console.log(`Articles to seed: ${ALL_ARTICLES.length}`);
  console.log(`Mode: ${wipe ? "WIPE + reseed" : "add (skip existing titles)"}`);
  console.log("─".repeat(60));

  if (wipe) {
    console.log("Wiping existing knowledge...");
    await db.delete(knowledgeChunks);
    await db.delete(knowledgeDocuments);
    await db.delete(settings).where(eq(settings.key, "kb_seeded_v1"));
    console.log("  ✓ wiped");
  }

  // Skip titles that already exist (unless wiping — then everything is fresh)
  const existingTitles = new Set<string>();
  if (!wipe) {
    const rows = await db.select({ title: knowledgeDocuments.title }).from(knowledgeDocuments);
    for (const r of rows) existingTitles.add(r.title);
  }

  let inserted = 0;
  let skipped = 0;
  let totalChunks = 0;

  for (const article of ALL_ARTICLES) {
    if (existingTitles.has(article.title)) {
      console.log(`  · skip (exists): ${article.title}`);
      skipped++;
      continue;
    }

    const [doc] = await db
      .insert(knowledgeDocuments)
      .values({
        title: article.title,
        category: article.category,
        content: article.content,
        source: SOURCE_TAG,
        sourceType: "seed",
        status: "published",
      })
      .returning({ id: knowledgeDocuments.id });

    const pieces = chunkText(article.content, CHUNK_SIZE, CHUNK_OVERLAP);
    if (pieces.length) {
      await db.insert(knowledgeChunks).values(
        pieces.map((content, i) => ({
          documentId: doc.id,
          chunkIndex: i,
          content,
          embedding: null,
          active: true,
        })),
      );
    }

    console.log(`  ✓ ${article.title}  (${pieces.length} chunks)`);
    inserted++;
    totalChunks += pieces.length;
  }

  // Mark seeding flag so the app's own auto-seeder doesn't add the old starter docs
  await db
    .insert(settings)
    .values({ key: "kb_seeded_v1", value: { at: new Date().toISOString(), by: "seed-script" } })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: { at: new Date().toISOString(), by: "seed-script" } },
    });

  console.log("─".repeat(60));
  console.log(`Done. Inserted ${inserted} documents (${totalChunks} chunks), skipped ${skipped}.`);
  console.log("─".repeat(60));
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Seeding failed:", err);
  process.exit(1);
});