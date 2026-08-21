"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Child {
  id: string;
  displayName: string;
}

interface Question {
  q: string;
  options: string[];
}

const TIER_LABEL: Record<number, string> = { 100: "Mastered", 80: "Proficient", 50: "Familiar", 0: "Not yet" };

export default function QuizWidget({
  quizId,
  lessonId,
  kids,
  questions,
}: {
  quizId: string;
  lessonId: string;
  kids: Child[];
  questions: Question[];
}) {
  const router = useRouter();
  const [childId, setChildId] = useState(kids[0]?.id ?? "");
  const [selected, setSelected] = useState<number[]>(new Array(questions.length).fill(-1));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correctCount: number;
    totalQuestions: number;
    masteryPoints: number;
    newlyEarnedBadges: string[];
  } | null>(null);

  if (kids.length === 0) return null;

  const allAnswered = selected.every((s) => s >= 0);

  return (
    <div
      className="mt-8 flex flex-col gap-4 p-4"
      style={{
        borderRadius: "var(--shell-radius, 0.5rem)",
        border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 15%, transparent)",
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium" htmlFor="quiz-child">
          Taking the quiz as
        </label>
        <select
          id="quiz-child"
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

      {questions.map((q, qi) => (
        <div key={qi}>
          <p className="font-medium">{q.q}</p>
          <div className="mt-1 flex flex-col gap-1">
            {q.options.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={selected[qi] === oi}
                  onChange={() =>
                    setSelected((prev) => prev.map((v, i) => (i === qi ? oi : v)))
                  }
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled={pending || !allAnswered}
        onClick={async () => {
          setPending(true);
          setError(null);
          const res = await fetch(`/api/quizzes/${quizId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ childProfileId: childId, nodeId: lessonId, answers: selected }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            correctCount?: number;
            totalQuestions?: number;
            masteryPoints?: number;
            newlyEarnedBadges?: string[];
          };
          setPending(false);
          if (!res.ok) {
            setError(data.error ?? "Something went wrong.");
            return;
          }
          setResult({
            correctCount: data.correctCount ?? 0,
            totalQuestions: data.totalQuestions ?? questions.length,
            masteryPoints: data.masteryPoints ?? 0,
            newlyEarnedBadges: data.newlyEarnedBadges ?? [],
          });
          router.refresh();
        }}
        className="self-start rounded px-4 py-1.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--shell-accent, #f4b21a)", color: "#2a1c06" }}
      >
        {pending ? "Grading…" : "Submit quiz"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="border-t pt-3" style={{ borderColor: "color-mix(in srgb, var(--shell-ink, #000) 15%, transparent)" }}>
          <p className="font-semibold">
            {result.correctCount} of {result.totalQuestions} correct — {TIER_LABEL[result.masteryPoints] ?? "Not yet"}
          </p>
          {result.masteryPoints === 0 && (
            <p className="mt-1 text-sm opacity-80">Not quite there yet — try again to build mastery!</p>
          )}
          {result.newlyEarnedBadges.length > 0 && (
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--shell-accent, #f4b21a)" }}>
              New badge earned on the Chardi Kala Path! 🎉
            </p>
          )}
        </div>
      )}
    </div>
  );
}
