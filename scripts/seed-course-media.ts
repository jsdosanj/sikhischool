// Seeds one hero image + one intro video per SUBJECT, applied to every
// course row in that subject (reused across grade levels — see the
// subject-media map below for the real, license-verified source of each
// asset). Same D1 HTTP API pattern as the other seed scripts.
//
// Auth: reads CLOUDFLARE_API_TOKEN from the environment (needs D1 Edit permission).
// Run: CLOUDFLARE_API_TOKEN=... npx tsx scripts/seed-course-media.ts

export {}; // makes this file a module, not a global script — see seed-chardi-kala-badges.ts's own fix

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

interface SubjectMedia {
  heroImageUrl: string;
  heroImageAttribution: string | null;
  videoId: string | null;
}

// Every entry here was verified live (HTTP 200 + image mime type for the
// Wikimedia file; a successful YouTube oEmbed response for the video) before
// being added — see the plan file's progress log for the verification notes.
const SUBJECT_MEDIA: Record<string, SubjectMedia> = {
  math: {
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Play_with_Polygon.jpg/960px-Play_with_Polygon.jpg",
    heroImageAttribution: "Photo: Aliva Sahoo (CC BY 4.0), via Wikimedia Commons",
    videoId: "mvOkMYCygps", // "Basic multiplication" — Khan Academy
  },
  ela: {
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Children_reading_beneath_a_tree_-_Story-Friends_%281927%29_-_Mabel_Betsy_Hill.jpg/960px-Children_reading_beneath_a_tree_-_Story-Friends_%281927%29_-_Mabel_Betsy_Hill.jpg",
    heroImageAttribution: null, // public domain
    videoId: "ZBuT2wdYtpM", // "Why we should all be reading aloud to children" — TEDxYouth@BeaconStreet
  },
  science: {
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Solar_System_Illustration_%28rubin-20220314-Solar-System-hero%29.jpg/960px-Solar_System_Illustration_%28rubin-20220314-Solar-System-hero%29.jpg",
    heroImageAttribution: "Image: Rubin Observatory/NSF/AURA (CC BY 4.0), via Wikimedia Commons",
    videoId: "JcxTM7knO80", // "Welcome to Crash Course Kids!"
  },
  "social-studies": {
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/World_map_from_A_System_of_Geography%2C_for_the_use_of_Schools_%281860%29_published_by_Sidney_Edwards_Morse._Original_from_the_British_Library._Digitally_enhanced_by_rawpixel._%2850622865398%29.jpg/960px-thumbnail.jpg",
    heroImageAttribution: "Image: Rawpixel Ltd, digitally enhanced from an 1860 British Library map (CC BY 2.0)",
    videoId: "93LLwiMjDko", // "What is Geography? Crash Course Geography #1"
  },
  punjabi: {
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/A_view_of_landscape_pre_with_harvest_wheat_crop_in_Punjab.jpg/960px-A_view_of_landscape_pre_with_harvest_wheat_crop_in_Punjab.jpg",
    heroImageAttribution: "Photo: Harvinder Chandigarh (CC BY-SA 4.0), via Wikimedia Commons",
    videoId: "iGP8VLRAlVM", // "Learn Greetings in Punjabi" — Punjabi With Navrup
  },
  sikhi: {
    // Exterior architectural photo only — never a depiction of the Gurus, per CLAUDE.md's content policy.
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Golden_Temple%2C_Amritsar_01.jpg/960px-Golden_Temple%2C_Amritsar_01.jpg",
    heroImageAttribution: "Photo: Bernard Gagnon (CC BY-SA 4.0), via Wikimedia Commons",
    videoId: "Tf8aK3e7RtQ", // "Who am I? What's on my Head?" — Little Sikhs (real Sikh children's-education channel)
  },
  "life-skills": {
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/HomeschooledChildrenCooking.jpg/960px-HomeschooledChildrenCooking.jpg",
    heroImageAttribution: "Photo: woodleywonderworks (CC BY 2.0), via Wikimedia Commons",
    videoId: "Dugn51K_6WA", // "Money and Finance: Crash Course Economics #11"
  },
  "digital-literacy": {
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Zambian_kids_learning_how_to_use_computers.jpg/960px-Zambian_kids_learning_how_to_use_computers.jpg",
    heroImageAttribution: null, // public domain (Peace Corps)
    videoId: "O5nskjZ_GoI", // "Early Computing: Crash Course Computer Science #1"
  },
};

async function main() {
  for (const [subject, media] of Object.entries(SUBJECT_MEDIA)) {
    await query(
      "UPDATE courses SET hero_image_url = ?, hero_image_attribution = ?, video_id = ? WHERE subject = ?;",
      [media.heroImageUrl, media.heroImageAttribution, media.videoId, subject],
    );
    console.log(`Updated media for subject "${subject}".`);
  }
}

main();
