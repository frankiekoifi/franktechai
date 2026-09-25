import { db } from "@/db";
import { conversations, sessions, users, type User } from "@/db/schema";
import { appConfig } from "@/server/config";
import { and, eq, gt, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./password";

export type PublicUser = Pick<User, "id" | "email" | "name" | "role">;

const toPublic = (u: User): PublicUser => ({ id: u.id, email: u.email, name: u.name, role: u.role });

async function isSecureRequest() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return proto === "https";
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  const token = jar.get(appConfig.sessionCookie)?.value;
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ? toPublic(rows[0].user) : null;
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Authentication required", 401);
  if (user.role !== "admin") throw new AuthError("Administrator access required", 403);
  return user;
}

async function startSession(user: User) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + appConfig.sessionDays * 86400_000);
  await db.insert(sessions).values({ id: token, userId: user.id, expiresAt });
  const jar = await cookies();
  jar.set(appConfig.sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await isSecureRequest(),
    path: "/",
    expires: expiresAt,
  });
  // Carry this browser's guest conversations over to the account.
  const guest = jar.get(appConfig.guestCookie)?.value;
  if (guest) {
    await db
      .update(conversations)
      .set({ ownerKey: `user:${user.id}` })
      .where(eq(conversations.ownerKey, `guest:${guest}`));
  }
}

export async function register(input: { email: string; name: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError("Enter a valid email");
  if (input.password.length < 8) throw new AuthError("Password must be at least 8 characters");
  const name = input.name.trim() || email.split("@")[0];

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) throw new AuthError("An account with this email already exists", 409);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
  // The first account (or ADMIN_EMAIL) becomes the administrator.
  const role = count === 0 || email === appConfig.adminEmail ? "admin" : "user";

  const [user] = await db
    .insert(users)
    .values({ email, name, role, passwordHash: await hashPassword(input.password) })
    .returning();
  await startSession(user);
  return toPublic(user);
}

export async function login(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthError("Invalid email or password", 401);
  }
  await startSession(user);
  return toPublic(user);
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(appConfig.sessionCookie)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  jar.delete(appConfig.sessionCookie);
}

export async function hasAnyUser() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
  return count > 0;
}

/**
 * Resolves the web caller's channel-agnostic owner key.
 * Logged-in → "user:<id>", otherwise a persistent guest cookie → "guest:<uuid>".
 */
export async function resolveWebOwner(): Promise<{ ownerKey: string; user: PublicUser | null }> {
  const user = await getCurrentUser();
  if (user) return { ownerKey: `user:${user.id}`, user };
  const jar = await cookies();
  let guest = jar.get(appConfig.guestCookie)?.value;
  if (!guest || !/^[0-9a-f-]{36}$/.test(guest)) {
    guest = randomUUID();
    jar.set(appConfig.guestCookie, guest, {
      httpOnly: true,
      sameSite: "lax",
      secure: await isSecureRequest(),
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  }
  return { ownerKey: `guest:${guest}`, user: null };
}
