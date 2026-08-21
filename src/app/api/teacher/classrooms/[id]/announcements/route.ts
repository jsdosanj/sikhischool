import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getOrCreateCurrentTeacher } from "@/lib/session";
import { getClassroomForTeacher } from "@/lib/classrooms";
import { announcements } from "../../../../../../../drizzle/schema";

// Posts an announcement to one of the signed-in teacher's own classrooms.
// classroomLicenseId ownership is re-verified against the session-derived
// teacher, never trusted from the URL alone (same IDOR-prevention pattern
// used by /api/progress and /api/classrooms/join).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const teacher = await getOrCreateCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const { id: classroomLicenseId } = await params;
  const classroom = await getClassroomForTeacher(classroomLicenseId, teacher.id);
  if (!classroom) {
    return NextResponse.json({ error: "That classroom doesn't belong to your account." }, { status: 403 });
  }

  const body = (await request.json()) as { body?: string };
  const text = body.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "Announcement text is required." }, { status: 400 });
  }

  const db = await getDb();
  await db.insert(announcements).values({
    id: crypto.randomUUID(),
    classroomLicenseId,
    authorTeacherAccountId: teacher.id,
    body: text,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
