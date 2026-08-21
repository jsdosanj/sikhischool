import { eq, and, inArray, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  classroomLicenses,
  classroomEnrollments,
  childProfiles,
  studentProgress,
  childBadges,
  announcements,
} from "../../drizzle/schema";

// Excludes visually-ambiguous characters (0/O, 1/I/L) since parents type or
// read this code aloud.
const JOIN_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

export async function getClassroomsForTeacher(teacherAccountId: string) {
  const db = await getDb();
  return db.select().from(classroomLicenses).where(eq(classroomLicenses.teacherAccountId, teacherAccountId));
}

// Roster + a lightweight gradebook view: how many lessons/sections each
// enrolled child has passed, and how many badges they've earned.
export async function getRoster(classroomLicenseId: string) {
  const db = await getDb();
  const roster = await db
    .select({ id: childProfiles.id, displayName: childProfiles.displayName, gradeLevel: childProfiles.gradeLevel })
    .from(classroomEnrollments)
    .innerJoin(childProfiles, eq(classroomEnrollments.childProfileId, childProfiles.id))
    .where(eq(classroomEnrollments.classroomLicenseId, classroomLicenseId));

  if (roster.length === 0) return [];

  const childIds = roster.map((r) => r.id);
  const [progressRows, badgeRows] = await Promise.all([
    db
      .select({ childProfileId: studentProgress.childProfileId })
      .from(studentProgress)
      .where(and(inArray(studentProgress.childProfileId, childIds), eq(studentProgress.status, "passed"))),
    db.select({ childProfileId: childBadges.childProfileId }).from(childBadges).where(inArray(childBadges.childProfileId, childIds)),
  ]);

  const lessonsPassedByChild = new Map<string, number>();
  for (const row of progressRows) {
    lessonsPassedByChild.set(row.childProfileId, (lessonsPassedByChild.get(row.childProfileId) ?? 0) + 1);
  }
  const badgesByChild = new Map<string, number>();
  for (const row of badgeRows) {
    badgesByChild.set(row.childProfileId, (badgesByChild.get(row.childProfileId) ?? 0) + 1);
  }

  return roster.map((r) => ({
    ...r,
    lessonsPassed: lessonsPassedByChild.get(r.id) ?? 0,
    badgesEarned: badgesByChild.get(r.id) ?? 0,
  }));
}

export async function getClassroomForTeacher(classroomLicenseId: string, teacherAccountId: string) {
  const db = await getDb();
  return (
    (await db
      .select()
      .from(classroomLicenses)
      .where(and(eq(classroomLicenses.id, classroomLicenseId), eq(classroomLicenses.teacherAccountId, teacherAccountId)))
      .get()) ?? null
  );
}

export async function getAnnouncementsForClassroom(classroomLicenseId: string) {
  const db = await getDb();
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.classroomLicenseId, classroomLicenseId))
    .orderBy(desc(announcements.createdAt));
}

// All announcements from every classroom a child is enrolled in — the
// parent-facing view.
export async function getAnnouncementsForChild(childProfileId: string) {
  const db = await getDb();
  return db
    .select({
      id: announcements.id,
      body: announcements.body,
      createdAt: announcements.createdAt,
      classroomName: classroomLicenses.name,
    })
    .from(classroomEnrollments)
    .innerJoin(announcements, eq(announcements.classroomLicenseId, classroomEnrollments.classroomLicenseId))
    .innerJoin(classroomLicenses, eq(classroomLicenses.id, classroomEnrollments.classroomLicenseId))
    .where(eq(classroomEnrollments.childProfileId, childProfileId))
    .orderBy(desc(announcements.createdAt));
}
