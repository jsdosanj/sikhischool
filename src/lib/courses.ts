import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { courses } from "../../drizzle/schema";
import { GRADE_ORDER } from "./grades";

export const GRADE_BAND_ORDER = ["K-2", "3-5", "6-8", "9-12"] as const;

export const SUBJECT_LABELS: Record<string, string> = {
  math: "Math",
  ela: "English Language Arts",
  science: "Science",
  "social-studies": "Social Studies",
  punjabi: "Punjabi",
  sikhi: "Sikhi",
  "life-skills": "Life Skills",
  "digital-literacy": "Digital Literacy",
};

function compareGradeLevel(a: string, b: string): number {
  const ia = GRADE_ORDER.indexOf(a);
  const ib = GRADE_ORDER.indexOf(b);
  if (ia === -1 || ib === -1) return a.localeCompare(b); // band-level rows (e.g. "K-2")
  return ia - ib;
}

export async function getAllCourses() {
  const db = await getDb();
  const rows = await db.select().from(courses);
  return rows.sort((a, b) => compareGradeLevel(a.gradeLevel, b.gradeLevel));
}

export async function getCourse(id: string) {
  const db = await getDb();
  return (await db.select().from(courses).where(eq(courses.id, id)).get()) ?? null;
}
