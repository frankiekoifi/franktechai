import { AgentInputError } from "@/server/ai/agent";
import { AuthError } from "@/server/auth/session";
import { UploadError } from "@/server/files/file-service";
import { ExtractionError } from "@/server/knowledge/ingestion/extract";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Wraps a route handler with consistent error → JSON mapping. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof AuthError || err instanceof AgentInputError) return jsonError(err.message, err.status);
      if (err instanceof UploadError || err instanceof ExtractionError) return jsonError(err.message, 400);
      console.error("[api] unhandled error", err);
      return jsonError("Something went wrong. Please try again.", 500);
    }
  };
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new AgentInputError("Invalid JSON body");
  }
}
