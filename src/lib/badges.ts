import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { badges, childBadges, studentProgress, lessons } from "../../drizzle/schema";
import { BADGE_TIERS, type BadgeTier } from "@/design/tokens";

const TIER_TITLE: Record<BadgeTier, string> = {
  seed: "Seed",
  sprout: "Sprout",
  bloom: "Bloom",
  sunrise: "Sunrise",
  "chardi-kala": "Chardi Kala",
};

// The Chardi Kala Path: an overall growth ladder across all subjects.
// Thresholds are total lessons/sections passed across every subject.
export const CHARDI_KALA_PATH: { key: string; tier: BadgeTier; title: string; threshold: number }[] =
  BADGE_TIERS.map((tier, i) => ({
    key: `chardi-kala-path-${tier}`,
    tier,
    title: TIER_TITLE[tier],
    threshold: [1, 5, 15, 30, 50][i],
  }));

// Per-subject Chardi Kala Path ladders (plan §6) — unblocked now that every
// core subject has real content in every grade-band. Scoped to the 6 core
// subjects (not the Life Skills/Digital Literacy bonus strands, which have no
// lessons yet). Thresholds are lower than the overall ladder's since a child
// only accrues progress in ONE subject-track at a time here, not across all 6.
const CORE_SUBJECTS: { key: string; label: string }[] = [
  { key: "math", label: "Math" },
  { key: "ela", label: "ELA" },
  { key: "science", label: "Science" },
  { key: "social-studies", label: "Social Studies" },
  { key: "punjabi", label: "Punjabi" },
  { key: "sikhi", label: "Sikhi" },
];

export const SUBJECT_CHARDI_KALA_PATHS: Record<
  string,
  { key: string; tier: BadgeTier; title: string; threshold: number }[]
> = Object.fromEntries(
  CORE_SUBJECTS.map(({ key: subject, label }) => [
    subject,
    BADGE_TIERS.map((tier, i) => ({
      key: `chardi-kala-path-${subject}-${tier}`,
      tier,
      title: `${label} ${TIER_TITLE[tier]}`,
      threshold: [1, 3, 8, 15, 25][i],
    })),
  ]),
);

export async function getEarnedBadges(childProfileId: string) {
  const db = await getDb();
  return db
    .select({ key: badges.key, title: badges.title, tier: badges.tier, earnedAt: childBadges.earnedAt })
    .from(childBadges)
    .innerJoin(badges, eq(childBadges.badgeId, badges.id))
    .where(eq(childBadges.childProfileId, childProfileId));
}

// Call after any progress write. Counts total passed nodes for this child
// (overall) plus passed nodes per core subject (via the Lesson each nodeId
// resolves to — ScriptureSection nodes have no subject and are excluded from
// the per-subject count, same as the per-subject split's own scoping note),
// and awards any Chardi Kala Path tier — overall or per-subject — newly
// crossed. Idempotent — re-running never double-awards a tier.
export async function awardEligibleBadges(childProfileId: string) {
  const db = await getDb();

  const passed = await db
    .select({ nodeId: studentProgress.nodeId })
    .from(studentProgress)
    .where(and(eq(studentProgress.childProfileId, childProfileId), eq(studentProgress.status, "passed")));
  const passedCount = passed.length;

  const passedLessons =
    passed.length === 0
      ? []
      : await db
          .select({ subject: lessons.subject })
          .from(lessons)
          .where(inArray(lessons.id, passed.map((p) => p.nodeId)));
  const passedCountBySubject = new Map<string, number>();
  for (const { subject } of passedLessons) {
    passedCountBySubject.set(subject, (passedCountBySubject.get(subject) ?? 0) + 1);
  }

  const eligibleKeys = CHARDI_KALA_PATH.filter((b) => passedCount >= b.threshold).map((b) => b.key);
  for (const [subject, ladder] of Object.entries(SUBJECT_CHARDI_KALA_PATHS)) {
    const subjectCount = passedCountBySubject.get(subject) ?? 0;
    eligibleKeys.push(...ladder.filter((b) => subjectCount >= b.threshold).map((b) => b.key));
  }
  if (eligibleKeys.length === 0) return [];

  const catalog = await db.select().from(badges).where(inArray(badges.key, eligibleKeys));
  const catalogByKey = new Map(catalog.map((b) => [b.key, b]));

  const alreadyEarned = await db
    .select({ badgeId: childBadges.badgeId })
    .from(childBadges)
    .where(eq(childBadges.childProfileId, childProfileId));
  const alreadyEarnedIds = new Set(alreadyEarned.map((b) => b.badgeId));

  const newlyEarned: string[] = [];
  const now = new Date();
  for (const key of eligibleKeys) {
    const badge = catalogByKey.get(key);
    if (!badge || alreadyEarnedIds.has(badge.id)) continue;
    await db.insert(childBadges).values({
      id: crypto.randomUUID(),
      childProfileId,
      badgeId: badge.id,
      earnedAt: now,
    });
    newlyEarned.push(key);
  }
  return newlyEarned;
}
