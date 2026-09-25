import { resolveWebOwner } from "@/server/auth/session";
import { saveUpload } from "@/server/files/file-service";
import { handle, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** Chat attachments: extracts text from PDF/DOCX/TXT/MD, keeps images for vision models. */
export const POST = handle(async (req: Request) => {
  const { ownerKey } = await resolveWebOwner();
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return jsonError("No file provided");
  const saved = await saveUpload(ownerKey, file);
  return Response.json({ file: saved }, { status: 201 });
});
