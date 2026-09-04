// The contract between a lesson's `activityRefs` and the step-type components
// that render them (plan §4 C1). Deliberately tiny: a step-type only reports how
// many items the child got right. Turning that into mastery points is the
// server's job, against the lesson's own masteryPointsFamiliar/Proficient/
// Mastered thresholds — never a parallel scoring system (plan §4 C1a).

// Mirrors lessons.activityRefs' JSON shape in drizzle/schema.ts.
export interface ActivityRef {
  type: "game" | "exercise";
  componentKey: string;
  config?: Record<string, unknown>;
}

export interface GameResult {
  correct: number;
  total: number;
}

// Every step-type component takes exactly this. `config` is the authored JSON
// blob from activityRefs — each step-type reads the keys it needs out of it,
// the same way the worksheet templates read `generationData`.
export interface GameStepProps {
  config: Record<string, unknown>;
  onFinish: (result: GameResult) => void;
}
