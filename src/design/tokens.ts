// Structural design constants (not colors/type — the visual design system is
// Wave 1b work). See the plan's §5 (age-banded UI/UX shells) and §6 (gamification).

export const SHELLS = {
  "little-sparks": { label: "Little Sparks", gradeBands: ["K-2"] },
  "rising-school": { label: "Rising School", gradeBands: ["3-5", "6-8"] },
  "sikhi-school-studio": { label: "Sikhi School Studio", gradeBands: ["9-12"] },
} as const;

export type ShellKey = keyof typeof SHELLS;

export function shellForGradeBand(gradeBand: string): ShellKey {
  if (gradeBand === "K-2") return "little-sparks";
  if (gradeBand === "9-12") return "sikhi-school-studio";
  return "rising-school"; // 3-5, 6-8
}

export const BADGE_TIERS = ["seed", "sprout", "bloom", "sunrise", "chardi-kala"] as const;

export type BadgeTier = (typeof BADGE_TIERS)[number];

export const GRADE_BANDS = ["K-2", "3-5", "6-8", "9-12"] as const;

export const SUBJECTS = [
  "math",
  "ela",
  "science",
  "social-studies",
  "punjabi",
  "sikhi",
  "life-skills",
  "digital-literacy",
  "spanish",
] as const;

export type Subject = (typeof SUBJECTS)[number];
