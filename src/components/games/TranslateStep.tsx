"use client";

import { useState } from "react";
import type { GameStepProps } from "./types";

interface Item {
  prompt: string;
  acceptedAnswers: string[];
}

// Trim + lowercase is the entire matching rule. Every tolerance a translation
// needs — a second valid wording, an accent-less spelling — is an extra entry
// in acceptedAnswers (e.g. ["mama", "mamá"]), authored by whoever knows the
// language. Fuzzy/edit-distance matching would instead silently accept
// misspellings in the target language, which is the one thing translation
// practice exists to catch.
function normalize(text: string) {
  return text.trim().toLowerCase();
}

// Free-text translation practice, batched: every prompt on screen, typed at the
// child's own pace, checked in one go — the same reviewable shape as
// MultipleChoiceStep, so a language lesson mixing the two reads as one activity
// rather than two different games.
export default function TranslateStep({ config, onFinish }: GameStepProps) {
  const items = (config.items as Item[] | undefined) ?? [];
  const [answers, setAnswers] = useState<string[]>(new Array(items.length).fill(""));
  const [checked, setChecked] = useState(false);

  if (items.length === 0) return null;

  const results = items.map((item, i) => item.acceptedAnswers.some((a) => normalize(a) === normalize(answers[i])));
  const correctCount = results.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1">
          <label className="font-medium" htmlFor={`translate-${i}`}>
            {i + 1}. {item.prompt}
          </label>
          <input
            id={`translate-${i}`}
            type="text"
            autoComplete="off"
            disabled={checked}
            value={answers[i]}
            onChange={(e) => setAnswers((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
            className="px-3 py-2 text-sm disabled:opacity-75"
            style={{
              borderRadius: "var(--shell-radius, 0.5rem)",
              minHeight: "var(--shell-touch, 2.75rem)",
              border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 20%, transparent)",
              background: checked
                ? `color-mix(in srgb, ${results[i] ? "var(--color-success)" : "var(--color-error)"} 20%, transparent)`
                : "transparent",
            }}
          />
          {/* Only the first accepted answer is shown back — the rest are
              tolerances, not alternatives worth teaching as equally canonical. */}
          {checked && !results[i] && <p className="text-sm opacity-75">Answer: {item.acceptedAnswers[0]}</p>}
        </div>
      ))}

      {!checked ? (
        <button
          type="button"
          disabled={answers.some((a) => a.trim() === "")}
          onClick={() => setChecked(true)}
          className="self-start px-4 py-2 text-sm font-semibold disabled:opacity-60"
          style={{
            borderRadius: "var(--shell-radius, 0.5rem)",
            minHeight: "var(--shell-touch, 2.75rem)",
            background: "var(--shell-accent, #f4b21a)",
            color: "var(--shell-on-accent)",
          }}
        >
          Check my answers
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold" role="status">
            {correctCount} of {items.length} correct
          </p>
          <button
            type="button"
            onClick={() => onFinish({ correct: correctCount, total: items.length })}
            className="px-4 py-2 text-sm font-semibold"
            style={{
              borderRadius: "var(--shell-radius, 0.5rem)",
              minHeight: "var(--shell-touch, 2.75rem)",
              background: "var(--shell-accent, #f4b21a)",
              color: "var(--shell-on-accent)",
            }}
          >
            Save my score
          </button>
        </div>
      )}
    </div>
  );
}
