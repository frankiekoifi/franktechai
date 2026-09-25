import { createProvider } from "@/server/ai/providers";
import { getSettings } from "@/server/config/settings";

/**
 * Optional semantic embeddings. When the configured provider has an
 * embedding model, chunks are embedded at index time and queries at search
 * time. Otherwise retrieval uses PostgreSQL full-text search only.
 */
export async function getEmbedder() {
  const settings = await getSettings();
  if (!settings.embeddingModel) return null;
  const provider = createProvider(settings);
  if (!provider?.embed) return null;
  return {
    model: settings.embeddingModel,
    embed: (texts: string[]) => provider.embed!(texts),
  };
}

export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}
