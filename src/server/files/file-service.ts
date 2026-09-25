import { db } from "@/db";
import { files } from "@/db/schema";
import { appConfig } from "@/server/config";
import { detectKind, ExtractionError, extractText, isImage } from "@/server/knowledge/ingestion/extract";
import { and, eq, inArray } from "drizzle-orm";

export class UploadError extends Error {}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Stores a user-uploaded file and extracts its text (or keeps image data). */
export async function saveUpload(ownerKey: string, file: File) {
  if (file.size > appConfig.maxUploadBytes) {
    throw new UploadError(`File too large (max ${appConfig.maxUploadBytes / 1024 / 1024} MB)`);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const kind = detectKind(mimeType, file.name);
  let extractedText: string | null = null;
  let dataUrl: string | null = null;

  if (kind === "image" || isImage(mimeType, file.name)) {
    if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Images must be under 5 MB");
    const imgType = mimeType.startsWith("image/") ? mimeType : "image/png";
    dataUrl = `data:${imgType};base64,${buffer.toString("base64")}`;
  } else if (kind === "unknown") {
    throw new UploadError("Unsupported file type. Use PDF, DOCX, TXT, Markdown or images.");
  } else {
    try {
      extractedText = await extractText(buffer, mimeType, file.name);
    } catch (e) {
      if (e instanceof ExtractionError) throw new UploadError(e.message);
      console.error("[files] extraction failed", e);
      throw new UploadError("Could not read this file.");
    }
  }

  const [row] = await db
    .insert(files)
    .values({ ownerKey, name: file.name, mimeType, size: file.size, extractedText, dataUrl })
    .returning();

  return {
    id: row.id,
    name: row.name,
    mimeType: row.mimeType,
    size: row.size,
    hasText: Boolean(extractedText),
    isImage: Boolean(dataUrl),
    chars: extractedText?.length ?? 0,
  };
}

export async function getOwnedFiles(ownerKey: string, ids: string[]) {
  const valid = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!valid.length) return [];
  return db
    .select()
    .from(files)
    .where(and(eq(files.ownerKey, ownerKey), inArray(files.id, valid)));
}
