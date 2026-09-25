/**
 * Text extraction for PDF, DOCX, TXT, Markdown, HTML and web pages.
 * Shared by knowledge ingestion and chat file attachments.
 */
export class ExtractionError extends Error {}

const TEXT_EXT = /\.(txt|md|markdown|csv|json|log|ini|cfg|xml|yaml|yml)$/i;

export function isImage(mimeType: string, name: string) {
  return mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(name);
}

export function detectKind(mimeType: string, name: string) {
  if (mimeType === "application/pdf" || /\.pdf$/i.test(name)) return "pdf" as const;
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.docx$/i.test(name)
  )
    return "docx" as const;
  if (mimeType === "text/html" || /\.html?$/i.test(name)) return "html" as const;
  if (isImage(mimeType, name)) return "image" as const;
  if (mimeType.startsWith("text/") || TEXT_EXT.test(name)) return "text" as const;
  return "unknown" as const;
}

export function htmlToText(html: string): { title: string | null; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const body = html
    .replace(/<(script|style|noscript|svg|nav|footer|header|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<h([1-6])[^>]*>/gi, (_m, l) => "\n" + "#".repeat(Number(l)) + " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
  return { title: titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : null, text: body };
}

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  name: string,
): Promise<string> {
  const kind = detectKind(mimeType, name);
  switch (kind) {
    case "pdf": {
      const { extractText: pdfExtract, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await pdfExtract(pdf, { mergePages: true });
      const out = (Array.isArray(text) ? text.join("\n\n") : text).trim();
      if (!out) throw new ExtractionError("No selectable text found in PDF (it may be a scanned image).");
      return out;
    }
    case "docx": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }
    case "html":
      return htmlToText(buffer.toString("utf8")).text;
    case "text":
      return buffer.toString("utf8").trim();
    case "image":
      throw new ExtractionError("Images have no extractable text.");
    default:
      throw new ExtractionError(`Unsupported file type: ${mimeType || name}`);
  }
}

export async function fetchUrlText(url: string): Promise<{ title: string; text: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ExtractionError("Invalid URL");
  }
  if (!/^https?:$/.test(parsed.protocol)) throw new ExtractionError("Only http(s) URLs are supported");
  const res = await fetch(parsed, {
    headers: { "User-Agent": "FrankTechSpaceAI/1.0 (+knowledge-import)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new ExtractionError(`Could not fetch URL (HTTP ${res.status})`);
  const type = res.headers.get("content-type") || "";
  const buf = Buffer.from(await res.arrayBuffer());
  if (type.includes("pdf")) {
    return { title: parsed.pathname.split("/").pop() || parsed.hostname, text: await extractText(buf, "application/pdf", "x.pdf") };
  }
  if (type.includes("html")) {
    const { title, text } = htmlToText(buf.toString("utf8"));
    return { title: title || parsed.hostname, text };
  }
  return { title: parsed.hostname + parsed.pathname, text: buf.toString("utf8") };
}
