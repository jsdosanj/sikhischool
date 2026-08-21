import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { getAuthOptions } from "./auth";
import { getDb } from "./db";
import { parentAccounts, childProfiles } from "../../drizzle/schema";

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
