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

  // Fail loud before any D1 write, not with a stack trace mid-insert or (worse)
  // a silent partial insert — this is the shape docs/CONTENT-AUTHORING.md
  // documents. "Every lesson ships a Worksheet + TeacherGuide, no exceptions"
  // is a CLAUDE.md hard rule; this is what actually enforces it.
  //
  // Checks every column the INSERTs below actually bind, not just a plausible
  // subset — a field checked here-but-missing-there is the exact silent-
  // partial-write failure mode this validation exists to prevent (a NOT NULL
  // column with a DB-level default still rejects an explicit NULL, which is
  // what JSON.stringify(undefined) becomes once it crosses the fetch boundary).
  // (DX review finding + outside-voice correction, docs/plans/expansion-plan-2026-09.md §16)
  const missing: string[] = [];
  if (!unit?.id || !unit?.courseId || !unit?.title) missing.push("unit.{id,courseId,title}");
  if (typeof unit?.order !== "number") missing.push("unit.order (number)");
  if (!lesson?.id || !lesson?.unitId || !lesson?.title || !lesson?.gradeLevel || !lesson?.subject) {
    missing.push("lesson.{id,unitId,title,gradeLevel,subject}");
  }
  if (typeof lesson?.order !== "number") missing.push("lesson.order (number)");
  if (lesson?.standardTags !== undefined && !Array.isArray(lesson.standardTags)) {
    missing.push("lesson.standardTags (array, if present)");
  }
  if (lesson?.activityRefs !== undefined && !Array.isArray(lesson.activityRefs)) {
    missing.push("lesson.activityRefs (array, if present)");
  }
  if (!Array.isArray(lesson?.contentBlocks) || lesson.contentBlocks.length === 0) {
    missing.push("lesson.contentBlocks (non-empty array)");
  } else if (lesson.contentBlocks.some((b: { type?: string; ref?: string }) => !b?.type || !b?.ref)) {
    missing.push("lesson.contentBlocks[*].{type,ref} (every block needs both)");
  }
  if (!teacherGuide?.id || !teacherGuide?.facilitationScript) missing.push("teacherGuide.{id,facilitationScript}");
  if (!Array.isArray(teacherGuide?.objectives)) missing.push("teacherGuide.objectives (array)");
  if (!Array.isArray(teacherGuide?.materialsNeeded)) missing.push("teacherGuide.materialsNeeded (array)");
  if (!Array.isArray(teacherGuide?.differentiationTips)) missing.push("teacherGuide.differentiationTips (array)");
  if (!worksheet?.id || !worksheet?.title) missing.push("worksheet.{id,title}");
  if (missing.length > 0) {
    console.error(`${path} is missing required field(s): ${missing.join(", ")}`);
    console.error("See docs/CONTENT-AUTHORING.md for the full lesson JSON shape.");
    process.exit(1);
  }
  // aiReviewStatus has a DB-level default ("pending") but this script always
  // passes an explicit value below — apply the same default in code so an
  // omitted field doesn't become an explicit NULL that violates NOT NULL.
  lesson.aiReviewStatus ??= "pending";

  // Only insert the unit if it doesn't already exist. Multiple lessons share
  // a unit, and lessons.unit_id is a real FK to units.id — unconditionally
  // deleting+reinserting the unit on every run would (briefly, or worse,
  // permanently if the DELETE fails on the FK) orphan any lessons already
  // added to it in an earlier run.
  const existingUnit = await query("SELECT id FROM units WHERE id = ?;", [unit.id]);
  const unitRows = (existingUnit as unknown as { result: { results: unknown[] }[] }).result;
  const unitExists = (unitRows?.[0]?.results?.length ?? 0) > 0;
  if (!unitExists) {
    await query(
      'INSERT INTO units (id, course_id, "order", title, week_of_year, standard_tags) VALUES (?,?,?,?,?,?);',
      [unit.id, unit.courseId, unit.order, unit.title, unit.weekOfYear, "[]"],
    );
  }

  // worksheets/teacher_guides reference lessons.id via FK — must delete
  // those child rows before the lesson row, not after.
  await query("DELETE FROM worksheets WHERE lesson_id = ?;", [lesson.id]);
  await query("DELETE FROM teacher_guides WHERE lesson_id = ?;", [lesson.id]);
  await query("DELETE FROM lessons WHERE id = ?;", [lesson.id]);
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
      // These three were hardcoded to the literal "[]" regardless of what the
      // JSON actually authored — every prior flagship lesson happened not to
      // set these fields, so the bug was silent until content started using
      // them (first real case: Spanish week 1's activityRefs, plan §4 C1/C2).
      JSON.stringify(lesson.standardTags ?? []),
      JSON.stringify(lesson.contentBlocks),
      JSON.stringify(lesson.activityRefs ?? []),
      50,
      80,
      100,
      lesson.aiGenerated ? 1 : 0,
      lesson.aiReviewStatus,
      JSON.stringify(lesson.citations ?? []),
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
