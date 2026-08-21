// Loads one data/flagship-lessons/*.json file into units/lessons/teacher_guides/
// worksheets — the "one real, complete lesson per unit" quality bar from the plan,
// as opposed to every course staying an empty "coming soon" shell. Same D1 HTTP
// API pattern as the other seed scripts.
//
// Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-flagship-lesson.ts <path>

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
    console.error("Usage: seed-flagship-lesson.ts <path-to-json>");
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const { unit, lesson, teacherGuide, worksheet } = data;

  await query('DELETE FROM units WHERE id = ?;', [unit.id]);
  await query(
    'INSERT INTO units (id, course_id, "order", title, week_of_year, standard_tags) VALUES (?,?,?,?,?,?);',
    [unit.id, unit.courseId, unit.order, unit.title, unit.weekOfYear, "[]"],
  );

  await query(
    'INSERT INTO lessons (id, unit_id, "order", day_of_week, title, grade_level, subject, standard_tags, content_blocks, activity_refs, mastery_points_familiar, mastery_points_proficient, mastery_points_mastered, ai_generated, ai_review_status, citations, enrichment_links) ' +
      "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
    [
      lesson.id,
      lesson.unitId,
      lesson.order,
      lesson.dayOfWeek,
      lesson.title,
      lesson.gradeLevel,
      lesson.subject,
      "[]",
      JSON.stringify(lesson.contentBlocks),
      "[]",
      50,
      80,
      100,
      lesson.aiGenerated ? 1 : 0,
      lesson.aiReviewStatus,
      "[]",
      JSON.stringify(lesson.enrichmentLinks ?? []),
    ],
  );

  await query(
    "INSERT INTO teacher_guides (id, lesson_id, objectives, materials_needed, facilitation_script, differentiation_tips, estimated_minutes, answer_key, standards_rationale) VALUES (?,?,?,?,?,?,?,?,?);",
    [
      teacherGuide.id,
      teacherGuide.lessonId,
      JSON.stringify(teacherGuide.objectives),
      JSON.stringify(teacherGuide.materialsNeeded),
      teacherGuide.facilitationScript,
      JSON.stringify(teacherGuide.differentiationTips),
      teacherGuide.estimatedMinutes,
      teacherGuide.answerKey,
      teacherGuide.standardsRationale,
    ],
  );

  await query(
    "INSERT INTO worksheets (id, lesson_id, title, generation_template_key, generation_data) VALUES (?,?,?,?,?);",
    [
      worksheet.id,
      lesson.id,
      worksheet.title,
      worksheet.generationTemplateKey ?? "count-and-write-v1",
      JSON.stringify(worksheet.generationData ?? { rows: worksheet.rows }),
    ],
  );

  console.log(`Seeded unit "${unit.title}", lesson "${lesson.title}", teacher guide, and worksheet.`);
}

main();
