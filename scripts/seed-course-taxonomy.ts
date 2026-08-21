// Loads data/course-taxonomy.json into the `courses` table — the Wave 1b broad
// skeleton (one row per grade x subject, no units/lessons yet). Same D1 HTTP API
// approach as seed-santhya-path.ts.
//
// Auth: reads CLOUDFLARE_API_TOKEN from the environment (needs D1 Edit permission).
// Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-course-taxonomy.ts

import { readFileSync } from "node:fs";
import { join } from "node:path";

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

interface RawCourse {
  subject: string;
  gradeLevel: string;
  title: string;
  description: string;
}

function gradeBandFor(gradeLevel: string, gradeBands: Record<string, string>): string {
  // Bonus-strand rows already use a band as their gradeLevel (e.g. "K-2").
  return gradeBands[gradeLevel] ?? gradeLevel;
}

function shellFor(gradeBand: string): string {
  if (gradeBand === "K-2") return "little-sparks";
  if (gradeBand === "9-12") return "sikhi-school-studio";
  return "rising-school"; // 3-5, 6-8
}

async function main() {
  const datasetPath = join(__dirname, "..", "data", "course-taxonomy.json");
  const dataset = JSON.parse(readFileSync(datasetPath, "utf-8")) as {
    gradeBands: Record<string, string>;
    courses: RawCourse[];
  };

  await query("DELETE FROM courses;");

  for (const c of dataset.courses) {
    const gradeBand = gradeBandFor(c.gradeLevel, dataset.gradeBands);
    const id = `course-${c.subject}-${c.gradeLevel.toLowerCase()}`;
    await query(
      "INSERT INTO courses (id, subject, grade_level, grade_band, title, description, wa_standard_refs, shell_assignment) VALUES (?,?,?,?,?,?,?,?);",
      [id, c.subject, c.gradeLevel, gradeBand, c.title, c.description, "[]", shellFor(gradeBand)],
    );
  }

  console.log(`Seeded ${dataset.courses.length} courses.`);
}

main();
