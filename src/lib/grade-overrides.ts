import { eq, and, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "./db";
import { studentProgress, lessons, gradeOverrides, classroomEnrollments, classroomLicenses } from "../../drizzle/schema";

export interface QuizProgressRow {
  childProfileId: string;
  nodeId: string;
  lessonTitle: string;
  masteryPoints: number;
  overrideScore: number | null;
}

// For each of the given children, their progress on quiz-bearing lessons
// (masteryQuizId IS NOT NULL) — the only nodes with an auto-computed score
// meaningful to override — plus any existing teacher override. Effective score
// for display is override ?? masteryPoints (ported sikhiuni pattern).
export async function getQuizProgressForChildren(childIds: string[]): Promise<QuizProgressRow[]> {
  if (childIds.length === 0) return [];
  const db = await getDb();
  const progressRows = await db
    .select({
      childProfileId: studentProgress.childProfileId,
      nodeId: studentProgress.nodeId,
      masteryPoints: studentProgress.masteryPoints,
      lessonTitle: lessons.title,
    })
    .from(studentProgress)
    .innerJoin(lessons, eq(lessons.id, studentProgress.nodeId))
    .where(and(inArray(studentProgress.childProfileId, childIds), isNotNull(lessons.masteryQuizId)));

  if (progressRows.length === 0) return [];

  const overrides = await db.select().from(gradeOverrides).where(inArray(gradeOverrides.childProfileId, childIds));
  const overrideByKey = new Map(overrides.map((o) => [`${o.childProfileId}:${o.nodeId}`, o.overrideScore]));

  return progressRows.map((r) => ({
    ...r,
    overrideScore: overrideByKey.get(`${r.childProfileId}:${r.nodeId}`) ?? null,
  }));
}

// IDOR-safe check: is this child actually enrolled in a classroom the given
// teacher owns? Never trust childProfileId alone — same pattern as
// /api/classrooms/join and /api/progress.
export async function isChildInTeachersClassroom(childProfileId: string, teacherAccountId: string): Promise<boolean> {
  const db = await getDb();
  const row = await db
    .select({ id: classroomEnrollments.id })
    .from(classroomEnrollments)
    .innerJoin(classroomLicenses, eq(classroomLicenses.id, classroomEnrollments.classroomLicenseId))
    .where(
      and(
        eq(classroomEnrollments.childProfileId, childProfileId),
        eq(classroomLicenses.teacherAccountId, teacherAccountId),
      ),
    )
    .get();
  return !!row;
}

export async function setGradeOverride(
  childProfileId: string,
  nodeId: string,
  overrideScore: number | null,
  teacherAccountId: string,
) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(gradeOverrides)
    .where(and(eq(gradeOverrides.childProfileId, childProfileId), eq(gradeOverrides.nodeId, nodeId)))
    .get();
  const now = new Date();
  if (existing) {
    await db
      .update(gradeOverrides)
      .set({ overrideScore, setByTeacherAccountId: teacherAccountId, setAt: now })
      .where(eq(gradeOverrides.id, existing.id));
  } else {
    await db.insert(gradeOverrides).values({
      id: crypto.randomUUID(),
      childProfileId,
      nodeId,
      overrideScore,
      setByTeacherAccountId: teacherAccountId,
      setAt: now,
    });
  }
}
