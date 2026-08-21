import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentParent } from "@/lib/session";
import { awardEligibleBadges } from "@/lib/badges";
import { childProfiles, quizzes, lessons, studentProgress } from "../../../../../../drizzle/schema";

// Grades a quiz submission server-side and escalates mastery accordingly —
// the answer key never leaves the server (see src/lib/quizzes.ts). Khan
// Academy-style tiers: >=100% = Mastered, >=80% = Proficient, >=50% =
// Familiar, below that the child hasn't passed yet (status stays
// in-progress, encouraging a retry rather than a discouraging "failed").
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parent = await getCurrentParent();
  if (!parent) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const { id: quizId } = await params;
  const body = (await request.json()) as { childProfileId?: string; nodeId?: string; answers?: number[] };
  const { childProfileId, nodeId, answers } = body;
  if (!childProfileId || !nodeId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "childProfileId, nodeId, and answers are required." }, { status: 400 });
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

  const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).get();
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  const lesson = await db.select().from(lessons).where(eq(lessons.id, nodeId)).get();
  if (!lesson || lesson.masteryQuizId !== quizId) {
    return NextResponse.json({ error: "That quiz doesn't belong to that lesson." }, { status: 400 });
  }

  const questions = quiz.questions as { q: string; options: string[]; answer: number }[];
  const correctCount = questions.reduce((count, q, i) => (answers[i] === q.answer ? count + 1 : count), 0);
  const scoreRatio = questions.length > 0 ? correctCount / questions.length : 0;

  let status: "passed" | "in-progress";
  let masteryPoints: number;
  if (scoreRatio >= 1) {
    status = "passed";
    masteryPoints = lesson.masteryPointsMastered;
  } else if (scoreRatio >= 0.8) {
    status = "passed";
    masteryPoints = lesson.masteryPointsProficient;
  } else if (scoreRatio >= 0.5) {
    status = "passed";
    masteryPoints = lesson.masteryPointsFamiliar;
  } else {
    status = "in-progress";
    masteryPoints = 0;
  }

  const now = new Date();
  const existing = await db
    .select()
    .from(studentProgress)
    .where(and(eq(studentProgress.childProfileId, childProfileId), eq(studentProgress.nodeId, nodeId)))
    .get();
  if (existing) {
    await db
      .update(studentProgress)
      .set({ status, masteryPoints, lastPracticedAt: now })
      .where(eq(studentProgress.id, existing.id));
  } else {
    await db.insert(studentProgress).values({
      id: crypto.randomUUID(),
      childProfileId,
      nodeId,
      status,
      masteryPoints,
      lastPracticedAt: now,
    });
  }

  const newlyEarnedBadges = status === "passed" ? await awardEligibleBadges(childProfileId) : [];

  return NextResponse.json({
    ok: true,
    correctCount,
    totalQuestions: questions.length,
    masteryPoints,
    status,
    newlyEarnedBadges,
  });
}
