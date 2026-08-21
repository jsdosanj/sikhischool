import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { badges, childBadges, studentProgress } from "../../drizzle/schema";
import { BADGE_TIERS, type BadgeTier } from "@/design/tokens";

// The Chardi Kala Path: an overall growth ladder across all subjects, not yet
// split per subject-track (see plan §6) — content depth per subject isn't
// there yet to make a per-subject ladder meaningful. Thresholds are total
// lessons/sections passed across every subject.
export const CHARDI_KALA_PATH: { key: string; tier: BadgeTier; title: string; threshold: number }[] =
  BADGE_TIERS.map((tier, i) => ({
    key: `chardi-kala-path-${tier}`,
    tier,
    title: { seed: "Seed", sprout: "Sprout", bloom: "Bloom", sunrise: "Sunrise", "chardi-kala": "Chardi Kala" }[tier],
    threshold: [1, 5, 15, 30, 50][i],
  }));

export async function getEarnedBadges(childProfileId: string) {
  const db = await getDb();
  return db
    .select({ key: badges.key, title: badges.title, tier: badges.tier, earnedAt: childBadges.earnedAt })
    .from(childBadges)
    .innerJoin(badges, eq(childBadges.badgeId, badges.id))
    .where(eq(childBadges.childProfileId, childProfileId));
}

// Call after any progress write. Counts total passed nodes for this child,
// and awards any Chardi Kala Path tier they've newly crossed the threshold
// for. Idempotent — re-running never double-awards a tier.
export async function awardEligibleBadges(childProfileId: string) {
  const db = await getDb();

  const passed = await db
    .select({ nodeId: studentProgress.nodeId })
    .from(studentProgress)
    .where(and(eq(studentProgress.childProfileId, childProfileId), eq(studentProgress.status, "passed")));
  const passedCount = passed.length;

  const eligibleKeys = CHARDI_KALA_PATH.filter((b) => passedCount >= b.threshold).map((b) => b.key);
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
