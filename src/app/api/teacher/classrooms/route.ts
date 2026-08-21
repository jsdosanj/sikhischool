import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getOrCreateCurrentTeacher } from "@/lib/session";
import { generateJoinCode } from "@/lib/classrooms";
import { classroomLicenses } from "../../../../../drizzle/schema";

export async function POST(request: Request) {
  const teacher = await getOrCreateCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "A classroom name is required." }, { status: 400 });
  }

  const db = await getDb();

  // Astronomically unlikely to collide (32^6), but the join code is unique —
  // retry on the rare collision rather than 500ing the teacher's request.
  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode = generateJoinCode();
    const existing = await db.select().from(classroomLicenses).where(eq(classroomLicenses.joinCode, joinCode)).get();
    if (existing) continue;

    await db.insert(classroomLicenses).values({
      id: crypto.randomUUID(),
      teacherAccountId: teacher.id,
      name,
      joinCode,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, joinCode });
  }

  return NextResponse.json({ error: "Couldn't generate a unique join code — try again." }, { status: 500 });
}
