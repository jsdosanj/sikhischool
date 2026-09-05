"use client";

import { useState } from "react";
import { shuffle } from "./shuffle";
import type { GameStepProps } from "./types";

interface Item {
  words: string[];
  // Indices into `words`, in the order they form the correct sentence.
  correctOrder: number[];
}

// Word-ordering: tap words out of the bank to build the sentence, tap a placed
// word to send it back.
//
// Same reasoning as MatchingPairsStep: no drag-and-drop. Every word is a real
// <button> in both places, so Tab+Enter is the identical interaction a mouse or
// a finger gets and there is no parallel keyboard path to keep working (plan §3
// B1 — keyboard-operable from the first pass, not retrofitted).
//
// The bank tracks word *indices*, not strings, so a sentence that repeats a
// word ("the cat sat on the mat") grades correctly instead of matching the
// wrong "the".
export default function BuildTheSentenceStep({ config, onFinish }: GameStepProps) {
  const items = (config.items as Item[] | undefined) ?? [];

  // Shuffled once per run — the run's key changes on retry, remounting this.
  // Shuffling here means config authors can write `words` in natural order and
  // let the component scramble it, rather than hand-scrambling every item.
  const [banks] = useState(() => items.map((item) => shuffle(item.words.map((word, index) => ({ word, index })))));
  const [placed, setPlaced] = useState<number[][]>(() => items.map(() => []));
  const [checked, setChecked] = useState(false);

  if (items.length === 0) return null;

  const results = items.map((item, i) => placed[i].join(",") === item.correctOrder.join(","));
  const correctCount = results.filter(Boolean).length;
  const allBuilt = items.every((item, i) => placed[i].length === item.words.length);

  function place(itemIndex: number, wordIndex: number) {
    setPlaced((prev) => prev.map((row, i) => (i === itemIndex ? [...row, wordIndex] : row)));
  }

  function unplace(itemIndex: number, position: number) {
    setPlaced((prev) => prev.map((row, i) => (i === itemIndex ? row.filter((_, p) => p !== position) : row)));
  }

  const tileStyle = {
    borderRadius: "var(--shell-radius, 0.5rem)",
    minHeight: "var(--shell-touch, 2.75rem)",
    border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 20%, transparent)",
  };

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2">
          <p className="text-sm opacity-80">{i + 1}. Tap the words in order. Tap a word again to take it back.</p>

          {/* The sentence being built. Empty until the first tap, so it needs a
              minimum height or the layout jumps on the first word. */}
          <div
            className="flex flex-wrap items-center gap-2 p-2"
            style={{
              minHeight: "var(--shell-touch, 2.75rem)",
              borderRadius: "var(--shell-radius, 0.5rem)",
              border: "1px dashed color-mix(in srgb, var(--shell-ink, #000) 30%, transparent)",
              background: checked
                ? `color-mix(in srgb, ${results[i] ? "var(--color-success)" : "var(--color-error)"} 20%, transparent)`
                : "transparent",
            }}
          >
            {placed[i].map((wordIndex, position) => (
              <button
                key={`${wordIndex}-${position}`}
                type="button"
                disabled={checked}
                onClick={() => unplace(i, position)}
                className="px-3 py-2 text-sm font-medium disabled:opacity-75"
                style={{
                  ...tileStyle,
                  background: "color-mix(in srgb, var(--shell-accent, #f4b21a) 25%, transparent)",
                }}
              >
                {item.words[wordIndex]}
              </button>
            ))}
          </div>

          {/* Word bank — a placed word leaves the bank rather than greying out,
              so what's left is always exactly what's still available. */}
          <div className="flex flex-wrap gap-2">
            {banks[i]
              .filter((entry) => !placed[i].includes(entry.index))
              .map((entry) => (
                <button
                  key={entry.index}
                  type="button"
                  disabled={checked}
                  onClick={() => place(i, entry.index)}
                  className="px-3 py-2 text-sm font-medium disabled:opacity-60"
                  style={{ ...tileStyle, background: "transparent" }}
                >
                  {entry.word}
                </button>
              ))}
          </div>

          {checked && !results[i] && (
            <p className="text-sm opacity-75">Answer: {item.correctOrder.map((w) => item.words[w]).join(" ")}</p>
          )}
        </div>
      ))}

      {!checked ? (
        <button
          type="button"
          disabled={!allBuilt}
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
