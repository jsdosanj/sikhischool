import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { pacingGuides } from "../../drizzle/schema";

export async function getPacingGuide(courseId: string) {
  const db = await getDb();
  return (await db.select().from(pacingGuides).where(eq(pacingGuides.courseId, courseId)).get()) ?? null;
}
