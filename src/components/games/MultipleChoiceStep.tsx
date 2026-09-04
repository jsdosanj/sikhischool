"use client";

import { useState } from "react";
import type { GameStepProps } from "./types";

interface Question {
  q: string;
  options: string[];
  answer: number;
  explanation?: string;
}

// Batch multiple-choice practice: every question on screen at once, answered at
// the child's own pace, checked in one go with explanations. Deliberately the
// slow, reviewable counterpart to SpeedDrillStep's rapid-fire mode.
//
// The answer key ships to the client here, unlike the graded mastery quiz
// (src/lib/quizzes.ts strips it server-side). That's the intended split: games
// are practice with immediate feedback, so the client has to know what's right.
// The submission route re-tiers the score against the lesson's own mastery
// thresholds anyway, so a forged score can't earn more than an honest one.
export default function MultipleChoiceStep({ config, onFinish }: GameStepProps) {
  const questions = (config.questions as Question[] | undefined) ?? [];
  const [selected, setSelected] = useState<number[]>(new Array(questions.length).fill(-1));
  const [checked, setChecked] = useState(false);

  if (questions.length === 0) return null;

  const correctCount = questions.reduce((n, q, i) => (selected[i] === q.answer ? n + 1 : n), 0);

  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, qi) => (
        <fieldset key={qi} className="flex flex-col gap-1">
          <legend className="font-medium">
            {qi + 1}. {q.q}
          </legend>
          {q.options.map((opt, oi) => {
            const isAnswer = oi === q.answer;
            const isPicked = selected[qi] === oi;
            return (
              <label
                key={oi}
                className="flex items-center gap-2 px-2 py-1 text-sm"
                style={{
                  minHeight: "var(--shell-touch, 2.75rem)",
                  borderRadius: "var(--shell-radius, 0.5rem)",
                  background:
                    checked && (isAnswer || isPicked)
                      ? `color-mix(in srgb, ${isAnswer ? "var(--shell-accent-2)" : "var(--shell-sunrise-3, #ff5c7a)"} 20%, transparent)`
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name={`mc-${qi}`}
                  disabled={checked}
                  checked={isPicked}
                  onChange={() => setSelected((prev) => prev.map((v, i) => (i === qi ? oi : v)))}
                />
                {opt}
              </label>
            );
          })}
          {checked && q.explanation && <p className="mt-1 text-sm opacity-75">{q.explanation}</p>}
        </fieldset>
      ))}

      {!checked ? (
        <button
          type="button"
          disabled={selected.some((s) => s < 0)}
          onClick={() => setChecked(true)}
          className="self-start px-4 py-2 text-sm font-semibold disabled:opacity-60"
          style={{
            borderRadius: "var(--shell-radius, 0.5rem)",
            minHeight: "var(--shell-touch, 2.75rem)",
            background: "var(--shell-accent, #f4b21a)",
            color: "#2a1c06",
          }}
        >
          Check my answers
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold" role="status">
            {correctCount} of {questions.length} correct
          </p>
          <button
            type="button"
            onClick={() => onFinish({ correct: correctCount, total: questions.length })}
            className="px-4 py-2 text-sm font-semibold"
            style={{
              borderRadius: "var(--shell-radius, 0.5rem)",
              minHeight: "var(--shell-touch, 2.75rem)",
              background: "var(--shell-accent, #f4b21a)",
              color: "#2a1c06",
            }}
          >
            Save my score
          </button>
        </div>
      )}
    </div>
  );
}
