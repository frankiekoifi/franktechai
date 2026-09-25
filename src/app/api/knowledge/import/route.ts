import { requireAdmin } from "@/server/auth/session";
import { appConfig } from "@/server/config";
import { handle, jsonError } from "@/server/http";
import { detectKind, extractText, fetchUrlText } from "@/server/knowledge/ingestion/extract";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Extracts text from an uploaded file (PDF/DOCX/TXT/MD/HTML) or a web URL and
 * returns a draft for the admin to review before saving to the knowledge base.
 */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const type = req.headers.get("content-type") || "";

  if (type.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") return jsonError("No file provided");
    if (file.size > appConfig.maxUploadBytes) return jsonError("File too large (max 15 MB)");
    const kind = detectKind(file.type, file.name);
    if (kind === "image" || kind === "unknown") {
      return jsonError("Supported knowledge files: PDF, DOCX, TXT, Markdown, HTML");
    }
    const text = await extractText(Buffer.from(await file.arrayBuffer()), file.type, file.name);
    if (!text.trim()) return jsonError("No text could be extracted from this file");
    return Response.json({
      draft: {
        title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
        content: text,
        source: `Uploaded file: ${file.name}`,
        sourceType: "file",
      },
    });
  }

  const body = (await req.json().catch(() => ({}))) as { url?: string };
  if (!body.url) return jsonError("Provide a file or a URL");
  const { title, text } = await fetchUrlText(body.url);
  if (!text.trim()) return jsonError("No readable text found at that URL");
  return Response.json({
    draft: { title, content: text.slice(0, 200_000), source: body.url, sourceType: "url" },
  });
});
