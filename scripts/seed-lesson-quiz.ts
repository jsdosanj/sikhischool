// Seeds one Quiz row and wires it to a lesson via lessons.mastery_quiz_id.
// Same D1 HTTP API pattern as the other seed scripts.
//
// Auth: reads CLOUDFLARE_API_TOKEN from the environment (needs D1 Edit permission).
// Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-lesson-quiz.ts <path-to-json>

import { readFileSync } from "node:fs";

const ACCOUNT_ID = "0d4412e40181808b16cce0225ddb5152";
const DATABASE_ID = "1ccc6190-dab9-45f0-a31e-ff88a9b43de0";

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
if (!API_TOKEN) {
  console.error("Set CLOUDFLARE_API_TOKEN (needs D1 Edit permission) before running this script.");
  process.exit(1);
}

async function query(sql: string, params: (string | number | null)[] = []) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    },
  );
  const body = (await res.json()) as { success: boolean; errors: unknown[] };
  if (!body.success) throw new Error(`D1 query failed: ${JSON.stringify(body.errors)}`);
  return body;
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: seed-lesson-quiz.ts <path-to-json>");
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const { lessonId, quiz } = data;

  // Fail loud before any D1 write — same rationale as seed-flagship-lesson.ts.
  // (DX review finding + outside-voice correction, docs/plans/expansion-plan-2026-09.md §16)
  const missing: string[] = [];
  if (!lessonId) missing.push("lessonId");
  if (!quiz?.id || !quiz?.level) missing.push("quiz.{id,level}");
  if (!Array.isArray(quiz?.questions) || quiz.questions.length === 0) {
    missing.push("quiz.questions (non-empty array)");
  } else {
    quiz.questions.forEach((q: { q?: string; options?: string[]; answer?: number }, i: number) => {
      if (!q?.q || !Array.isArray(q?.options) || q.options.length === 0) {
        missing.push(`quiz.questions[${i}].{q,options}`);
      } else if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.options.length) {
        missing.push(`quiz.questions[${i}].answer (must be a valid index into options)`);
      }
    });
  }
  if (missing.length > 0) {
    console.error(`${path} is missing required field(s): ${missing.join(", ")}`);
    console.error("See docs/CONTENT-AUTHORING.md for the full quiz JSON shape.");
    process.exit(1);
  }

  await query("DELETE FROM quizzes WHERE id = ?;", [quiz.id]);
  await query("INSERT INTO quizzes (id, level, questions, mastery_weight) VALUES (?,?,?,?);", [
    quiz.id,
    quiz.level,
    JSON.stringify(quiz.questions),
    quiz.masteryWeight ?? 1,
  ]);
  const linkResult = await query("UPDATE lessons SET mastery_quiz_id = ? WHERE id = ?;", [quiz.id, lessonId]);
  // D1 returns success:true with 0 rows changed for an UPDATE that matched no
  // row — a typo'd lessonId would otherwise print a false-positive "Seeded"
  // message while the quiz sits linked to nothing. (outside-voice finding, §16)
  const changes = (linkResult as unknown as { result: { meta: { changes: number } }[] }).result?.[0]?.meta?.changes ?? 0;
  if (changes === 0) {
    console.error(`No lesson found with id "${lessonId}" — quiz "${quiz.id}" was created but NOT linked to any lesson.`);
    process.exit(1);
  }

  console.log(`Seeded quiz "${quiz.id}" and linked it to lesson "${lessonId}".`);
}

main();
