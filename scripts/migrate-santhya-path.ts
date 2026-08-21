// Read-only data-export pass against sikh-archive's Sikhi School (Santhiya) feature,
// producing the Wave 1a migration dataset for Santhya Path (this site's renamed,
// natively-rebuilt version — see CLAUDE.md and the plan's §11/§12).
//
// Source of truth (sikh-archive, verified 2026-08-21):
//   lib/santhiya/curriculum.ts        — the 7-step SANTHIYA array (transcribed below;
//                                        it's small and stable enough that a one-time
//                                        transcription is simpler and safer than a
//                                        fragile cross-repo TS import)
//   public/data/santhiya-audio.json   — audio tracks per step, keyed by `audioSlug`
//
// CORRECTION to the original plan: sikh-archive's santhiya audio is R2-mirrored from
// gurmatveechar.com (each track has both a `sourceUrl` and an `r2Key`), not
// Arweave-backed as the plan assumed. Since sikh-archive itself chose to mirror
// rather than link directly to the external source, Sikhi School should do the same
// — copy the R2 objects into `sikhischool-media`, don't just reference `sourceUrl`.
// That R2-to-R2 copy is real, separate work (needs sikh-archive's public asset URL
// scheme confirmed) — deliberately NOT done by this script; it only produces the
// dataset + carries `sourceUrl`/`r2Key` through so Wave 1a can do the copy.
//
// This script is read-only against sikh-archive (no writes to that repo) and only
// writes to this repo's data/santhya-path-migration.json.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SIKH_ARCHIVE_LOCAL_CLONE =
  process.env.SIKH_ARCHIVE_PATH || join(process.env.HOME || "", "Documents/Github/sikh-archive");

interface SourceStep {
  slug: string;
  title: string;
  gurmukhi: string;
  description: string;
  source?: string;
  externalReader?: { href: string; label: string };
  audioSlug?: string;
  audioNote?: string;
  crossLink?: { label: string; href: string };
}

// Transcribed from sikh-archive's lib/santhiya/curriculum.ts (verified 2026-08-21).
const SANTHIYA: SourceStep[] = [
  {
    slug: "muharni-baal-updesh",
    title: "Muharni + Baal Updesh",
    gurmukhi: "ਮੁਹਾਰਨੀ + ਬਾਲ ਉਪਦੇਸ਼",
    description:
      "Step 1 — the foundation. Learn the 35 Gurmukhi letters (akhar), the vowel signs (laga-matra), and the muharni: chanting every letter through each vowel until the sounds are second nature. Baal Updesh adds simple words and shabads so new readers build confidence before opening a gutka.",
    crossLink: { label: "Punjabi School", href: "/punjabi" },
  },
  {
    slug: "nitnem-sundar-gutka",
    title: "Nitnem + Sundar Gutka",
    gurmukhi: "ਨਿਤਨੇਮ + ਸੁੰਦਰ ਗੁਟਕਾ",
    description:
      "Step 2 — the daily banis. Read along to the five morning banis, Rehras Sahib, and Kirtan Sohila exactly as they are uchaared, then continue into the wider Sundar Gutka collection. Follow the Bhindran Taksal santhya track to perfect pauses (vishraam) and pronunciation.",
    source: "SG",
    audioSlug: "nitnem-sundar-gutka",
    audioNote: "Bhindran Taksal Santhya · gurmatveechar.com",
  },
  {
    slug: "punj-das-granthi",
    title: "Punj Granthi + Das Granthi",
    gurmukhi: "ਪੰਜ ਗ੍ਰੰਥੀ + ਦਸ ਗ੍ਰੰਥੀ",
    description:
      "Step 3 — the five-bani (Punj Granthi) and ten-bani (Das Granthi) collections. These gather the longer banis read by Gursikhs beyond Nitnem, building the stamina and fluency needed before taking on a full granth.",
    source: "SG",
  },
  {
    slug: "vaaran-bhagat-bani",
    title: "22 Vaaran + Bhagat Bani + Bhai Gurdas Vaaran",
    gurmukhi: "੨੨ ਵਾਰਾਂ + ਭਗਤ ਬਾਣੀ + ਭਾਈ ਗੁਰਦਾਸ ਵਾਰਾਂ",
    description:
      "Step 4 — the 22 Vaaran of Sri Guru Granth Sahib Ji, the bani of the Bhagats, and the Vaaran of Bhai Gurdas Ji — called the kunji (key) to Gurbani. Reading these deepens understanding of raag, rhythm, and the vocabulary you will meet in the full granth.",
    source: "V",
  },
  {
    slug: "sggs",
    title: "Sri Guru Granth Sahib Ji",
    gurmukhi: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ",
    description:
      "Step 5 — the complete Sri Guru Granth Sahib Ji, all 1430 ang, with read-along sehaj-paath audio for every ang. Read at your own pace; the docked player follows you ang by ang so you can match the uchaaran of each pankti.",
    externalReader: { href: "/sggs", label: "Open the full SGGS reader" },
    audioSlug: "sggs",
    audioNote: "Sehaj Paath · Bhagat Ji Radio",
  },
  {
    slug: "dasam",
    title: "Sri Dasam Granth",
    gurmukhi: "ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ",
    description:
      "Step 6 — Sri Dasam Granth Sahib, the writings of Sri Guru Gobind Singh Ji. Read along with santhiya recorded at the Dasam Granth Paath Bodh Samagam — the precise uchaaran matters most here, where the bani is dense with Braj, Persian, and Sanskrit vocabulary.",
    externalReader: { href: "/dasam", label: "Open the full Dasam Granth reader" },
    audioSlug: "dasam",
    audioNote: "Dasam Granth Paath Bodh Samagam · gurmatveechar.com",
  },
  {
    slug: "sarbloh",
    title: "Sri Sarbloh Granth",
    gurmukhi: "ਸ੍ਰੀ ਸਰਬਲੋਹ ਗ੍ਰੰਥ",
    description:
      "Step 7 — Sri Sarbloh Granth, the final and most advanced granth in the santhiya path. Read along with santhiya from the Sri Sarbloh Granth Paath Bodh Samagam, completing the journey from the first Gurmukhi letter to the deepest Khalsa bani.",
    externalReader: { href: "/sarbloh", label: "Open the full Sarbloh Granth reader" },
    audioSlug: "sarbloh",
    audioNote: "Sri Sarbloh Granth Paath Bodh Samagam · gurmatveechar.com",
  },
];

interface AudioTrack {
  title: string;
  sourceUrl: string;
  r2Key: string;
}

function loadAudioIndex(): Record<string, { title: string; tracks: AudioTrack[] }> {
  const path = join(SIKH_ARCHIVE_LOCAL_CLONE, "public/data/santhiya-audio.json");
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  return raw;
}

function main() {
  const audioIndex = loadAudioIndex();

  const stages = SANTHIYA.map((step, i) => ({
    id: `stage-${step.slug}`,
    order: i + 1,
    title: step.title,
    description: step.description,
    recommendedGradeBand: null as string | null, // soft guidance, unset — assign during Wave 1a design pass
  }));

  const sections = SANTHIYA.map((step) => {
    const audio = step.audioSlug ? audioIndex[step.audioSlug] : undefined;
    return {
      id: `section-${step.slug}`,
      stageId: `stage-${step.slug}`,
      order: 1,
      title: step.title,
      gurmukhiTitle: step.gurmukhi,
      description: step.description,
      // NOT yet the actual vishraam-marked Gurbani text — that lives in sikh-archive's
      // GURBANI_DB (source="SG"/"V" above), a separate, larger corpus this script
      // deliberately doesn't pull in Wave 0. Wave 1a's reader-rebuild step sources it.
      textRef: step.source ? `sikh-archive:GURBANI_DB:${step.source}` : null,
      externalReader: step.externalReader ?? null,
      audioTracks: audio?.tracks ?? [],
      audioNote: step.audioNote ?? null,
      padchedLarivaarSupport: Boolean(step.source), // steps with a dedicated santhiya reader support both
    };
  });

  const dataset = {
    exportedAt: new Date().toISOString(),
    sourceRepo: "redroyals/sikh-archive",
    sourceCommitNote: "lib/santhiya/curriculum.ts + public/data/santhiya-audio.json, verified 2026-08-21",
    stages,
    sections,
  };

  const outPath = join(__dirname, "..", "data", "santhya-path-migration.json");
  writeFileSync(outPath, JSON.stringify(dataset, null, 2));
  console.log(`Wrote ${sections.length} sections across ${stages.length} stages to ${outPath}`);
  console.log(
    "NOTE: audioTracks carry sourceUrl (gurmatveechar.com) + r2Key (sikh-archive's own R2) but " +
      "have NOT been copied into sikhischool-media yet — that R2-to-R2 copy is separate Wave 1a work.",
  );
}

main();
