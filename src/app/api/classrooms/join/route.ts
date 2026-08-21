import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentParent } from "@/lib/session";
import { childProfiles, classroomLicenses, classroomEnrollments } from "../../../../../drizzle/schema";

// A parent enrolls one of their own children into a teacher's classroom via
// a join code. childProfileId is re-verified against the session-derived
// parent, never trusted from the request body (same IDOR-prevention pattern
// as /api/children and /api/progress).
export async function POST(request: Request) {
  const parent = await getCurrentParent();
  if (!parent) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json()) as { childProfileId?: string; joinCode?: string };
  const childProfileId = body.childProfileId;
  const joinCode = body.joinCode?.trim().toUpperCase();
  if (!childProfileId || !joinCode) {
    return NextResponse.json({ error: "childProfileId and joinCode are required." }, { status: 400 });
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

  const classroom = await db.select().from(classroomLicenses).where(eq(classroomLicenses.joinCode, joinCode)).get();
  if (!classroom) {
    return NextResponse.json({ error: "That join code doesn't match a classroom." }, { status: 404 });
  }

  const existing = await db
    .select()
    .from(classroomEnrollments)
    .where(
      and(
        eq(classroomEnrollments.classroomLicenseId, classroom.id),
        eq(classroomEnrollments.childProfileId, childProfileId),
      ),
    )
    .get();
  if (existing) {
    return NextResponse.json({ ok: true, classroomName: classroom.name });
  }

  await db.insert(classroomEnrollments).values({
    id: crypto.randomUUID(),
    classroomLicenseId: classroom.id,
    childProfileId,
    enrolledAt: new Date(),
  });

  return NextResponse.json({ ok: true, classroomName: classroom.name });
}
