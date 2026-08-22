import { NextResponse } from "next/server";
import { getOrCreateCurrentTeacher } from "@/lib/session";
import { getClassroomForTeacher } from "@/lib/classrooms";
import { isChildInTeachersClassroom, setGradeOverride } from "@/lib/grade-overrides";

// Sets (or clears, with overrideScore: null) a teacher's manual override on one
// of their students' quiz-graded lesson scores. studentId travels in the body,
// not a second dynamic URL segment — a nested [id]/students/[studentId] route
// 404s under this app's OpenNext/Cloudflare deployment (single-dynamic-segment
// routes work fine; verified directly against production). Double IDOR check:
// the classroom must belong to the signed-in teacher AND the student must
// actually be enrolled in it — neither is trusted from the request alone, same
// pattern as /api/teacher/classrooms/[id]/announcements.
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

  const body = (await request.json()) as { studentId?: string; nodeId?: string; overrideScore?: number | null };
  const { studentId, nodeId } = body;
  if (!studentId || !nodeId) {
    return NextResponse.json({ error: "studentId and nodeId are required." }, { status: 400 });
  }
  if (!(await isChildInTeachersClassroom(studentId, teacher.id))) {
    return NextResponse.json({ error: "That student isn't enrolled in one of your classrooms." }, { status: 403 });
  }

  const overrideScore = body.overrideScore ?? null;
  if (overrideScore !== null && (typeof overrideScore !== "number" || overrideScore < 0 || overrideScore > 100)) {
    return NextResponse.json({ error: "overrideScore must be a number between 0 and 100, or null to clear." }, { status: 400 });
  }

  await setGradeOverride(studentId, nodeId, overrideScore, teacher.id);
  return NextResponse.json({ ok: true });
}
