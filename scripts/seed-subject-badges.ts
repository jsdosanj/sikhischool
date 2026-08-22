// Seeds the per-subject Chardi Kala Path badges (6 core subjects x 5 tiers = 30
// rows) into the `badges` catalog. Keys/titles/thresholds must match
// src/lib/badges.ts's SUBJECT_CHARDI_KALA_PATHS exactly — this script is the
// one-time data-load counterpart to that award logic, not a second source of
// truth.
//
// Auth: reads CLOUDFLARE_API_TOKEN from the environment (needs D1 Edit permission).
// Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-subject-badges.ts

export {}; // see seed-chardi-kala-badges.ts's header comment on why this matters
// for any import-less script sharing the same tsc program.

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

// Kept in sync by hand with src/lib/badges.ts's SUBJECT_CHARDI_KALA_PATHS.
const CORE_SUBJECTS = [
  { key: "math", label: "Math" },
  { key: "ela", label: "ELA" },
  { key: "science", label: "Science" },
  { key: "social-studies", label: "Social Studies" },
  { key: "punjabi", label: "Punjabi" },
  { key: "sikhi", label: "Sikhi" },
];
const TIERS: { tier: string; title: string; threshold: number }[] = [
  { tier: "seed", title: "Seed", threshold: 1 },
  { tier: "sprout", title: "Sprout", threshold: 3 },
  { tier: "bloom", title: "Bloom", threshold: 8 },
  { tier: "sunrise", title: "Sunrise", threshold: 15 },
  { tier: "chardi-kala", title: "Chardi Kala", threshold: 25 },
];

const SUBJECT_BADGES = CORE_SUBJECTS.flatMap(({ key: subject, label }) =>
  TIERS.map((t) => ({
    key: `chardi-kala-path-${subject}-${t.tier}`,
    tier: t.tier,
    title: `${label} ${t.title}`,
    threshold: t.threshold,
    subjectLabel: label,
  })),
);

async function main() {
  const keys = SUBJECT_BADGES.map((b) => b.key);
  await query(`DELETE FROM badges WHERE key IN (${keys.map(() => "?").join(",")});`, keys);

  for (const b of SUBJECT_BADGES) {
    await query("INSERT INTO badges (id, key, title, tier, icon_ref, criteria) VALUES (?, ?, ?, ?, ?, ?);", [
      crypto.randomUUID(),
      b.key,
      b.title,
      b.tier,
      null,
      `Complete ${b.threshold} ${b.subjectLabel} lesson${b.threshold === 1 ? "" : "s"}`,
    ]);
  }

  console.log(`Seeded ${SUBJECT_BADGES.length} per-subject Chardi Kala Path badges.`);
}

main();
