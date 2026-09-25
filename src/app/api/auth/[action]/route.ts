import { getCurrentUser, hasAnyUser, login, logout, register } from "@/server/auth/session";
import { handle, jsonError, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ action: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const { action } = await params;
  if (action !== "me") return jsonError("Not found", 404);
  const user = await getCurrentUser();
  return Response.json({ user, setupRequired: !(await hasAnyUser()) });
});

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const { action } = await params;
  switch (action) {
    case "login": {
      const b = await readJson<{ email?: string; password?: string }>(req);
      const user = await login({ email: b.email ?? "", password: b.password ?? "" });
      return Response.json({ user });
    }
    case "register": {
      const b = await readJson<{ email?: string; password?: string; name?: string }>(req);
      const user = await register({ email: b.email ?? "", password: b.password ?? "", name: b.name ?? "" });
      return Response.json({ user }, { status: 201 });
    }
    case "logout":
      await logout();
      return Response.json({ ok: true });
    default:
      return jsonError("Not found", 404);
  }
});
