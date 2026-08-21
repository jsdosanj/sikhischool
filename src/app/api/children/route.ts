import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentParent } from "@/lib/session";
import { childProfiles } from "../../../../drizzle/schema";
import { GRADE_ORDER } from "@/lib/grades";

// COPPA: only ever accepts displayName + gradeLevel from the request body —
// no email, no DOB, no other PII. See CLAUDE.md.
export async function POST(request: Request) {
  const parent = await getCurrentParent();
  if (!parent) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json()) as { displayName?: string; gradeLevel?: string };
  const displayName = body.displayName?.trim();
  const gradeLevel = body.gradeLevel?.trim();

  if (!displayName || !gradeLevel || !GRADE_ORDER.includes(gradeLevel)) {
    return NextResponse.json({ error: "A name and a valid grade level are required." }, { status: 400 });
  }

  const db = await getDb();
  await db.insert(childProfiles).values({
    id: crypto.randomUUID(),
    parentAccountId: parent.id,
    displayName,
    gradeLevel,
  });

  return NextResponse.json({ ok: true });
}
