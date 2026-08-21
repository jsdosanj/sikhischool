import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { getAuthOptions } from "./auth";
import { getDb } from "./db";
import { parentAccounts, childProfiles, teacherAccounts } from "../../drizzle/schema";

export async function getCurrentParent() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email) return null;

  const db = await getDb();
  const parent = await db
    .select()
    .from(parentAccounts)
    .where(eq(parentAccounts.email, session.user.email))
    .get();
  return parent ?? null;
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
