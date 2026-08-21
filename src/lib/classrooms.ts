import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { classroomLicenses, classroomEnrollments, childProfiles } from "../../drizzle/schema";

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

export async function getRoster(classroomLicenseId: string) {
  const db = await getDb();
  return db
    .select({ id: childProfiles.id, displayName: childProfiles.displayName, gradeLevel: childProfiles.gradeLevel })
    .from(classroomEnrollments)
    .innerJoin(childProfiles, eq(classroomEnrollments.childProfileId, childProfiles.id))
    .where(eq(classroomEnrollments.classroomLicenseId, classroomLicenseId));
}
