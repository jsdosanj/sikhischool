// Loads data/santhya-path-migration.json into the scripture_stages/scripture_sections
// tables via D1's HTTP query API (not `wrangler d1 execute --file`: some sections carry
// large audio_tracks JSON — SGGS alone is ~1,428 tracks, ~150KB — and D1's file-execute
// path rejects long inline SQL statements with SQLITE_TOOBIG even though it's a single
// bound parameter well within the API's actual limits).
//
// Auth: reads CLOUDFLARE_API_TOKEN from the environment (needs D1 Edit permission on
// the target account). Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-santhya-path.ts

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
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );
  const body = (await res.json()) as { success: boolean; errors: unknown[] };
  if (!body.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(body.errors)}`);
  }
  return body;
}

interface Stage {
  id: string;
  order: number;
  title: string;
  description: string;
  recommendedGradeBand: string | null;
}

interface Section {
  id: string;
  stageId: string;
  order: number;
  title: string;
  gurmukhiTitle: string | null;
  description: string | null;
  textRef: string | null;
  externalReader: { href: string; label: string } | null;
  audioTracks: { title: string; sourceUrl: string; r2Key: string }[];
  audioNote: string | null;
  padchedLarivaarSupport: boolean;
}

async function main() {
  const datasetPath = join(__dirname, "..", "data", "santhya-path-migration.json");
  const dataset = JSON.parse(readFileSync(datasetPath, "utf-8")) as {
    stages: Stage[];
    sections: Section[];
  };

  await query("DELETE FROM scripture_sections;");
  await query("DELETE FROM scripture_stages;");

  for (const stage of dataset.stages) {
    await query(
      'INSERT INTO scripture_stages (id, "order", title, description, recommended_grade_band) VALUES (?,?,?,?,?);',
      [stage.id, stage.order, stage.title, stage.description, stage.recommendedGradeBand],
    );
  }

  for (const section of dataset.sections) {
    await query(
      'INSERT INTO scripture_sections (id, stage_id, "order", title, gurmukhi_title, description, text_ref, external_reader, audio_tracks, audio_note, padched_larivaar_support, glossary_refs) ' +
        "VALUES (?,?,?,?,?,?,?,?,?,?,?,?);",
      [
        section.id,
        section.stageId,
        section.order,
        section.title,
        section.gurmukhiTitle,
        section.description,
        section.textRef,
        section.externalReader ? JSON.stringify(section.externalReader) : null,
        JSON.stringify(section.audioTracks ?? []),
        section.audioNote,
        section.padchedLarivaarSupport ? 1 : 0,
        JSON.stringify([]),
      ],
    );
    console.log(`Seeded ${section.id} (${section.audioTracks?.length ?? 0} audio tracks)`);
  }

  console.log(`Done: ${dataset.stages.length} stages, ${dataset.sections.length} sections.`);
}

main();
