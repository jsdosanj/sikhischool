// Loads a data/dictionaries/*.json file (a flat array of dictionary rows) into
// the `dictionary` table. Same D1 HTTP API pattern as the other seed scripts —
// first content authored against this table (plan §5 D1/D3), so there's no
// prior seed script to follow; this one matches seed-flagship-lesson.ts's
// conventions deliberately (fail-loud validation before any write, one file
// per invocation, per-row DELETE-then-INSERT keyed by id so a re-run updates
// rather than duplicates).
//
// Auth: reads CLOUDFLARE_API_TOKEN from the environment (needs D1 Edit permission).
// Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-dictionary-entries.ts <path-to-json>

import { readFileSync } from "node:fs";

const ACCOUNT_ID = "0d4412e40181808b16cce0225ddb5152";
const DATABASE_ID = "1ccc6190-dab9-45f0-a31e-ff88a9b43de0";

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
if (!API_TOKEN) {
  console.error("Set CLOUDFLARE_API_TOKEN (needs D1 Edit permission) before running this script.");
  process.exit(1);
}

interface DictionaryEntry {
  id: string;
  language: string;
  word: string;
  translation: string;
  partOfSpeech?: string | null;
  synonyms?: string[];
  exampleSentence?: string | null;
  audioRef?: string | null;
  gradeBandHint?: string | null;
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
    console.error("Usage: seed-dictionary-entries.ts <path-to-json>");
    process.exit(1);
  }
  const entries = JSON.parse(readFileSync(path, "utf-8")) as DictionaryEntry[];
  if (!Array.isArray(entries) || entries.length === 0) {
    console.error(`${path} must be a non-empty JSON array of dictionary entries.`);
    process.exit(1);
  }

  // Fail loud before any D1 write, not mid-batch — same rationale as
  // seed-flagship-lesson.ts (docs/plans/expansion-plan-2026-09.md §16).
  const problems: string[] = [];
  entries.forEach((e, i) => {
    if (!e?.id || !e?.language || !e?.word || !e?.translation) {
      problems.push(`entries[${i}] missing required field(s): {id,language,word,translation}`);
    }
    if (e?.synonyms !== undefined && !Array.isArray(e.synonyms)) {
      problems.push(`entries[${i}].synonyms must be an array if present`);
    }
  });
  if (problems.length > 0) {
    console.error(`${path} has invalid entries:\n${problems.join("\n")}`);
    process.exit(1);
  }

  for (const e of entries) {
    // Keyed by id, like every other seed script — a re-run updates the same
    // rows instead of duplicating them.
    await query("DELETE FROM dictionary WHERE id = ?;", [e.id]);
    await query(
      "INSERT INTO dictionary (id, language, word, translation, part_of_speech, synonyms, example_sentence, audio_ref, grade_band_hint) VALUES (?,?,?,?,?,?,?,?,?);",
      [
        e.id,
        e.language,
        e.word,
        e.translation,
        e.partOfSpeech ?? null,
        JSON.stringify(e.synonyms ?? []),
        e.exampleSentence ?? null,
        e.audioRef ?? null,
        e.gradeBandHint ?? null,
      ],
    );
  }

  console.log(`Seeded ${entries.length} dictionary entries from ${path}.`);
}

main();
