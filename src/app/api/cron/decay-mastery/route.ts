import { NextResponse } from "next/server";
import { eq, and, lte, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { scheduleDecayFrom, decayedPoints } from "@/lib/decay";
import { studentProgress, lessons } from "../../../../../drizzle/schema";

// Called on a schedule by .github/workflows/mastery-decay.yml (Workers' native Cron
// Triggers aren't supported by the installed OpenNext Cloudflare adapter). Not
// user-facing — authenticated via a shared secret header, not a session.
//
// Processes up to BATCH_LIMIT due rows per invocation; the workflow runs daily, so
// it catches up naturally rather than needing to process everything in one call.
const BATCH_LIMIT = 200;

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = await getDb();
  const now = new Date();

  const due = await db
    .select()
    .from(studentProgress)
    .where(and(eq(studentProgress.status, "passed"), lte(studentProgress.decayScheduledAt, now)))
    .limit(BATCH_LIMIT);

  if (due.length === 0) {
    return NextResponse.json({ ok: true, decayed: 0, resurfaced: 0 });
  }

  // Decay only applies to Lesson nodes — they're the only ones with per-tier
  // masteryPoints thresholds configured (ScriptureSection has none yet).
  const lessonRows = await db
    .select()
    .from(lessons)
    .where(inArray(lessons.id, due.map((d) => d.nodeId)));
  const lessonById = new Map(lessonRows.map((l) => [l.id, l]));

  let decayed = 0;
  let resurfaced = 0;
  for (const row of due) {
    const lesson = lessonById.get(row.nodeId);
    if (!lesson) continue; // not a lesson node — leave untouched for now

    const newPoints = decayedPoints(
      row.masteryPoints,
      lesson.masteryPointsFamiliar,
      lesson.masteryPointsProficient,
      lesson.masteryPointsMastered,
    );

    if (newPoints <= 0) {
      await db
        .update(studentProgress)
        .set({ status: "in-progress", masteryPoints: 0, decayScheduledAt: null })
        .where(eq(studentProgress.id, row.id));
      resurfaced++;
    } else {
      await db
        .update(studentProgress)
        .set({ masteryPoints: newPoints, decayScheduledAt: scheduleDecayFrom(now) })
        .where(eq(studentProgress.id, row.id));
      decayed++;
    }
  }

  return NextResponse.json({ ok: true, decayed, resurfaced, processed: due.length });
}
