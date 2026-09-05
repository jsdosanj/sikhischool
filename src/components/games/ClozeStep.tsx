"use client";

import { useState } from "react";
import type { GameStepProps } from "./types";

interface Item {
  sentence: string;
  blankToken: string;
  options: string[];
  answer: string;
}

// Fill-in-the-blank from a word bank, batched like MultipleChoiceStep.
//
// The bank is buttons, not a text input, on purpose: grading stays exact (no
// spelling near-misses to arbitrate), the target is finger-sized on a tablet,
// and a child who recognises the right word but can't yet spell it isn't
// blocked. Free-text recall is TranslateStep's job — this step-type tests the
// grammar slot, not the typing.
export default function ClozeStep({ config, onFinish }: GameStepProps) {
  const items = (config.items as Item[] | undefined) ?? [];
  const [picked, setPicked] = useState<(string | null)[]>(new Array(items.length).fill(null));
  const [checked, setChecked] = useState(false);

  if (items.length === 0) return null;

  const correctCount = items.reduce((n, item, i) => (picked[i] === item.answer ? n + 1 : n), 0);

  return (
    <div className="flex flex-col gap-5">
      {items.map((item, i) => {
        // The token appears once by contract; splitting on it and rejoining the
        // tail keeps the sentence whole even if an author repeats it, rather
        // than dropping text on the floor.
        const parts = item.sentence.split(item.blankToken);
        const before = parts[0];
        const after = parts.slice(1).join(item.blankToken);
        const isRight = picked[i] === item.answer;

        return (
          <div key={i} className="flex flex-col gap-2">
            <p className="font-medium">
              {before}
              <span
                className="mx-1 inline-block px-2 py-0.5 text-center text-sm font-semibold"
                style={{
                  minWidth: "5rem",
                  borderRadius: "var(--shell-radius, 0.5rem)",
                  borderBottom: "2px solid color-mix(in srgb, var(--shell-ink, #000) 40%, transparent)",
                  background: checked
                    ? `color-mix(in srgb, ${isRight ? "var(--color-success)" : "var(--color-error)"} 20%, transparent)`
                    : "transparent",
                }}
              >
                {picked[i] ?? " "}
              </span>
              {after}
            </p>

            <div className="flex flex-wrap gap-2">
              {item.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={checked}
                  aria-pressed={picked[i] === option}
                  onClick={() => setPicked((prev) => prev.map((v, j) => (j === i ? option : v)))}
                  className="px-3 py-2 text-sm font-medium disabled:opacity-60"
                  style={{
                    borderRadius: "var(--shell-radius, 0.5rem)",
                    minHeight: "var(--shell-touch, 2.75rem)",
                    border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 20%, transparent)",
                    background:
                      picked[i] === option
                        ? "color-mix(in srgb, var(--shell-accent, #f4b21a) 30%, transparent)"
                        : "transparent",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {checked && !isRight && <p className="text-sm opacity-75">Answer: {item.answer}</p>}
          </div>
        );
      })}

      {!checked ? (
        <button
          type="button"
          disabled={picked.some((p) => p === null)}
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
