import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getAuthOptions } from "./auth";
import { getDb } from "./db";
import { bearerToken, verifyClerkToken, emailFor } from "./clerk";
import { parentAccounts, childProfiles, teacherAccounts, users } from "../../drizzle/schema";

// The verified email from an `Authorization: Bearer <Clerk token>` header (the unified Sikhi login), or null.
async function clerkBearerEmail(): Promise<string | null> {
  try {
    const token = bearerToken((await headers()).get("authorization"));
    if (!token) return null;
    const claims = await verifyClerkToken(token, process.env as Record<string, string | undefined>);
    return claims ? await emailFor(claims, process.env as Record<string, string | undefined>) : null;
  } catch {
    return null;
  }
}

export async function getCurrentParent() {
  const session = await getServerSession(await getAuthOptions());
  const sessionEmail = session?.user?.email ?? null;
  // Web sessions (magic link) win; otherwise accept the unified Sikhi login sent as a bearer token.
  const email = sessionEmail ?? (await clerkBearerEmail());
  if (!email) return null;

  const db = await getDb();
  const parent = await db.select().from(parentAccounts).where(eq(parentAccounts.email, email)).get();
  if (parent || sessionEmail) return parent ?? null;

  // First sign-in through the unified login: provision the same records the magic-link flow creates.
  const now = new Date();
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (!existingUser) await db.insert(users).values({ id: crypto.randomUUID(), email, emailVerified: now });
  const created = { id: crypto.randomUUID(), email, name: null, createdAt: now };
  await db.insert(parentAccounts).values(created);
  return created;
}

export async function getChildren(parentAccountId: string) {
  const db = await getDb();
  return db.select().from(childProfiles).where(eq(childProfiles.parentAccountId, parentAccountId));
}

// Teacher accounts are lazily provisioned on first visit to /teacher/dashboard,
// not via NextAuth's events.createUser (which fires once per new email
// identity and has no way to know which role — parent or teacher — the person
// intended; see the comment in login/LoginForm.tsx). A person can legitimately
// hold both a ParentAccount and a TeacherAccount under the same email.
export async function getOrCreateCurrentTeacher() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email) return null;

  const db = await getDb();
  const existing = await db
    .select()
    .from(teacherAccounts)
    .where(eq(teacherAccounts.email, session.user.email))
    .get();
  if (existing) return existing;

  const created = {
    id: crypto.randomUUID(),
    email: session.user.email,
    name: session.user.name ?? null,
    createdAt: new Date(),
  };
  await db.insert(teacherAccounts).values(created);
  return created;
}
