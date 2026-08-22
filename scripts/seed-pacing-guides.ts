// Generates and seeds a PacingGuide for every course from its existing units —
// addresses the "PacingGuide generation" backlog item (plan §8/§14: "a first
// PacingGuide published per course even before every Lesson is filled in, so
// the full-year shape is visible immediately"). Idempotent: re-run any time new
// units land in a course and it regenerates that course's guide from scratch.
//
// Auth: reads CLOUDFLARE_API_TOKEN from the environment (needs D1 Edit permission).
// Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-pacing-guides.ts

export {}; // see seed-chardi-kala-badges.ts's header comment on why this matters

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
  const body = (await res.json()) as { success: boolean; result: { results: Record<string, unknown>[] }[]; errors: unknown[] };
  if (!body.success) throw new Error(`D1 query failed: ${JSON.stringify(body.errors)}`);
  return body.result[0].results;
}

interface UnitRow {
  id: string;
  order: number;
  title: string;
  week_of_year: number | null;
}

async function main() {
  const courses = (await query("SELECT id FROM courses")) as { id: string }[];
  let seeded = 0;
  let skipped = 0;

  for (const course of courses) {
    const units = (await query(
      "SELECT id, `order`, title, week_of_year FROM units WHERE course_id = ? ORDER BY `order`",
      [course.id],
    )) as unknown as UnitRow[];

    if (units.length === 0) {
      skipped++;
      continue;
    }

    const weekByWeekSequence = units.map((u, i) => ({
      week: u.week_of_year ?? i + 1,
      unitId: u.id,
      summary: u.title,
    }));

    const id = `pacing-${course.id}`;
    await query("DELETE FROM pacing_guides WHERE course_id = ?;", [course.id]);
    await query("INSERT INTO pacing_guides (id, course_id, week_by_week_sequence) VALUES (?, ?, ?);", [
      id,
      course.id,
      JSON.stringify(weekByWeekSequence),
    ]);
    seeded++;
  }

  console.log(`Seeded pacing guides for ${seeded} courses (${skipped} skipped — no units yet).`);
}

main();
