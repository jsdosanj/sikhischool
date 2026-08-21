import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentParent } from "@/lib/session";
import { childProfiles, studentProgress, lessons } from "../../../../drizzle/schema";

// Marks a lesson complete for one of the signed-in parent's children.
// childProfileId is never trusted as-is: it's re-verified against
// parentAccountId derived from the session, not the request body, so one
// parent can never write progress onto another family's child (IDOR).
export async function POST(request: Request) {
  const parent = await getCurrentParent();
  if (!parent) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json()) as { childProfileId?: string; lessonId?: string };
  const { childProfileId, lessonId } = body;
  if (!childProfileId || !lessonId) {
    return NextResponse.json({ error: "childProfileId and lessonId are required." }, { status: 400 });
  }

  const db = await getDb();

  const child = await db
    .select()
    .from(childProfiles)
    .where(and(eq(childProfiles.id, childProfileId), eq(childProfiles.parentAccountId, parent.id)))
    .get();
  if (!child) {
    return NextResponse.json({ error: "That child doesn't belong to your account." }, { status: 403 });
  }

  const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const existing = await db
    .select()
    .from(studentProgress)
    .where(and(eq(studentProgress.childProfileId, childProfileId), eq(studentProgress.nodeId, lessonId)))
    .get();

  const now = new Date();
  if (existing) {
    await db
      .update(studentProgress)
      .set({ status: "passed", masteryPoints: lesson.masteryPointsFamiliar, lastPracticedAt: now })
      .where(eq(studentProgress.id, existing.id));
  } else {
    await db.insert(studentProgress).values({
      id: crypto.randomUUID(),
      childProfileId,
      nodeId: lessonId,
      status: "passed",
      masteryPoints: lesson.masteryPointsFamiliar,
      lastPracticedAt: now,
    });
  }

  return NextResponse.json({ ok: true });
}
