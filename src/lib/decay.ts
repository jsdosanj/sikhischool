// Spaced-repetition-style mastery decay (plan §6). Cloudflare Workers' native Cron
// Triggers aren't supported by the installed OpenNext Cloudflare adapter (no
// `scheduled` export hook) — see .github/workflows/mastery-decay.yml, which calls
// POST /api/cron/decay-mastery on a schedule instead.

export const DECAY_WINDOW_DAYS = 30;

export function scheduleDecayFrom(date: Date): Date {
  return new Date(date.getTime() + DECAY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

// One tier step down per decay run: Mastered -> Proficient -> Familiar -> 0 (drops
// out of "passed", resurfacing the node for practice). Never decays below 0.
export function decayedPoints(current: number, familiar: number, proficient: number, mastered: number): number {
  if (current >= mastered) return proficient;
  if (current >= proficient) return familiar;
  return 0;
}
