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

  await query("DELETE FROM quizzes WHERE id = ?;", [quiz.id]);
  await query("INSERT INTO quizzes (id, level, questions, mastery_weight) VALUES (?,?,?,?);", [
    quiz.id,
    quiz.level,
    JSON.stringify(quiz.questions),
    quiz.masteryWeight ?? 1,
  ]);
  await query("UPDATE lessons SET mastery_quiz_id = ? WHERE id = ?;", [quiz.id, lessonId]);

  console.log(`Seeded quiz "${quiz.id}" and linked it to lesson "${lessonId}".`);
}

main();
