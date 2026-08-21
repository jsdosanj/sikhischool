import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { units, lessons, teacherGuides, worksheets, studentProgress } from "../../drizzle/schema";

export async function getUnitsForCourse(courseId: string) {
  const db = await getDb();
  return db.select().from(units).where(eq(units.courseId, courseId)).orderBy(units.order);
}

export async function getLessonsForUnit(unitId: string) {
  const db = await getDb();
  return db.select().from(lessons).where(eq(lessons.unitId, unitId)).orderBy(lessons.order);
}

export async function getLesson(lessonId: string) {
  const db = await getDb();
  const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
  if (!lesson) return null;
  const [guide, worksheet] = await Promise.all([
    db.select().from(teacherGuides).where(eq(teacherGuides.lessonId, lessonId)).get(),
    db.select().from(worksheets).where(eq(worksheets.lessonId, lessonId)).get(),
  ]);
  return { lesson, guide: guide ?? null, worksheet: worksheet ?? null };
}

export async function getUnit(unitId: string) {
  const db = await getDb();
  return (await db.select().from(units).where(eq(units.id, unitId)).get()) ?? null;
}

// Which of these children have already completed this lesson — used to show
// a "Done" state instead of letting the same completion be marked twice.
export async function getChildrenWithProgress(childIds: string[], nodeId: string) {
  if (childIds.length === 0) return [];
  const db = await getDb();
  const rows = await db
    .select()
    .from(studentProgress)
    .where(and(inArray(studentProgress.childProfileId, childIds), eq(studentProgress.nodeId, nodeId)));
  return rows.filter((r) => r.status === "passed").map((r) => r.childProfileId);
}
