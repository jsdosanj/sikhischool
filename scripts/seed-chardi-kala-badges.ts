// Seeds the 5 Chardi Kala Path tier badges (Seed -> Sprout -> Bloom -> Sunrise
// -> Chardi Kala) into the `badges` catalog. Thresholds/titles must match
// src/lib/badges.ts's CHARDI_KALA_PATH exactly — this script is the one-time
// data-load counterpart to that award logic, not a second source of truth.
//
// Auth: reads CLOUDFLARE_API_TOKEN from the environment (needs D1 Edit permission).
// Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-chardi-kala-badges.ts

export {}; // makes this file a module — without this, its top-level consts/functions
// collide with any other import-less script in the same tsc program (real bug,
// found and fixed when adding scripts/seed-course-media.ts alongside it)

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

// Kept in sync by hand with src/lib/badges.ts's CHARDI_KALA_PATH.
const CHARDI_KALA_PATH = [
  { key: "chardi-kala-path-seed", tier: "seed", title: "Seed", threshold: 1 },
  { key: "chardi-kala-path-sprout", tier: "sprout", title: "Sprout", threshold: 5 },
  { key: "chardi-kala-path-bloom", tier: "bloom", title: "Bloom", threshold: 15 },
  { key: "chardi-kala-path-sunrise", tier: "sunrise", title: "Sunrise", threshold: 30 },
  { key: "chardi-kala-path-chardi-kala", tier: "chardi-kala", title: "Chardi Kala", threshold: 50 },
];

async function main() {
  await query("DELETE FROM badges WHERE key LIKE 'chardi-kala-path-%';");

  for (const b of CHARDI_KALA_PATH) {
    await query(
      "INSERT INTO badges (id, key, title, tier, icon_ref, criteria) VALUES (?, ?, ?, ?, ?, ?);",
      [
        crypto.randomUUID(),
        b.key,
        b.title,
        b.tier,
        null,
        `Complete ${b.threshold} lesson${b.threshold === 1 ? "" : "s"} or scripture section${b.threshold === 1 ? "" : "s"}`,
      ],
    );
  }

  console.log(`Seeded ${CHARDI_KALA_PATH.length} Chardi Kala Path badges.`);
}

main();
