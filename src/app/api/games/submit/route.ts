import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentParent } from "@/lib/session";
import { awardEligibleBadges } from "@/lib/badges";
import { scheduleDecayFrom } from "@/lib/decay";
import { childProfiles, studentProgress, lessons } from "../../../../../drizzle/schema";

// Records a game score against the SAME lesson's mastery points — never a
// parallel scoring system (plan §4 C1a). Three rules the plan fixes here:
//
//  1. childProfileId is never trusted as sent: it's re-verified against the
//     parentAccountId derived from the session, exactly as /api/progress and
//     /api/quizzes/[id]/submit do, so a shared-device sibling can't write onto
//     another family's child (IDOR).
//  2. Retry is allowed and mastery only ever moves up — max(existing, new).
//  3. Every graded attempt bumps attemptCount, so a teacher/parent can see how
//     many tries a score took, not just the score.
//
// The score is computed client-side (games give immediate feedback, so the
// client has to know the answers) and clamped + re-tiered here against the
// lesson's own thresholds — a forged submission can't earn more than an honest
// perfect run.
export async function POST(request: Request) {
  const parent = await getCurrentParent();
  if (!parent) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json()) as {
    childProfileId?: string;
    lessonId?: string;
    componentKey?: string;
    correct?: number;
    total?: number;
  };
  const { childProfileId, lessonId, componentKey } = body;
  if (!childProfileId || !lessonId || !componentKey) {
    return NextResponse.json(
      { error: "childProfileId, lessonId, and componentKey are required." },
      { status: 400 },
    );
  }

  const total = Math.floor(Number(body.total));
  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: "total must be a positive number of items." }, { status: 400 });
  }
  // NaN/negative/over-total all clamp into range rather than erroring — a
  // miscounted score shouldn't lose a child their run.
  const rawCorrect = Math.floor(Number(body.correct));
  const correct = Number.isFinite(rawCorrect) ? Math.min(Math.max(rawCorrect, 0), total) : 0;

  const db = await getDb();

  const child = await db
    .select()
    .from(childProfiles)
    .where(and(eq(childProfiles.id, childProfileId), eq(childProfiles.parentAccountId, parent.id)))
    .get();
  if (!child) {
    console.warn(`games/submit: child ${childProfileId} does not belong to parent ${parent.id}`);
    return NextResponse.json({ error: "That child doesn't belong to your account." }, { status: 403 });
  }

  const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  // The game has to actually be one this lesson authored — same shape of check
  // as the quiz route's "that quiz doesn't belong to that lesson".
  const activities = lesson.activityRefs as { componentKey: string }[];
  if (!activities.some((a) => a.componentKey === componentKey)) {
    return NextResponse.json({ error: "That game isn't part of this lesson." }, { status: 400 });
  }

  // Same Khan Academy-style tiers the mastery quiz uses, so a game and a quiz
  // on one lesson can't disagree about what "proficient" means.
  const scoreRatio = correct / total;
  let earned: number;
  if (scoreRatio >= 1) {
    earned = lesson.masteryPointsMastered;
  } else if (scoreRatio >= 0.8) {
    earned = lesson.masteryPointsProficient;
  } else if (scoreRatio >= 0.5) {
    earned = lesson.masteryPointsFamiliar;
  } else {
    earned = 0;
  }
  const passedThisRun = earned > 0;

  const existing = await db
    .select()
    .from(studentProgress)
    .where(and(eq(studentProgress.childProfileId, childProfileId), eq(studentProgress.nodeId, lessonId)))
    .get();

  const now = new Date();
  let masteryPoints: number;
  let status: string;
  let attemptCount: number;
  if (existing) {
    masteryPoints = Math.max(existing.masteryPoints, earned);
    status = existing.status === "passed" || passedThisRun ? "passed" : "in-progress";
    attemptCount = existing.attemptCount + 1;
    await db
      .update(studentProgress)
      .set({
        status,
        masteryPoints,
        attemptCount,
        lastPracticedAt: now,
        decayScheduledAt: status === "passed" ? scheduleDecayFrom(now) : existing.decayScheduledAt,
      })
      .where(eq(studentProgress.id, existing.id));
  } else {
    masteryPoints = earned;
    status = passedThisRun ? "passed" : "in-progress";
    attemptCount = 1;
    await db.insert(studentProgress).values({
      id: crypto.randomUUID(),
      childProfileId,
      nodeId: lessonId,
      status,
      masteryPoints,
      attemptCount,
      lastPracticedAt: now,
      decayScheduledAt: status === "passed" ? scheduleDecayFrom(now) : null,
    });
  }

  const newlyEarnedBadges = status === "passed" ? await awardEligibleBadges(childProfileId) : [];

  return NextResponse.json({ ok: true, correct, total, masteryPoints, status, attemptCount, newlyEarnedBadges });
}
