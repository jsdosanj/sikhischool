"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STEP_TYPES } from "./registry";
import { useGameSession } from "./useGameSession";
import type { ActivityRef, GameResult } from "./types";

interface Child {
  id: string;
  displayName: string;
}

interface SaveResult {
  masteryPoints: number;
  attemptCount: number;
  newlyEarnedBadges: string[];
}

// Hosts one activityRefs entry: owns the §14 state machine, the child selector,
// and score submission. The step-type component underneath only ever plays the
// game and reports {correct, total} — it knows nothing about children, mastery
// points, or the network.
export default function GameActivity({
  lessonId,
  activity,
  kids,
}: {
  lessonId: string;
  activity: ActivityRef;
  kids: Child[];
}) {
  const router = useRouter();
  const [session, dispatch] = useGameSession();
  const [childId, setChildId] = useState(kids[0]?.id ?? "");
  const [saved, setSaved] = useState<SaveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const Step = STEP_TYPES[activity.componentKey];
  const config = activity.config ?? {};
  const title = (config.title as string | undefined) ?? "Practice activity";

  async function handleFinish(result: GameResult) {
    dispatch({ type: "finish", result });
    // Signed out, or a signed-in parent with no children yet: the game is still
    // playable, there's just nowhere to save the score.
    if (!childId) {
      dispatch({ type: "submitted" });
      return;
    }
    setError(null);
    const res = await fetch("/api/games/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childProfileId: childId,
        lessonId,
        componentKey: activity.componentKey,
        correct: result.correct,
        total: result.total,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      masteryPoints?: number;
      attemptCount?: number;
      newlyEarnedBadges?: string[];
    };
    // Completed always advances to Submitted, success or not — a failed save
    // never leaves the run stuck mid-flight. The previous best score stands.
    dispatch({ type: "submitted" });
    if (!res.ok) {
      setError(data.error ?? "We couldn't save that score just now — your earlier best is still safe.");
      return;
    }
    setSaved({
      masteryPoints: data.masteryPoints ?? 0,
      attemptCount: data.attemptCount ?? 1,
      newlyEarnedBadges: data.newlyEarnedBadges ?? [],
    });
    router.refresh();
  }

  function retry() {
    setSaved(null);
    setError(null);
    dispatch({ type: "retry" });
  }

  const playAgainButton = (
    <button
      type="button"
      onClick={retry}
      className="self-start px-4 py-2 text-sm font-semibold"
      style={{
        borderRadius: "var(--shell-radius, 0.5rem)",
        minHeight: "var(--shell-touch, 2.75rem)",
        background: "var(--shell-accent, #f4b21a)",
        color: "#2a1c06",
      }}
    >
      Play again
    </button>
  );

  return (
    <div
      className="flex flex-col gap-4 p-4"
      style={{
        borderRadius: "var(--shell-radius, 0.5rem)",
        border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 15%, transparent)",
        background: "var(--shell-surface)",
      }}
    >
      <h3 className="font-semibold" style={{ fontFamily: "var(--shell-display-font)" }}>
        {title}
      </h3>

      {session.phase === "not-started" && (
        <>
          {kids.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium" htmlFor={`game-child-${activity.componentKey}`}>
                Playing as
              </label>
              <select
                id={`game-child-${activity.componentKey}`}
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                className="rounded border border-[color-mix(in_srgb,var(--shell-ink,#000)_20%,transparent)] bg-transparent px-2 py-1.5 text-sm"
              >
                {kids.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: "start" })}
            className="self-start px-4 py-2 text-sm font-semibold"
            style={{
              borderRadius: "var(--shell-radius, 0.5rem)",
              minHeight: "var(--shell-touch, 2.75rem)",
              background: "var(--shell-accent, #f4b21a)",
              color: "#2a1c06",
            }}
          >
            Start
          </button>
        </>
      )}

      {session.phase === "in-progress" && <Step key={session.runId} config={config} onFinish={handleFinish} />}

      {session.phase === "completed" && <p className="text-sm opacity-80">Saving your score…</p>}

      {session.phase === "abandoned" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-80">
            That round closed before you finished — nothing was counted against you. Start it again whenever you like.
          </p>
          {playAgainButton}
        </div>
      )}

      {session.phase === "submitted" && (
        <div className="flex flex-col gap-3">
          {session.result && (
            <p className="font-semibold">
              {session.result.correct} of {session.result.total} correct
            </p>
          )}
          {saved && (
            <p className="text-sm opacity-80">
              Mastery points for this lesson: {saved.masteryPoints} &middot; attempt {saved.attemptCount}. Your best score
              is always the one that counts.
            </p>
          )}
          {saved && saved.newlyEarnedBadges.length > 0 && (
            <p className="text-sm font-semibold" style={{ color: "var(--shell-accent, #f4b21a)" }}>
              New badge earned on the Chardi Kala Path! 🎉
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {playAgainButton}
        </div>
      )}
    </div>
  );
}
